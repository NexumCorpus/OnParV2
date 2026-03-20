// App-wide constants
export const APP_NAME = 'OnPar'
export const APP_DESCRIPTION = 'Smart Restaurant Inventory Management'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Inventory categories
export const INVENTORY_CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Seafood', 'Pantry',
  'Bakery', 'Beverages', 'Seasonings', 'Frozen', 'Other',
] as const

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]

// Inventory units
export const INVENTORY_UNITS = [
  'pieces', 'lbs', 'kg', 'oz', 'g',
  'liters', 'gallons', 'bottles', 'cans',
  'boxes', 'bags', 'containers', 'heads',
  'jars', 'loaves', 'bunches',
] as const

export type InventoryUnit = (typeof INVENTORY_UNITS)[number]

// Grouped units for compact dropdown display
export const UNIT_GROUPS = [
  { label: 'Weight', units: ['lbs', 'kg', 'oz', 'g'] },
  { label: 'Volume', units: ['liters', 'gallons'] },
  { label: 'Count', units: ['pieces', 'bottles', 'cans', 'boxes', 'bags', 'containers', 'heads', 'jars', 'loaves', 'bunches'] },
] as const

// CSV import limits
export const CSV_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const CSV_MAX_ROWS = 500

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const INFINITE_SCROLL_PAGE_SIZE = 20

// Debounce
export const QUANTITY_STEPPER_DEBOUNCE_MS = 1000
export const SEARCH_DEBOUNCE_MS = 300

// Recipe categories
export const RECIPE_CATEGORIES = [
  'Appetizer', 'Main Course', 'Side Dish', 'Dessert',
  'Beverage', 'Pizza', 'Pasta', 'Salad', 'Soup',
  'Sandwich', 'Breakfast', 'Other',
] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

// Subscription plan configuration
export const PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    limits: { items: 50, users: 1 },
    features: ['Basic tracking', '50 items max', '1 user'],
  },
  starter: {
    name: 'Starter',
    price: { monthly: 29, annual: 23 },
    stripePriceId: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? 'price_starter_monthly',
      annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? 'price_starter_annual',
    },
    limits: { items: 500, users: 3 },
    features: ['All tracking', 'Waste analysis', 'AI insights', 'CSV import', 'Email alerts', '3 users'],
  },
  professional: {
    name: 'Professional',
    price: { monthly: 79, annual: 63 },
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? 'price_pro_monthly',
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? 'price_pro_annual',
    },
    limits: { items: Infinity, users: 10 },
    features: ['Everything in Starter', 'API access', 'Priority support', 'Custom reports', '10 users'],
  },
} as const

export type PlanKey = keyof typeof PLANS
