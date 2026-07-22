-- ============================================================
-- OnPar: COMPLETE DATABASE SETUP (generated from migrations)
-- Paste this entire file into the Supabase SQL Editor and run.
-- Combines: 001_initial_schema, 002_organizations,
--           003_purchase_orders, 004_fix_rls_recursion,
--           005_auto_org_id, seed-demo (demo data function)
-- ============================================================

-- ------------------------------------------------------------
-- FROM: supabase/migrations/001_initial_schema.sql
-- ------------------------------------------------------------
-- OnPar Database Schema v2 (Clean Redesign)
-- Single migration file replacing 20+ fragmented migrations
--
-- FUTURE-PROOFING: Multi-User / Team Support
-- Current: All tables use user_id as the ownership key (single-restaurant).
-- Future migration path when team support is added:
--   1. Create `organizations` table (id, name, owner_id, created_at)
--   2. Create `org_members` table (org_id, user_id, role, invited_at, joined_at)
--   3. Add `org_id uuid` column to: inventory_items, recipes, menu_items, suppliers, waste_events
--   4. RLS policies change from `auth.uid() = user_id` to:
--      `org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())`
--   5. user_id remains on rows to track who created/modified each record
-- NO SCHEMA CHANGES NEEDED NOW. This documents the intended migration path.

------------------------------------------------------------
-- UTILITY FUNCTIONS
------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- USERS
------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  restaurant_name text,
  monthly_budget numeric(10,2),
  avatar_url text,
  settings jsonb NOT NULL DEFAULT '{
    "reorder_multiplier": 2.0,
    "low_stock_threshold": 0.8,
    "expiry_warning_days": 7,
    "budget_warning_threshold": 0.9,
    "email_notifications": true,
    "onboarding_completed": false
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

------------------------------------------------------------
-- SUPPLIERS
------------------------------------------------------------

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_own" ON suppliers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "suppliers_insert_own" ON suppliers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "suppliers_update_own" ON suppliers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "suppliers_delete_own" ON suppliers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- INVENTORY ITEMS
------------------------------------------------------------

CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Uncategorized',
  quantity numeric(12,3) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pieces',
  expiry_date date,
  reorder_point numeric(12,3) NOT NULL DEFAULT 0,
  max_stock_level numeric(12,3),
  price_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  deleted_at timestamptz, -- soft delete: set to NOW() instead of hard deleting. All queries MUST filter WHERE deleted_at IS NULL.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_own" ON inventory_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_insert_own" ON inventory_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inventory_update_own" ON inventory_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_delete_own" ON inventory_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_supplier ON inventory_items(supplier_id);
-- Optimizes the most common query pattern: active items for a user (soft-delete filter)
CREATE INDEX idx_inventory_user_active ON inventory_items(user_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- MENU ITEMS
------------------------------------------------------------

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id uuid, -- FK to recipes added via ALTER TABLE below (recipes table created after menu_items)
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Main Course',
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  sales_percentage numeric(5,2) NOT NULL DEFAULT 0,
  waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_select_own" ON menu_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "menu_insert_own" ON menu_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "menu_update_own" ON menu_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "menu_delete_own" ON menu_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_menu_user_id ON menu_items(user_id);

CREATE TRIGGER trg_menu_updated_at
  BEFORE UPDATE ON menu_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- RECIPES
------------------------------------------------------------

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Main Course',
  serving_size integer NOT NULL DEFAULT 1,
  prep_time_minutes integer,
  cook_time_minutes integer,
  difficulty_level text NOT NULL DEFAULT 'medium'
    CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  instructions text,
  cost_per_serving numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  profit_margin numeric(5,2) NOT NULL DEFAULT 0,
  popularity_score numeric(5,2) NOT NULL DEFAULT 0, -- manually entered or derived from POS integration (future)
  waste_percentage numeric(5,2) NOT NULL DEFAULT 0, -- manually entered estimate of food waste for this recipe
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_own" ON recipes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "recipes_insert_own" ON recipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update_own" ON recipes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete_own" ON recipes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- RECIPE INGREDIENTS
------------------------------------------------------------

CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_needed numeric(10,3) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ingredients_select" ON recipe_ingredients
  FOR SELECT TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_insert" ON recipe_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_update" ON recipe_ingredients
  FOR UPDATE TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_delete" ON recipe_ingredients
  FOR DELETE TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item ON recipe_ingredients(inventory_item_id);

-- Deferred FK: menu_items.recipe_id → recipes.id (menu_items created before recipes)
-- Nullable: menu items can exist without recipes (e.g., beverages from suppliers)
ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_recipe
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;

------------------------------------------------------------
-- WASTE EVENTS
------------------------------------------------------------

CREATE TABLE waste_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  quantity numeric(12,3) NOT NULL,
  unit text NOT NULL,
  estimated_value numeric(10,2) NOT NULL DEFAULT 0,
  reason text NOT NULL CHECK (reason IN (
    'expired', 'spoiled', 'overproduction', 'prep_waste',
    'damaged', 'customer_return', 'quality_issue', 'other'
  )),
  notes text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE waste_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waste_events_select_own" ON waste_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "waste_events_insert_own" ON waste_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "waste_events_update_own" ON waste_events
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "waste_events_delete_own" ON waste_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_waste_events_user_id ON waste_events(user_id);
CREATE INDEX idx_waste_events_item ON waste_events(inventory_item_id);
CREATE INDEX idx_waste_events_recorded ON waste_events(recorded_at);
CREATE INDEX idx_waste_events_reason ON waste_events(reason);

------------------------------------------------------------
-- PRODUCTS (shared barcode lookup table)
------------------------------------------------------------

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  category text,
  unit text NOT NULL DEFAULT 'pieces',
  average_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_all" ON products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_service_manage" ON products
  FOR ALL TO service_role USING (true);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- AI INSIGHTS
------------------------------------------------------------

CREATE TABLE ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'waste_reduction', 'cost_optimization',
    'inventory_optimization', 'menu_optimization'
  )),
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  estimated_savings numeric(10,2) NOT NULL DEFAULT 0,
  confidence numeric(5,2) NOT NULL DEFAULT 0
    CHECK (confidence >= 0 AND confidence <= 100),
  data_points jsonb NOT NULL DEFAULT '[]',
  recommended_actions jsonb NOT NULL DEFAULT '[]',
  related_items jsonb NOT NULL DEFAULT '[]',
  timeframe text NOT NULL DEFAULT 'Unknown',
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  implementation_date timestamptz,
  completion_date timestamptz,
  actual_savings numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- DEDUP: Prevent duplicate pending insights of the same type+title per user.
  -- refreshAIInsights() deletes pending insights then re-inserts; this constraint
  -- is a safety net against concurrent refresh calls that slip past the delete.
  -- NOTE: Includes status so a dismissed insight doesn't block a new pending one
  -- with the same title (e.g., user dismisses "Reduce Pizza Waste", next refresh
  -- can create a fresh pending insight with the same title).
  UNIQUE (user_id, type, title, status) -- upsert target for saveInsights()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_select_own" ON ai_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights_insert_own" ON ai_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_update_own" ON ai_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights_delete_own" ON ai_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_insights_type ON ai_insights(type);
