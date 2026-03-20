import { describe, it, expect } from 'vitest'
import {
  generatePredictions,
  generateAlerts,
  calculatePreventionROI,
} from '@/lib/engines/waste-predictions'
import type { WasteEvent, InventoryItem } from '@/types'

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    org_id: 'org-1',
    user_id: 'user-1',
    supplier_id: null,
    name: 'Lettuce',
    category: 'Produce',
    quantity: 50,
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

describe('Waste Predictions Engine', () => {
  describe('generatePredictions', () => {
    it('generates predictions for each inventory item', () => {
      const items = [makeItem({ id: 'item-1' }), makeItem({ id: 'item-2', name: 'Milk' })]
      const events = [makeWasteEvent({ inventory_item_id: 'item-1' })]

      const predictions = generatePredictions(items, events, 7) // July
      expect(predictions).toHaveLength(2)
      expect(predictions[0].itemId).toBe('item-1')
      expect(predictions[1].itemId).toBe('item-2')
    })

    it('returns empty array for no items', () => {
      const predictions = generatePredictions([], [], 1)
      expect(predictions).toHaveLength(0)
    })

    it('confidence is min(95, (eventsCount/10)*100)', () => {
      const items = [makeItem()]
      // Create 10 waste events
      const events = Array.from({ length: 10 }, (_, i) =>
        makeWasteEvent({ id: `waste-${i}` })
      )

      const predictions = generatePredictions(items, events, 1)
      // dataQuality = min(1, 10/10) = 1, confidence = min(95, 1*100) = 95
      expect(predictions[0].confidence).toBe(95)
    })

    it('confidence scales with event count', () => {
      const items = [makeItem()]
      const events = Array.from({ length: 5 }, (_, i) =>
        makeWasteEvent({ id: `waste-${i}` })
      )

      const predictions = generatePredictions(items, events, 1)
      // dataQuality = min(1, 5/10) = 0.5, confidence = min(95, 50) = 50
      expect(predictions[0].confidence).toBe(50)
    })

    it('applies seasonal multiplier correctly', () => {
      const items = [makeItem()]
      const events = [makeWasteEvent()]

      const predJuly = generatePredictions(items, events, 7) // 1.15
      const predFeb = generatePredictions(items, events, 2) // 0.92

      // July should predict more waste than February
      expect(predJuly[0].factors.find((f) => f.name === 'Seasonal')?.impact).toBe(1.15)
      expect(predFeb[0].factors.find((f) => f.name === 'Seasonal')?.impact).toBe(0.92)
    })

    it('stock factor is 1.3 when quantity > 120% of max', () => {
      const items = [makeItem({ quantity: 130, max_stock_level: 100 })]
      const events = [makeWasteEvent()]

      const predictions = generatePredictions(items, events, 10)
      const stockFactor = predictions[0].factors.find((f) => f.name === 'Stock Level')
      expect(stockFactor?.impact).toBe(1.3)
    })

    it('stock factor is 1.15 when quantity > max but <= 120%', () => {
      const items = [makeItem({ quantity: 110, max_stock_level: 100 })]
      const events = [makeWasteEvent()]

      const predictions = generatePredictions(items, events, 10)
      const stockFactor = predictions[0].factors.find((f) => f.name === 'Stock Level')
      expect(stockFactor?.impact).toBe(1.15)
    })

    it('expiry factor is 2.0 when < 1 day', () => {
      const expiry = new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString()
      const items = [makeItem({ expiry_date: expiry })]
      const events = [makeWasteEvent()]

      const predictions = generatePredictions(items, events, 10)
      const expiryFactor = predictions[0].factors.find((f) => f.name === 'Expiration')
      expect(expiryFactor?.impact).toBe(2.0)
    })

    it('expiry factor is 1.5 when < 3 days', () => {
      const expiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      const items = [makeItem({ expiry_date: expiry })]
      const events = [makeWasteEvent()]

      const predictions = generatePredictions(items, events, 10)
      const expiryFactor = predictions[0].factors.find((f) => f.name === 'Expiration')
      expect(expiryFactor?.impact).toBe(1.5)
    })

    it('expiry factor is 1.2 when < 7 days', () => {
      const expiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      const items = [makeItem({ expiry_date: expiry })]
      const events = [makeWasteEvent()]

      const predictions = generatePredictions(items, events, 10)
      const expiryFactor = predictions[0].factors.find((f) => f.name === 'Expiration')
      expect(expiryFactor?.impact).toBe(1.2)
    })
  })

  describe('generateAlerts', () => {
    it('generates expiration alert for item expiring today', () => {
      const expiry = new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString()
      const items = [makeItem({ expiry_date: expiry })]
      const alerts = generateAlerts(items, [], 10)
      const expirationAlerts = alerts.filter((a) => a.type === 'expiration')
      expect(expirationAlerts.length).toBeGreaterThanOrEqual(1)
      expect(expirationAlerts[0].severity).toBe('critical')
    })

    it('generates expiration alert for item expiring tomorrow', () => {
      const expiry = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString()
      const items = [makeItem({ expiry_date: expiry })]
      const alerts = generateAlerts(items, [], 10)
      const expirationAlerts = alerts.filter((a) => a.type === 'expiration')
      expect(expirationAlerts.length).toBeGreaterThanOrEqual(1)
      expect(expirationAlerts[0].severity).toBe('critical')
    })

    it('generates overstock alert when quantity > 120% of max', () => {
      const items = [makeItem({ quantity: 130, max_stock_level: 100 })]
      const alerts = generateAlerts(items, [], 10)
      const overstockAlerts = alerts.filter((a) => a.type === 'overstock')
      expect(overstockAlerts.length).toBe(1)
      expect(overstockAlerts[0].severity).toBe('medium')
      expect(overstockAlerts[0].title).toContain('overstocked by 30%')
    })

    it('does not generate overstock alert when within limits', () => {
      const items = [makeItem({ quantity: 100, max_stock_level: 100 })]
      const alerts = generateAlerts(items, [], 10)
      const overstockAlerts = alerts.filter((a) => a.type === 'overstock')
      expect(overstockAlerts.length).toBe(0)
    })

    it('generates seasonal spike alert for dairy in summer', () => {
      const items = [makeItem({ category: 'Dairy' })]
      const alerts = generateAlerts(items, [], 7) // July
      const seasonalAlerts = alerts.filter((a) => a.type === 'seasonal_spike')
      expect(seasonalAlerts.length).toBe(1)
      expect(seasonalAlerts[0].title).toContain('dairy')
    })

    it('generates seasonal spike alert for frozen in winter', () => {
      const items = [makeItem({ category: 'Frozen' })]
      const alerts = generateAlerts(items, [], 1) // January
      const seasonalAlerts = alerts.filter((a) => a.type === 'seasonal_spike')
      expect(seasonalAlerts.length).toBe(1)
    })

    it('returns empty array for empty input', () => {
      const alerts = generateAlerts([], [], 10)
      expect(alerts).toHaveLength(0)
    })

    it('sorts alerts by severity', () => {
      const tomorrow = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString()
      const in5days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      const items = [
        makeItem({ id: 'item-1', expiry_date: in5days, name: 'Bread' }),
        makeItem({ id: 'item-2', expiry_date: tomorrow, name: 'Milk' }),
      ]
      const alerts = generateAlerts(items, [], 10)
      if (alerts.length >= 2) {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        for (let i = 1; i < alerts.length; i++) {
          expect(severityOrder[alerts[i].severity]).toBeGreaterThanOrEqual(
            severityOrder[alerts[i - 1].severity]
          )
        }
      }
    })
  })

  describe('calculatePreventionROI', () => {
    it('calculates monthlySavings correctly', () => {
      const roi = calculatePreventionROI(1000, 'FIFO', 20, 500)
      expect(roi.monthlySavings).toBe(200)
    })

    it('calculates annualSavings correctly', () => {
      const roi = calculatePreventionROI(1000, 'FIFO', 20, 500)
      expect(roi.annualSavings).toBe(2400)
    })

    it('calculates ROI correctly', () => {
      const roi = calculatePreventionROI(1000, 'FIFO', 20, 500)
      // roi = ((2400 - 500) / 500) * 100 = 380
      expect(roi.roi).toBeCloseTo(380)
    })

    it('calculates paybackMonths correctly', () => {
      const roi = calculatePreventionROI(1000, 'FIFO', 20, 500)
      // payback = 500 / 200 = 2.5
      expect(roi.paybackMonths).toBeCloseTo(2.5)
    })

    it('returns 0 ROI for zero implementation cost', () => {
      const roi = calculatePreventionROI(1000, 'FIFO', 20, 0)
      expect(roi.roi).toBe(0)
    })

    it('returns 0 paybackMonths for zero savings', () => {
      const roi = calculatePreventionROI(0, 'FIFO', 20, 500)
      expect(roi.paybackMonths).toBe(0)
    })
  })
})
