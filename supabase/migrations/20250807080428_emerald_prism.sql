/*
  # Recipe Management System

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, nullable)
      - `category` (text)
      - `serving_size` (integer)
      - `prep_time_minutes` (integer, nullable)
      - `cook_time_minutes` (integer, nullable)
      - `difficulty_level` (text)
      - `instructions` (text, nullable)
      - `cost_per_serving` (numeric)
      - `selling_price` (numeric)
      - `profit_margin` (numeric)
      - `popularity_score` (numeric)
      - `waste_percentage` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipe_ingredients`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key)
      - `inventory_item_id` (uuid, foreign key)
      - `quantity_needed` (numeric)
      - `unit` (text)
      - `cost_per_unit` (numeric)
      - `total_cost` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access their own data only
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Main Course',
  serving_size integer NOT NULL DEFAULT 1,
  prep_time_minutes integer,
  cook_time_minutes integer,
  difficulty_level text NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  instructions text,
  cost_per_serving numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  profit_margin numeric(5,2) NOT NULL DEFAULT 0,
  popularity_score numeric(5,2) NOT NULL DEFAULT 0,
  waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  quantity_needed numeric(10,3) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  total_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for recipes table
CREATE POLICY "Users can read own recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for recipe_ingredients table
CREATE POLICY "Users can read own recipe ingredients"
  ON recipe_ingredients
  FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recipe ingredients"
  ON recipe_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recipe ingredients"
  ON recipe_ingredients
  FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recipe ingredients"
  ON recipe_ingredients
  FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at on recipes
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_profit_margin ON recipes(profit_margin);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_inventory_item_id ON recipe_ingredients(inventory_item_id);

-- Insert sample recipes for demo
INSERT INTO recipes (user_id, name, description, category, serving_size, prep_time_minutes, cook_time_minutes, difficulty_level, cost_per_serving, selling_price, profit_margin, popularity_score, waste_percentage) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Margherita Pizza', 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil', 'Pizza', 1, 15, 12, 'medium', 4.50, 16.00, 71.9, 85.0, 3.2),
  ('11111111-1111-1111-1111-111111111111', 'Spaghetti Carbonara', 'Traditional Roman pasta with eggs, cheese, and pancetta', 'Pasta', 1, 10, 15, 'medium', 3.80, 14.00, 72.9, 78.0, 4.1),
  ('22222222-2222-2222-2222-222222222222', 'Sweet & Sour Pork', 'Crispy pork with bell peppers in sweet and sour sauce', 'Main Course', 1, 20, 15, 'medium', 5.20, 18.00, 71.1, 82.0, 5.2),
  ('33333333-3333-3333-3333-333333333333', 'Cappuccino', 'Espresso with steamed milk and foam', 'Beverages', 1, 3, 2, 'easy', 1.20, 4.50, 73.3, 92.0, 2.1),
  ('44444444-4444-4444-4444-444444444444', 'Beef Tacos', 'Seasoned ground beef with fresh toppings in corn tortillas', 'Main Course', 3, 15, 10, 'easy', 4.80, 12.00, 60.0, 88.0, 6.5)
ON CONFLICT (id) DO NOTHING;