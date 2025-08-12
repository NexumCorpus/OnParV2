-- OnPar Demo Data for Beta Testing
-- Run this in your Supabase SQL Editor after setting up a demo account

-- Demo inventory items for a typical small restaurant
INSERT INTO inventory_items (user_id, name, quantity, unit, reorder_point, price_per_unit, expiry_date) VALUES
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users table
('YOUR_USER_ID_HERE', 'Ground Beef (80/20)', 25, 'lbs', 10, 4.99, '2025-01-20'),
('YOUR_USER_ID_HERE', 'Chicken Breast', 15, 'lbs', 8, 6.49, '2025-01-18'),
('YOUR_USER_ID_HERE', 'Fresh Mozzarella', 8, 'lbs', 5, 7.99, '2025-01-22'),
('YOUR_USER_ID_HERE', 'Roma Tomatoes', 12, 'lbs', 6, 2.99, '2025-01-16'),
('YOUR_USER_ID_HERE', 'Lettuce (Iceberg)', 6, 'heads', 3, 1.49, '2025-01-15'),
('YOUR_USER_ID_HERE', 'Onions (Yellow)', 20, 'lbs', 8, 1.29, '2025-02-10'),
('YOUR_USER_ID_HERE', 'Olive Oil (Extra Virgin)', 4, 'bottles', 2, 12.99, '2025-06-15'),
('YOUR_USER_ID_HERE', 'Flour (All Purpose)', 50, 'lbs', 20, 0.89, '2025-04-20'),
('YOUR_USER_ID_HERE', 'Eggs (Large)', 8, 'dozen', 4, 3.49, '2025-01-25'),
('YOUR_USER_ID_HERE', 'Milk (Whole)', 6, 'gallons', 3, 4.29, '2025-01-19'),
('YOUR_USER_ID_HERE', 'Cheddar Cheese', 5, 'lbs', 3, 8.99, '2025-02-05'),
('YOUR_USER_ID_HERE', 'Bell Peppers (Mixed)', 8, 'lbs', 4, 3.99, '2025-01-17'),
('YOUR_USER_ID_HERE', 'Mushrooms (Button)', 4, 'lbs', 2, 4.49, '2025-01-16'),
('YOUR_USER_ID_HERE', 'Bacon', 6, 'lbs', 3, 7.99, '2025-01-30'),
('YOUR_USER_ID_HERE', 'Pasta (Penne)', 12, 'lbs', 6, 2.49, '2025-08-15'),
('YOUR_USER_ID_HERE', 'Marinara Sauce', 8, 'jars', 4, 3.99, '2025-03-20'),
('YOUR_USER_ID_HERE', 'Garlic', 3, 'lbs', 2, 4.99, '2025-01-25'),
('YOUR_USER_ID_HERE', 'Basil (Fresh)', 2, 'bunches', 1, 2.99, '2025-01-14'),
('YOUR_USER_ID_HERE', 'Parmesan Cheese', 3, 'lbs', 2, 15.99, '2025-03-01'),
('YOUR_USER_ID_HERE', 'Bread Rolls', 24, 'pieces', 12, 0.75, '2025-01-16');

-- Demo menu items with realistic sales and waste percentages
INSERT INTO menu_items (user_id, name, sales_percentage, waste_percentage) VALUES
('YOUR_USER_ID_HERE', 'Classic Cheeseburger', 18.5, 3.2),
('YOUR_USER_ID_HERE', 'Margherita Pizza', 15.2, 2.8),
('YOUR_USER_ID_HERE', 'Caesar Salad', 12.8, 8.5),
('YOUR_USER_ID_HERE', 'Chicken Parmesan', 11.3, 4.1),
('YOUR_USER_ID_HERE', 'Spaghetti Carbonara', 9.7, 3.6),
('YOUR_USER_ID_HERE', 'Grilled Chicken Sandwich', 8.9, 2.9),
('YOUR_USER_ID_HERE', 'Mushroom Risotto', 6.4, 7.2),
('YOUR_USER_ID_HERE', 'Fish & Chips', 5.8, 5.1),
('YOUR_USER_ID_HERE', 'Vegetable Stir Fry', 4.2, 9.8),
('YOUR_USER_ID_HERE', 'BBQ Bacon Burger', 3.9, 4.3),
('YOUR_USER_ID_HERE', 'Caprese Salad', 2.1, 12.4),
('YOUR_USER_ID_HERE', 'Seafood Pasta', 1.2, 8.7);

-- Instructions for use:
-- 1. Create a demo account by signing up at /auth
-- 2. Find your user ID in the Supabase auth.users table
-- 3. Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- 4. Run this script in Supabase SQL Editor
-- 5. Refresh your dashboard to see the demo data

-- This creates a realistic restaurant inventory with:
-- - Items that are low stock (trigger alerts)
-- - Items expiring soon (trigger alerts) 
-- - Mix of perishable and non-perishable items
-- - Menu items with varying performance (some high waste, some high sales)
-- - Realistic pricing for cost calculations