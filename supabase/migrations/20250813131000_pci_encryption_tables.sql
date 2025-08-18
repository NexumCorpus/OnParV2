/*
  # PCI DSS Encryption Tables
  
  This migration creates tables for PCI DSS compliant encryption and tokenization:
  1. Encryption keys management
  2. Payment token storage
  3. Encrypted data references
  
  Requirements: 9.4
*/

-- Create encryption_keys table for key management
CREATE TABLE IF NOT EXISTS encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  data_type text NOT NULL,
  key_material text NOT NULL, -- Base64 encoded key (in production, use HSM)
  algorithm text NOT NULL DEFAULT 'aes-256-gcm',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  rotated_at timestamptz,
  expires_at timestamptz,
  
  -- Ensure only one active key per tenant/data_type
  UNIQUE(tenant_id, data_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create payment_tokens table for card tokenization
CREATE TABLE IF NOT EXISTS payment_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  encrypted_card_data text NOT NULL,
  key_id uuid REFERENCES encryption_keys(id) ON DELETE RESTRICT NOT NULL,
  last_four text NOT NULL,
  card_type text NOT NULL DEFAULT 'unknown',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- Ensure token format
  CHECK (token ~ '^tok_[a-zA-Z0-9]{32,}$'),
  CHECK (length(last_four) = 4 AND last_four ~ '^\d{4}$'),
  CHECK (card_type IN ('visa', 'mastercard', 'amex', 'discover', 'unknown'))
);

-- Update encrypted_data table with additional fields
ALTER TABLE encrypted_data ADD COLUMN IF NOT EXISTS key_id uuid REFERENCES encryption_keys(id) ON DELETE RESTRICT;
ALTER TABLE encrypted_data ADD COLUMN IF NOT EXISTS checksum text;
ALTER TABLE encrypted_data ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0;
ALTER TABLE encrypted_data ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz;

-- Create data_access_log table for audit trail
CREATE TABLE IF NOT EXISTS data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  data_type text NOT NULL,
  data_id uuid, -- Reference to encrypted_data or payment_tokens
  access_type text NOT NULL CHECK (access_type IN ('encrypt', 'decrypt', 'tokenize', 'detokenize', 'view', 'export')),
  ip_address inet,
  user_agent text,
  success boolean NOT NULL,
  failure_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create key_rotation_log table
CREATE TABLE IF NOT EXISTS key_rotation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  old_key_id uuid REFERENCES encryption_keys(id) ON DELETE SET NULL,
  new_key_id uuid REFERENCES encryption_keys(id) ON DELETE SET NULL,
  data_type text NOT NULL,
  items_reencrypted integer DEFAULT 0,
  rotation_started_at timestamptz DEFAULT now(),
  rotation_completed_at timestamptz,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  error_message text
);

-- Enable RLS on new tables
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_rotation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for encryption_keys (service role only)
CREATE POLICY "Service role can manage encryption keys"
  ON encryption_keys
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for payment_tokens (service role only)
CREATE POLICY "Service role can manage payment tokens"
  ON payment_tokens
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for data_access_log
CREATE POLICY "Users can view own data access logs"
  ON data_access_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (tenant_id = get_current_tenant_id() AND
     current_user_has_permission('view_analytics'))
  );

CREATE POLICY "Service role can manage data access logs"
  ON data_access_log
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for key_rotation_log
CREATE POLICY "Admins can view key rotation logs"
  ON key_rotation_log
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() AND
    current_user_has_permission('manage_settings')
  );

CREATE POLICY "Service role can manage key rotation logs"
  ON key_rotation_log
  FOR ALL
  TO service_role
  USING (true);

