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
