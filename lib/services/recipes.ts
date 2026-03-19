import { createClient } from '@/lib/supabase/server'
import type {
  Recipe,
  RecipeIngredient,
  InventoryItem,
  CreateRecipeInput,
  CreateIngredientInput,
} from '@/types'
import { logger } from '@/lib/utils/logger'

interface RecipeFilters {
  category?: string
  search?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  sortBy?: 'name' | 'profit_margin' | 'cost_per_serving' | 'popularity_score' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { inventory_item: InventoryItem })[]
}

export async function getRecipes(
  userId: string,
  filters?: RecipeFilters
): Promise<Recipe[]> {
  const supabase = await createClient()
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty_level', filters.difficulty)
  }

  const sortBy = filters?.sortBy ?? 'updated_at'
  const sortOrder = filters?.sortOrder ?? 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    logger.error({ err: error, userId, action: 'getRecipes' }, 'Failed to fetch recipes')
    throw new Error('Failed to fetch recipes')
  }

  return (data ?? []) as Recipe[]
}

export async function getRecipe(
  id: string
): Promise<RecipeWithIngredients | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*, inventory_items(*))')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error({ err: error, id, action: 'getRecipe' }, 'Failed to fetch recipe')
    throw new Error('Failed to fetch recipe')
  }

  if (!data) return null

  // Map the Supabase join shape to our expected type
  const recipe = data as Record<string, unknown>
  const rawIngredients = (recipe.recipe_ingredients ?? []) as Array<
    Record<string, unknown>
  >

  const ingredients = rawIngredients.map((ri) => {
    const inventoryItems = ri.inventory_items as InventoryItem | InventoryItem[] | null
    const inventory_item = Array.isArray(inventoryItems)
      ? inventoryItems[0]
      : inventoryItems

    return {
      id: ri.id as string,
      recipe_id: ri.recipe_id as string,
      inventory_item_id: ri.inventory_item_id as string,
      quantity_needed: ri.quantity_needed as number,
      unit: ri.unit as string,
      cost_per_unit: ri.cost_per_unit as number,
      created_at: ri.created_at as string,
      inventory_item: inventory_item as InventoryItem,
    }
  })

  const { recipe_ingredients: _ri, ...recipeFields } = recipe

  return {
    ...recipeFields,
    ingredients,
  } as RecipeWithIngredients
}

export async function createRecipe(
  data: CreateRecipeInput & { user_id: string }
): Promise<Recipe> {
  const supabase = await createClient()
  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      user_id: data.user_id,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      serving_size: data.serving_size,
      prep_time_minutes: data.prep_time_minutes ?? null,
      cook_time_minutes: data.cook_time_minutes ?? null,
      difficulty_level: data.difficulty_level,
      instructions: data.instructions ?? null,
      selling_price: data.selling_price,
      cost_per_serving: 0,
      profit_margin: data.selling_price > 0 ? 100 : 0,
      popularity_score: 0,
      waste_percentage: 0,
    })
    .select()
    .single()

  if (error) {
    logger.error({ err: error, action: 'createRecipe' }, 'Failed to create recipe')
    throw new Error('Failed to create recipe')
  }

  return recipe as Recipe
}

export async function updateRecipe(
  id: string,
  data: Partial<CreateRecipeInput>
): Promise<Recipe> {
  const supabase = await createClient()
  const { data: recipe, error } = await supabase
    .from('recipes')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error({ err: error, id, action: 'updateRecipe' }, 'Failed to update recipe')
    throw new Error('Failed to update recipe')
  }

  return recipe as Recipe
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error({ err: error, id, action: 'deleteRecipe' }, 'Failed to delete recipe')
    throw new Error('Failed to delete recipe')
  }
}

// --- Ingredient Management ---

export async function addIngredient(data: {
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
}): Promise<RecipeIngredient> {
  const supabase = await createClient()
  const { data: ingredient, error } = await supabase
    .from('recipe_ingredients')
    .insert({
      recipe_id: data.recipe_id,
      inventory_item_id: data.inventory_item_id,
      quantity_needed: data.quantity_needed,
      unit: data.unit,
      cost_per_unit: data.cost_per_unit,
    })
    .select()
    .single()

  if (error) {
    logger.error({ err: error, action: 'addIngredient' }, 'Failed to add ingredient')
    throw new Error('Failed to add ingredient')
  }

  return ingredient as RecipeIngredient
}

export async function removeIngredient(ingredientId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) {
    logger.error({ err: error, ingredientId, action: 'removeIngredient' }, 'Failed to remove ingredient')
    throw new Error('Failed to remove ingredient')
  }
}

