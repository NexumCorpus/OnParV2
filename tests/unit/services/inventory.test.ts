import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client
const mockSelect = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockIs = vi.fn().mockReturnThis()
const mockNot = vi.fn().mockReturnThis()
const mockGte = vi.fn().mockReturnThis()
const mockLte = vi.fn().mockReturnThis()
const mockFilter = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()
const mockIlike = vi.fn().mockReturnThis()
const mockSingle = vi.fn()
const mockInsert = vi.fn().mockReturnThis()
const mockUpdate = vi.fn().mockReturnThis()
const mockRpc = vi.fn()

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  is: mockIs,
  not: mockNot,
  gte: mockGte,
  lte: mockLte,
  filter: mockFilter,
  order: mockOrder,
  ilike: mockIlike,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
}))

// Build the chain so select/eq/is/etc. all return the same chainable object
const chainable = {
  select: mockSelect,
  eq: mockEq,
  is: mockIs,
  not: mockNot,
  gte: mockGte,
  lte: mockLte,
  filter: mockFilter,
  order: mockOrder,
  ilike: mockIlike,
  single: mockSingle,
  insert: mockInsert,
  update: mockUpdate,
  from: mockFrom,
}

mockSelect.mockReturnValue(chainable)
mockEq.mockReturnValue(chainable)
mockIs.mockReturnValue(chainable)
mockNot.mockReturnValue(chainable)
mockGte.mockReturnValue(chainable)
mockLte.mockReturnValue(chainable)
mockFilter.mockReturnValue(chainable)
mockOrder.mockReturnValue(chainable)
mockIlike.mockReturnValue(chainable)
mockInsert.mockReturnValue(chainable)
mockUpdate.mockReturnValue(chainable)

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

// Import after mocking
const {
  getCount,
  getLowStockItems,
  getExpiringItems,
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustQuantity,
  getTotalInventoryValue,
  calculateEstimatedSavings,
  getCategories,
  bulkUpdateQuantities,
} = await import('@/lib/services/inventory')

