// Global type definitions for OnPar application

import { Database } from '@/lib/supabase'

// Database types
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type User = Database['public']['Tables']['users']['Row']

// User Profile type
export interface UserProfile {
  id: string
  email: string
  restaurant_name?: string
  monthly_budget?: number
  premium_subscription: boolean
  cuisine_type?: string
  restaurant_size?: string
  employee_count?: number
  low_stock_threshold?: number
  expiry_warning_days?: number
  budget_warning_threshold?: number
  created_at: string
}

// Recipe types
export interface Recipe {
  id: string
  name: string
  description: string
  category: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: RecipeIngredient[]
  instructions: string[]
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  inventory_item_id: string
  name: string
  quantity: number
  unit: string
  cost: number
  notes?: string
}

// Supplier types
export interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  category: string
  rating: number
  reliability_score: number
  avg_delivery_time: number
  payment_terms: string
  minimum_order: number
  delivery_fee: number
  notes: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  last_order_date?: string
  total_orders: number
  total_spent: number
}

export interface SupplierOrder {
  id: string
  supplier_id: string
  order_date: string
  delivery_date?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  items: OrderItem[]
  notes?: string
}

export interface OrderItem {
  inventory_item_id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

// Notification types
export interface Notification {
  id: string
  type: 'low_stock' | 'expiring' | 'expired' | 'budget' | 'waste' | 'supplier' | 'system' | 'ai_insight'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  dismissed: boolean
  created_at: string
  expires_at?: string
  action_url?: string
  action_label?: string
}

// Report types
export interface ReportConfig {
  name: string
  type: 'inventory' | 'waste' | 'financial' | 'performance' | 'compliance' | 'custom'
  dateRange: {
    start: string
    end: string
    preset: string
  }
  filters: {
    categories: string[]
    suppliers: string[]
    locations: string[]
    status: string[]
  }
  metrics: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    recipients: string[]
    enabled: boolean
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: React.ComponentType<{ className?: string }>
  metrics: string[]
  defaultFilters: Record<string, any>
  isPremium?: boolean
}

export interface ReportData {
  summary: Record<string, any>
  inventory_details: InventoryItem[]
  menu_details: MenuItem[]
  metrics: string[]
  filters_applied: Record<string, any>
}

// Analytics types
export interface AnalyticsData {
  totalInventoryValue: number
  monthlySpend: number
  wastePercentage: number
  savingsOpportunity: number
  topPerformingItems: MenuItem[]
  underperformingItems: MenuItem[]
  expiringItems: InventoryItem[]
  lowStockItems: InventoryItem[]
  costTrends: Array<{ date: string; value: number }>
  wasteTrends: Array<{ date: string; value: number }>
  categoryBreakdown: Array<{ category: string; value: number; percentage: number }>
}

// Component prop types
export interface BaseComponentProps {
  isPremium: boolean
  userProfile: UserProfile
}

export interface InventoryManagerProps extends BaseComponentProps {
  inventoryItems: InventoryItem[]
  onItemsChange: (items: InventoryItem[]) => void
}

export interface RecipeManagerProps extends BaseComponentProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
}

export interface SupplierManagerProps extends BaseComponentProps {}

export interface NotificationCenterProps extends BaseComponentProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
}

export interface ReportGeneratorProps extends BaseComponentProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
}

export interface AnalyticsProps extends BaseComponentProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
}

// Form data types
export interface InventoryFormData {
  name: string
  quantity: number
  unit: string
  reorder_point: number
  price_per_unit: number
  expiry_date?: string
  category: string
  supplier?: string
  notes?: string
}

export interface RecipeFormData {
  name: string
  description: string
  category: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: RecipeIngredient[]
  instructions: string[]
  selling_price: number
  tags: string[]
}

export interface SupplierFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  category: string
  rating: number
  reliability_score: number
  avg_delivery_time: number
  payment_terms: string
  minimum_order: number
  delivery_fee: number
  notes: string
  status: 'active' | 'inactive' | 'pending'
}

// Onboarding types
export interface OnboardingData {
  restaurant_name: string
  cuisine_type: string
  restaurant_size: string
  location: string
  years_in_business: string
  monthly_budget: number
  employee_count: number
  avg_daily_customers: number
  operating_hours: string
  biggest_challenges: string[]
  current_inventory_method: string
  waste_estimate: number
  primary_goals: string[]
  expected_savings: number
  notification_preferences: string[]
  preferred_contact_method: string
  add_sample_data: boolean
  import_existing_data: boolean
}

// Filter and search types
export interface InventoryFilters {
  search: string
  category: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface BulkAction {
  type: 'update_quantity' | 'update_price' | 'delete' | 'reorder'
  items: string[]
}

// Notification settings
export interface NotificationSettings {
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  low_stock_threshold: number
  expiry_warning_days: number
  budget_warning_percentage: number
  waste_threshold_percentage: number
  quiet_hours_start: string
  quiet_hours_end: string
  notification_types: {
    low_stock: boolean
    expiring_items: boolean
    budget_alerts: boolean
    waste_alerts: boolean
    supplier_updates: boolean
    ai_insights: boolean
    system_updates: boolean
  }
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Chart and visualization types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface MetricCardData {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  isGood?: boolean
}

// AI Insights types
export interface AIInsight {
  id: string
  user_id: string
  type: 'waste_reduction' | 'cost_optimization' | 'inventory_optimization' | 'menu_optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimated_savings: number
  actionable: boolean
  confidence: number
  data_points: string[]
  recommended_actions: string[]
  related_items: Array<{
    id: string
    name: string
    type: 'inventory' | 'menu' | 'recipe'
    currentValue: number
    suggestedValue: number
    unit?: string
  }>
  timeframe: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  implementation_date?: string
  completion_date?: string
  actual_savings?: number
  created_at: string
  updated_at: string
}

export interface AIInsightImplementation {
  id: string
  insight_id: string
  user_id: string
  action_taken: string
  notes?: string
  impact_measured?: number
  success_rating?: number // 1-5 rating
  created_at: string
}

export interface WasteAnalysisData {
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

export interface ActionPlan {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: 'ordering' | 'storage' | 'preparation' | 'menu'
  description: string
  expectedSavings: number
  implementationSteps: string[]
  timeframe: string
}

export interface ImpactMetrics {
  actualSavings: number
  wasteReduction: number
  efficiencyGain: number
  implementationSuccess: boolean
  timeToComplete: number
  userSatisfaction: number
}

export interface WasteAnalysis {
  totalWaste: number
  wasteByCategory: Record<string, number>
  trendAnalysis: {
    direction: 'increasing' | 'decreasing' | 'stable'
    rate: number
  }
  seasonalFactors: Record<string, number>
  recommendations: string[]
}

// Export all types
export * from './index'