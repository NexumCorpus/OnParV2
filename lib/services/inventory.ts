import { createClient } from '@/lib/supabase/server'
import type { InventoryItem, CreateInventoryInput } from '@/types'
import { logger } from '@/lib/utils/logger'

interface InventoryFilters {
  category?: string
  search?: string
  lowStockOnly?: boolean
  expiringOnly?: boolean
  sortBy?: 'name' | 'quantity' | 'expiry_date' | 'price_per_unit' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export async function getInventoryItems(
  userId: string,
  filters?: InventoryFilters
): Promise<InventoryItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  // lowStockOnly is handled post-query (PostgREST can't compare columns)

  if (filters?.expiringOnly) {
    const now = new Date()
    const withinDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    query = query
      .not('expiry_date', 'is', null)
      .gte('expiry_date', now.toISOString().split('T')[0])
      .lte('expiry_date', withinDate.toISOString().split('T')[0])
  }

  const sortBy = filters?.sortBy ?? 'updated_at'
  const sortOrder = filters?.sortOrder ?? 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    logger.error({ err: error, userId, action: 'getInventoryItems' }, 'Failed to fetch inventory items')
    throw new Error('Failed to fetch inventory items')
  }

  let items = (data ?? []) as InventoryItem[]
  if (filters?.lowStockOnly) {
    items = items.filter(item => item.quantity < item.reorder_point)
  }
  return items
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error({ err: error, id, action: 'getInventoryItem' }, 'Failed to fetch inventory item')
    throw new Error('Failed to fetch inventory item')
  }

  return data as InventoryItem | null
}

export async function createInventoryItem(
  data: CreateInventoryInput & { user_id: string }
): Promise<InventoryItem> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert({
      user_id: data.user_id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      expiry_date: data.expiry_date ?? null,
      reorder_point: data.reorder_point,
      max_stock_level: data.max_stock_level ?? null,
      price_per_unit: data.price_per_unit,
      supplier_id: data.supplier_id ?? null,
    })
    .select()
    .single()

  if (error) {
    logger.error({ err: error, action: 'createInventoryItem' }, 'Failed to create inventory item')
    throw new Error('Failed to create inventory item')
  }

  return item as InventoryItem
}

export async function updateInventoryItem(
  id: string,
  data: Partial<CreateInventoryInput>
): Promise<InventoryItem> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logger.error({ err: error, id, action: 'updateInventoryItem' }, 'Failed to update inventory item')
    throw new Error('Failed to update inventory item')
  }

  return item as InventoryItem
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('inventory_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    logger.error({ err: error, id, action: 'deleteInventoryItem' }, 'Failed to soft-delete inventory item')
    throw new Error('Failed to delete inventory item')
  }
}

export async function getLowStockItems(userId: string): Promise<InventoryItem[]> {
  const supabase = await createClient()
  // PostgREST doesn't support column-to-column comparison via .filter(),
  // so fetch active items and compare quantity < reorder_point in JS.
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    logger.error({ err: error, userId, action: 'getLowStockItems' }, 'Failed to fetch low stock items')
    throw new Error('Failed to fetch low stock items')
  }

  return ((data ?? []) as InventoryItem[]).filter(item => item.quantity < item.reorder_point)
}

export async function getExpiringItems(
  userId: string,
  withinDays: number = 7
): Promise<InventoryItem[]> {
  const supabase = await createClient()
  const now = new Date()
  const withinDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .not('expiry_date', 'is', null)
    .gte('expiry_date', now.toISOString().split('T')[0])
    .lte('expiry_date', withinDate.toISOString().split('T')[0])

  if (error) {
    logger.error({ err: error, userId, action: 'getExpiringItems' }, 'Failed to fetch expiring items')
    throw new Error('Failed to fetch expiring items')
  }

  return (data ?? []) as InventoryItem[]
}

export async function getTotalInventoryValue(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('quantity, price_per_unit')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    logger.error({ err: error, userId, action: 'getTotalInventoryValue' }, 'Failed to calculate inventory value')
    throw new Error('Failed to calculate inventory value')
  }

  const items = (data ?? []) as Array<{ quantity: number; price_per_unit: number }>
  return items.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0)
}

export async function calculateEstimatedSavings(userId: string): Promise<{
  lowStockSavings: number
  expirySavings: number
  totalSavings: number
}> {
  const [lowStockItems, expiringItems] = await Promise.all([
    getLowStockItems(userId),
    getExpiringItems(userId),
  ])

  const lowStockSavings = lowStockItems.reduce(
    (sum, item) => sum + (item.reorder_point - item.quantity) * item.price_per_unit * 0.15,
    0
  )

  const expirySavings = expiringItems.reduce(
    (sum, item) => sum + item.quantity * item.price_per_unit * 0.20,
    0
  )

  return {
    lowStockSavings,
    expirySavings,
    totalSavings: lowStockSavings + expirySavings,
  }
}

export async function getCategories(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('category')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    logger.error({ err: error, userId, action: 'getCategories' }, 'Failed to fetch categories')
    throw new Error('Failed to fetch categories')
  }

  const categories = (data ?? []) as Array<{ category: string }>
  const unique = [...new Set(categories.map((c) => c.category))]
  return unique.sort()
}

export async function adjustQuantity(
  id: string,
  delta: number
): Promise<InventoryItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('adjust_quantity', {
    item_id: id,
    delta,
  })

  if (error) {
    logger.error({ err: error, id, delta, action: 'adjustQuantity' }, 'Failed to adjust quantity')
    throw new Error('Failed to adjust quantity')
  }

  const rows = data as InventoryItem[] | null
  return rows?.[0] ?? null
}

export async function bulkUpdateQuantities(
  updates: Array<{ id: string; delta: number }>
): Promise<void> {
  await Promise.all(updates.map((u) => adjustQuantity(u.id, u.delta)))
}

export async function getCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    logger.error({ err: error, userId, action: 'getCount' }, 'Failed to count inventory items')
    throw new Error('Failed to count inventory items')
  }

  return count ?? 0
}
