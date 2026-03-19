-- Migration 002: Multi-User / Organization Support

------------------------------------------------------------
-- 1. NEW TABLES: organizations and org_members
------------------------------------------------------------
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org_members (
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Organization Policies
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT TO authenticated 
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "orgs_update" ON organizations
  FOR UPDATE TO authenticated 
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Org Members Policies
CREATE POLICY "members_select" ON org_members
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "members_insert" ON org_members
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

CREATE POLICY "members_update" ON org_members
  FOR UPDATE TO authenticated
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "members_delete" ON org_members
  FOR DELETE TO authenticated
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- 2. ADD org_id COLUMNS TO EXISTING TABLES
------------------------------------------------------------
ALTER TABLE suppliers ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE inventory_items ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE recipes ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE waste_events ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE ai_insights ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE waste_analysis_snapshots ADD COLUMN org_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

------------------------------------------------------------
-- 3. DATA MIGRATION: CREATE ORGS & ASSIGN DATA
------------------------------------------------------------
DO $$ 
DECLARE
  u record;
  new_org_id uuid;
BEGIN
  FOR u IN SELECT id, email, restaurant_name FROM public.users LOOP
    new_org_id := gen_random_uuid();
    
    -- Create organization for the user
    INSERT INTO organizations (id, name, owner_id)
    VALUES (new_org_id, COALESCE(u.restaurant_name, split_part(u.email, '@', 1) || '''s Restaurant'), u.id);
    
    -- Add the user as owner
    INSERT INTO org_members (org_id, user_id, role)
    VALUES (new_org_id, u.id, 'owner');
    
    -- Update existing records to link to the new organization
    UPDATE suppliers SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE inventory_items SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE menu_items SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE recipes SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE waste_events SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE ai_insights SET org_id = new_org_id WHERE user_id = u.id;
    UPDATE waste_analysis_snapshots SET org_id = new_org_id WHERE user_id = u.id;
  END LOOP;
END $$;

------------------------------------------------------------
-- 4. MAKE org_id NOT NULL AND CREATE INDEXES
------------------------------------------------------------
ALTER TABLE suppliers ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE menu_items ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE waste_events ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE ai_insights ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE waste_analysis_snapshots ALTER COLUMN org_id SET NOT NULL;

CREATE INDEX idx_suppliers_org_id ON suppliers(org_id);
CREATE INDEX idx_inventory_org_id ON inventory_items(org_id);
CREATE INDEX idx_menu_org_id ON menu_items(org_id);
CREATE INDEX idx_recipes_org_id ON recipes(org_id);
CREATE INDEX idx_waste_events_org_id ON waste_events(org_id);
CREATE INDEX idx_ai_insights_org_id ON ai_insights(org_id);
CREATE INDEX idx_waste_analysis_org_id ON waste_analysis_snapshots(org_id);

------------------------------------------------------------
-- 5. UPDATE RLS POLICIES FOR ALL TABLES
------------------------------------------------------------

-- Suppliers
DROP POLICY IF EXISTS "suppliers_select_own" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_own" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_own" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_own" ON suppliers;

CREATE POLICY "suppliers_select_org" ON suppliers FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "suppliers_insert_org" ON suppliers FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "suppliers_update_org" ON suppliers FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));
CREATE POLICY "suppliers_delete_org" ON suppliers FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Inventory Items
DROP POLICY IF EXISTS "inventory_select_own" ON inventory_items;
DROP POLICY IF EXISTS "inventory_insert_own" ON inventory_items;
DROP POLICY IF EXISTS "inventory_update_own" ON inventory_items;
DROP POLICY IF EXISTS "inventory_delete_own" ON inventory_items;

CREATE POLICY "inventory_select_org" ON inventory_items FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "inventory_insert_org" ON inventory_items FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "inventory_update_org" ON inventory_items FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "inventory_delete_org" ON inventory_items FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Menu Items
DROP POLICY IF EXISTS "menu_select_own" ON menu_items;
DROP POLICY IF EXISTS "menu_insert_own" ON menu_items;
DROP POLICY IF EXISTS "menu_update_own" ON menu_items;
DROP POLICY IF EXISTS "menu_delete_own" ON menu_items;

CREATE POLICY "menu_select_org" ON menu_items FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "menu_insert_org" ON menu_items FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "menu_update_org" ON menu_items FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "menu_delete_org" ON menu_items FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Recipes
DROP POLICY IF EXISTS "recipes_select_own" ON recipes;
DROP POLICY IF EXISTS "recipes_insert_own" ON recipes;
DROP POLICY IF EXISTS "recipes_update_own" ON recipes;
DROP POLICY IF EXISTS "recipes_delete_own" ON recipes;

CREATE POLICY "recipes_select_org" ON recipes FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "recipes_insert_org" ON recipes FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "recipes_update_org" ON recipes FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "recipes_delete_org" ON recipes FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Recipe Ingredients
DROP POLICY IF EXISTS "recipe_ingredients_select" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_insert" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_update" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_delete" ON recipe_ingredients;

CREATE POLICY "recipe_ingredients_select_org" ON recipe_ingredients FOR SELECT TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "recipe_ingredients_insert_org" ON recipe_ingredients FOR INSERT TO authenticated WITH CHECK (
  recipe_id IN (SELECT id FROM recipes WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "recipe_ingredients_update_org" ON recipe_ingredients FOR UPDATE TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "recipe_ingredients_delete_org" ON recipe_ingredients FOR DELETE TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);

-- Waste Events
DROP POLICY IF EXISTS "waste_events_select_own" ON waste_events;
DROP POLICY IF EXISTS "waste_events_insert_own" ON waste_events;
DROP POLICY IF EXISTS "waste_events_update_own" ON waste_events;
DROP POLICY IF EXISTS "waste_events_delete_own" ON waste_events;

CREATE POLICY "waste_events_select_org" ON waste_events FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "waste_events_insert_org" ON waste_events FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "waste_events_update_org" ON waste_events FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "waste_events_delete_org" ON waste_events FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- AI Insights
DROP POLICY IF EXISTS "insights_select_own" ON ai_insights;
DROP POLICY IF EXISTS "insights_insert_own" ON ai_insights;
DROP POLICY IF EXISTS "insights_update_own" ON ai_insights;
DROP POLICY IF EXISTS "insights_delete_own" ON ai_insights;

CREATE POLICY "insights_select_org" ON ai_insights FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "insights_insert_org" ON ai_insights FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "insights_update_org" ON ai_insights FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "insights_delete_org" ON ai_insights FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Waste Analysis Snapshots
DROP POLICY IF EXISTS "snapshots_select_own" ON waste_analysis_snapshots;
DROP POLICY IF EXISTS "snapshots_insert_own" ON waste_analysis_snapshots;
DROP POLICY IF EXISTS "snapshots_update_own" ON waste_analysis_snapshots;
DROP POLICY IF EXISTS "snapshots_delete_own" ON waste_analysis_snapshots;

CREATE POLICY "snapshots_select_org" ON waste_analysis_snapshots FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "snapshots_insert_org" ON waste_analysis_snapshots FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "snapshots_update_org" ON waste_analysis_snapshots FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "snapshots_delete_org" ON waste_analysis_snapshots FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

------------------------------------------------------------
-- 6. UPDATE handle_new_user TRIGGER
------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default organization for the new user
  new_org_id := gen_random_uuid();
  
  INSERT INTO organizations (id, name, owner_id)
  VALUES (new_org_id, split_part(NEW.email, '@', 1) || '''s Restaurant', NEW.id);
  
  INSERT INTO org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
