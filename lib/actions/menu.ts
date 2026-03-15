'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createMenuItem as createMenuItemService,
  updateMenuItem as updateMenuItemService,
  deleteMenuItem as deleteMenuItemService,
} from '@/lib/services/menu'
import { menuItemSchema } from '@/lib/utils/validation'
import { logger } from '@/lib/utils/logger'
import type { ActionResult } from '@/types'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user.id
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      selling_price: Number(formData.get('selling_price')),
      sales_percentage: formData.get('sales_percentage')
        ? Number(formData.get('sales_percentage'))
        : undefined,
      waste_percentage: formData.get('waste_percentage')
        ? Number(formData.get('waste_percentage'))
        : undefined,
      is_active: formData.get('is_active') !== 'false',
    }

    const parsed = menuItemSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const recipeId = (formData.get('recipe_id') as string) || null

    const item = await createMenuItemService({
      ...parsed.data,
      user_id: userId,
      recipe_id: recipeId,
    })
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, action: 'createMenuItem' }, 'Failed to create menu item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      selling_price: Number(formData.get('selling_price')),
      sales_percentage: formData.get('sales_percentage')
        ? Number(formData.get('sales_percentage'))
        : undefined,
      waste_percentage: formData.get('waste_percentage')
        ? Number(formData.get('waste_percentage'))
        : undefined,
      is_active: formData.get('is_active') !== 'false',
    }

    const parsed = menuItemSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const recipeId = (formData.get('recipe_id') as string) || null

    const item = await updateMenuItemService(id, {
      ...parsed.data,
      recipe_id: recipeId,
    })
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, id, action: 'updateMenuItem' }, 'Failed to update menu item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await deleteMenuItemService(id)
    return { success: true }
  } catch (err) {
    logger.error({ err, id, action: 'deleteMenuItem' }, 'Failed to delete menu item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function toggleMenuItemActive(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const supabase = await createClient()
    const { data: current, error: fetchError } = await supabase
      .from('menu_items')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Menu item not found' }
    }

    const currentItem = current as { is_active: boolean }
    const item = await updateMenuItemService(id, {
      is_active: !currentItem.is_active,
    })
    return { success: true, data: item }
  } catch (err) {
    logger.error({ err, id, action: 'toggleMenuItemActive' }, 'Failed to toggle menu item')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
