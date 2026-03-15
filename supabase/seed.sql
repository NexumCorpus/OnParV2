-- Sample products for barcode lookup
INSERT INTO products (barcode, name, brand, category, unit, average_price) VALUES
  ('123456789012', 'Organic Tomatoes', 'Fresh Valley', 'Produce', 'lbs', 3.99),
  ('987654321098', 'Fresh Mozzarella', 'Bella Vista', 'Dairy', 'lbs', 8.99),
  ('456789123456', 'Extra Virgin Olive Oil', 'Mediterranean Gold', 'Pantry', 'bottles', 12.99),
  ('789123456789', 'Whole Wheat Pasta', 'Artisan Mills', 'Pantry', 'boxes', 2.49),
  ('321654987321', 'Sea Salt', 'Ocean Harvest', 'Seasonings', 'containers', 4.99),
  ('654987321654', 'Black Pepper', 'Spice Masters', 'Seasonings', 'containers', 6.99),
  ('147258369147', 'Chicken Breast', 'Farm Fresh', 'Meat', 'lbs', 7.99),
  ('258369147258', 'Ground Beef', 'Premium Cuts', 'Meat', 'lbs', 9.99),
  ('369147258369', 'Salmon Fillet', 'Ocean Select', 'Seafood', 'lbs', 16.99),
  ('741852963741', 'Romaine Lettuce', 'Green Fields', 'Produce', 'heads', 2.99),
  ('852963741852', 'Yellow Onions', 'Farm Direct', 'Produce', 'lbs', 1.99),
  ('963741852963', 'Garlic Cloves', 'Aromatic Farms', 'Produce', 'lbs', 4.99),
  ('159753486159', 'Cheddar Cheese', 'Dairy Best', 'Dairy', 'lbs', 6.99),
  ('357159486357', 'Whole Milk', 'Fresh Dairy', 'Dairy', 'gallons', 3.49),
  ('486159357486', 'Sourdough Bread', 'Artisan Bakery', 'Bakery', 'loaves', 4.99),
  ('159486357159', 'Canola Oil', 'Pure Gold', 'Pantry', 'bottles', 8.99),
  ('486357159486', 'All-Purpose Flour', 'Baker''s Choice', 'Pantry', 'lbs', 3.99),
  ('357486159357', 'White Sugar', 'Sweet Valley', 'Pantry', 'lbs', 2.99),
  ('486159486159', 'Kosher Salt', 'Crystal Pure', 'Seasonings', 'containers', 3.99),
  ('159357159357', 'Vanilla Extract', 'Pure Essence', 'Baking', 'bottles', 9.99)
ON CONFLICT (barcode) DO NOTHING;

-- ============================================================
-- DEVELOPMENT SEED DATA
-- ============================================================
-- This data provides realistic restaurant inventory so that
-- dashboards, charts, and analytics render meaningfully.
-- Replace DEMO_USER_ID with the actual UUID after creating a
-- demo account via Supabase Auth, or use a seed trigger.
--
-- To use: After signing up your first dev account, copy its UUID
-- and run: UPDATE ... SET user_id = '<your-uuid>' WHERE user_id = 'DEMO_USER_ID';
-- Or simply use the SQL below as a template.

-- Suppliers (5)
-- INSERT INTO suppliers (id, user_id, name, contact_email, contact_phone, rating, is_active) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, 'Fresh Farms Direct', 'orders@freshfarms.com', '555-0101', 4, true),
--   (gen_random_uuid(), DEMO_USER_ID, 'Ocean Catch Seafood', 'sales@oceancatch.com', '555-0102', 5, true),
--   (gen_random_uuid(), DEMO_USER_ID, 'Valley Meats Co', 'info@valleymeats.com', '555-0103', 3, true),
--   (gen_random_uuid(), DEMO_USER_ID, 'Artisan Bakery Supply', 'wholesale@artisanbakery.com', '555-0104', 4, true),
--   (gen_random_uuid(), DEMO_USER_ID, 'Green Valley Produce', 'orders@greenvalley.com', '555-0105', 4, true);

-- Inventory Items (25) — spread across categories with varied stock levels
-- Categories: Produce, Protein, Dairy, Dry Goods, Beverages
-- Include items at: normal stock, low stock (qty <= reorder_point), near expiry (within 3 days), overstocked
-- Example rows (generate 25 like this with realistic quantities and prices):
-- INSERT INTO inventory_items (id, user_id, name, category, quantity, unit, expiry_date, reorder_point, max_stock_level, price_per_unit) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, 'Roma Tomatoes', 'Produce', 5.0, 'lbs', CURRENT_DATE + 2, 20, 50, 3.49),   -- LOW STOCK + NEAR EXPIRY
--   (gen_random_uuid(), DEMO_USER_ID, 'Atlantic Salmon', 'Protein', 8.0, 'lbs', CURRENT_DATE + 1, 10, 25, 16.99), -- NEAR EXPIRY
--   (gen_random_uuid(), DEMO_USER_ID, 'All-Purpose Flour', 'Dry Goods', 120.0, 'lbs', CURRENT_DATE + 180, 30, 60, 2.49), -- OVERSTOCKED
--   (gen_random_uuid(), DEMO_USER_ID, 'Whole Milk', 'Dairy', 15.0, 'gallons', CURRENT_DATE + 5, 10, 30, 3.49),   -- NORMAL
--   ... (21 more items covering all categories)

