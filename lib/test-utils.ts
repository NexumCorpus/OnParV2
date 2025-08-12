// Testing utilities and mock data for OnPar application

import { InventoryItem, MenuItem, Recipe, Supplier, Notification, UserProfile } from '@/types'

// Mock data generators
export const mockUserProfile: UserProfile = {
  id: 'user-1',
  email: 'test@restaurant.com',
  restaurant_name: 'Test Restaurant',
  monthly_budget: 5000,
  premium_subscription: true,
  cuisine_type: 'American',
  restaurant_size: 'Medium (26-75 seats)',
  employee_count: 15,
  low_stock_threshold: 10,
  expiry_warning_days: 7,
  budget_warning_threshold: 80,
  created_at: new Date().toISOString()
}

export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    user_id: 'user-1',
    name: 'Ground Beef',
    quantity: 25,
    unit: 'lb',
    price_per_unit: 6.99,
    reorder_point: 10,
    expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    supplier_id: 'sup-1',
    category: 'Proteins',
    notes: 'Fresh ground beef for burgers',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-2',
    user_id: 'user-1',
    name: 'Lettuce',
    quantity: 5,
    unit: 'head',
    price_per_unit: 2.49,
    reorder_point: 8,
    expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    supplier_id: 'sup-2',
    category: 'Produce',
    notes: 'Iceberg lettuce for salads',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-3',
    user_id: 'user-1',
    name: 'Tomatoes',
    quantity: 15,
    unit: 'lb',
    price_per_unit: 3.99,
    reorder_point: 12,
    expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    supplier_id: 'sup-2',
    category: 'Produce',
    notes: 'Roma tomatoes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-4',
    user_id: 'user-1',
    name: 'Cheese',
    quantity: 3,
    unit: 'lb',
    price_per_unit: 8.99,
    reorder_point: 5,
    expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    supplier_id: 'sup-3',
    category: 'Dairy',
    notes: 'Cheddar cheese',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockMenuItems: MenuItem[] = [
  {
    id: 'menu-1',
    user_id: 'user-1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and cheese',
    price: 12.99,
    category: 'Main Courses',
    is_available: true,
    prep_time: 15,
    allergens: ['dairy', 'gluten'],
    recipe_id: 'recipe-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-2',
    user_id: 'user-1',
    name: 'Garden Salad',
    description: 'Fresh mixed greens with tomatoes and dressing',
    price: 8.99,
    category: 'Salads',
    is_available: true,
    prep_time: 5,
    allergens: [],
    recipe_id: 'recipe-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Classic Burger',
    description: 'Our signature burger recipe',
    category: 'Main Courses',
    servings: 1,
    prep_time: 10,
    cook_time: 15,
    difficulty: 'easy',
    ingredients: [
      {
        inventory_item_id: 'inv-1',
        name: 'Ground Beef',
        quantity: 0.25,
        unit: 'lb',
        cost: 1.75
      },
      {
        inventory_item_id: 'inv-2',
        name: 'Lettuce',
        quantity: 2,
        unit: 'leaves',
        cost: 0.25
      },
      {
        inventory_item_id: 'inv-3',
        name: 'Tomatoes',
        quantity: 0.1,
        unit: 'lb',
        cost: 0.40
      },
      {
        inventory_item_id: 'inv-4',
        name: 'Cheese',
        quantity: 0.05,
        unit: 'lb',
        cost: 0.45
      }
    ],
    instructions: [
      'Form ground beef into patty',
      'Season with salt and pepper',
      'Grill for 6-8 minutes per side',
      'Add cheese in last minute',
      'Assemble burger with lettuce and tomato'
    ],
    cost_per_serving: 2.85,
    selling_price: 12.99,
    profit_margin: 78,
    popularity_score: 85,
    waste_percentage: 5,
    tags: ['popular', 'classic', 'beef'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Premium Meats Co.',
    contact_person: 'John Smith',
    email: 'john@premiummeats.com',
    phone: '(555) 123-4567',
    address: '123 Meat St',
    city: 'Charleston',
    state: 'SC',
    zip: '29401',
    category: 'Proteins',
    rating: 4.8,
    reliability_score: 95,
    avg_delivery_time: 24,
    payment_terms: 'Net 30',
    minimum_order: 100,
    delivery_fee: 25,
    notes: 'High quality meats, reliable delivery',
    status: 'active',
    created_at: new Date().toISOString(),
    last_order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_orders: 45,
    total_spent: 12500
  },
  {
    id: 'sup-2',
    name: 'Fresh Produce LLC',
    contact_person: 'Sarah Johnson',
    email: 'sarah@freshproduce.com',
    phone: '(555) 234-5678',
    address: '456 Farm Rd',
    city: 'Charleston',
    state: 'SC',
    zip: '29403',
    category: 'Produce',
    rating: 4.6,
    reliability_score: 88,
    avg_delivery_time: 12,
    payment_terms: 'Net 15',
    minimum_order: 50,
    delivery_fee: 15,
    notes: 'Local organic produce',
    status: 'active',
    created_at: new Date().toISOString(),
    last_order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total_orders: 78,
    total_spent: 8900
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'low_stock',
    priority: 'high',
    title: 'Low Stock Alert',
    message: 'Lettuce is running low (5 heads remaining)',
    data: { item_id: 'inv-2', current_quantity: 5, reorder_point: 8 },
    read: false,
    dismissed: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action_url: '/inventory',
    action_label: 'View Inventory'
  },
  {
    id: 'notif-2',
    type: 'expiring',
    priority: 'medium',
    title: 'Items Expiring Soon',
    message: 'Ground Beef expires in 5 days',
    data: { item_id: 'inv-1', days_until_expiry: 5 },
    read: false,
    dismissed: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    action_url: '/inventory',
    action_label: 'Check Expiry Dates'
  },
  {
    id: 'notif-3',
    type: 'ai_insight',
    priority: 'medium',
    title: 'Cost Optimization Opportunity',
    message: 'You could save $150/month by switching tomato suppliers',
    data: { potential_savings: 150, category: 'produce' },
    read: true,
    dismissed: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action_url: '/suppliers',
    action_label: 'View Suppliers'
  }
]

// Test data generators
export function generateInventoryItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  const baseItem = mockInventoryItems[0]
  return {
    ...baseItem,
    id: `inv-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }
}

export function generateMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  const baseItem = mockMenuItems[0]
  return {
    ...baseItem,
    id: `menu-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }
}

