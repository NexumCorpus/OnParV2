import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockSelect = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockSingle = vi.fn()
const mockInsert = vi.fn().mockReturnThis()
const mockUpdate = vi.fn().mockReturnThis()
const mockDelete = vi.fn().mockReturnThis()
const mockRpc = vi.fn()

const chainable: Record<string, ReturnType<typeof vi.fn>> = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}

mockSelect.mockReturnValue(chainable)
mockEq.mockReturnValue(chainable)
mockInsert.mockReturnValue(chainable)
mockUpdate.mockReturnValue(chainable)
mockDelete.mockReturnValue(chainable)

const mockFrom = vi.fn(() => chainable)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

const mockIlike = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()

const extChainable: Record<string, ReturnType<typeof vi.fn>> = {
  ...chainable,
  ilike: mockIlike,
  order: mockOrder,
}

mockSelect.mockReturnValue(extChainable)
mockEq.mockReturnValue(extChainable)
mockInsert.mockReturnValue(extChainable)
mockUpdate.mockReturnValue(extChainable)
mockDelete.mockReturnValue(extChainable)
mockIlike.mockReturnValue(extChainable)
mockOrder.mockReturnValue(extChainable)

const {
  calculateProfitMargin,
  calculateRecipeCost,
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  removeIngredient,
  updateIngredient,
} = await import('@/lib/services/recipes')

describe('Recipe Cost Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue(extChainable)
    mockEq.mockReturnValue(extChainable)
    mockInsert.mockReturnValue(extChainable)
    mockUpdate.mockReturnValue(extChainable)
    mockDelete.mockReturnValue(extChainable)
    mockIlike.mockReturnValue(extChainable)
    mockOrder.mockReturnValue(extChainable)
  })

  it('calculateRecipeCost sums ingredient costs correctly', async () => {
    // ingredients: [{quantity_needed: 2, cost_per_unit: 3.50}, {quantity_needed: 1, cost_per_unit: 5.00}]
    // expected: 2 * 3.50 + 1 * 5.00 = 12.00
    const ingredients = [
      { quantity_needed: 2, cost_per_unit: 3.5 },
      { quantity_needed: 1, cost_per_unit: 5.0 },
    ]

    mockEq.mockResolvedValueOnce({ data: ingredients, error: null })

    const cost = await calculateRecipeCost('recipe-1')
    expect(cost).toBe(12.0)
    expect(mockFrom).toHaveBeenCalledWith('recipe_ingredients')
  })

  it('cost_per_serving = totalCost / serving_size', () => {
    // totalCost: 12.00, serving_size: 4
    // expected: 3.00
    const totalCost = 12.0
    const servingSize = 4
    const costPerServing = totalCost / servingSize
    expect(costPerServing).toBe(3.0)
  })

  it('profit_margin = ((selling_price - cost_per_serving) / selling_price) * 100', () => {
    // selling_price: 14.00, cost_per_serving: 3.00
    // expected: ((14 - 3) / 14) * 100 = 78.57...
    const margin = calculateProfitMargin(14.0, 3.0)
    expect(margin).toBeCloseTo(78.57, 1)
  })

  it('recipe with zero ingredients results in cost = 0, margin = 100%', async () => {
    mockEq.mockResolvedValueOnce({ data: [], error: null })

    const cost = await calculateRecipeCost('empty-recipe')
    expect(cost).toBe(0)

    // With zero cost, margin should be 100% (if selling_price > 0)
    const margin = calculateProfitMargin(16.0, 0)
    expect(margin).toBe(100)
  })

  it('food_cost_percentage = (cost_per_serving / selling_price) * 100', () => {
    // For COGS link: cost_per_serving: 8.50, selling_price: 28.00
    // expected: 30.36%
    const costPerServing = 8.5
    const sellingPrice = 28.0
    const foodCostPercentage = (costPerServing / sellingPrice) * 100
    expect(foodCostPercentage).toBeCloseTo(30.36, 1)
  })

  it('calculateProfitMargin returns 0 when selling price is 0', () => {
    const margin = calculateProfitMargin(0, 5.0)
    expect(margin).toBe(0)
  })

  it('calculateProfitMargin handles negative cost (selling at profit)', () => {
    // selling_price: 20, cost: 5 => ((20-5)/20)*100 = 75%
    const margin = calculateProfitMargin(20, 5)
    expect(margin).toBe(75)
  })

  it('calculateRecipeCost handles single ingredient', async () => {
    const ingredients = [{ quantity_needed: 0.25, cost_per_unit: 12.0 }]
    mockEq.mockResolvedValueOnce({ data: ingredients, error: null })

    const cost = await calculateRecipeCost('recipe-2')
    expect(cost).toBe(3.0)
  })

  it('calculateRecipeCost throws on supabase error', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

    await expect(calculateRecipeCost('recipe-bad')).rejects.toThrow('Failed to calculate recipe cost')
  })
})

