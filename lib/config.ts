// App-wide constants — pricing plans added in Tier 7
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

// CSV import limits
export const CSV_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const CSV_MAX_ROWS = 500

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const INFINITE_SCROLL_PAGE_SIZE = 20

// Debounce
export const QUANTITY_STEPPER_DEBOUNCE_MS = 1000
export const SEARCH_DEBOUNCE_MS = 300
