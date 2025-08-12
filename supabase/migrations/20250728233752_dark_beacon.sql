```sql
/*
  # Create Beta Feedback and User Action Logging System

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key, nullable for anonymous feedback)
      - `email` (text, nullable)
      - `feedback_type` (text) - 'bug', 'feature_request', 'general'
      - `message` (text)
      - `page_url` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamp)
    
    - `user_actions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key, nullable for anonymous actions)
      - `action_type` (text) - 'page_view', 'button_click', 'feature_use', etc.
      - `details` (jsonb) - flexible data storage
      - `page_url` (text, nullable)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to insert their own data
    - Add policies for service role to read all data (for analytics)
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'general')),
  message text NOT NULL,
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create user_actions table
CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  details jsonb DEFAULT '{}',
  page_url text,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Feedback table policies
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all feedback"
  ON feedback
  FOR SELECT
  TO service_role
  USING (true);

-- User actions table policies
CREATE POLICY "Authenticated users can log actions"
  ON user_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own actions"
  ON user_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all actions"
  ON user_actions
  FOR SELECT
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);
```