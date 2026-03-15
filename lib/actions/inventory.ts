'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustQuantity,
} from '@/lib/services/inventory'
import { canAddInventoryItem } from '@/lib/services/plan-limits'
import { inventoryItemSchema } from '@/lib/utils/validation'
import { parseInventoryCSV } from '@/lib/utils/csv'
import { logger } from '@/lib/utils/logger'
import { CSV_MAX_FILE_SIZE_BYTES, CSV_MAX_ROWS } from '@/lib/config'
import type { ActionResult } from '@/types'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user.id
}

export async function createItem(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    const canAdd = await canAddInventoryItem(userId)
    if (!canAdd) {
      return { success: false, error: 'PLAN_LIMIT_REACHED' }
    }

    const raw = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      expiry_date: (formData.get('expiry_date') as string) || null,
      reorder_point: Number(formData.get('reorder_point')),
      max_stock_level: formData.get('max_stock_level')
        ? Number(formData.get('max_stock_level'))
        : null,
      price_per_unit: Number(formData.get('price_per_unit')),
      supplier_id: (formData.get('supplier_id') as string) || null,
    }

    const parsed = inventoryItemSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const { expiry_date, max_stock_level, supplier_id, ...rest } = parsed.data
    const item = await createInventoryItem({
      ...rest,
      user_id: userId,
      expiry_date: expiry_date ?? undefined,
      max_stock_level: max_stock_level ?? undefined,
      supplier_id: supplier_id ?? undefined,
    })
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, action: 'createItem' }, 'Failed to create inventory item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateItem(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      expiry_date: (formData.get('expiry_date') as string) || null,
      reorder_point: Number(formData.get('reorder_point')),
      max_stock_level: formData.get('max_stock_level')
        ? Number(formData.get('max_stock_level'))
        : null,
      price_per_unit: Number(formData.get('price_per_unit')),
      supplier_id: (formData.get('supplier_id') as string) || null,
    }

    const parsed = inventoryItemSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const { expiry_date: ed, max_stock_level: ms, supplier_id: si, ...updateRest } = parsed.data
    const item = await updateInventoryItem(id, {
      ...updateRest,
      expiry_date: ed ?? undefined,
      max_stock_level: ms ?? undefined,
      supplier_id: si ?? undefined,
    })
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, id, action: 'updateItem' }, 'Failed to update inventory item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await deleteInventoryItem(id)
    return { success: true }
  } catch (err) {
    logger.error({ err, id, action: 'deleteItem' }, 'Failed to delete inventory item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function bulkDeleteItems(ids: string[]): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await Promise.all(ids.map((id) => deleteInventoryItem(id)))
    return { success: true }
  } catch (err) {
    logger.error({ err, action: 'bulkDeleteItems' }, 'Failed to bulk delete items')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function adjustItemQuantity(
  id: string,
  delta: number
): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    const item = await adjustQuantity(id, delta)
    if (!item) {
      return { success: false, error: 'ITEM_DELETED' }
    }
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, id, delta, action: 'adjustItemQuantity' }, 'Failed to adjust quantity')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function importFromCSV(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    if (file.size > CSV_MAX_FILE_SIZE_BYTES) {
      return { success: false, error: `File too large. Maximum size is 5MB.` }
    }

    const csvString = await file.text()
    const result = parseInventoryCSV(csvString)

    if (result.errors.length > 0 && result.valid.length === 0) {
      return {
        success: false,
        error: `All rows have errors: ${result.errors.map((e) => `Row ${e.row}: ${e.message}`).join('; ')}`,
      }
    }

    if (result.valid.length > CSV_MAX_ROWS) {
      return { success: false, error: `Too many rows. Maximum is ${CSV_MAX_ROWS} rows.` }
    }

    const canAdd = await canAddInventoryItem(userId)
    if (!canAdd) {
      return { success: false, error: 'PLAN_LIMIT_REACHED' }
    }

    // Insert all valid items
    const insertPromises = result.valid.map((item) =>
      createInventoryItem({
        ...item,
        user_id: userId,
        expiry_date: item.expiry_date ?? undefined,
      })
    )
    await Promise.all(insertPromises)

    return {
      success: true,
      data: {
        imported: result.valid.length,
        errors: result.errors,
      },
    }
  } catch (err) {
    logger.error({ err, action: 'importFromCSV' }, 'Failed to import CSV')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