CREATE INDEX idx_insights_status ON ai_insights(status);
CREATE INDEX idx_insights_priority ON ai_insights(priority);

CREATE TRIGGER trg_insights_updated_at
  BEFORE UPDATE ON ai_insights FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- WASTE ANALYSIS SNAPSHOTS
------------------------------------------------------------

CREATE TABLE waste_analysis_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date date NOT NULL DEFAULT CURRENT_DATE,
  total_inventory_value numeric(12,2) NOT NULL DEFAULT 0,
  monthly_spend numeric(12,2) NOT NULL DEFAULT 0,
  average_waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  inventory_turnover numeric(8,4) NOT NULL DEFAULT 0,
  cost_efficiency_score numeric(5,2) NOT NULL DEFAULT 0,
  seasonal_factor numeric(5,4) NOT NULL DEFAULT 1.0,
  data_quality_score numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, analysis_date)
);

ALTER TABLE waste_analysis_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_select_own" ON waste_analysis_snapshots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshots_insert_own" ON waste_analysis_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "snapshots_update_own" ON waste_analysis_snapshots
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshots_delete_own" ON waste_analysis_snapshots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_snapshots_user_id ON waste_analysis_snapshots(user_id);
CREATE INDEX idx_snapshots_date ON waste_analysis_snapshots(analysis_date);

------------------------------------------------------------
-- FEEDBACK
------------------------------------------------------------

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'general')),
  message text NOT NULL,
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_any" ON feedback
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "feedback_select_own" ON feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "feedback_service_read" ON feedback
  FOR SELECT TO service_role USING (true);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);

------------------------------------------------------------
-- STRIPE CUSTOMERS
------------------------------------------------------------

CREATE TABLE stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_customers_select_own" ON stripe_customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- STRIPE SUBSCRIPTIONS
------------------------------------------------------------

CREATE TYPE subscription_status AS ENUM (
  'not_started', 'incomplete', 'incomplete_expired',
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'
);

CREATE TABLE stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text NOT NULL UNIQUE,
  subscription_id text,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status subscription_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_subs_select_own" ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
  ));

CREATE TRIGGER trg_stripe_subs_updated_at
  BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- STORAGE BUCKETS
------------------------------------------------------------

-- Avatar uploads (TIER 7 settings page)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "avatar_upload_own" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "avatar_read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar_update_own" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "avatar_delete_own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

------------------------------------------------------------
-- RPC STORED PROCEDURES
-- These are called via supabase.rpc() from server actions
-- to guarantee transactional atomicity for multi-step ops.
------------------------------------------------------------

-- Race-safe relative quantity adjustment (TIER 3 inventory service).
-- Uses GREATEST to floor at 0 — inventory can never go negative.
-- Returns the updated row, or nothing if item is soft-deleted.
CREATE OR REPLACE FUNCTION adjust_quantity(p_item_id uuid, p_delta numeric)
RETURNS SETOF inventory_items AS $$
  UPDATE inventory_items
  SET quantity = GREATEST(0, quantity + p_delta),
      updated_at = now()
  WHERE id = p_item_id AND deleted_at IS NULL
  RETURNING *;
$$ LANGUAGE sql;

-- All-or-nothing CSV import with plan-limit enforcement (TIER 3 server actions).
-- Atomicity is guaranteed by PostgreSQL — if any INSERT fails or limit is exceeded,
-- the entire function call rolls back automatically.
CREATE OR REPLACE FUNCTION bulk_import_inventory(
  p_user_id uuid,
  p_items jsonb,
  p_plan_limit integer
)
RETURNS integer AS $$
DECLARE
  current_count integer;
  new_count integer;