export async function updateIngredient(
  ingredientId: string,
  data: Partial<CreateIngredientInput>
): Promise<RecipeIngredient> {
  const supabase = await createClient()
  const { data: ingredient, error } = await supabase
    .from('recipe_ingredients')
    .update(data)
    .eq('id', ingredientId)
    .select()
    .single()

  if (error) {
    logger.error({ err: error, ingredientId, action: 'updateIngredient' }, 'Failed to update ingredient')
    throw new Error('Failed to update ingredient')
  }

  return ingredient as RecipeIngredient
}

// --- Business Logic ---

/**
 * Calculate total recipe cost from ingredients.
 * cost = SUM(ingredient.quantity_needed * ingredient.cost_per_unit)
 */
export async function calculateRecipeCost(recipeId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('quantity_needed, cost_per_unit')
    .eq('recipe_id', recipeId)

  if (error) {
    logger.error({ err: error, recipeId, action: 'calculateRecipeCost' }, 'Failed to calculate recipe cost')
    throw new Error('Failed to calculate recipe cost')
  }

  const ingredients = (data ?? []) as Array<{ quantity_needed: number; cost_per_unit: number }>
  return ingredients.reduce((sum, ing) => sum + ing.quantity_needed * ing.cost_per_unit, 0)
}

/**
 * Calculate profit margin.
 * margin = ((sellingPrice - costPerServing) / sellingPrice) * 100
 */
export function calculateProfitMargin(sellingPrice: number, costPerServing: number): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - costPerServing) / sellingPrice) * 100
}

/**
 * Check if all ingredients are available in inventory.
 * Returns items where inventory.quantity < recipe_ingredient.quantity_needed.
 */
export async function checkIngredientAvailability(recipeId: string): Promise<{
  available: boolean
  missingItems: Array<{
    ingredient: RecipeIngredient
    inventoryItem: InventoryItem
    shortfall: number
  }>
}> {
  const recipe = await getRecipe(recipeId)
  if (!recipe) {
    throw new Error('Recipe not found')
  }

  const missingItems: Array<{
    ingredient: RecipeIngredient
    inventoryItem: InventoryItem
    shortfall: number
  }> = []

  for (const ing of recipe.ingredients) {
    if (!ing.inventory_item) continue
    if (ing.inventory_item.quantity < ing.quantity_needed) {
      const { inventory_item: _inv, ...ingredientFields } = ing
      missingItems.push({
        ingredient: ingredientFields as RecipeIngredient,
        inventoryItem: ing.inventory_item,
        shortfall: ing.quantity_needed - ing.inventory_item.quantity,
      })
    }
  }

  return {
    available: missingItems.length === 0,
    missingItems,
  }
}

/**
 * Recalculate and update cost_per_serving and profit_margin on recipe.
 * Called after ingredient changes.
 * cost_per_serving = calculateRecipeCost(recipeId) / recipe.serving_size
 * profit_margin = ((selling_price - cost_per_serving) / selling_price) * 100
 *
 * Uses Supabase RPC for atomicity — the function runs in a single transaction.
 * Falls back to manual calculation if the RPC is not available.
 */
export async function recalculateRecipeCosts(recipeId: string): Promise<Recipe> {
  const supabase = await createClient()

  // Try using RPC for atomic recalculation
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'recalculate_recipe_costs',
    { p_recipe_id: recipeId }
  )

  if (!rpcError && rpcData) {
    const rows = rpcData as Recipe[] | Recipe
    return Array.isArray(rows) ? rows[0] : rows
  }

  // Fallback: manual calculation (still safe for single-user scenarios)
  if (rpcError) {
    logger.warn(
      { err: rpcError, recipeId, action: 'recalculateRecipeCosts' },
      'RPC not available, falling back to manual recalculation'
    )
  }

  const totalCost = await calculateRecipeCost(recipeId)

  // Get the current recipe to know serving_size and selling_price
  const { data: currentRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('serving_size, selling_price')
    .eq('id', recipeId)
    .single()

  if (fetchError || !currentRecipe) {
    throw new Error('Failed to fetch recipe for recalculation')
  }

  const rec = currentRecipe as { serving_size: number; selling_price: number }
  const costPerServing = rec.serving_size > 0 ? totalCost / rec.serving_size : 0
  const profitMargin = calculateProfitMargin(rec.selling_price, costPerServing)

  const { data: updated, error: updateError } = await supabase
    .from('recipes')
    .update({
      cost_per_serving: costPerServing,
      profit_margin: profitMargin,
    })
    .eq('id', recipeId)
    .select()
    .single()

  if (updateError) {
    logger.error({ err: updateError, recipeId, action: 'recalculateRecipeCosts' }, 'Failed to update recipe costs')
    throw new Error('Failed to update recipe costs')
  }

  return updated as Recipe
}
