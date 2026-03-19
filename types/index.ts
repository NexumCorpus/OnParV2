export interface User {
  id: string
  email: string
  restaurant_name: string | null
  monthly_budget: number | null
  avatar_url: string | null
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  reorder_multiplier: number
  low_stock_threshold: number
  expiry_warning_days: number
  budget_warning_threshold: number
  email_notifications: boolean
  onboarding_completed: boolean
}

export interface InventoryItem {
  id: string
  user_id: string
  supplier_id: string | null
  name: string
  category: string
  quantity: number
  unit: string
  expiry_date: string | null
  reorder_point: number
  max_stock_level: number | null
  price_per_unit: number
  deleted_at: string | null    // soft-delete timestamp; null = active item
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  user_id: string
  recipe_id: string | null  // nullable: menu items can exist without recipes
  name: string
  category: string
  selling_price: number
  sales_percentage: number
  waste_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  serving_size: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  difficulty_level: 'easy' | 'medium' | 'hard'
  instructions: string | null
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
  created_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  notes: string | null
  rating: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WasteEvent {
  id: string
  user_id: string
  inventory_item_id: string | null
  quantity: number
  unit: string
  estimated_value: number
  reason: WasteReason
  notes: string | null
  recorded_at: string
  created_at: string
}

export type WasteReason =
  | 'expired'
  | 'spoiled'
  | 'overproduction'
  | 'prep_waste'
  | 'damaged'
  | 'customer_return'
  | 'quality_issue'
  | 'other'

export interface Product {
  id: string
  barcode: string
  name: string
  brand: string | null
  category: string | null
  unit: string
  average_price: number
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  type: 'waste_reduction' | 'cost_optimization' | 'inventory_optimization' | 'menu_optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimated_savings: number
  confidence: number
  data_points: string[]
  recommended_actions: string[]
  related_items: RelatedItem[]
  timeframe: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  implementation_date: string | null
  completion_date: string | null
  actual_savings: number | null
  created_at: string
  updated_at: string
}

export interface RelatedItem {
  id: string
  name: string
  type: 'inventory' | 'menu' | 'recipe'
  currentValue: number
  suggestedValue: number
  unit: string
}

export interface WasteAnalysisSnapshot {
  id: string
  user_id: string
  analysis_date: string
  total_inventory_value: number
  monthly_spend: number
  average_waste_percentage: number
  inventory_turnover: number
  cost_efficiency_score: number
  seasonal_factor: number
  data_quality_score: number
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string | null
  email: string | null
  feedback_type: 'bug' | 'feature_request' | 'general'
  message: string
  page_url: string | null
  user_agent: string | null
  created_at: string
}

// Shared result type for all Server Actions
export type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string }

// Subscription status enum (matches PostgreSQL subscription_status type)
export type SubscriptionStatus =
  | 'not_started' | 'incomplete' | 'incomplete_expired'
  | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'

// Input types — used across tiers for service/action function signatures.
// Implementations should derive these from z.infer<typeof schema> where a Zod schema exists.
export type CreateInventoryInput = {
  name: string; category: string; quantity: number; unit: string;
  expiry_date?: string; reorder_point: number; max_stock_level?: number;
  price_per_unit: number; supplier_id?: string;
}
export type CreateRecipeInput = {
  name: string; description?: string | null; category: string; serving_size: number;
  prep_time_minutes?: number | null; cook_time_minutes?: number | null;
  difficulty_level: 'easy' | 'medium' | 'hard'; instructions?: string | null;
  selling_price: number;
}
export type CreateIngredientInput = {
  inventory_item_id: string; quantity_needed: number; unit: string; cost_per_unit: number;
}
export type CreateMenuItemInput = {
  name: string; category: string; selling_price: number;
  sales_percentage?: number; waste_percentage?: number; is_active?: boolean;
}
export type RecordWasteInput = {
  inventory_item_id: string; quantity: number; unit: string;
  reason: WasteReason; notes?: string | null;
}
export type CreateSupplierInput = {
  name: string; contact_email?: string | null; contact_phone?: string | null;
  address?: string | null; notes?: string | null;
  rating?: number | null; is_active?: boolean;
}

// Standardized error codes — use these instead of raw strings in ActionResult.error
export const ERROR_CODES = {
  PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
  ITEM_DELETED: 'ITEM_DELETED',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
} as const
