import { z } from 'zod'

// Validation schemas for OnPar application

// Base schemas
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')
export const urlSchema = z.string().url('Invalid URL')
export const positiveNumberSchema = z.number().positive('Must be a positive number')
export const nonNegativeNumberSchema = z.number().min(0, 'Cannot be negative')

// User schemas
export const userProfileSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
  restaurant_name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  timezone: z.string().optional()
})

// Inventory schemas
export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: nonNegativeNumberSchema,
  unit: z.string().min(1, 'Unit is required'),
  price_per_unit: positiveNumberSchema,
  reorder_point: nonNegativeNumberSchema,
  expiry_date: z.string().datetime().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  category: z.string().optional(),
  notes: z.string().optional()
})

export const bulkInventoryUpdateSchema = z.array(
  z.object({
    id: z.string().uuid(),
    quantity: nonNegativeNumberSchema.optional(),
    price_per_unit: positiveNumberSchema.optional(),
    reorder_point: nonNegativeNumberSchema.optional(),
    expiry_date: z.string().datetime().optional().nullable()
  })
)

// Menu schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().optional(),
  price: positiveNumberSchema,
  category: z.string().min(1, 'Category is required'),
  is_available: z.boolean().default(true),
  prep_time: z.number().min(0).optional(),
  allergens: z.array(z.string()).optional(),
  recipe_id: z.string().uuid().optional().nullable()
})

// Recipe schemas
export const recipeIngredientSchema = z.object({
  inventory_item_id: z.string().uuid(),
  quantity: positiveNumberSchema,
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional()
})

export const recipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  prep_time: z.number().min(0, 'Prep time cannot be negative'),
  cook_time: z.number().min(0, 'Cook time cannot be negative'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required')
})

// Supplier schemas
export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact_person: z.string().optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  website: urlSchema.optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  delivery_days: z.array(z.number().min(0).max(6)).optional()
})

// Notification schemas
export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'warning', 'error', 'success']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  action_label: z.string().optional(),
  action_url: z.string().optional(),
  expires_at: z.string().datetime().optional()
})

// Report schemas
export const reportConfigSchema = z.object({
  type: z.enum(['inventory', 'menu', 'waste', 'financial', 'supplier']),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  filters: z.record(z.any()).optional(),
  format: z.enum(['pdf', 'csv', 'excel']).default('pdf'),
  include_charts: z.boolean().default(true),
  email_recipients: z.array(emailSchema).optional()
})

// API request schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc')
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape
})

// Billing schemas
export const subscriptionSchema = z.object({
  plan_id: z.string().min(1, 'Plan ID is required'),
  billing_cycle: z.enum(['monthly', 'yearly']),
  payment_method_id: z.string().optional()
})

// Settings schemas
export const restaurantSettingsSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  address: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: urlSchema.optional(),
  timezone: z.string().default('America/New_York'),
  currency: z.string().default('USD'),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h'),
  low_stock_threshold: z.number().min(0).default(10),
  expiry_warning_days: z.number().min(1).default(7),
  auto_reorder: z.boolean().default(false),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false)
})

// Validation helper functions
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

export function validatePartial<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: Partial<T>
  errors?: string[]
} {
  try {
    const result = schema.partial().parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Custom validation functions
export function validateInventoryQuantity(quantity: number, reorderPoint: number): boolean {
  return quantity >= 0 && reorderPoint >= 0 && reorderPoint <= quantity * 2
}

export function validateExpiryDate(expiryDate: string): boolean {
  const date = new Date(expiryDate)
  const now = new Date()
  return date > now
}

export function validateRecipeServings(ingredients: any[], servings: number): boolean {
  if (servings <= 0) return false
  
  return ingredients.every(ingredient => {
    const totalNeeded = ingredient.quantity * servings
    return totalNeeded > 0 && totalNeeded <= 10000 // Reasonable upper limit
  })
}

export function validateSupplierDeliveryDays(days: number[]): boolean {
  return days.every(day => day >= 0 && day <= 6) && new Set(days).size === days.length
}

// Form validation helpers
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateWithSchema(schema, data)
    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Validation failed')
    }
    return result.data!
  }
}

export function createAsyncValidator<T>(
  schema: z.ZodSchema<T>,
  asyncChecks?: Array<(data: T) => Promise<boolean>>
) {
  return async (data: unknown) => {
    const result = validateWithSchema(schema, data)
    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Validation failed')
    }
    
    if (asyncChecks) {
      const asyncResults = await Promise.all(
        asyncChecks.map(check => check(result.data!))
      )
      
      if (asyncResults.some(result => !result)) {
        throw new Error('Async validation failed')
      }
    }
    
    return result.data!
  }
}