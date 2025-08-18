/*
  # Enterprise Multi-Tenant Foundation
  
  This migration establishes enterprise-grade multi-tenant data isolation with:
  1. Enhanced row-level security (RLS) policies
  2. Tenant context management
  3. Advanced audit logging
  4. Performance optimization indexes
  5. Data retention policies
  
  Requirements: 10.1, 10.2, 10.4
*/

-- Create tenant management system
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organizations table for enterprise customers
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'restaurant' CHECK (type IN ('restaurant', 'chain', 'franchise', 'enterprise')),
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address jsonb,
  timezone text DEFAULT 'UTC',
  settings jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add tenant_id and location_id to existing tables for multi-tenancy
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE SET NULL;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE CASCADE;

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE CASCADE;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE CASCADE;

ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE CASCADE;

ALTER TABLE ai_insight_implementations ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE waste_analysis_data ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE waste_analysis_data ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE CASCADE;

-- Create audit log table for enterprise compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
DECLARE
  tenant_id_val uuid;
  user_id_val uuid;
  location_id_val uuid;
BEGIN
  -- Get tenant context
  tenant_id_val := get_current_tenant_id();
  
  -- Get user context
  user_id_val := auth.uid();
  
  -- Get location context if available
  IF TG_TABLE_NAME IN ('inventory_items', 'menu_items', 'recipes', 'ai_insights', 'waste_analysis_data') THEN
    IF TG_OP = 'DELETE' THEN
      location_id_val := OLD.location_id;
    ELSE
      location_id_val := NEW.location_id;
    END IF;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    location_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    tenant_id_val,
    user_id_val,
    location_id_val,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE 
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)
      ELSE NULL
    END
  );
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create enhanced RLS policies for tenants table
CREATE POLICY "Tenants can read own tenant data"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (id = get_current_tenant_id());

CREATE POLICY "Service role can manage tenants"
  ON tenants
  FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for organizations table
CREATE POLICY "Users can read own organization data"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can manage own organization data"
  ON organizations
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Create RLS policies for locations table
CREATE POLICY "Users can read own location data"
  ON locations
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can manage own location data"
  ON locations
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Create RLS policies for audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Service role can manage audit logs"
  ON audit_logs
  FOR ALL
  TO service_role
  USING (true);

-- Update existing RLS policies to include tenant isolation
DROP POLICY IF EXISTS "Users can read own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory items" ON inventory_items;

CREATE POLICY "Users can read own tenant inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can insert own tenant inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update own tenant inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete own tenant inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

-- Update menu_items policies
DROP POLICY IF EXISTS "Users can read own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can update own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own menu items" ON menu_items;

CREATE POLICY "Users can read own tenant menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can insert own tenant menu items"
  ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update own tenant menu items"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete own tenant menu items"
  ON menu_items
  FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

-- Update recipes policies
DROP POLICY IF EXISTS "Users can read own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

CREATE POLICY "Users can read own tenant recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can insert own tenant recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update own tenant recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete own tenant recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

-- Update AI insights policies
DROP POLICY IF EXISTS "Users can read own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can insert own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can update own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can delete own AI insights" ON ai_insights;

CREATE POLICY "Users can read own tenant AI insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can insert own tenant AI insights"
  ON ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update own tenant AI insights"
  ON ai_insights
  FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete own tenant AI insights"
  ON ai_insights
  FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());

-- Create audit triggers for all tables
CREATE TRIGGER audit_tenants_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tenants
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_organizations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_locations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON locations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_inventory_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_menu_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_recipes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON recipes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

CREATE INDEX IF NOT EXISTS idx_locations_organization_id ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_tenant_id ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);

CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_location_id ON menu_items(location_id);

CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_location_id ON recipes(location_id);

CREATE INDEX IF NOT EXISTS idx_ai_insights_tenant_id ON ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_location_id ON ai_insights(location_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default tenant for existing data migration
INSERT INTO tenants (id, name, slug, plan, status) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Tenant', 'default', 'enterprise', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default organization
INSERT INTO organizations (id, tenant_id, name, type)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Default Organization', 'restaurant')
ON CONFLICT (id) DO NOTHING;

-- Insert default location
INSERT INTO locations (id, organization_id, tenant_id, name)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Default Location')
ON CONFLICT (id) DO NOTHING;

-- Update existing users to have tenant_id (for migration)
UPDATE users 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    organization_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing inventory_items to have tenant_id and location_id
UPDATE inventory_items 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing menu_items to have tenant_id and location_id
UPDATE menu_items 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing recipes to have tenant_id and location_id
UPDATE recipes 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing recipe_ingredients to have tenant_id
UPDATE recipe_ingredients 
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing ai_insights to have tenant_id and location_id
UPDATE ai_insights 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing ai_insight_implementations to have tenant_id
UPDATE ai_insight_implementations 
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Update existing waste_analysis_data to have tenant_id and location_id
UPDATE waste_analysis_data 
SET tenant_id = '00000000-0000-0000-0000-000000000000',
    location_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;