-- Functions for PCI compliance

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access(
  data_type_param text,
  data_id_param uuid,
  access_type_param text,
  success_param boolean,
  failure_reason_param text DEFAULT NULL
)
RETURNS void AS $
BEGIN
  INSERT INTO data_access_log (
    tenant_id,
    user_id,
    data_type,
    data_id,
    access_type,
    success,
    failure_reason,
    created_at
  ) VALUES (
    get_current_tenant_id(),
    auth.uid(),
    data_type_param,
    data_id_param,
    access_type_param,
    success_param,
    failure_reason_param,
    now()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check encryption key expiry
CREATE OR REPLACE FUNCTION check_key_expiry()
RETURNS TABLE(
  tenant_id uuid,
  key_id uuid,
  data_type text,
  days_until_expiry integer
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    ek.tenant_id,
    ek.id as key_id,
    ek.data_type,
    EXTRACT(days FROM (ek.expires_at - now()))::integer as days_until_expiry
  FROM encryption_keys ek
  WHERE ek.is_active = true
    AND ek.expires_at IS NOT NULL
    AND ek.expires_at <= now() + INTERVAL '30 days'
  ORDER BY ek.expires_at ASC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge expired tokens and data
CREATE OR REPLACE FUNCTION purge_expired_data()
RETURNS void AS $
DECLARE
  purged_tokens integer := 0;
  purged_data integer := 0;
BEGIN
  -- Purge expired payment tokens
  DELETE FROM payment_tokens 
  WHERE expires_at < now();
  GET DIAGNOSTICS purged_tokens = ROW_COUNT;
  
  -- Purge expired encrypted data
  DELETE FROM encrypted_data 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS purged_data = ROW_COUNT;
  
  -- Log purge activity
  INSERT INTO security_events (
    event_type,
    event_data,
    severity
  ) VALUES (
    'data_purged',
    jsonb_build_object(
      'purged_tokens', purged_tokens,
      'purged_data', purged_data,
      'purged_at', now()
    ),
    'medium'
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate PCI compliance
CREATE OR REPLACE FUNCTION validate_pci_compliance(tenant_id_param uuid)
RETURNS jsonb AS $
DECLARE
  result jsonb := '{}';
  key_count integer;
  expired_keys integer;
  old_tokens integer;
  unencrypted_data integer;
BEGIN
  -- Check encryption key status
  SELECT COUNT(*) INTO key_count
  FROM encryption_keys
  WHERE tenant_id = tenant_id_param AND is_active = true;
  
  SELECT COUNT(*) INTO expired_keys
  FROM encryption_keys
  WHERE tenant_id = tenant_id_param 
    AND is_active = true 
    AND expires_at IS NOT NULL 
    AND expires_at < now();
  
  -- Check for old payment tokens (should be rotated regularly)
  SELECT COUNT(*) INTO old_tokens
  FROM payment_tokens
  WHERE tenant_id = tenant_id_param 
    AND created_at < now() - INTERVAL '1 year';
  
  -- Check for unencrypted sensitive data (this would be application-specific)
  unencrypted_data := 0; -- Placeholder
  
  result := jsonb_build_object(
    'tenant_id', tenant_id_param,
    'active_keys', key_count,
    'expired_keys', expired_keys,
    'old_tokens', old_tokens,
    'unencrypted_data', unencrypted_data,
    'compliant', (expired_keys = 0 AND old_tokens = 0 AND unencrypted_data = 0),
    'checked_at', now()
  );
  
  RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_encryption_keys_tenant_type ON encryption_keys(tenant_id, data_type);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_tenant ON payment_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_token ON payment_tokens(token);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_expires_at ON payment_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_last_four ON payment_tokens(last_four);
CREATE INDEX IF NOT EXISTS idx_data_access_log_tenant_user ON data_access_log(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_log_created_at ON data_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_data_access_log_access_type ON data_access_log(access_type);
CREATE INDEX IF NOT EXISTS idx_key_rotation_log_tenant ON key_rotation_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_key_rotation_log_status ON key_rotation_log(status);

-- Create triggers for audit logging
CREATE TRIGGER audit_encryption_keys_trigger
  AFTER INSERT OR UPDATE OR DELETE ON encryption_keys
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payment_tokens_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payment_tokens
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create trigger to update access count on encrypted_data
CREATE OR REPLACE FUNCTION update_data_access_stats()
RETURNS trigger AS $
BEGIN
  -- This would be called when data is accessed
  UPDATE encrypted_data 
  SET 
    access_count = access_count + 1,
    last_accessed_at = now()
  WHERE id = NEW.data_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_access_stats_trigger
  AFTER INSERT ON data_access_log
  FOR EACH ROW 
  WHEN (NEW.access_type IN ('decrypt', 'view') AND NEW.success = true)
  EXECUTE FUNCTION update_data_access_stats();

-- Insert default encryption keys for existing tenants
INSERT INTO encryption_keys (tenant_id, data_type, key_material, algorithm, is_active)
SELECT 
  t.id as tenant_id,
  dt.data_type,
  encode(gen_random_bytes(32), 'base64') as key_material,
  'aes-256-gcm' as algorithm,
  true as is_active
FROM tenants t
CROSS JOIN (
  VALUES 
    ('payment_token'),
    ('card_number'),
    ('pii_data'),
    ('sensitive_config'),
    ('mfa_secret'),
    ('backup_code')
) dt(data_type)
ON CONFLICT (tenant_id, data_type, is_active) DO NOTHING;

-- Create scheduled cleanup job comments
COMMENT ON FUNCTION purge_expired_data() IS 'Should be called daily to purge expired tokens and encrypted data';
COMMENT ON FUNCTION check_key_expiry() IS 'Should be called weekly to check for keys nearing expiration';
COMMENT ON FUNCTION validate_pci_compliance(uuid) IS 'Should be called monthly for PCI compliance validation';