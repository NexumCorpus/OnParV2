import { describe, it, expect } from 'vitest'
import {
  analyzeWastePatterns,
  getSeasonalTrends,
  calculateSavings,
  SEASONAL_MULTIPLIERS,
} from '@/lib/engines/waste-analysis'
import type { WasteEvent, InventoryItem } from '@/types'

// --- Test Helpers ---

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    org_id: 'org-1',
    user_id: 'user-1',
    supplier_id: null,
    name: 'Lettuce',
    category: 'Produce',
    quantity: 95,
    unit: 'lbs',
    expiry_date: null,
    reorder_point: 20,
    max_stock_level: 100,
    price_per_unit: 2.3,
    deleted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeWasteEvent(overrides: Partial<WasteEvent> = {}): WasteEvent {
  return {
    id: 'waste-1',
    org_id: 'org-1',
    user_id: 'user-1',
    inventory_item_id: 'item-1',
    quantity: 5,
    unit: 'lbs',
    estimated_value: 11.5,
    reason: 'expired',
    notes: null,
    recorded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// --- Tests ---

describe('Waste Analysis Engine', () => {
  describe('waste rate calculation', () => {
    it('calculates correctly: (wasteQty / inboundQty) * 100', () => {
      const items = [makeItem({ id: 'item-1', quantity: 95 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 5, estimated_value: 11.5 })]

      const patterns = analyzeWastePatterns(events, items)
      expect(patterns).toHaveLength(1)
      // inbound = 95 + 5 = 100, wasteRate = (5/100) * 100 = 5.0
      expect(patterns[0].wasteRate).toBeCloseTo(5.0)
    })

    it('returns 0 for zero inbound (item quantity 0 and no waste)', () => {
      const items = [makeItem({ id: 'item-1', quantity: 0 })]
      // No events for item-1 means it won't show up in patterns at all
      const events: WasteEvent[] = []
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns).toHaveLength(0)
    })

    it('handles waste events with no matching inventory item', () => {
      const items = [makeItem({ id: 'item-1' })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-nonexistent' })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns).toHaveLength(0)
    })
  })

  describe('risk levels', () => {
    it('critical: >20% waste OR >$500 waste value', () => {
      // wasteRate > 20%: waste=30, quantity=70, inbound=100, rate=30%
      const items = [makeItem({ id: 'item-1', quantity: 70 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 30, estimated_value: 69 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('critical')
    })

    it('critical: waste value > $500', () => {
      const items = [makeItem({ id: 'item-1', quantity: 990 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 10, estimated_value: 501 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('critical')
    })

    it('high: >10% waste OR >$200 waste value', () => {
      // waste=15, quantity=85, inbound=100, rate=15%
      const items = [makeItem({ id: 'item-1', quantity: 85 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 15, estimated_value: 34.5 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('high')
    })

    it('high: waste value > $200', () => {
      const items = [makeItem({ id: 'item-1', quantity: 990 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 10, estimated_value: 201 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('high')
    })

    it('medium: >5% waste OR >$50 waste value', () => {
      // waste=8, quantity=92, inbound=100, rate=8%
      const items = [makeItem({ id: 'item-1', quantity: 92 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 8, estimated_value: 18.4 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('medium')
    })

    it('low: everything else', () => {
      // waste=2, quantity=98, inbound=100, rate=2%
      const items = [makeItem({ id: 'item-1', quantity: 98 })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1', quantity: 2, estimated_value: 4.6 })]
      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].riskLevel).toBe('low')
    })
  })

  describe('savings calculation', () => {
    it('calculates: wasteValue * (reductionPct / 100)', () => {
      const result = calculateSavings(1000, 20, 500)
      expect(result.potentialSavings).toBe(200)
      expect(result.currentMonthlyWaste).toBe(1000)
      expect(result.reductionPercentage).toBe(20)
      expect(result.implementationCost).toBe(500)
    })

    it('calculates payback period correctly', () => {
      const result = calculateSavings(1000, 20, 500)
      // payback = 500 / 200 = 2.5 months
      expect(result.paybackPeriodMonths).toBeCloseTo(2.5)
    })

    it('calculates ROI correctly', () => {
      const result = calculateSavings(1000, 20, 500)
      // roi = ((200 * 12 - 500) / 500) * 100 = ((2400 - 500) / 500) * 100 = 380
      expect(result.roi).toBeCloseTo(380)
    })

    it('returns 0 for zero implementation cost', () => {
      const result = calculateSavings(1000, 20, 0)
      expect(result.roi).toBe(0)
      expect(result.paybackPeriodMonths).toBe(0) // potentialSavings > 0 but impl cost is 0
    })

    it('returns 0 payback when savings is 0', () => {
      const result = calculateSavings(1000, 0, 500)
      expect(result.potentialSavings).toBe(0)
      expect(result.paybackPeriodMonths).toBe(0)
    })
  })

  describe('seasonal multipliers', () => {
    it('returns correct multiplier for each month', () => {
      const expected: Record<number, number> = {
        1: 0.95, 2: 0.92, 3: 0.98, 4: 1.02, 5: 1.05, 6: 1.12,
        7: 1.15, 8: 1.10, 9: 1.03, 10: 1.00, 11: 1.08, 12: 1.18,
      }
      for (const [month, multiplier] of Object.entries(expected)) {
        expect(SEASONAL_MULTIPLIERS[Number(month)]).toBe(multiplier)
      }
    })

    it('getSeasonalTrends returns 12 months', () => {
      const trends = getSeasonalTrends()
      expect(trends).toHaveLength(12)
      expect(trends[0].month).toBe(1)
      expect(trends[0].monthName).toBe('January')
      expect(trends[0].wasteMultiplier).toBe(0.95)
      expect(trends[11].month).toBe(12)
      expect(trends[11].monthName).toBe('December')
      expect(trends[11].wasteMultiplier).toBe(1.18)
    })
  })

  describe('trend analysis', () => {
    it('returns increasing when current > prev * 1.1', () => {
      const now = new Date()
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)

      const items = [makeItem({ id: 'item-1', quantity: 80 })]
      const events = [
        // Current period (last 30 days): qty 20
        makeWasteEvent({ id: 'w1', inventory_item_id: 'item-1', quantity: 20, estimated_value: 46, recorded_at: fifteenDaysAgo.toISOString() }),
        // Previous period (30-60 days ago): qty 5
        makeWasteEvent({ id: 'w2', inventory_item_id: 'item-1', quantity: 5, estimated_value: 11.5, recorded_at: fortyFiveDaysAgo.toISOString() }),
      ]

      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].trend).toBe('increasing')
    })

    it('returns decreasing when current < prev * 0.9', () => {
      const now = new Date()
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)

      const items = [makeItem({ id: 'item-1', quantity: 80 })]
      const events = [
        // Current period: qty 2
        makeWasteEvent({ id: 'w1', inventory_item_id: 'item-1', quantity: 2, estimated_value: 4.6, recorded_at: fifteenDaysAgo.toISOString() }),
        // Previous period: qty 20
        makeWasteEvent({ id: 'w2', inventory_item_id: 'item-1', quantity: 20, estimated_value: 46, recorded_at: fortyFiveDaysAgo.toISOString() }),
      ]

      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].trend).toBe('decreasing')
    })

    it('returns stable when current is within 10% of previous', () => {
      const now = new Date()
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)

      const items = [makeItem({ id: 'item-1', quantity: 80 })]
      const events = [
        // Current period: qty 10
        makeWasteEvent({ id: 'w1', inventory_item_id: 'item-1', quantity: 10, estimated_value: 23, recorded_at: fifteenDaysAgo.toISOString() }),
        // Previous period: qty 10 (same)
        makeWasteEvent({ id: 'w2', inventory_item_id: 'item-1', quantity: 10, estimated_value: 23, recorded_at: fortyFiveDaysAgo.toISOString() }),
      ]

      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].trend).toBe('stable')
    })

    it('returns stable when no previous period data', () => {
      const now = new Date()
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)

      const items = [makeItem({ id: 'item-1', quantity: 90 })]
      const events = [
        makeWasteEvent({ id: 'w1', inventory_item_id: 'item-1', quantity: 10, estimated_value: 23, recorded_at: fifteenDaysAgo.toISOString() }),
      ]

      const patterns = analyzeWastePatterns(events, items)
      expect(patterns[0].trend).toBe('stable')
    })
  })

  describe('empty input handling', () => {
    it('returns zero values for empty waste events array', () => {
      const items = [makeItem()]
      const patterns = analyzeWastePatterns([], items)
      expect(patterns).toHaveLength(0)
    })

    it('returns empty array for empty inventory items array', () => {
      const events = [makeWasteEvent()]
      const patterns = analyzeWastePatterns(events, [])
      expect(patterns).toHaveLength(0)
    })

    it('never returns NaN or undefined', () => {
      const items = [makeItem({ quantity: 0 })]
      const events = [makeWasteEvent({ quantity: 0, estimated_value: 0 })]
      const patterns = analyzeWastePatterns(events, items)
      for (const p of patterns) {
        expect(Number.isNaN(p.wasteRate)).toBe(false)
        expect(Number.isNaN(p.totalWasteValue)).toBe(false)
        expect(p.riskLevel).toBeDefined()
        expect(p.trend).toBeDefined()
      }
    })
  })
})