-- Recipes (8) with ingredients
-- INSERT INTO recipes (id, user_id, name, category, serving_size, prep_time_minutes, cook_time_minutes, difficulty_level, cost_per_serving, selling_price, profit_margin) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, 'Caesar Salad', 'Appetizer', 4, 15, 0, 'easy', 3.20, 14.00, 77.14),
--   (gen_random_uuid(), DEMO_USER_ID, 'Grilled Salmon', 'Entree', 2, 10, 20, 'medium', 8.50, 28.00, 69.64),
--   (gen_random_uuid(), DEMO_USER_ID, 'Margherita Pizza', 'Entree', 2, 20, 15, 'medium', 4.10, 18.00, 77.22),
--   ... (5 more recipes)

-- Menu Items (10) with sales and waste metrics
-- INSERT INTO menu_items (id, user_id, name, category, selling_price, sales_percentage, waste_percentage, is_active) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, 'Caesar Salad', 'Appetizer', 14.00, 12.5, 2.1, true),
--   (gen_random_uuid(), DEMO_USER_ID, 'Grilled Salmon', 'Entree', 28.00, 18.3, 4.2, true),
--   ... (8 more menu items)

-- Waste Events (30) — distributed over past 90 days
-- Reasons: expired (40%), spoiled (25%), overproduction (20%), prep_waste (10%), other (5%)
-- INSERT INTO waste_events (id, user_id, inventory_item_id, quantity, unit, estimated_value, reason, notes, recorded_at) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, <tomato_id>, 3.0, 'lbs', 10.47, 'expired', 'Past expiry date', NOW() - INTERVAL '2 days'),
--   (gen_random_uuid(), DEMO_USER_ID, <salmon_id>, 1.5, 'lbs', 25.49, 'spoiled', 'Discoloration noticed', NOW() - INTERVAL '5 days'),
--   ... (28 more waste events spread across 90 days)

-- Waste Analysis Snapshots (12) — one per week for past 3 months
-- INSERT INTO waste_analysis_snapshots (id, user_id, analysis_date, total_inventory_value, monthly_spend, average_waste_percentage, inventory_turnover, cost_efficiency_score, seasonal_factor, data_quality_score) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, CURRENT_DATE - 7, 4500.00, 12000.00, 6.8, 2.67, 82.5, 1.0, 0.75),
--   (gen_random_uuid(), DEMO_USER_ID, CURRENT_DATE - 14, 4200.00, 11800.00, 7.2, 2.81, 80.1, 1.0, 0.72),
--   ... (10 more snapshots)

-- AI Insights (5) — mix of statuses
-- INSERT INTO ai_insights (id, user_id, type, title, description, impact, estimated_savings, confidence, priority, status) VALUES
--   (gen_random_uuid(), DEMO_USER_ID, 'high_waste', 'Reduce Tomato Waste', 'Tomato waste is 8.5% above average. Consider smaller orders.', 'high', 120.00, 0.85, 1, 'pending'),
--   (gen_random_uuid(), DEMO_USER_ID, 'overstock', 'Flour Overstocked', 'Current flour stock is 4x reorder point. Pause orders.', 'medium', 60.00, 0.92, 2, 'pending'),
--   (gen_random_uuid(), DEMO_USER_ID, 'cost_saving', 'Switch Olive Oil Supplier', 'Competitor offers 15% lower pricing.', 'medium', 45.00, 0.70, 3, 'in_progress'),
--   (gen_random_uuid(), DEMO_USER_ID, 'budget_alert', 'Budget 85% Used', 'Monthly spend approaching budget limit.', 'high', 0, 0.95, 1, 'pending'),
--   (gen_random_uuid(), DEMO_USER_ID, 'high_waste', 'Salmon Spoilage Pattern', 'Tuesday deliveries spoil by Friday. Shift to Thursday.', 'high', 200.00, 0.80, 1, 'completed');

-- NOTE: The above INSERT statements use placeholder IDs and DEMO_USER_ID.
-- To activate: create a dev account, capture its UUID, and run these inserts
-- with the real user_id. Cross-reference inventory_item_id values as needed.
