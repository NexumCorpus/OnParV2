import { supabase } from './supabase'
import { Database } from './supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuUpdate = Database['public']['Tables']['menu_items']['Update']

export async function getMenuItems(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  
    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return { data: [], error }
  }
}

export async function createMenuItem(item: MenuInsert) {
  try {
    // Enhanced input validation
    if (!item.user_id || !item.name?.trim()) {
      throw new Error('Invalid menu item data')
    }

    // Validate user_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(item.user_id)) {
      throw new Error('Invalid user ID format')
    }

    // Sanitize and validate inputs
    const sanitizedItem: MenuInsert = {
      user_id: item.user_id,
      name: String(item.name).trim().substring(0, 100),
      sales_percentage: Math.max(0, Math.min(100, parseFloat(String(item.sales_percentage)) || 0)),
      waste_percentage: Math.max(0, Math.min(100, parseFloat(String(item.waste_percentage)) || 0))
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([sanitizedItem])
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error creating menu item:', error)
    return { data: null, error }
  }
}

export async function updateMenuItem(id: string, updates: MenuUpdate) {
  try {
    if (!id) {
      throw new Error('Menu item ID is required')
    }

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid menu item ID format')
    }

    // Sanitize updates
    const sanitizedUpdates: MenuUpdate = {}
    
    if (updates.name !== undefined) {
      sanitizedUpdates.name = String(updates.name).trim().substring(0, 100)
    }
    if (updates.sales_percentage !== undefined) {
      sanitizedUpdates.sales_percentage = Math.max(0, Math.min(100, parseFloat(String(updates.sales_percentage)) || 0))
    }
    if (updates.waste_percentage !== undefined) {
      sanitizedUpdates.waste_percentage = Math.max(0, Math.min(100, parseFloat(String(updates.waste_percentage)) || 0))
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error updating menu item:', error)
    return { data: null, error }
  }
}

export async function deleteMenuItem(id: string) {
  try {
    if (!id) {
      throw new Error('Menu item ID is required')
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
  
    return { error }
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return { error }
  }
}

export function calculateWastePercentage(salesPercentage: number, baseWaste: number = 5) {
  // Simple formula: higher sales = lower waste
  const wasteReduction = Math.min(salesPercentage * 0.1, 4)
  return Math.max(baseWaste - wasteReduction, 1)
}