BEGIN
  -- Lock to prevent concurrent imports racing past the limit check
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT count(*) INTO current_count
  FROM inventory_items
  WHERE user_id = p_user_id AND deleted_at IS NULL;

  new_count := jsonb_array_length(p_items);

  IF current_count + new_count > p_plan_limit THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: would have % items, limit is %',
      current_count + new_count, p_plan_limit;
  END IF;

  INSERT INTO inventory_items (user_id, name, category, quantity, unit, expiry_date, reorder_point, price_per_unit)
  SELECT
    p_user_id,
    (item->>'name')::text,
    COALESCE(item->>'category', 'Uncategorized'),
    COALESCE((item->>'quantity')::numeric, 0),
    COALESCE(item->>'unit', 'pieces'),
    (item->>'expiry_date')::date,
    COALESCE((item->>'reorder_point')::numeric, 0),
    COALESCE((item->>'price_per_unit')::numeric, 0)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Atomic ingredient add with recipe cost recalculation (TIER 4 server actions).
-- The entire function runs in a single transaction. FOR UPDATE on the recipe row
-- serializes concurrent ingredient changes.
CREATE OR REPLACE FUNCTION add_recipe_ingredient(
  p_recipe_id uuid,
  p_inventory_item_id uuid,
  p_quantity_needed numeric,
  p_unit text,
  p_cost_per_unit numeric
)
RETURNS void AS $$
DECLARE
  v_serving_size numeric;
  v_selling_price numeric;
  v_new_cost numeric;
BEGIN
  -- Lock the recipe row to serialize concurrent ingredient changes
  SELECT serving_size, selling_price INTO v_serving_size, v_selling_price
  FROM recipes WHERE id = p_recipe_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipe not found: %', p_recipe_id;
  END IF;

  -- Insert the ingredient
  INSERT INTO recipe_ingredients (recipe_id, inventory_item_id, quantity_needed, unit, cost_per_unit)
  VALUES (p_recipe_id, p_inventory_item_id, p_quantity_needed, p_unit, p_cost_per_unit);

  -- Recalculate cost_per_serving and profit_margin
  SELECT COALESCE(SUM(quantity_needed * cost_per_unit), 0) INTO v_new_cost
  FROM recipe_ingredients WHERE recipe_id = p_recipe_id;

  UPDATE recipes SET
    cost_per_serving = CASE WHEN v_serving_size > 0 THEN v_new_cost / v_serving_size ELSE 0 END,
    profit_margin = CASE
      WHEN v_selling_price > 0 THEN ((v_selling_price - (v_new_cost / GREATEST(v_serving_size, 1))) / v_selling_price) * 100
      ELSE 0
    END,
    updated_at = now()
  WHERE id = p_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic ingredient removal with recipe cost recalculation (TIER 4 server actions).
CREATE OR REPLACE FUNCTION remove_recipe_ingredient(p_ingredient_id uuid)
RETURNS void AS $$
DECLARE
  v_recipe_id uuid;
  v_serving_size numeric;
  v_selling_price numeric;
  v_new_cost numeric;
BEGIN
  -- Get the recipe_id before deleting
  SELECT recipe_id INTO v_recipe_id
  FROM recipe_ingredients WHERE id = p_ingredient_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ingredient not found: %', p_ingredient_id;
  END IF;

  -- Lock the recipe row
  SELECT serving_size, selling_price INTO v_serving_size, v_selling_price
  FROM recipes WHERE id = v_recipe_id FOR UPDATE;

  -- Delete the ingredient
  DELETE FROM recipe_ingredients WHERE id = p_ingredient_id;

  -- Recalculate
  SELECT COALESCE(SUM(quantity_needed * cost_per_unit), 0) INTO v_new_cost
  FROM recipe_ingredients WHERE recipe_id = v_recipe_id;

  UPDATE recipes SET
    cost_per_serving = CASE WHEN v_serving_size > 0 THEN v_new_cost / v_serving_size ELSE 0 END,
    profit_margin = CASE
      WHEN v_selling_price > 0 THEN ((v_selling_price - (v_new_cost / GREATEST(v_serving_size, 1))) / v_selling_price) * 100
      ELSE 0
    END,
    updated_at = now()
  WHERE id = v_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- FROM: supabase/migrations/002_organizations.sql
-- ------------------------------------------------------------
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
RETURNS TRIGGER AS $fn$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Create default organization for the new user
  new_org_id := gen_random_uuid();

  INSERT INTO public.organizations (id, name, owner_id)
  VALUES (new_org_id, concat(split_part(NEW.email, '@', 1), chr(39), 's Restaurant'), NEW.id);

  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------
-- FROM: supabase/migrations/003_purchase_orders.sql
-- ------------------------------------------------------------
-- Migration 003: Purchase Orders

------------------------------------------------------------
-- 1. NEW TABLES: purchase_orders and po_line_items
------------------------------------------------------------
CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'partially_received', 'received', 'cancelled')) DEFAULT 'draft',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  expected_delivery_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz
);

CREATE TABLE po_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_ordered numeric(10,2) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received numeric(10,2) NOT NULL DEFAULT 0,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_line_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- 2. RLS POLICIES FOR PURCHASE ORDERS
------------------------------------------------------------
CREATE POLICY "po_select_org" ON purchase_orders FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_insert_org" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_update_org" ON purchase_orders FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_delete_org" ON purchase_orders FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

