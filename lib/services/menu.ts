import { createClient } from '@/lib/supabase/server'
import type { MenuItem, CreateMenuItemInput } from '@/types'
import { logger } from '@/lib/utils/logger'

interface MenuFilters {
  category?: string
  search?: string
  activeOnly?: boolean
  sortBy?: 'name' | 'selling_price' | 'sales_percentage' | 'waste_percentage'
  sortOrder?: 'asc' | 'desc'
}

export async function getMenuItems(
  userId: string,
  filters?: MenuFilters
): Promise<MenuItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', userId)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.activeOnly) {
    query = query.eq('is_active', true)
  }

  const sortBy = filters?.sortBy ?? 'name'
  const sortOrder = filters?.sortOrder ?? 'asc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    logger.error({ err: error, userId, action: 'getMenuItems' }, 'Failed to fetch menu items')
    throw new Error('Failed to fetch menu items')
  }

  return (data ?? []) as MenuItem[]
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error({ err: error, id, action: 'getMenuItem' }, 'Failed to fetch menu item')
    throw new Error('Failed to fetch menu item')
  }

  return data as MenuItem | null
}

export async function createMenuItem(
  data: CreateMenuItemInput & { user_id: string; recipe_id?: string | null }
): Promise<MenuItem> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('menu_items')
    .insert({
      user_id: data.user_id,
      name: data.name,
      category: data.category,
      selling_price: data.selling_price,
      sales_percentage: data.sales_percentage ?? 0,
      waste_percentage: data.waste_percentage ?? 0,
      is_active: data.is_active ?? true,
      recipe_id: data.recipe_id ?? null,
    })
    .select()
    .single()

  if (error) {
    logger.error({ err: error, action: 'createMenuItem' }, 'Failed to create menu item')
    throw new Error('Failed to create menu item')
  }

  return item as MenuItem
}

export async function updateMenuItem(
  id: string,
  data: Partial<CreateMenuItemInput & { recipe_id?: string | null }>
): Promise<MenuItem> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('menu_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error({ err: error, id, action: 'updateMenuItem' }, 'Failed to update menu item')
    throw new Error('Failed to update menu item')
  }

  return item as MenuItem
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error({ err: error, id, action: 'deleteMenuItem' }, 'Failed to delete menu item')
    throw new Error('Failed to delete menu item')
  }
}

export async function getMenuStats(userId: string): Promise<{
  totalItems: number
  activeItems: number
  avgWastePercentage: number
  topPerformers: MenuItem[]
  worstPerformers: MenuItem[]
}> {
  const allItems = await getMenuItems(userId)
  const activeItems = allItems.filter((item) => item.is_active)

  const avgWastePercentage =
    activeItems.length > 0
      ? activeItems.reduce((sum, item) => sum + item.waste_percentage, 0) / activeItems.length
      : 0

  // Top 3 by sales_percentage
  const sortedBySales = [...activeItems].sort(
    (a, b) => b.sales_percentage - a.sales_percentage
  )
  const topPerformers = sortedBySales.slice(0, 3)

  // Bottom 3 by sales_percentage with >3% waste
  const worstPerformers = [...activeItems]
    .filter((item) => item.waste_percentage > 3)
    .sort((a, b) => a.sales_percentage - b.sales_percentage)
    .slice(0, 3)

  return {
    totalItems: allItems.length,
    activeItems: activeItems.length,
    avgWastePercentage,
    topPerformers,
    worstPerformers,
  }
}
