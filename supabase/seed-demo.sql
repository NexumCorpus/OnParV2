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