------------------------------------------------------------
-- 3. RLS POLICIES FOR PO LINE ITEMS
------------------------------------------------------------
CREATE POLICY "po_line_select_org" ON po_line_items FOR SELECT TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_insert_org" ON po_line_items FOR INSERT TO authenticated WITH CHECK (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_update_org" ON po_line_items FOR UPDATE TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_delete_org" ON po_line_items FOR DELETE TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')))
);

------------------------------------------------------------
-- 4. RPC: receive_purchase_order
------------------------------------------------------------
-- This function marks a PO as received and automatically increments the inventory
CREATE OR REPLACE FUNCTION receive_purchase_order(p_po_id uuid)
RETURNS void AS $$
DECLARE
  v_org_id uuid;
  v_status text;
  line_item record;
BEGIN
  -- Verify PO exists and get org_id
  SELECT org_id, status INTO v_org_id, v_status FROM purchase_orders WHERE id = p_po_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Purchase order not found';
  END IF;
  
  IF v_status = 'received' THEN
    RAISE EXCEPTION 'Purchase order is already marked as received';
  END IF;

  -- Verify user has access to this org's POs
  IF NOT EXISTS (SELECT 1 FROM org_members WHERE org_id = v_org_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to receive this purchase order';
  END IF;

  -- Mark PO as received
  UPDATE purchase_orders 
  SET status = 'received', received_at = now(), updated_at = now()
  WHERE id = p_po_id;

  -- For each line item, mark it fully received and update inventory
  FOR line_item IN SELECT id, inventory_item_id, quantity_ordered FROM po_line_items WHERE po_id = p_po_id LOOP
    -- Update line item
    UPDATE po_line_items 
    SET quantity_received = line_item.quantity_ordered
    WHERE id = line_item.id;
    
    -- Update inventory (call existing adjust_quantity RPC for safe concurrent updates)
    PERFORM adjust_quantity(line_item.inventory_item_id, line_item.quantity_ordered);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- FROM: supabase/migrations/004_fix_rls_recursion.sql
-- ------------------------------------------------------------
-- Migration 004: Fix infinite recursion in org_members RLS policies
--
-- The org_members policies from migration 002 subquery org_members inside
-- their own USING/WITH CHECK clauses. Any query touching org_members (directly
-- or via another table's org-scoped policy) recursed infinitely (SQLSTATE 42P17),
-- which broke every org-scoped read: inventory, recipes, waste, purchasing.
--
-- Fix: SECURITY DEFINER helper functions bypass RLS when reading org_members,
-- so the policies terminate. Only org_members' own four policies change; the
-- other org-scoped policies keep their subqueries, which now evaluate against
-- these non-recursive policies.

CREATE OR REPLACE FUNCTION public.user_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid $$;

CREATE OR REPLACE FUNCTION public.user_admin_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid AND role IN ('owner', 'manager') $$;

CREATE OR REPLACE FUNCTION public.user_owner_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid AND role = 'owner' $$;

REVOKE ALL ON FUNCTION public.user_org_ids(uuid), public.user_admin_org_ids(uuid), public.user_owner_org_ids(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_org_ids(uuid), public.user_admin_org_ids(uuid), public.user_owner_org_ids(uuid) TO authenticated;

DROP POLICY IF EXISTS "members_select" ON org_members;
DROP POLICY IF EXISTS "members_insert" ON org_members;
DROP POLICY IF EXISTS "members_update" ON org_members;
DROP POLICY IF EXISTS "members_delete" ON org_members;

CREATE POLICY "members_select" ON org_members
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.user_org_ids(auth.uid())));

CREATE POLICY "members_insert" ON org_members
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT public.user_admin_org_ids(auth.uid())));

CREATE POLICY "members_update" ON org_members
  FOR UPDATE TO authenticated
  USING (org_id IN (SELECT public.user_owner_org_ids(auth.uid())));

CREATE POLICY "members_delete" ON org_members
  FOR DELETE TO authenticated
  USING (org_id IN (SELECT public.user_admin_org_ids(auth.uid())));

