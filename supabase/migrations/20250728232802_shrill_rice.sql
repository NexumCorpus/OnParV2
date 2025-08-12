-- Seed data for OnPar application
-- This file contains sample data for testing the application

-- Insert sample users (restaurants)
INSERT INTO users (id, email, restaurant_name, monthly_budget, premium_subscription) VALUES
  ('11111111-1111-1111-1111-111111111111', 'mario@italyskitchen.com', 'Mario''s Italian Kitchen', 5000.00, true),
  ('22222222-2222-2222-2222-222222222222', 'chen@dragonwok.com', 'Dragon Wok Express', 3500.00, false),
  ('33333333-3333-3333-3333-333333333333', 'sophie@cafebloom.com', 'Cafe Bloom', 2800.00, true),
  ('44444444-4444-4444-4444-444444444444', 'carlos@tacosol.com', 'Taco Sol', 4200.00, false),
  ('55555555-5555-5555-5555-555555555555', 'raj@spiceroute.com', 'Spice Route', 3800.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_items (user_id, name, quantity, unit, expiry_date, reorder_point, price_per_unit) VALUES
  -- Mario's Italian Kitchen
  ('11111111-1111-1111-1111-111111111111', 'Tomato Sauce', 24, 'cans', '2025-08-15', 10, 2.50),
  ('11111111-1111-1111-1111-111111111111', 'Mozzarella Cheese', 5, 'kg', '2025-02-05', 8, 12.00),
  ('11111111-1111-1111-1111-111111111111', 'Pasta (Spaghetti)', 50, 'kg', NULL, 20, 3.20),
  ('11111111-1111-1111-1111-111111111111', 'Olive Oil', 8, 'liters', '2025-12-01', 3, 15.00),
  
  -- Dragon Wok Express
  ('22222222-2222-2222-2222-222222222222', 'Soy Sauce', 12, 'bottles', '2025-10-20', 5, 4.50),
  ('22222222-2222-2222-2222-222222222222', 'Rice (Jasmine)', 30, 'kg', NULL, 15, 2.80),
  ('22222222-2222-2222-2222-222222222222', 'Chicken Breast', 15, 'kg', '2025-02-03', 20, 8.50),
  ('22222222-2222-2222-2222-222222222222', 'Vegetables Mix', 10, 'kg', '2025-01-30', 12, 6.20),
  
  -- Cafe Bloom
  ('33333333-3333-3333-3333-333333333333', 'Coffee Beans', 20, 'kg', '2025-03-15', 8, 18.00),
  ('33333333-3333-3333-3333-333333333333', 'Milk', 40, 'liters', '2025-01-28', 25, 1.20),
  ('33333333-3333-3333-3333-333333333333', 'Sugar', 15, 'kg', NULL, 5, 1.50),
  ('33333333-3333-3333-3333-333333333333', 'Pastries', 25, 'pieces', '2025-01-27', 30, 3.50),
  
  -- Taco Sol
  ('44444444-4444-4444-4444-444444444444', 'Ground Beef', 20, 'kg', '2025-02-01', 25, 9.00),
  ('44444444-4444-4444-4444-444444444444', 'Tortillas', 100, 'pieces', '2025-02-10', 50, 0.50),
  ('44444444-4444-4444-4444-444444444444', 'Cheese (Cheddar)', 8, 'kg', '2025-02-15', 10, 11.00),
  ('44444444-4444-4444-4444-444444444444', 'Lettuce', 12, 'kg', '2025-01-29', 15, 2.30),
  
  -- Spice Route
  ('55555555-5555-5555-5555-555555555555', 'Basmati Rice', 25, 'kg', NULL, 12, 4.20),
  ('55555555-5555-5555-5555-555555555555', 'Chicken Curry Paste', 18, 'jars', '2025-06-30', 8, 6.80),
  ('55555555-5555-5555-5555-555555555555', 'Naan Bread', 40, 'pieces', '2025-01-28', 50, 1.80),
  ('55555555-5555-5555-5555-555555555555', 'Yogurt', 15, 'kg', '2025-02-02', 20, 3.50);

-- Insert sample menu items
INSERT INTO menu_items (user_id, name, sales_percentage, waste_percentage) VALUES
  -- Mario's Italian Kitchen
  ('11111111-1111-1111-1111-111111111111', 'Spaghetti Carbonara', 25.5, 3.2),
  ('11111111-1111-1111-1111-111111111111', 'Margherita Pizza', 30.2, 2.8),
  ('11111111-1111-1111-1111-111111111111', 'Lasagna', 18.3, 5.1),
  ('11111111-1111-1111-1111-111111111111', 'Caesar Salad', 12.8, 8.5),
  
  -- Dragon Wok Express
  ('22222222-2222-2222-2222-222222222222', 'Sweet & Sour Pork', 22.4, 4.2),
  ('22222222-2222-2222-2222-222222222222', 'Fried Rice', 28.1, 2.5),
  ('22222222-2222-2222-2222-222222222222', 'Kung Pao Chicken', 19.7, 3.8),
  ('22222222-2222-2222-2222-222222222222', 'Spring Rolls', 15.2, 6.1),
  
  -- Cafe Bloom
  ('33333333-3333-3333-3333-333333333333', 'Cappuccino', 35.8, 1.5),
  ('33333333-3333-3333-3333-333333333333', 'Croissant', 20.4, 7.2),
  ('33333333-3333-3333-3333-333333333333', 'Avocado Toast', 18.9, 4.6),
  ('33333333-3333-3333-3333-333333333333', 'Latte', 24.9, 2.1),
  
  -- Taco Sol
  ('44444444-4444-4444-4444-444444444444', 'Beef Tacos', 32.1, 3.5),
  ('44444444-4444-4444-4444-444444444444', 'Chicken Quesadilla', 24.6, 4.1),
  ('44444444-4444-4444-4444-444444444444', 'Burrito Bowl', 21.3, 5.8),
  ('44444444-4444-4444-4444-444444444444', 'Guacamole & Chips', 22.0, 6.5),
  
  -- Spice Route
  ('55555555-5555-5555-5555-555555555555', 'Chicken Tikka Masala', 28.7, 3.9),
  ('55555555-5555-5555-5555-555555555555', 'Biryani', 26.4, 2.7),
  ('55555555-5555-5555-5555-555555555555', 'Naan Bread', 31.2, 4.3),
  ('55555555-5555-5555-5555-555555555555', 'Mango Lassi', 13.7, 1.8);