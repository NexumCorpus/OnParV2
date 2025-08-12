import { supabase } from './supabase'
import { Database } from './supabase'
import { memoize } from './performance'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type InventoryInsert = Database['public']['Tables']['inventory_items']['Insert']
type InventoryUpdate = Database['public']['Tables']['inventory_items']['Update']

export async function getInventoryItems(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  
    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return { data: [], error }
  }
}

export async function createInventoryItem(item: InventoryInsert) {
  try {
    // Enhanced input validation
    if (!item.user_id || !item.name?.trim()) {
      throw new Error('Invalid item data')
    }

    // Validate user_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(item.user_id)) {
      throw new Error('Invalid user ID format')
    }

    // Sanitize and validate inputs
    const sanitizedItem: InventoryInsert = {
      user_id: item.user_id,
      name: String(item.name).trim().substring(0, 100), // Limit name length
      quantity: Math.max(0, Math.min(999999, parseInt(String(item.quantity)) || 0)),
      unit: String(item.unit || 'pieces').trim().substring(0, 20),
      reorder_point: Math.max(0, Math.min(999999, parseInt(String(item.reorder_point)) || 0)),
      price_per_unit: Math.max(0, Math.min(999999, parseFloat(String(item.price_per_unit)) || 0)),
      expiry_date: item.expiry_date || null
    }

    // Validate expiry date if provided
    if (sanitizedItem.expiry_date) {
      const expiryDate = new Date(sanitizedItem.expiry_date)
      if (isNaN(expiryDate.getTime())) {
        throw new Error('Invalid expiry date')
      }
      // Ensure expiry date is not too far in the past or future
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const tenYearsFromNow = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate())
      
      if (expiryDate < oneYearAgo || expiryDate > tenYearsFromNow) {
        throw new Error('Expiry date out of reasonable range')
      }
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([sanitizedItem])
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return { data: null, error }
  }
}

export async function updateInventoryItem(id: string, updates: InventoryUpdate) {
  try {
    if (!id) {
      throw new Error('Item ID is required')
    }

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid item ID format')
    }

    // Sanitize updates
    const sanitizedUpdates: InventoryUpdate = {}
    
    if (updates.name !== undefined) {
      sanitizedUpdates.name = String(updates.name).trim().substring(0, 100)
    }
    if (updates.quantity !== undefined) {
      sanitizedUpdates.quantity = Math.max(0, Math.min(999999, parseInt(String(updates.quantity)) || 0))
    }
    if (updates.unit !== undefined) {
      sanitizedUpdates.unit = String(updates.unit).trim().substring(0, 20)
    }
    if (updates.reorder_point !== undefined) {
      sanitizedUpdates.reorder_point = Math.max(0, Math.min(999999, parseInt(String(updates.reorder_point)) || 0))
    }
    if (updates.price_per_unit !== undefined) {
      sanitizedUpdates.price_per_unit = Math.max(0, Math.min(999999, parseFloat(String(updates.price_per_unit)) || 0))
    }
    if (updates.expiry_date !== undefined) {
      if (updates.expiry_date) {
        const expiryDate = new Date(updates.expiry_date)
        if (isNaN(expiryDate.getTime())) {
          throw new Error('Invalid expiry date')
        }
        sanitizedUpdates.expiry_date = updates.expiry_date
      } else {
        sanitizedUpdates.expiry_date = null
      }
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return { data: null, error }
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    if (!id) {
      throw new Error('Item ID is required')
    }

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
  
    return { error }
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return { error }
  }
}

export function getLowStockItems(items: InventoryItem[]) {
  return items.filter(item => item.quantity < item.reorder_point)
}

export const getExpiringItems = memoize((items: InventoryItem[]) => {
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  
  return items.filter(item => {
    if (!item.expiry_date) return false
    return new Date(item.expiry_date) <= sevenDaysFromNow
  })
})

export const calculateEstimatedSavings = memoize((items: InventoryItem[]) => {
  const lowStockItems = getLowStockItems(items)
  const expiringItems = getExpiringItems(items)
  
  const lowStockSavings = lowStockItems.reduce((total, item) => {
    return total + (item.quantity * item.price_per_unit * 0.15)
  }, 0)
  
  const expirySavings = expiringItems.reduce((total, item) => {
    return total + (item.quantity * item.price_per_unit * 0.20)
  }, 0)
  
  return lowStockSavings + expirySavings
})