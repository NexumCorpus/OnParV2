'use client'

import { supabase } from './supabase'
import { Database } from './supabase'

// Database utility functions for common operations

type Tables = Database['public']['Tables']
type InventoryItem = Tables['inventory_items']['Row']
type MenuItem = Tables['menu_items']['Row']
type Recipe = Tables['recipes']['Row']
type Supplier = Tables['suppliers']['Row']

// Generic database operations
export class DatabaseService<T extends Record<string, any>> {
  constructor(private tableName: string) {}

  async findAll(filters?: Partial<T>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async bulkCreate(items: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(items)
      .select()
    
    if (error) throw error
    return data || []
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    const promises = updates.map(({ id, data }) => this.update(id, data))
    return Promise.all(promises)
  }

  async count(filters?: Partial<T>): Promise<number> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    const { count, error } = await query
    if (error) throw error
    return count || 0
  }
}

// Specific service instances
export const inventoryService = new DatabaseService<InventoryItem>('inventory_items')
export const menuService = new DatabaseService<MenuItem>('menu_items')
export const recipeService = new DatabaseService<Recipe>('recipes')
export const supplierService = new DatabaseService<Supplier>('suppliers')

// Advanced inventory operations
export const inventoryOperations = {
  async getLowStockItems(userId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .lt('quantity', supabase.raw('reorder_point'))
    
    if (error) throw error
    return data || []
  },

  async getExpiringItems(userId: string, days: number = 7): Promise<InventoryItem[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString())
    
    if (error) throw error
    return data || []
  },

  async getTotalValue(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('quantity, price_per_unit')
      .eq('user_id', userId)
    
    if (error) throw error
    
    return (data || []).reduce((total, item) => {
      return total + (item.quantity * item.price_per_unit)
    }, 0)
  },

  async updateQuantity(id: string, newQuantity: number): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async bulkUpdateQuantities(updates: Array<{ id: string; quantity: number }>): Promise<void> {
    const promises = updates.map(({ id, quantity }) => 
      this.updateQuantity(id, quantity)
    )
    await Promise.all(promises)
  }
}

// Menu operations
export const menuOperations = {
  async getMenuWithRecipes(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        recipes (
          id,
          name,
          ingredients,
          instructions,
          prep_time,
          cook_time,
          servings
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  async calculateMenuCosts(userId: string): Promise<Record<string, number>> {
    const menuItems = await this.getMenuWithRecipes(userId)
    const costs: Record<string, number> = {}
    
    for (const item of menuItems) {
      if (item.recipes && item.recipes.ingredients) {
        let totalCost = 0
        
        // Calculate cost based on ingredients
        for (const ingredient of item.recipes.ingredients) {
          const inventoryItem = await inventoryService.findAll({
            user_id: userId,
            name: ingredient.name
          })
          
          if (inventoryItem.length > 0) {
            const cost = (ingredient.quantity / inventoryItem[0].quantity) * inventoryItem[0].price_per_unit
            totalCost += cost
          }
        }
        
        costs[item.id] = totalCost
      }
    }
    
    return costs
  }
}

// Recipe operations
export const recipeOperations = {
  async getRecipeWithIngredients(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          quantity,
          unit,
          inventory_items (
            id,
            name,
            price_per_unit,
            quantity as available_quantity
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async checkIngredientAvailability(recipeId: string, servings: number = 1): Promise<{
    available: boolean
    missingIngredients: string[]
    availableServings: number
  }> {
    const recipe = await this.getRecipeWithIngredients(recipeId)
    const missingIngredients: string[] = []
    let maxServings = Infinity
    
    for (const ingredient of recipe.recipe_ingredients || []) {
      const requiredQuantity = ingredient.quantity * servings
      const availableQuantity = ingredient.inventory_items?.available_quantity || 0
      
      if (availableQuantity < requiredQuantity) {
        missingIngredients.push(ingredient.inventory_items?.name || 'Unknown')
      }
      
      const possibleServings = Math.floor(availableQuantity / ingredient.quantity)
      maxServings = Math.min(maxServings, possibleServings)
    }
    
    return {
      available: missingIngredients.length === 0,
      missingIngredients,
      availableServings: maxServings === Infinity ? 0 : maxServings
    }
  }
}

// Supplier operations
export const supplierOperations = {
  async getSupplierWithItems(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        inventory_items (
          id,
          name,
          quantity,
          price_per_unit,
          reorder_point
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async generateReorderList(userId: string): Promise<any[]> {
    const lowStockItems = await inventoryOperations.getLowStockItems(userId)
    
    const reorderList = await Promise.all(
      lowStockItems.map(async (item) => {
        const supplier = await supplierService.findById(item.supplier_id || '')
        return {
          item,
          supplier,
          recommendedQuantity: Math.max(item.reorder_point * 2, 10)
        }
      })
    )
    
    return reorderList.filter(item => item.supplier)
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  latency: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const { error } = await supabase.from('inventory_items').select('id').limit(1)
    const latency = Date.now() - startTime
    
    if (error) {
      return { connected: false, latency, error: error.message }
    }
    
    return { connected: true, latency }
  } catch (error) {
    return { 
      connected: false, 
      latency: Date.now() - startTime, 
      error: (error as Error).message 
    }
  }
}