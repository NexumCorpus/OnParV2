import { supabase } from './supabase'
import { Database } from './supabase'

export interface Recipe {
  id: string
  user_id: string
  name: string
  description?: string
  category: string
  serving_size: number
  prep_time_minutes?: number
  cook_time_minutes?: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  instructions?: string
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
  total_cost: number
  created_at: string
}

export interface RecipeInsert {
  user_id: string
  name: string
  description?: string
  category: string
  serving_size: number
  prep_time_minutes?: number
  cook_time_minutes?: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  instructions?: string
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
}

export interface RecipeUpdate {
  name?: string
  description?: string
  category?: string
  serving_size?: number
  prep_time_minutes?: number
  cook_time_minutes?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  instructions?: string
  cost_per_serving?: number
  selling_price?: number
  profit_margin?: number
  popularity_score?: number
  waste_percentage?: number
}

export async function getRecipes(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          inventory_items (
            name,
            unit,
            price_per_unit
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  
    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return { data: [], error }
  }
}

export async function createRecipe(recipe: RecipeInsert) {
  try {
    // Enhanced input validation
    if (!recipe.user_id || !recipe.name?.trim()) {
      throw new Error('Invalid recipe data')
    }

    // Validate user_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(recipe.user_id)) {
      throw new Error('Invalid user ID format')
    }

    // Sanitize and validate inputs
    const sanitizedRecipe: RecipeInsert = {
      user_id: recipe.user_id,
      name: String(recipe.name).trim().substring(0, 100),
      description: recipe.description ? String(recipe.description).trim().substring(0, 500) : undefined,
      category: String(recipe.category || 'Main Course').trim().substring(0, 50),
      serving_size: Math.max(1, Math.min(100, parseInt(String(recipe.serving_size)) || 1)),
      prep_time_minutes: recipe.prep_time_minutes ? Math.max(0, Math.min(480, parseInt(String(recipe.prep_time_minutes)))) : undefined,
      cook_time_minutes: recipe.cook_time_minutes ? Math.max(0, Math.min(480, parseInt(String(recipe.cook_time_minutes)))) : undefined,
      difficulty_level: recipe.difficulty_level || 'medium',
      instructions: recipe.instructions ? String(recipe.instructions).trim().substring(0, 2000) : undefined,
      cost_per_serving: Math.max(0, Math.min(1000, parseFloat(String(recipe.cost_per_serving)) || 0)),
      selling_price: Math.max(0, Math.min(1000, parseFloat(String(recipe.selling_price)) || 0)),
      profit_margin: Math.max(0, Math.min(100, parseFloat(String(recipe.profit_margin)) || 0)),
      popularity_score: Math.max(0, Math.min(100, parseFloat(String(recipe.popularity_score)) || 0)),
      waste_percentage: Math.max(0, Math.min(100, parseFloat(String(recipe.waste_percentage)) || 0))
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert([sanitizedRecipe])
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error creating recipe:', error)
    return { data: null, error }
  }
}

export async function updateRecipe(id: string, updates: RecipeUpdate) {
  try {
    if (!id) {
      throw new Error('Recipe ID is required')
    }

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid recipe ID format')
    }

    // Sanitize updates
    const sanitizedUpdates: RecipeUpdate = {}
    
    if (updates.name !== undefined) {
      sanitizedUpdates.name = String(updates.name).trim().substring(0, 100)
    }
    if (updates.description !== undefined) {
      sanitizedUpdates.description = updates.description ? String(updates.description).trim().substring(0, 500) : undefined
    }
    if (updates.category !== undefined) {
      sanitizedUpdates.category = String(updates.category).trim().substring(0, 50)
    }
    if (updates.serving_size !== undefined) {
      sanitizedUpdates.serving_size = Math.max(1, Math.min(100, parseInt(String(updates.serving_size)) || 1))
    }
    if (updates.cost_per_serving !== undefined) {
      sanitizedUpdates.cost_per_serving = Math.max(0, Math.min(1000, parseFloat(String(updates.cost_per_serving)) || 0))
    }
    if (updates.selling_price !== undefined) {
      sanitizedUpdates.selling_price = Math.max(0, Math.min(1000, parseFloat(String(updates.selling_price)) || 0))
    }
    if (updates.profit_margin !== undefined) {
      sanitizedUpdates.profit_margin = Math.max(0, Math.min(100, parseFloat(String(updates.profit_margin)) || 0))
    }
    if (updates.popularity_score !== undefined) {
      sanitizedUpdates.popularity_score = Math.max(0, Math.min(100, parseFloat(String(updates.popularity_score)) || 0))
    }
    if (updates.waste_percentage !== undefined) {
      sanitizedUpdates.waste_percentage = Math.max(0, Math.min(100, parseFloat(String(updates.waste_percentage)) || 0))
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error updating recipe:', error)
    return { data: null, error }
  }
}

export async function deleteRecipe(id: string) {
  try {
    if (!id) {
      throw new Error('Recipe ID is required')
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
  
    return { error }
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return { error }
  }
}

export async function getRecipeIngredients(recipeId: string) {
  try {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        inventory_items (
          name,
          unit,
          price_per_unit,
          quantity
        )
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true })
  
    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching recipe ingredients:', error)
    return { data: [], error }
  }
}

export async function addRecipeIngredient(recipeId: string, inventoryItemId: string, quantityNeeded: number) {
  try {
    // Get inventory item details for cost calculation
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('unit, price_per_unit')
      .eq('id', inventoryItemId)
      .single()

    if (inventoryError || !inventoryItem) {
      throw new Error('Inventory item not found')
    }

    const totalCost = quantityNeeded * inventoryItem.price_per_unit

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert([{
        recipe_id: recipeId,
        inventory_item_id: inventoryItemId,
        quantity_needed: quantityNeeded,
        unit: inventoryItem.unit,
        cost_per_unit: inventoryItem.price_per_unit,
        total_cost: totalCost
      }])
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error adding recipe ingredient:', error)
    return { data: null, error }
  }
}

export function calculateRecipeCost(ingredients: any[]): number {
  return ingredients.reduce((total, ingredient) => total + ingredient.total_cost, 0)
}

export function calculateProfitMargin(costPerServing: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - costPerServing) / sellingPrice) * 100
}

export function getRecipeCategories(): string[] {
  return [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Sides',
    'Salads',
    'Soups',
    'Pasta',
    'Pizza',
    'Sandwiches',
    'Seafood',
    'Vegetarian',
    'Specials'
  ]
}

export function getDifficultyLevels(): Array<{ value: string; label: string; description: string }> {
  return [
    { value: 'easy', label: 'Easy', description: 'Simple preparation, minimal skills required' },
    { value: 'medium', label: 'Medium', description: 'Moderate complexity, some cooking experience needed' },
    { value: 'hard', label: 'Hard', description: 'Complex preparation, advanced culinary skills required' }
  ]
}