-- ------------------------------------------------------------
-- FROM: supabase/migrations/005_auto_org_id.sql
-- ------------------------------------------------------------
-- Migration 005: Auto-populate org_id on insert
--
-- Every org-scoped table has `org_id NOT NULL` with no default, but the app's
-- service-layer inserts only set user_id (see lib/services/*). So every create
-- action through the app — add inventory item, supplier, recipe, log waste,
-- purchase order — failed a NOT NULL violation, surfaced to users as the generic
-- "Something went wrong." The seeded demo data set org_id explicitly (as the
-- postgres superuser during setup), which is why the bug was invisible until a
-- real in-app insert.
--
-- Fix: a BEFORE INSERT trigger that fills org_id from the inserting user's org
-- membership when it's left null. Trigger runs before the RLS WITH CHECK is
-- evaluated, so the resulting row also satisfies the org-scoped insert policies.
-- Explicit org_id (e.g. the seed function, service-role admin writes) is left
-- untouched.

CREATE OR REPLACE FUNCTION public.set_org_id_default()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT om.org_id INTO NEW.org_id
    FROM org_members om
    WHERE om.user_id = auth.uid()
    ORDER BY om.joined_at
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'inventory_items', 'suppliers', 'recipes', 'waste_events',
    'waste_analysis_snapshots', 'menu_items', 'ai_insights', 'purchase_orders'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_org_id ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_set_org_id BEFORE INSERT ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_org_id_default()', t);
  END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- FROM: supabase/seed-demo.sql
-- ------------------------------------------------------------
-- ============================================================
-- DEMO SEED DATA
-- ============================================================
-- Run this AFTER signing up your first demo account.
-- Usage:
--   1. Sign up at your deployed app
--   2. Go to Supabase Dashboard → Authentication → Users
--   3. Copy the user's UUID
--   4. In SQL Editor, run:
--      SELECT seed_demo_data('<paste-uuid-here>');
-- ============================================================

CREATE OR REPLACE FUNCTION seed_demo_data(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_org_id uuid;
  v_supplier_1 uuid := gen_random_uuid();
  v_supplier_2 uuid := gen_random_uuid();
  v_supplier_3 uuid := gen_random_uuid();
  v_supplier_4 uuid := gen_random_uuid();
  v_supplier_5 uuid := gen_random_uuid();
  v_item_tomatoes uuid := gen_random_uuid();
  v_item_salmon uuid := gen_random_uuid();
  v_item_flour uuid := gen_random_uuid();
  v_item_milk uuid := gen_random_uuid();
  v_item_chicken uuid := gen_random_uuid();
  v_item_lettuce uuid := gen_random_uuid();
  v_item_mozzarella uuid := gen_random_uuid();
  v_item_olive_oil uuid := gen_random_uuid();
  v_item_onions uuid := gen_random_uuid();
  v_item_garlic uuid := gen_random_uuid();
  v_item_beef uuid := gen_random_uuid();
  v_item_cheddar uuid := gen_random_uuid();
  v_item_bread uuid := gen_random_uuid();
  v_item_rice uuid := gen_random_uuid();
  v_item_butter uuid := gen_random_uuid();
  v_item_eggs uuid := gen_random_uuid();
  v_item_cream uuid := gen_random_uuid();
  v_item_basil uuid := gen_random_uuid();
  v_item_shrimp uuid := gen_random_uuid();
  v_item_potatoes uuid := gen_random_uuid();
  v_recipe_1 uuid := gen_random_uuid();
  v_recipe_2 uuid := gen_random_uuid();
  v_recipe_3 uuid := gen_random_uuid();
  v_recipe_4 uuid := gen_random_uuid();
  v_recipe_5 uuid := gen_random_uuid();
  v_recipe_6 uuid := gen_random_uuid();
BEGIN
  -- Get the user's org
  SELECT org_id INTO v_org_id FROM org_members WHERE user_id = p_user_id LIMIT 1;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User not found or has no organization. Make sure you have signed up and completed onboarding.';
  END IF;

  -- Suppliers
  INSERT INTO suppliers (id, org_id, user_id, name, contact_email, contact_phone, rating, is_active) VALUES
    (v_supplier_1, v_org_id, p_user_id, 'Fresh Farms Direct', 'orders@freshfarms.com', '555-0101', 4, true),
    (v_supplier_2, v_org_id, p_user_id, 'Ocean Catch Seafood', 'sales@oceancatch.com', '555-0102', 5, true),
    (v_supplier_3, v_org_id, p_user_id, 'Valley Meats Co', 'info@valleymeats.com', '555-0103', 3, true),
    (v_supplier_4, v_org_id, p_user_id, 'Artisan Bakery Supply', 'wholesale@artisanbakery.com', '555-0104', 4, true),
    (v_supplier_5, v_org_id, p_user_id, 'Green Valley Produce', 'orders@greenvalley.com', '555-0105', 4, true);

  -- Inventory Items (20) — varied stock levels, some low, some overstocked, some near expiry
  INSERT INTO inventory_items (id, org_id, user_id, supplier_id, name, category, quantity, unit, expiry_date, reorder_point, max_stock_level, price_per_unit) VALUES
    (v_item_tomatoes,    v_org_id, p_user_id, v_supplier_5, 'Roma Tomatoes',      'Produce',   5.0,   'lbs',     CURRENT_DATE + 2,   20, 50,  3.49),
    (v_item_salmon,      v_org_id, p_user_id, v_supplier_2, 'Atlantic Salmon',    'Protein',   8.0,   'lbs',     CURRENT_DATE + 1,   10, 25,  16.99),
    (v_item_flour,       v_org_id, p_user_id, v_supplier_4, 'All-Purpose Flour',  'Dry Goods', 120.0, 'lbs',     CURRENT_DATE + 180, 30, 60,  2.49),
    (v_item_milk,        v_org_id, p_user_id, v_supplier_1, 'Whole Milk',         'Dairy',     15.0,  'gallons', CURRENT_DATE + 5,   10, 30,  3.49),
    (v_item_chicken,     v_org_id, p_user_id, v_supplier_3, 'Chicken Breast',     'Protein',   25.0,  'lbs',     CURRENT_DATE + 4,   15, 50,  7.99),
    (v_item_lettuce,     v_org_id, p_user_id, v_supplier_5, 'Romaine Lettuce',    'Produce',   3.0,   'heads',   CURRENT_DATE + 3,   12, 30,  2.99),
    (v_item_mozzarella,  v_org_id, p_user_id, v_supplier_1, 'Fresh Mozzarella',   'Dairy',     6.0,   'lbs',     CURRENT_DATE + 7,   8,  20,  8.99),
    (v_item_olive_oil,   v_org_id, p_user_id, v_supplier_5, 'Extra Virgin Olive Oil', 'Pantry', 10.0, 'bottles', CURRENT_DATE + 365, 5,  15,  12.99),
    (v_item_onions,      v_org_id, p_user_id, v_supplier_5, 'Yellow Onions',      'Produce',   40.0,  'lbs',     CURRENT_DATE + 14,  15, 50,  1.99),
    (v_item_garlic,      v_org_id, p_user_id, v_supplier_5, 'Garlic Cloves',      'Produce',   8.0,   'lbs',     CURRENT_DATE + 21,  5,  15,  4.99),
    (v_item_beef,        v_org_id, p_user_id, v_supplier_3, 'Ground Beef',        'Protein',   4.0,   'lbs',     CURRENT_DATE + 3,   12, 30,  9.99),
    (v_item_cheddar,     v_org_id, p_user_id, v_supplier_1, 'Cheddar Cheese',     'Dairy',     12.0,  'lbs',     CURRENT_DATE + 30,  5,  20,  6.99),
    (v_item_bread,       v_org_id, p_user_id, v_supplier_4, 'Sourdough Bread',    'Bakery',    2.0,   'loaves',  CURRENT_DATE + 2,   8,  20,  4.99),
    (v_item_rice,        v_org_id, p_user_id, v_supplier_1, 'Jasmine Rice',       'Dry Goods', 50.0,  'lbs',     CURRENT_DATE + 180, 20, 60,  1.89),
    (v_item_butter,      v_org_id, p_user_id, v_supplier_1, 'Unsalted Butter',    'Dairy',     18.0,  'lbs',     CURRENT_DATE + 30,  10, 25,  5.49),
    (v_item_eggs,        v_org_id, p_user_id, v_supplier_1, 'Large Eggs',         'Dairy',     6.0,   'dozen',   CURRENT_DATE + 14,  10, 30,  3.99),
    (v_item_cream,       v_org_id, p_user_id, v_supplier_1, 'Heavy Cream',        'Dairy',     4.0,   'quarts',  CURRENT_DATE + 7,   6,  15,  4.49),
    (v_item_basil,       v_org_id, p_user_id, v_supplier_5, 'Fresh Basil',        'Produce',   2.0,   'bunches', CURRENT_DATE + 3,   5,  12,  2.99),
    (v_item_shrimp,      v_org_id, p_user_id, v_supplier_2, 'Jumbo Shrimp',       'Protein',   10.0,  'lbs',     CURRENT_DATE + 2,   8,  20,  14.99),
    (v_item_potatoes,    v_org_id, p_user_id, v_supplier_5, 'Russet Potatoes',    'Produce',   45.0,  'lbs',     CURRENT_DATE + 21,  20, 60,  1.49);

  -- Recipes (6)
  INSERT INTO recipes (id, org_id, user_id, name, category, serving_size, prep_time_minutes, cook_time_minutes, difficulty_level, cost_per_serving, selling_price, profit_margin, waste_percentage) VALUES
    (v_recipe_1, v_org_id, p_user_id, 'Caesar Salad',       'Appetizer', 4,  15, 0,  'easy',   3.20, 14.00, 77.14, 2.1),
    (v_recipe_2, v_org_id, p_user_id, 'Grilled Salmon',     'Entree',    2,  10, 20, 'medium', 8.50, 28.00, 69.64, 4.2),
    (v_recipe_3, v_org_id, p_user_id, 'Margherita Pizza',   'Entree',    2,  20, 15, 'medium', 4.10, 18.00, 77.22, 3.5),
    (v_recipe_4, v_org_id, p_user_id, 'Beef Burger',        'Entree',    1,  10, 12, 'easy',   5.20, 16.00, 67.50, 5.0),
    (v_recipe_5, v_org_id, p_user_id, 'Shrimp Scampi',      'Entree',    2,  15, 15, 'medium', 9.80, 26.00, 62.31, 3.8),
    (v_recipe_6, v_org_id, p_user_id, 'Mashed Potatoes',    'Side',      4,  15, 20, 'easy',   1.50,  8.00, 81.25, 1.5);

  -- Recipe Ingredients
  INSERT INTO recipe_ingredients (recipe_id, inventory_item_id, quantity_needed, unit, cost_per_unit) VALUES
    (v_recipe_1, v_item_lettuce,    2,     'heads',   2.99),
    (v_recipe_1, v_item_cheddar,    0.5,   'lbs',     6.99),
    (v_recipe_1, v_item_bread,      0.25,  'loaves',  4.99),
    (v_recipe_2, v_item_salmon,     1.5,   'lbs',    16.99),
    (v_recipe_2, v_item_butter,     0.25,  'lbs',     5.49),
    (v_recipe_2, v_item_garlic,     0.1,   'lbs',     4.99),
    (v_recipe_3, v_item_flour,      0.5,   'lbs',     2.49),
    (v_recipe_3, v_item_mozzarella, 0.75,  'lbs',     8.99),
    (v_recipe_3, v_item_tomatoes,   1,     'lbs',     3.49),
    (v_recipe_3, v_item_basil,      0.5,   'bunches', 2.99),
    (v_recipe_4, v_item_beef,       0.5,   'lbs',     9.99),
    (v_recipe_4, v_item_onions,     0.25,  'lbs',     1.99),
    (v_recipe_4, v_item_cheddar,    0.25,  'lbs',     6.99),
    (v_recipe_5, v_item_shrimp,     1,     'lbs',    14.99),
    (v_recipe_5, v_item_butter,     0.25,  'lbs',     5.49),
    (v_recipe_5, v_item_garlic,     0.15,  'lbs',     4.99),
    (v_recipe_6, v_item_potatoes,   2,     'lbs',     1.49),
    (v_recipe_6, v_item_butter,     0.5,   'lbs',     5.49),
    (v_recipe_6, v_item_cream,      0.5,   'quarts',  4.49);

  -- Menu Items (10)
  INSERT INTO menu_items (org_id, user_id, recipe_id, name, category, selling_price, sales_percentage, waste_percentage, is_active) VALUES
    (v_org_id, p_user_id, v_recipe_1, 'Caesar Salad',       'Appetizer', 14.00, 12.5, 2.1,  true),
    (v_org_id, p_user_id, v_recipe_2, 'Grilled Salmon',     'Entree',    28.00, 18.3, 4.2,  true),
    (v_org_id, p_user_id, v_recipe_3, 'Margherita Pizza',   'Entree',    18.00, 22.1, 3.5,  true),
    (v_org_id, p_user_id, v_recipe_4, 'Classic Burger',     'Entree',    16.00, 15.8, 5.0,  true),
    (v_org_id, p_user_id, v_recipe_5, 'Shrimp Scampi',      'Entree',    26.00,  8.4, 3.8,  true),
    (v_org_id, p_user_id, v_recipe_6, 'Mashed Potatoes',    'Side',       8.00, 10.2, 1.5,  true),
    (v_org_id, p_user_id, NULL,       'Garlic Bread',       'Appetizer',  7.00,  5.1, 1.8,  true),
    (v_org_id, p_user_id, NULL,       'Tiramisu',           'Dessert',   12.00,  4.3, 6.2,  true),
    (v_org_id, p_user_id, NULL,       'Lobster Bisque',     'Appetizer', 16.00,  2.1, 8.5,  true),
    (v_org_id, p_user_id, NULL,       'House Lemonade',     'Beverage',   5.00,  1.2, 0.5, false);

  -- Waste Events (30) — distributed over past 90 days
  INSERT INTO waste_events (org_id, user_id, inventory_item_id, quantity, unit, estimated_value, reason, notes, recorded_at) VALUES
    (v_org_id, p_user_id, v_item_tomatoes,   3.0,  'lbs',     10.47, 'expired',        'Past expiry date',              NOW() - INTERVAL '2 days'),
    (v_org_id, p_user_id, v_item_salmon,     1.5,  'lbs',     25.49, 'spoiled',         'Discoloration noticed',         NOW() - INTERVAL '5 days'),
    (v_org_id, p_user_id, v_item_lettuce,    4.0,  'heads',   11.96, 'expired',        'Wilted beyond use',             NOW() - INTERVAL '3 days'),
    (v_org_id, p_user_id, v_item_bread,      3.0,  'loaves',  14.97, 'expired',        'Stale',                         NOW() - INTERVAL '1 day'),
    (v_org_id, p_user_id, v_item_chicken,    2.0,  'lbs',     15.98, 'spoiled',         'Temperature issue',             NOW() - INTERVAL '7 days'),
    (v_org_id, p_user_id, v_item_milk,       2.0,  'gallons',  6.98, 'expired',        'Past use-by date',              NOW() - INTERVAL '10 days'),
    (v_org_id, p_user_id, v_item_cream,      1.0,  'quarts',   4.49, 'expired',        'Curdled',                       NOW() - INTERVAL '8 days'),
    (v_org_id, p_user_id, v_item_basil,      3.0,  'bunches',  8.97, 'spoiled',         'Wilted leaves',                 NOW() - INTERVAL '4 days'),
    (v_org_id, p_user_id, v_item_beef,       1.0,  'lbs',      9.99, 'quality_issue',  'Color off',                     NOW() - INTERVAL '6 days'),
    (v_org_id, p_user_id, v_item_shrimp,     2.0,  'lbs',     29.98, 'spoiled',         'Odor detected',                 NOW() - INTERVAL '9 days'),
    (v_org_id, p_user_id, v_item_tomatoes,   2.0,  'lbs',      6.98, 'overproduction', 'Prepped too many for service',  NOW() - INTERVAL '15 days'),
    (v_org_id, p_user_id, v_item_lettuce,    2.0,  'heads',    5.98, 'prep_waste',     'Outer leaves trimmed',          NOW() - INTERVAL '12 days'),
    (v_org_id, p_user_id, v_item_onions,     3.0,  'lbs',      5.97, 'prep_waste',     'Trimmings from prep',           NOW() - INTERVAL '14 days'),
    (v_org_id, p_user_id, v_item_salmon,     0.5,  'lbs',      8.50, 'prep_waste',     'Skin and trimmings',            NOW() - INTERVAL '20 days'),
    (v_org_id, p_user_id, v_item_chicken,    1.5,  'lbs',     11.99, 'overproduction', 'Extra grilled, not sold',       NOW() - INTERVAL '18 days'),
    (v_org_id, p_user_id, v_item_mozzarella, 1.0,  'lbs',      8.99, 'expired',        'Opened and not used in time',   NOW() - INTERVAL '22 days'),
    (v_org_id, p_user_id, v_item_bread,      2.0,  'loaves',   9.98, 'overproduction', 'Excess from weekend service',   NOW() - INTERVAL '25 days'),
    (v_org_id, p_user_id, v_item_eggs,       1.0,  'dozen',    3.99, 'damaged',        'Dropped during prep',           NOW() - INTERVAL '30 days'),
    (v_org_id, p_user_id, v_item_tomatoes,   4.0,  'lbs',     13.96, 'spoiled',         'Soft spots, mold',              NOW() - INTERVAL '35 days'),
    (v_org_id, p_user_id, v_item_shrimp,     1.0,  'lbs',     14.99, 'expired',        'Freezer burned',                NOW() - INTERVAL '40 days'),
    (v_org_id, p_user_id, v_item_milk,       1.0,  'gallons',  3.49, 'spoiled',         'Soured early',                  NOW() - INTERVAL '42 days'),
    (v_org_id, p_user_id, v_item_beef,       2.0,  'lbs',     19.98, 'overproduction', 'Over-ordered for event',        NOW() - INTERVAL '45 days'),
    (v_org_id, p_user_id, v_item_cream,      0.5,  'quarts',   2.25, 'expired',        'Past date',                     NOW() - INTERVAL '50 days'),
    (v_org_id, p_user_id, v_item_lettuce,    3.0,  'heads',    8.97, 'expired',        'Batch went bad',                NOW() - INTERVAL '55 days'),
    (v_org_id, p_user_id, v_item_chicken,    1.0,  'lbs',      7.99, 'spoiled',         'Off smell',                     NOW() - INTERVAL '58 days'),
    (v_org_id, p_user_id, v_item_basil,      2.0,  'bunches',  5.98, 'expired',        'Dried out',                     NOW() - INTERVAL '60 days'),
    (v_org_id, p_user_id, v_item_potatoes,   5.0,  'lbs',      7.45, 'spoiled',         'Sprouted',                      NOW() - INTERVAL '65 days'),
    (v_org_id, p_user_id, v_item_salmon,     1.0,  'lbs',     16.99, 'expired',        'Forgot in walk-in',             NOW() - INTERVAL '70 days'),
    (v_org_id, p_user_id, v_item_tomatoes,   2.5,  'lbs',      8.73, 'overproduction', 'Excess sauce made',             NOW() - INTERVAL '75 days'),
    (v_org_id, p_user_id, v_item_bread,      4.0,  'loaves',  19.96, 'expired',        'Holiday weekend excess',        NOW() - INTERVAL '80 days');

  -- Waste Analysis Snapshots (12 weeks)
  INSERT INTO waste_analysis_snapshots (org_id, user_id, analysis_date, total_inventory_value, monthly_spend, average_waste_percentage, inventory_turnover, cost_efficiency_score, seasonal_factor, data_quality_score) VALUES
    (v_org_id, p_user_id, CURRENT_DATE - 7,   4500.00, 12000.00, 6.8,  2.67, 82.5, 1.00, 0.85),
    (v_org_id, p_user_id, CURRENT_DATE - 14,  4200.00, 11800.00, 7.2,  2.81, 80.1, 1.00, 0.82),
    (v_org_id, p_user_id, CURRENT_DATE - 21,  4800.00, 12200.00, 5.9,  2.54, 85.0, 1.00, 0.80),
    (v_org_id, p_user_id, CURRENT_DATE - 28,  4100.00, 11500.00, 8.1,  2.80, 78.3, 1.03, 0.78),
    (v_org_id, p_user_id, CURRENT_DATE - 35,  4350.00, 11700.00, 7.5,  2.69, 79.8, 1.03, 0.76),
    (v_org_id, p_user_id, CURRENT_DATE - 42,  4600.00, 12100.00, 6.2,  2.63, 83.5, 1.05, 0.74),
    (v_org_id, p_user_id, CURRENT_DATE - 49,  4750.00, 12400.00, 5.5,  2.61, 86.1, 1.05, 0.72),
    (v_org_id, p_user_id, CURRENT_DATE - 56,  4000.00, 11200.00, 8.8,  2.80, 76.2, 1.05, 0.70),
    (v_org_id, p_user_id, CURRENT_DATE - 63,  4300.00, 11600.00, 7.0,  2.70, 81.0, 1.12, 0.68),
    (v_org_id, p_user_id, CURRENT_DATE - 70,  4550.00, 11900.00, 6.5,  2.62, 82.8, 1.12, 0.66),
    (v_org_id, p_user_id, CURRENT_DATE - 77,  4150.00, 11400.00, 7.8,  2.75, 79.0, 1.12, 0.64),
    (v_org_id, p_user_id, CURRENT_DATE - 84,  4400.00, 11800.00, 6.9,  2.68, 81.5, 1.15, 0.62);

  -- Update user profile with restaurant info and mark onboarding complete
  UPDATE users SET
    restaurant_name = COALESCE(restaurant_name, 'Demo Restaurant'),
    monthly_budget = COALESCE(monthly_budget, 12000),
    settings = jsonb_set(
      COALESCE(settings, '{}'::jsonb),
      '{onboarding_completed}',
      'true'
    ),
    updated_at = NOW()
  WHERE id = p_user_id;

  RAISE NOTICE 'Demo data seeded successfully for user %', p_user_id;
END;
$$ LANGUAGE plpgsql;
