'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createRecipe as createRecipeService,
  updateRecipe as updateRecipeService,
  deleteRecipe as deleteRecipeService,
  addIngredient as addIngredientService,
  removeIngredient as removeIngredientService,
  recalculateRecipeCosts,
} from '@/lib/services/recipes'
import { recipeSchema, ingredientSchema } from '@/lib/utils/validation'
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

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      serving_size: Number(formData.get('serving_size')),
      prep_time_minutes: formData.get('prep_time_minutes')
        ? Number(formData.get('prep_time_minutes'))
        : null,
      cook_time_minutes: formData.get('cook_time_minutes')
        ? Number(formData.get('cook_time_minutes'))
        : null,
      difficulty_level: formData.get('difficulty_level') as string,
      instructions: (formData.get('instructions') as string) || null,
      selling_price: Number(formData.get('selling_price')),
    }

    const parsed = recipeSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const recipe = await createRecipeService({
      ...parsed.data,
      user_id: userId,
    })
    return { success: true, data: recipe }
  } catch (err) {
    logger.error({ err, action: 'createRecipe' }, 'Failed to create recipe')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateRecipe(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      serving_size: Number(formData.get('serving_size')),
      prep_time_minutes: formData.get('prep_time_minutes')
        ? Number(formData.get('prep_time_minutes'))
        : null,
      cook_time_minutes: formData.get('cook_time_minutes')
        ? Number(formData.get('cook_time_minutes'))
        : null,
      difficulty_level: formData.get('difficulty_level') as string,
      instructions: (formData.get('instructions') as string) || null,
      selling_price: Number(formData.get('selling_price')),
    }

    const parsed = recipeSchema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const recipe = await updateRecipeService(id, parsed.data)

    // Recalculate costs after updating (selling_price may have changed)
    await recalculateRecipeCosts(id)

    return { success: true, data: recipe }
  } catch (err) {
    logger.error({ err, id, action: 'updateRecipe' }, 'Failed to update recipe')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteRecipe(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await deleteRecipeService(id)
    return { success: true }
  } catch (err) {
    logger.error({ err, id, action: 'deleteRecipe' }, 'Failed to delete recipe')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function addIngredient(data: {
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
}): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const parsed = ingredientSchema.safeParse({
      inventory_item_id: data.inventory_item_id,
      quantity_needed: data.quantity_needed,
      unit: data.unit,
      cost_per_unit: data.cost_per_unit,
    })
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const ingredient = await addIngredientService({
      recipe_id: data.recipe_id,
      ...parsed.data,
    })

    // Recalculate costs atomically after adding ingredient
    await recalculateRecipeCosts(data.recipe_id)

    return { success: true, data: ingredient }
  } catch (err) {
    logger.error({ err, action: 'addIngredient' }, 'Failed to add ingredient')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function removeIngredient(
  ingredientId: string,
  recipeId: string
): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await removeIngredientService(ingredientId)

    // Recalculate costs atomically after removing ingredient
    await recalculateRecipeCosts(recipeId)

    return { success: true }
  } catch (err) {
    logger.error({ err, ingredientId, action: 'removeIngredient' }, 'Failed to remove ingredient')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
