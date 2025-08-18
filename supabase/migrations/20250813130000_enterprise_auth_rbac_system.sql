/*
  # Enterprise Authentication and RBAC System
  
  This migration implements:
  1. JWT-based authentication with refresh token rotation
  2. Role-based access control (RBAC) system with fine-grained permissions
  3. Multi-factor authentication support
  4. PCI DSS compliant data encryption and tokenization
  
  Requirements: 9.1, 9.2, 9.3, 9.4
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'tenant_admin', 
  'location_manager',
  'shift_manager',
  'cashier',
  'kitchen_staff',
  'server',
  'viewer'
);

-- Create permissions enum
CREATE TYPE permission AS ENUM (
  -- System administration
  'manage_tenants',
  'manage_users',
  'manage_roles',
  
  -- Financial operations
  'view_financial_reports',
  'manage_payments',
  'process_refunds',
  
  -- POS operations
  'process_orders',
  'modify_orders',
  'void_transactions',
  'apply_discounts',
  
  -- Inventory management
  'view_inventory',
  'manage_inventory',
  'approve_orders',
  
  -- Staff management
  'view_schedules',
  'manage_schedules',
  'view_timeclock',
  'manage_timeclock',
  
  -- Customer management
  'view_customers',
  'manage_customers',
  'manage_loyalty',
  
  -- Analytics and reporting
  'view_analytics',
  'export_data',
  
  -- System configuration
  'manage_settings',
  'manage_integrations'
);

-- Add role and MFA fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'viewer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamptz;

-- Create user_roles table for role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  
  UNIQUE(user_id, tenant_id)
);

-- Create role_permissions table for custom permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  permission permission NOT NULL,
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, role, permission)
);

-- Create refresh_tokens table for JWT token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  is_revoked boolean DEFAULT false,
  device_info text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  
  -- Index for cleanup of expired tokens
  CHECK (expires_at > created_at)
);

-- Create user_mfa table for multi-factor authentication
CREATE TABLE IF NOT EXISTS user_mfa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  secret_encrypted text NOT NULL,
  backup_codes_encrypted text[] NOT NULL DEFAULT '{}',
  enabled boolean DEFAULT false,
  recovery_codes_used text[] DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create login_attempts table for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_address inet NOT NULL,
  user_agent text,
  success boolean NOT NULL,
  failure_reason text,
  mfa_required boolean DEFAULT false,
  mfa_success boolean,
  created_at timestamptz DEFAULT now()
);

-- Create security_events table for audit logging
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

-- Create encrypted_data table for PCI DSS compliance
CREATE TABLE IF NOT EXISTS encrypted_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type text NOT NULL,
  encrypted_value text NOT NULL,
  key_id text NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  -- Ensure data is properly categorized
  CHECK (data_type IN ('payment_token', 'pii_data', 'sensitive_config', 'mfa_secret', 'backup_code'))
);

-- Enable RLS on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR tenant_id = get_current_tenant_id());

CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.tenant_id = get_current_tenant_id()
      AND ur.role IN ('super_admin', 'tenant_admin')
      AND ur.is_active = true
    )
  );

-- RLS Policies for role_permissions
CREATE POLICY "Users can view role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Admins can manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.tenant_id = get_current_tenant_id()
      AND ur.role IN ('super_admin', 'tenant_admin')
      AND ur.is_active = true
    )
  );

-- RLS Policies for refresh_tokens
CREATE POLICY "Users can manage own refresh tokens"
  ON refresh_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_mfa
CREATE POLICY "Users can manage own MFA"
  ON user_mfa
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for login_attempts
CREATE POLICY "Service role can manage login attempts"
  ON login_attempts
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Admins can view login attempts"
  ON login_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'tenant_admin')
      AND ur.is_active = true
    )
  );

-- RLS Policies for security_events
CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (tenant_id = get_current_tenant_id() AND
     EXISTS (
       SELECT 1 FROM user_roles ur
       WHERE ur.user_id = auth.uid() 
       AND ur.tenant_id = get_current_tenant_id()
       AND ur.role IN ('super_admin', 'tenant_admin')
       AND ur.is_active = true
     ))
  );

CREATE POLICY "Service role can manage security events"
  ON security_events
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for encrypted_data
CREATE POLICY "Service role can manage encrypted data"
  ON encrypted_data
  FOR ALL
  TO service_role
  USING (true);

-- Functions for permission checking
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id_param uuid,
  tenant_id_param uuid,
  permission_param permission
)
RETURNS boolean AS $
DECLARE
  user_role_val user_role;
  has_permission_val boolean := false;
BEGIN
  -- Get user's role in the tenant
  SELECT role INTO user_role_val
  FROM user_roles
  WHERE user_id = user_id_param 
    AND tenant_id = tenant_id_param
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  IF user_role_val IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if role has the permission (with custom overrides)
  SELECT COALESCE(rp.granted, 
    CASE 
      WHEN user_role_val = 'super_admin' THEN true
      WHEN user_role_val = 'tenant_admin' AND permission_param != 'manage_tenants' THEN true
      WHEN user_role_val = 'location_manager' AND permission_param IN (
        'view_financial_reports', 'process_orders', 'modify_orders', 'void_transactions',
        'apply_discounts', 'view_inventory', 'manage_inventory', 'approve_orders',
        'view_schedules', 'manage_schedules', 'view_timeclock', 'manage_timeclock',
        'view_customers', 'manage_customers', 'manage_loyalty', 'view_analytics', 'export_data'
      ) THEN true
      WHEN user_role_val = 'shift_manager' AND permission_param IN (
        'process_orders', 'modify_orders', 'void_transactions', 'apply_discounts',
        'view_inventory', 'manage_inventory', 'view_schedules', 'view_timeclock',
        'manage_timeclock', 'view_customers', 'manage_customers', 'view_analytics'
      ) THEN true
      WHEN user_role_val = 'cashier' AND permission_param IN (
        'process_orders', 'modify_orders', 'view_inventory', 'view_customers', 'manage_customers'
      ) THEN true
      WHEN user_role_val = 'kitchen_staff' AND permission_param IN (
        'view_inventory', 'manage_inventory'
      ) THEN true
      WHEN user_role_val = 'server' AND permission_param IN (
        'process_orders', 'modify_orders', 'view_customers', 'manage_customers'
      ) THEN true
      WHEN user_role_val = 'viewer' AND permission_param IN (
        'view_inventory', 'view_schedules', 'view_customers', 'view_analytics'
      ) THEN true
      ELSE false
    END
  ) INTO has_permission_val
  FROM role_permissions rp
  WHERE rp.tenant_id = tenant_id_param
    AND rp.role = user_role_val
    AND rp.permission = permission_param;
  
  RETURN COALESCE(has_permission_val, false);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check current user permissions
CREATE OR REPLACE FUNCTION current_user_has_permission(permission_param permission)
RETURNS boolean AS $
BEGIN
  RETURN user_has_permission(auth.uid(), get_current_tenant_id(), permission_param);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type_param text,
  event_data_param jsonb DEFAULT '{}',
  severity_param text DEFAULT 'info'
)
RETURNS void AS $
BEGIN
  INSERT INTO security_events (
    user_id,
    tenant_id,
    event_type,
    event_data,
    severity,
    created_at
  ) VALUES (
    auth.uid(),
    get_current_tenant_id(),
    event_type_param,
    event_data_param,
    severity_param,
    now()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $
BEGIN
  -- Mark expired refresh tokens as revoked
  UPDATE refresh_tokens 
  SET is_revoked = true, revoked_at = now()
  WHERE expires_at < now() AND is_revoked = false;
  
  -- Delete old login attempts (keep 90 days)
  DELETE FROM login_attempts 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Delete old security events (keep 1 year)
  DELETE FROM security_events 
  WHERE created_at < now() - INTERVAL '1 year' AND severity IN ('low', 'medium');
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_tenant ON user_roles(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant_role ON role_permissions(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_tenant_type ON encrypted_data(tenant_id, data_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_mfa_updated_at
  BEFORE UPDATE ON user_mfa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create audit triggers for security tables
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_refresh_tokens_trigger
  AFTER INSERT OR UPDATE OR DELETE ON refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_mfa_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_mfa
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert default role permissions for each tenant
INSERT INTO role_permissions (tenant_id, role, permission, granted)
SELECT 
  t.id as tenant_id,
  r.role,
  p.permission,
  true as granted
FROM tenants t
CROSS JOIN (
  SELECT unnest(enum_range(NULL::user_role)) as role
) r
CROSS JOIN (
  SELECT unnest(enum_range(NULL::permission)) as permission
) p
WHERE 
  -- Super admin gets all permissions
  (r.role = 'super_admin') OR
  -- Tenant admin gets all except manage_tenants
  (r.role = 'tenant_admin' AND p.permission != 'manage_tenants') OR
  -- Location manager permissions
  (r.role = 'location_manager' AND p.permission IN (
    'view_financial_reports', 'process_orders', 'modify_orders', 'void_transactions',
    'apply_discounts', 'view_inventory', 'manage_inventory', 'approve_orders',
    'view_schedules', 'manage_schedules', 'view_timeclock', 'manage_timeclock',
    'view_customers', 'manage_customers', 'manage_loyalty', 'view_analytics', 'export_data'
  )) OR
  -- Shift manager permissions
  (r.role = 'shift_manager' AND p.permission IN (
    'process_orders', 'modify_orders', 'void_transactions', 'apply_discounts',
    'view_inventory', 'manage_inventory', 'view_schedules', 'view_timeclock',
    'manage_timeclock', 'view_customers', 'manage_customers', 'view_analytics'
  )) OR
  -- Cashier permissions
  (r.role = 'cashier' AND p.permission IN (
    'process_orders', 'modify_orders', 'view_inventory', 'view_customers', 'manage_customers'
  )) OR
  -- Kitchen staff permissions
  (r.role = 'kitchen_staff' AND p.permission IN (
    'view_inventory', 'manage_inventory'
  )) OR
  -- Server permissions
  (r.role = 'server' AND p.permission IN (
    'process_orders', 'modify_orders', 'view_customers', 'manage_customers'
  )) OR
  -- Viewer permissions
  (r.role = 'viewer' AND p.permission IN (
    'view_inventory', 'view_schedules', 'view_customers', 'view_analytics'
  ))
ON CONFLICT (tenant_id, role, permission) DO NOTHING;

-- Assign default roles to existing users
INSERT INTO user_roles (user_id, tenant_id, role, assigned_at)
SELECT 
  u.id as user_id,
  u.tenant_id,
  CASE 
    WHEN u.premium_subscription = true THEN 'tenant_admin'::user_role
    ELSE 'location_manager'::user_role
  END as role,
  now() as assigned_at
FROM users u
WHERE u.tenant_id IS NOT NULL
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Create scheduled job to cleanup expired tokens (would be set up in production)
-- This would typically be handled by a cron job or scheduled function
COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Should be called periodically to clean up expired tokens and old audit data';