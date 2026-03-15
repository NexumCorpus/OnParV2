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