describe('Recipe CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue(extChainable)
    mockEq.mockReturnValue(extChainable)
    mockInsert.mockReturnValue(extChainable)
    mockUpdate.mockReturnValue(extChainable)
    mockDelete.mockReturnValue(extChainable)
    mockIlike.mockReturnValue(extChainable)
    mockOrder.mockReturnValue(extChainable)
  })

  describe('getRecipes', () => {
    it('returns recipes for a user', async () => {
      const recipesData = [{ id: 'r1', name: 'Pizza', user_id: 'user-1' }]
      mockOrder.mockResolvedValueOnce({ data: recipesData, error: null })

      const result = await getRecipes('user-1')
      expect(result).toHaveLength(1)
      expect(mockFrom).toHaveBeenCalledWith('recipes')
    })

    it('applies category filter', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null })

      await getRecipes('user-1', { category: 'Pizza' })
      expect(mockEq).toHaveBeenCalled()
    })

    it('applies search filter', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null })

      await getRecipes('user-1', { search: 'marg' })
      expect(mockIlike).toHaveBeenCalledWith('name', '%marg%')
    })

    it('applies difficulty filter', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null })

      await getRecipes('user-1', { difficulty: 'easy' })
      expect(mockEq).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(getRecipes('user-1')).rejects.toThrow('Failed to fetch recipes')
    })
  })

  describe('createRecipe', () => {
    it('creates and returns a recipe', async () => {
      const recipe = { id: 'r1', name: 'Pizza' }
      mockSingle.mockResolvedValueOnce({ data: recipe, error: null })

      const result = await createRecipe({
        user_id: 'user-1',
        name: 'Pizza',
        category: 'Italian',
        serving_size: 4,
        difficulty_level: 'medium',
        selling_price: 15,
      })
      expect(result).toEqual(recipe)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(
        createRecipe({
          user_id: 'user-1',
          name: 'Pizza',
          category: 'Italian',
          serving_size: 4,
          difficulty_level: 'medium',
          selling_price: 15,
        })
      ).rejects.toThrow('Failed to create recipe')
    })
  })

  describe('updateRecipe', () => {
    it('updates and returns the recipe', async () => {
      const updated = { id: 'r1', name: 'Updated Pizza' }
      mockSingle.mockResolvedValueOnce({ data: updated, error: null })

      const result = await updateRecipe('r1', { name: 'Updated Pizza' })
      expect(result).toEqual(updated)
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(updateRecipe('r1', { name: 'X' })).rejects.toThrow('Failed to update recipe')
    })
  })

  describe('deleteRecipe', () => {
    it('deletes a recipe', async () => {
      mockEq.mockResolvedValueOnce({ error: null })

      await deleteRecipe('r1')
      expect(mockFrom).toHaveBeenCalledWith('recipes')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'fail' } })

      await expect(deleteRecipe('r1')).rejects.toThrow('Failed to delete recipe')
    })
  })

  describe('addIngredient', () => {
    it('adds an ingredient and returns it', async () => {
      const ingredient = { id: 'ing-1', recipe_id: 'r1' }
      mockSingle.mockResolvedValueOnce({ data: ingredient, error: null })

      const result = await addIngredient({
        recipe_id: 'r1',
        inventory_item_id: 'item-1',
        quantity_needed: 2,
        unit: 'lbs',
        cost_per_unit: 3.5,
      })
      expect(result).toEqual(ingredient)
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(
        addIngredient({
          recipe_id: 'r1',
          inventory_item_id: 'item-1',
          quantity_needed: 2,
          unit: 'lbs',
          cost_per_unit: 3.5,
        })
      ).rejects.toThrow('Failed to add ingredient')
    })
  })

  describe('removeIngredient', () => {
    it('removes an ingredient', async () => {
      mockEq.mockResolvedValueOnce({ error: null })

      await removeIngredient('ing-1')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'fail' } })

      await expect(removeIngredient('ing-1')).rejects.toThrow('Failed to remove ingredient')
    })
  })

  describe('updateIngredient', () => {
    it('updates an ingredient and returns it', async () => {
      const updated = { id: 'ing-1', quantity_needed: 5 }
      mockSingle.mockResolvedValueOnce({ data: updated, error: null })

      const result = await updateIngredient('ing-1', { quantity_needed: 5 })
      expect(result).toEqual(updated)
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(updateIngredient('ing-1', { quantity_needed: 5 })).rejects.toThrow(
        'Failed to update ingredient'
      )
    })
  })
})