describe('Inventory Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset chain defaults
    mockSelect.mockReturnValue(chainable)
    mockEq.mockReturnValue(chainable)
    mockIs.mockReturnValue(chainable)
    mockNot.mockReturnValue(chainable)
    mockGte.mockReturnValue(chainable)
    mockLte.mockReturnValue(chainable)
    mockFilter.mockReturnValue(chainable)
    mockOrder.mockReturnValue(chainable)
    mockIlike.mockReturnValue(chainable)
  })

  describe('getCount', () => {
    it('returns correct count for a user', async () => {
      mockSelect.mockReturnValueOnce({
        ...chainable,
        eq: vi.fn().mockReturnValue({
          ...chainable,
          is: vi.fn().mockResolvedValue({ count: 15, error: null }),
        }),
      })

      const count = await getCount('user-1')
      expect(count).toBe(15)
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('excludes soft-deleted items', async () => {
      // The function passes { count: 'exact', head: true } and filters deleted_at IS NULL
      mockSelect.mockReturnValueOnce({
        ...chainable,
        eq: vi.fn().mockReturnValue({
          ...chainable,
          is: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      })

      const count = await getCount('user-1')
      expect(count).toBe(5)
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true })
    })
  })

  describe('getLowStockItems', () => {
    it('returns items where quantity < reorder_point', async () => {
      const lowStockData = [
        { id: '1', name: 'Cheese', quantity: 2, reorder_point: 10, deleted_at: null },
        { id: '2', name: 'Milk', quantity: 1, reorder_point: 5, deleted_at: null },
      ]

      mockFilter.mockResolvedValueOnce({ data: lowStockData, error: null })

      const items = await getLowStockItems('user-1')
      expect(items).toHaveLength(2)
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('returns empty array when no low stock items', async () => {
      mockFilter.mockResolvedValueOnce({ data: [], error: null })

      const items = await getLowStockItems('user-1')
      expect(items).toHaveLength(0)
    })
  })

  describe('getExpiringItems', () => {
    it('returns items expiring within 7 days', async () => {
      const expiringData = [
        { id: '1', name: 'Yogurt', expiry_date: '2025-02-05', deleted_at: null },
      ]

      mockLte.mockResolvedValueOnce({ data: expiringData, error: null })

      const items = await getExpiringItems('user-1', 7)
      expect(items).toHaveLength(1)
    })

    it('excludes already expired items', async () => {
      // gte filter ensures expiry_date >= now
      mockLte.mockResolvedValueOnce({ data: [], error: null })

      const items = await getExpiringItems('user-1')
      expect(items).toHaveLength(0)
      // Verifies the gte filter was applied (only items with expiry_date >= now)
      expect(mockGte).toHaveBeenCalled()
    })
  })

  describe('adjustQuantity', () => {
    it('uses RPC for race-safe quantity adjustment', async () => {
      const updatedItem = { id: '1', name: 'Flour', quantity: 15 }
      mockRpc.mockResolvedValueOnce({ data: [updatedItem], error: null })

      const result = await adjustQuantity('1', 5)
      expect(result).toEqual(updatedItem)
      expect(mockRpc).toHaveBeenCalledWith('adjust_quantity', {
        item_id: '1',
        delta: 5,
      })
    })

    it('returns null when item was deleted (0 rows)', async () => {
      mockRpc.mockResolvedValueOnce({ data: [], error: null })

      const result = await adjustQuantity('deleted-id', -1)
      expect(result).toBeNull()
    })
  })

  describe('getTotalInventoryValue', () => {
    it('calculates sum of quantity * price_per_unit', async () => {
      const items = [
        { quantity: 10, price_per_unit: 2.5 },
        { quantity: 5, price_per_unit: 10 },
      ]

      mockOrder.mockResolvedValueOnce({ data: items, error: null })
      // getTotalInventoryValue only calls select('quantity, price_per_unit')
      // so we need to mock the chain differently
      mockIs.mockResolvedValueOnce({ data: items, error: null })

      const value = await getTotalInventoryValue('user-1')
      expect(value).toBe(75) // 10*2.5 + 5*10
    })
  })

  describe('getInventoryItems', () => {
    it('returns items for a user excluding soft-deleted', async () => {
      const itemsData = [
        { id: '1', name: 'Rice', quantity: 50, deleted_at: null },
      ]

      // The final call in the chain is order() which resolves
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: itemsData, error: null }) }
      mockIs.mockReturnValueOnce(resolving)

      const items = await getInventoryItems('user-1')
      expect(items).toHaveLength(1)
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('applies category filter when provided', async () => {
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: [], error: null }) }
      mockIs.mockReturnValueOnce({ ...chainable, eq: vi.fn().mockReturnValue(resolving) })

      await getInventoryItems('user-1', { category: 'Produce' })
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('applies search filter when provided', async () => {
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: [], error: null }) }
      mockIs.mockReturnValueOnce({ ...chainable, ilike: vi.fn().mockReturnValue(resolving) })

      await getInventoryItems('user-1', { search: 'tom' })
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('applies lowStockOnly filter when provided', async () => {
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: [], error: null }) }
      mockIs.mockReturnValueOnce({ ...chainable, filter: vi.fn().mockReturnValue(resolving) })

      await getInventoryItems('user-1', { lowStockOnly: true })
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('applies expiringOnly filter when provided', async () => {
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: [], error: null }) }
      const withLte = { ...chainable, lte: vi.fn().mockReturnValue(resolving) }
      const withGte = { ...chainable, gte: vi.fn().mockReturnValue(withLte) }
      const withNot = { ...chainable, not: vi.fn().mockReturnValue(withGte) }
      mockIs.mockReturnValueOnce(withNot)

      await getInventoryItems('user-1', { expiringOnly: true })
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('throws on supabase error', async () => {
      const resolving = { ...chainable, order: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'fail' } }) }
      mockIs.mockReturnValueOnce(resolving)

      await expect(getInventoryItems('user-1')).rejects.toThrow('Failed to fetch inventory items')
    })
  })

  describe('getInventoryItem', () => {
    it('returns a single item by id', async () => {
      const item = { id: '1', name: 'Rice', deleted_at: null }
      mockSingle.mockResolvedValueOnce({ data: item, error: null })

      const result = await getInventoryItem('1')
      expect(result).toEqual(item)
    })

    it('returns null when item not found (PGRST116)', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })

      const result = await getInventoryItem('missing-id')
      expect(result).toBeNull()
    })

    it('throws on other errors', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'OTHER', message: 'fail' } })

      await expect(getInventoryItem('bad-id')).rejects.toThrow('Failed to fetch inventory item')
    })
  })

  describe('createInventoryItem', () => {
    it('inserts a new item and returns it', async () => {
      const newItem = { id: '1', name: 'Flour', quantity: 10, user_id: 'user-1' }
      mockSingle.mockResolvedValueOnce({ data: newItem, error: null })

      const result = await createInventoryItem({
        user_id: 'user-1',
        name: 'Flour',
        category: 'Pantry',
        quantity: 10,
        unit: 'lbs',
        reorder_point: 5,
        price_per_unit: 2.0,
      })
      expect(result).toEqual(newItem)
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(
        createInventoryItem({
          user_id: 'user-1',
          name: 'Flour',
          category: 'Pantry',
          quantity: 10,
          unit: 'lbs',
          reorder_point: 5,
          price_per_unit: 2.0,
        })
      ).rejects.toThrow('Failed to create inventory item')
    })
  })

  describe('updateInventoryItem', () => {
    it('updates and returns the item', async () => {
      const updated = { id: '1', name: 'Flour Updated', quantity: 20 }
      mockSingle.mockResolvedValueOnce({ data: updated, error: null })

      const result = await updateInventoryItem('1', { name: 'Flour Updated' })
      expect(result).toEqual(updated)
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(updateInventoryItem('1', { name: 'X' })).rejects.toThrow(
        'Failed to update inventory item'
      )
    })
  })

  describe('deleteInventoryItem', () => {
    it('soft-deletes by setting deleted_at', async () => {
      mockIs.mockResolvedValueOnce({ error: null })

      await deleteInventoryItem('1')
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalledWith('inventory_items')
    })

    it('throws on supabase error', async () => {
      mockIs.mockResolvedValueOnce({ error: { message: 'fail' } })

      await expect(deleteInventoryItem('bad-id')).rejects.toThrow('Failed to delete inventory item')
    })
  })

  describe('getCategories', () => {
    it('returns unique sorted categories', async () => {
      mockIs.mockResolvedValueOnce({
        data: [{ category: 'Dairy' }, { category: 'Produce' }, { category: 'Dairy' }],
        error: null,
      })

      const categories = await getCategories('user-1')
      expect(categories).toEqual(['Dairy', 'Produce'])
    })

    it('throws on supabase error', async () => {
      mockIs.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      await expect(getCategories('user-1')).rejects.toThrow('Failed to fetch categories')
    })
  })

  describe('adjustQuantity error handling', () => {
    it('throws on RPC error', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'rpc fail' } })

      await expect(adjustQuantity('1', 5)).rejects.toThrow('Failed to adjust quantity')
    })
  })

  describe('bulkUpdateQuantities', () => {
    it('calls adjustQuantity for each update', async () => {
      mockRpc.mockResolvedValueOnce({ data: [{ id: '1', quantity: 15 }], error: null })
      mockRpc.mockResolvedValueOnce({ data: [{ id: '2', quantity: 8 }], error: null })

      await bulkUpdateQuantities([
        { id: '1', delta: 5 },
        { id: '2', delta: -2 },
      ])

      expect(mockRpc).toHaveBeenCalledTimes(2)
    })
  })

  describe('calculateEstimatedSavings', () => {
    it('calculates savings from low stock and expiring items', async () => {
      // getLowStockItems call
      mockFilter.mockResolvedValueOnce({
        data: [{ id: '1', quantity: 2, reorder_point: 10, price_per_unit: 5.0 }],
        error: null,
      })
      // getExpiringItems call
      mockLte.mockResolvedValueOnce({
        data: [{ id: '2', quantity: 20, price_per_unit: 3.0 }],
        error: null,
      })

      const result = await calculateEstimatedSavings('user-1')
      // lowStock: (10-2) * 5.0 * 0.15 = 6.0
      expect(result.lowStockSavings).toBeCloseTo(6.0)
      // expiry: 20 * 3.0 * 0.20 = 12.0
      expect(result.expirySavings).toBeCloseTo(12.0)
      expect(result.totalSavings).toBeCloseTo(18.0)
    })
  })
})
