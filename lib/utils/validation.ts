import { z } from 'zod'

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(0, 'Quantity must be >= 0'),
  unit: z.string().min(1, 'Unit is required'),
  expiry_date: z.string().nullable().optional(),
  reorder_point: z.number().min(0, 'Reorder point must be >= 0'),
  max_stock_level: z.number().min(0).nullable().optional(),
  price_per_unit: z.number().min(0, 'Price must be >= 0'),
  supplier_id: z.string().uuid().nullable().optional(),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  contact_email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  contact_phone: z.string().max(50, 'Phone too long').nullable().optional(),
  address: z.string().max(500, 'Address too long').nullable().optional(),
  notes: z.string().max(2000, 'Notes too long').nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  is_active: z.boolean().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

export const recipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  serving_size: z.number().int().min(1, 'Must serve at least 1'),
  prep_time_minutes: z.number().int().min(0).nullable().optional(),
  cook_time_minutes: z.number().int().min(0).nullable().optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  instructions: z.string().nullable().optional(),
  selling_price: z.number().min(0, 'Price must be >= 0'),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  selling_price: z.number().min(0, 'Price must be >= 0'),
  sales_percentage: z.number().min(0).max(100).optional(),
  waste_percentage: z.number().min(0).max(100).optional(),
  is_active: z.boolean(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

export const ingredientSchema = z.object({
  inventory_item_id: z.string().uuid(),
  quantity_needed: z.number().min(0.01, 'Quantity must be > 0'),
  unit: z.string().min(1, 'Unit is required'),
  cost_per_unit: z.number().min(0, 'Cost must be >= 0'),
})

export type IngredientFormValues = z.infer<typeof ingredientSchema>
