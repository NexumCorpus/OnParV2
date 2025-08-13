/*
  # AI Insights System

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text) - waste_reduction, cost_optimization, inventory_optimization, menu_optimization
      - `title` (text)
      - `description` (text)
      - `impact` (text) - high, medium, low
      - `estimated_savings` (numeric)
      - `actionable` (boolean)
      - `confidence` (numeric) - 0-100 confidence score
      - `data_points` (jsonb) - array of data points
      - `recommended_actions` (jsonb) - array of recommended actions
      - `related_items` (jsonb) - array of related items with suggestions
      - `timeframe` (text)
      - `priority` (text) - urgent, high, medium, low
      - `category` (text)
      - `status` (text) - pending, in_progress, completed, dismissed
      - `implementation_date` (timestamptz)
      - `completion_date` (timestamptz)
      - `actual_savings` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ai_insight_implementations`
      - `id` (uuid, primary key)
      - `insight_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `action_taken` (text)
      - `notes` (text)
      - `impact_measured` (numeric)
      - `success_rating` (integer) - 1-5 rating
      - `created_at` (timestamptz)

    - `waste_analysis_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `analysis_date` (date)
      - `total_inventory_value` (numeric)
      - `monthly_spend` (numeric)
      - `average_waste_percentage` (numeric)
      - `inventory_turnover` (numeric)
      - `cost_efficiency_score` (numeric)
      - `seasonal_factor` (numeric)
      - `data_quality_score` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data only
*/

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('waste_reduction', 'cost_optimization', 'inventory_optimization', 'menu_optimization')),
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  estimated_savings numeric(10,2) NOT NULL DEFAULT 0,
  actionable boolean NOT NULL DEFAULT true,
  confidence numeric(5,2) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  data_points jsonb NOT NULL DEFAULT '[]',
  recommended_actions jsonb NOT NULL DEFAULT '[]',
  related_items jsonb NOT NULL DEFAULT '[]',
  timeframe text NOT NULL DEFAULT 'Unknown',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  implementation_date timestamptz,
  completion_date timestamptz,
  actual_savings numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_insight_implementations table
CREATE TABLE IF NOT EXISTS ai_insight_implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid REFERENCES ai_insights(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_taken text NOT NULL,
  notes text,
  impact_measured numeric(10,2),
  success_rating integer CHECK (success_rating >= 1 AND success_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create waste_analysis_data table
CREATE TABLE IF NOT EXISTS waste_analysis_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  analysis_date date NOT NULL DEFAULT CURRENT_DATE,
  total_inventory_value numeric(12,2) NOT NULL DEFAULT 0,
  monthly_spend numeric(12,2) NOT NULL DEFAULT 0,
  average_waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  inventory_turnover numeric(8,4) NOT NULL DEFAULT 0,
  cost_efficiency_score numeric(5,2) NOT NULL DEFAULT 0,
  seasonal_factor numeric(5,4) NOT NULL DEFAULT 1.0,
  data_quality_score numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, analysis_date)
);

-- Enable Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insight_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_analysis_data ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_insights table
CREATE POLICY "Users can read own AI insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI insights"
  ON ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI insights"
  ON ai_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI insights"
  ON ai_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for ai_insight_implementations table
CREATE POLICY "Users can read own AI insight implementations"
  ON ai_insight_implementations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI insight implementations"
  ON ai_insight_implementations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI insight implementations"
  ON ai_insight_implementations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI insight implementations"
  ON ai_insight_implementations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for waste_analysis_data table
CREATE POLICY "Users can read own waste analysis data"
  ON waste_analysis_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waste analysis data"
  ON waste_analysis_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waste analysis data"
  ON waste_analysis_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own waste analysis data"
  ON waste_analysis_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_insight_implementations_insight_id ON ai_insight_implementations(insight_id);
CREATE INDEX IF NOT EXISTS idx_ai_insight_implementations_user_id ON ai_insight_implementations(user_id);

CREATE INDEX IF NOT EXISTS idx_waste_analysis_data_user_id ON waste_analysis_data(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_analysis_data_analysis_date ON waste_analysis_data(analysis_date);

-- Insert sample AI insights for demo users
INSERT INTO ai_insights (user_id, type, title, description, impact, estimated_savings, confidence, data_points, recommended_actions, related_items, timeframe, priority, category) VALUES
  ('11111111-1111-1111-1111-111111111111', 'waste_reduction', 'Reduce Pizza Waste by 35%', 'AI analysis shows your Margherita Pizza has 8.2% waste rate, 3.2% above optimal. Implementing portion control could save $180/month.', 'high', 180.00, 87.5, 
   '["8.2% current waste rate", "5.0% optimal waste rate", "87.5% prediction confidence", "3 weeks of data analyzed"]',
   '["Implement standardized portion scoops", "Train staff on consistent portioning", "Monitor waste daily for 2 weeks", "Adjust recipe portions based on customer feedback"]',
   '[{"id": "pizza-001", "name": "Margherita Pizza", "type": "menu", "currentValue": 8.2, "suggestedValue": 5.0, "unit": "% waste"}]',
   '2-3 weeks', 'high', 'Waste Management'),
   
  ('22222222-2222-2222-2222-222222222222', 'inventory_optimization', 'Optimize Rice Ordering', 'Your jasmine rice inventory turns over 2.3x monthly but you order weekly. Bulk ordering could reduce costs by $95/month.', 'medium', 95.00, 78.0,
   '["2.3x monthly turnover rate", "Weekly ordering frequency", "78% optimization confidence", "$95 potential monthly savings"]',
   '["Switch to bi-weekly bulk orders", "Negotiate volume discount with supplier", "Ensure adequate storage space", "Monitor inventory levels closely"]',
   '[{"id": "rice-001", "name": "Jasmine Rice", "type": "inventory", "currentValue": 50, "suggestedValue": 100, "unit": "lbs"}]',
   '1-2 weeks', 'medium', 'Procurement'),
   
  ('33333333-3333-3333-3333-333333333333', 'cost_optimization', 'Coffee Bean Supplier Optimization', 'Analysis shows switching to bulk coffee supplier could reduce costs by 15% while maintaining quality standards.', 'high', 220.00, 82.3,
   '["15% potential cost reduction", "Quality standards maintained", "82.3% recommendation confidence", "Current spend: $1,467/month"]',
   '["Research bulk coffee suppliers", "Request samples for quality testing", "Negotiate pricing and delivery terms", "Implement gradual transition plan"]',
   '[{"id": "coffee-001", "name": "Coffee Beans", "type": "inventory", "currentValue": 1467, "suggestedValue": 1247, "unit": "$/month"}]',
   '3-4 weeks', 'high', 'Cost Management');

-- Insert sample waste analysis data
INSERT INTO waste_analysis_data (user_id, analysis_date, total_inventory_value, monthly_spend, average_waste_percentage, inventory_turnover, cost_efficiency_score, seasonal_factor, data_quality_score) VALUES
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 8500.00, 12400.00, 6.8, 1.46, 73.2, 1.15, 85.0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 6200.00, 9800.00, 5.2, 1.58, 78.5, 1.08, 78.0),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 4100.00, 6900.00, 4.1, 1.68, 82.1, 0.95, 92.0),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 7300.00, 11200.00, 7.2, 1.53, 69.8, 1.12, 71.0);