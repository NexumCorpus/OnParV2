/*
  # User Invitations Table
  
  This migration creates the user_invitations table for managing user invitations
  in the enterprise authentication system.
*/

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL,
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invitation_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure email format
  CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  
  -- Ensure expiry is in the future when created
  CHECK (expires_at > created_at)
);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view invitations in their tenant"
  ON user_invitations
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() AND
    current_user_has_permission('manage_users')
  );

CREATE POLICY "Users can create invitations in their tenant"
  ON user_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id() AND
    current_user_has_permission('manage_users') AND
    invited_by = auth.uid()
  );

CREATE POLICY "Users can update invitations in their tenant"
  ON user_invitations
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() AND
    (current_user_has_permission('manage_users') OR email IN (
      SELECT email FROM users WHERE id = auth.uid()
    ))
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_tenant_id ON user_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger
CREATE TRIGGER audit_user_invitations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_invitations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $
BEGIN
  -- Mark expired invitations
  UPDATE user_invitations 
  SET status = 'expired'
  WHERE expires_at < now() AND status = 'pending';
  
  -- Delete old expired invitations (keep for 30 days for audit)
  DELETE FROM user_invitations 
  WHERE status = 'expired' AND expires_at < now() - INTERVAL '30 days';
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Should be called daily to clean up expired invitations';