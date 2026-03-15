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
  adjustQuantity,
  getTotalInventoryValue,
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
})
