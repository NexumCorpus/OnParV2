/*
  # Add Products Table for Barcode Scanner

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `barcode` (text, unique)
      - `name` (text)
      - `brand` (text, nullable)
      - `category` (text, nullable)
      - `unit` (text)
      - `average_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on products table
    - Add policy for authenticated users to read products
    - Products are shared across all users (read-only for most users)

  3. Sample Data
    - Insert common restaurant products with barcodes
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  category text,
  unit text NOT NULL DEFAULT 'pieces',
  average_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read products
CREATE POLICY "Authenticated users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to manage products
CREATE POLICY "Service role can manage products"
  ON products
  FOR ALL
  TO service_role
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert sample products for beta testing
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