export function generateSupplier(overrides: Partial<Supplier> = {}): Supplier {
  const baseSupplier = mockSuppliers[0]
  return {
    ...baseSupplier,
    id: `sup-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }
}

export function generateNotification(overrides: Partial<Notification> = {}): Notification {
  const baseNotification = mockNotifications[0]
  return {
    ...baseNotification,
    id: `notif-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

// Bulk data generators
export function generateInventoryItems(count: number): InventoryItem[] {
  return Array.from({ length: count }, (_, i) => 
    generateInventoryItem({ 
      name: `Test Item ${i + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      price_per_unit: Math.round((Math.random() * 20 + 1) * 100) / 100
    })
  )
}

export function generateMenuItems(count: number): MenuItem[] {
  return Array.from({ length: count }, (_, i) => 
    generateMenuItem({ 
      name: `Test Menu Item ${i + 1}`,
      price: Math.round((Math.random() * 25 + 5) * 100) / 100
    })
  )
}

// Test utilities
export function createMockApiResponse<T>(data: T, delay = 0): Promise<{ data: T }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data })
    }, delay)
  })
}

export function createMockApiError(message = 'Test error', delay = 0): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, delay)
  })
}

// Date utilities for testing
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days)
}

export function isExpiringSoon(expiryDate: string, warningDays = 7): boolean {
  const expiry = new Date(expiryDate)
  const warning = addDays(new Date(), warningDays)
  return expiry <= warning
}

export function isLowStock(quantity: number, reorderPoint: number): boolean {
  return quantity <= reorderPoint
}

// Analytics test data
export function generateAnalyticsData() {
  return {
    totalInventoryValue: 15750.50,
    monthlySpend: 4200.00,
    wastePercentage: 8.5,
    savingsOpportunity: 650.00,
    topPerformingItems: mockMenuItems.slice(0, 3),
    underperformingItems: mockMenuItems.slice(3, 6),
    expiringItems: mockInventoryItems.filter(item => 
      item.expiry_date && isExpiringSoon(item.expiry_date)
    ),
    lowStockItems: mockInventoryItems.filter(item => 
      isLowStock(item.quantity, item.reorder_point)
    ),
    costTrends: Array.from({ length: 30 }, (_, i) => ({
      date: subtractDays(new Date(), 29 - i).toISOString().split('T')[0],
      value: Math.round((Math.random() * 500 + 3500) * 100) / 100
    })),
    wasteTrends: Array.from({ length: 30 }, (_, i) => ({
      date: subtractDays(new Date(), 29 - i).toISOString().split('T')[0],
      value: Math.round((Math.random() * 5 + 5) * 100) / 100
    })),
    categoryBreakdown: [
      { category: 'Proteins', value: 5500, percentage: 35 },
      { category: 'Produce', value: 3200, percentage: 20 },
      { category: 'Dairy', value: 2400, percentage: 15 },
      { category: 'Dry Goods', value: 2800, percentage: 18 },
      { category: 'Beverages', value: 1850, percentage: 12 }
    ]
  }
}

// Performance test utilities
export function measurePerformance<T>(fn: () => T, label?: string): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  if (label) {
    console.log(`${label}: ${end - start}ms`)
  }
  
  return result
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>, 
  label?: string
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  if (label) {
    console.log(`${label}: ${end - start}ms`)
  }
  
  return result
}

// Local storage test utilities
export function clearTestData() {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('test-'))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

export function setTestData(key: string, data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`test-${key}`, JSON.stringify(data))
  }
}

export function getTestData<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`test-${key}`)
    return data ? JSON.parse(data) : null
  }
  return null
}

export default {
  mockUserProfile,
  mockInventoryItems,
  mockMenuItems,
  mockRecipes,
  mockSuppliers,
  mockNotifications,
  generateInventoryItem,
  generateMenuItem,
  generateSupplier,
  generateNotification,
  generateInventoryItems,
  generateMenuItems,
  createMockApiResponse,
  createMockApiError,
  generateAnalyticsData,
  measurePerformance,
  measureAsyncPerformance,
  clearTestData,
  setTestData,
  getTestData
}