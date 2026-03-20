import { describe, it, expect } from 'vitest'
import { generateInsights, calculateConfidence } from '@/lib/engines/ai-insights'
import type { InventoryItem, MenuItem, WasteEvent } from '@/types'

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    org_id: 'org-1',
    user_id: 'user-1',
    supplier_id: null,
    name: 'Rice',
    category: 'Pantry',
    quantity: 50,
    unit: 'lbs',
    expiry_date: null,
    reorder_point: 10,
    max_stock_level: 100,
    price_per_unit: 1.5,
    deleted_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'menu-1',
    org_id: 'org-1',
    user_id: 'user-1',
    recipe_id: null,
    name: 'Margherita Pizza',
    category: 'Pizza',
    selling_price: 15,
    sales_percentage: 12,
    waste_percentage: 5,
    is_active: true,
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
    estimated_value: 7.5,
    reason: 'expired',
    notes: null,
    recorded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('AI Insights Engine', () => {
  describe('calculateConfidence', () => {
    it('base = min(1, (inv+menu)/20) * 80', () => {
      const conf = calculateConfidence({
        inventoryCount: 10,
        menuCount: 10,
        wasteEventCount: 0,
        hasLongHistory: false,
      })
      // dataQuality = min(1, 20/20) = 1, base = 1*80 = 80
      expect(conf).toBe(80)
    })

    it('adds +10 if wasteCount > 30', () => {
      const conf = calculateConfidence({
        inventoryCount: 10,
        menuCount: 10,
        wasteEventCount: 31,
        hasLongHistory: false,
      })
      expect(conf).toBe(90)
    })

    it('adds +10 if hasLongHistory', () => {
      const conf = calculateConfidence({
        inventoryCount: 10,
        menuCount: 10,
        wasteEventCount: 0,
        hasLongHistory: true,
      })
      expect(conf).toBe(90)
    })

    it('caps at 100', () => {
      const conf = calculateConfidence({
        inventoryCount: 20,
        menuCount: 20,
        wasteEventCount: 50,
        hasLongHistory: true,
      })
      expect(conf).toBe(100)
    })

    it('returns 0 for no data', () => {
      const conf = calculateConfidence({
        inventoryCount: 0,
        menuCount: 0,
        wasteEventCount: 0,
        hasLongHistory: false,
      })
      expect(conf).toBe(0)
    })

    it('scales linearly with data quality', () => {
      const conf = calculateConfidence({
        inventoryCount: 5,
        menuCount: 5,
        wasteEventCount: 0,
        hasLongHistory: false,
      })
      // dataQuality = min(1, 10/20) = 0.5, base = 0.5*80 = 40
      expect(conf).toBe(40)
    })
  })

  describe('generateInsights', () => {
    it('generates high-waste menu insight when waste > avg + 2', () => {
      const menuItems = [
        makeMenuItem({ id: 'menu-1', waste_percentage: 8, sales_percentage: 20 }),
        makeMenuItem({ id: 'menu-2', waste_percentage: 2, sales_percentage: 30, name: 'Caesar Salad' }),
        makeMenuItem({ id: 'menu-3', waste_percentage: 2, sales_percentage: 25, name: 'Soup' }),
      ]
      // avg = (8 + 2 + 2) / 3 = 4, threshold = 4 + 2 = 6
      // Only menu-1 at 8% > 6

      const insights = generateInsights({
        inventoryItems: [],
        menuItems,
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })

      const wasteInsights = insights.filter((i) => i.type === 'waste_reduction' && i.title.includes('Margherita'))
      expect(wasteInsights.length).toBe(1)
    })

    it('generates inventory optimization insight when quantity > reorder_point * 3', () => {
      const items = [makeItem({ quantity: 35, reorder_point: 10 })] // 35 > 10*3 = 30

      const insights = generateInsights({
        inventoryItems: items,
        menuItems: [],
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })

      const invInsights = insights.filter((i) => i.type === 'inventory_optimization')
      expect(invInsights.length).toBe(1)
    })

    it('does not generate inventory optimization when quantity is normal', () => {
      const items = [makeItem({ quantity: 25, reorder_point: 10 })] // 25 < 30

      const insights = generateInsights({
        inventoryItems: items,
        menuItems: [],
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })

      const invInsights = insights.filter((i) => i.type === 'inventory_optimization')
      expect(invInsights.length).toBe(0)
    })

    it('generates menu optimization for low performer: <5% sales AND >3% waste', () => {
      const menuItems = [
        makeMenuItem({ sales_percentage: 3, waste_percentage: 5 }), // low performer
      ]

      const insights = generateInsights({
        inventoryItems: [],
        menuItems,
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })

      const menuInsights = insights.filter((i) => i.type === 'menu_optimization')
      expect(menuInsights.length).toBe(1)
    })

    it('generates budget alert when spend > 80% of budget', () => {
      const items = [makeItem({ quantity: 100, price_per_unit: 10 })] // value = $1000
      const monthlyBudget = 1000 // 1000/1000 = 100% > 80%

      const insights = generateInsights({
        inventoryItems: items,
        menuItems: [],
        wasteEvents: [],
        monthlyBudget,
        currentMonth: 10,
      })

      const budgetInsights = insights.filter(
        (i) => i.type === 'cost_optimization' && i.title.includes('Budget')
      )
      expect(budgetInsights.length).toBe(1)
    })

    it('does not generate budget alert when under 80%', () => {
      const items = [makeItem({ quantity: 10, price_per_unit: 1 })] // value = $10
      const monthlyBudget = 1000 // 10/1000 = 1%

      const insights = generateInsights({
        inventoryItems: items,
        menuItems: [],
        wasteEvents: [],
        monthlyBudget,
        currentMonth: 10,
      })

      const budgetInsights = insights.filter(
        (i) => i.type === 'cost_optimization' && i.title.includes('Budget')
      )
      expect(budgetInsights.length).toBe(0)
    })

    it('generates waste reduction prediction when monthly waste > $100', () => {
      const recentEvents = Array.from({ length: 5 }, (_, i) =>
        makeWasteEvent({
          id: `w-${i}`,
          estimated_value: 30,
          recorded_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        })
      )
      // Total = 5 * 30 = $150 > $100

      const insights = generateInsights({
        inventoryItems: [],
        menuItems: [],
        wasteEvents: recentEvents,
        monthlyBudget: null,
        currentMonth: 10,
      })

      const wasteReduction = insights.filter(
        (i) => i.type === 'waste_reduction' && i.title.includes('Save')
      )
      expect(wasteReduction.length).toBe(1)
      // potentialSavings = 150 * 0.15 = 22.5
      expect(wasteReduction[0].estimated_savings).toBeCloseTo(22.5)
    })

    it('returns empty array for completely empty data', () => {
      const insights = generateInsights({
        inventoryItems: [],
        menuItems: [],
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })
      expect(insights).toHaveLength(0)
    })

    it('deduplication: same type/title produces single insight within one run', () => {
      // This tests that generateInsights doesn't produce duplicate entries for the same item
      const items = [makeItem({ id: 'item-1', quantity: 35, reorder_point: 10 })]

      const insights = generateInsights({
        inventoryItems: items,
        menuItems: [],
        wasteEvents: [],
        monthlyBudget: null,
        currentMonth: 10,
      })

      const invInsights = insights.filter(
        (i) => i.type === 'inventory_optimization' && i.title.includes('Rice')
      )
      // Should be exactly 1, not duplicated
      expect(invInsights.length).toBe(1)
    })
  })
})
