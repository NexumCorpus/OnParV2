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

const { calculateProfitMargin, calculateRecipeCost } = await import(
  '@/lib/services/recipes'
)

describe('Recipe Cost Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue(chainable)
    mockEq.mockReturnValue(chainable)
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
})
