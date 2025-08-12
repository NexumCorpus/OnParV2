/*
  # Add User Settings for Enhanced Alerts

  1. New Columns for users table
    - `default_reorder_multiplier` (numeric) - Default multiplier for reorder suggestions
    - `low_stock_threshold` (numeric) - Threshold for low stock alerts (multiplier of reorder point)
    - `expiry_warning_days` (integer) - Days before expiry to send warnings
    - `budget_warning_threshold` (numeric) - Percentage of budget to trigger warnings
    - `email_notifications` (boolean) - Enable/disable email notifications
    - `fcm_token` (text) - Firebase Cloud Messaging token for push notifications

  2. Updates
    - Add default values for existing users
    - Maintain backward compatibility
*/

-- Add new columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'default_reorder_multiplier'
  ) THEN
    ALTER TABLE users ADD COLUMN default_reorder_multiplier numeric(3,1) DEFAULT 2.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE users ADD COLUMN low_stock_threshold numeric(3,1) DEFAULT 0.8;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'expiry_warning_days'
  ) THEN
    ALTER TABLE users ADD COLUMN expiry_warning_days integer DEFAULT 7;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'budget_warning_threshold'
  ) THEN
    ALTER TABLE users ADD COLUMN budget_warning_threshold numeric(3,2) DEFAULT 0.90;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_notifications'
  ) THEN
    ALTER TABLE users ADD COLUMN email_notifications boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'fcm_token'
  ) THEN
    ALTER TABLE users ADD COLUMN fcm_token text;
  END IF;
END $$;

-- Update existing users with default values
UPDATE users 
SET 
  default_reorder_multiplier = COALESCE(default_reorder_multiplier, 2.0),
  low_stock_threshold = COALESCE(low_stock_threshold, 0.8),
  expiry_warning_days = COALESCE(expiry_warning_days, 7),
  budget_warning_threshold = COALESCE(budget_warning_threshold, 0.90),
  email_notifications = COALESCE(email_notifications, true)
WHERE 
  default_reorder_multiplier IS NULL 
  OR low_stock_threshold IS NULL 
  OR expiry_warning_days IS NULL 
  OR budget_warning_threshold IS NULL 
  OR email_notifications IS NULL;

-- Add constraints for data validation
ALTER TABLE users ADD CONSTRAINT check_reorder_multiplier 
  CHECK (default_reorder_multiplier >= 1.0 AND default_reorder_multiplier <= 5.0);

ALTER TABLE users ADD CONSTRAINT check_low_stock_threshold 
  CHECK (low_stock_threshold >= 0.1 AND low_stock_threshold <= 2.0);

ALTER TABLE users ADD CONSTRAINT check_expiry_warning_days 
  CHECK (expiry_warning_days >= 1 AND expiry_warning_days <= 30);

ALTER TABLE users ADD CONSTRAINT check_budget_warning_threshold 
  CHECK (budget_warning_threshold >= 0.1 AND budget_warning_threshold <= 1.0);