import { describe, it, expect } from 'vitest'
import { exportInventoryToCSV, parseInventoryCSV } from '@/lib/utils/csv'
import type { InventoryItem } from '@/types'

const mockItem: InventoryItem = {
  id: '1',
  org_id: 'org-1',
  user_id: 'user-1',
  supplier_id: null,
  name: 'Fresh Tomatoes',
  category: 'Produce',
  quantity: 50,
  unit: 'lbs',
  expiry_date: '2025-03-15',
  reorder_point: 10,
  max_stock_level: 100,
  price_per_unit: 2.5,
  deleted_at: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

describe('CSV Export', () => {
  it('exports items to CSV with correct headers', () => {
    const csv = exportInventoryToCSV([mockItem])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit')
    expect(lines[1]).toBe('Fresh Tomatoes,Produce,50,lbs,2025-03-15,10,2.5')
  })

  it('escapes fields containing commas', () => {
    const itemWithComma: InventoryItem = {
      ...mockItem,
      name: 'Tomatoes, Fresh',
    }
    const csv = exportInventoryToCSV([itemWithComma])
    const lines = csv.split('\n')
    expect(lines[1]).toContain('"Tomatoes, Fresh"')
  })

  it('handles empty items array', () => {
    const csv = exportInventoryToCSV([])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1) // Just header
    expect(lines[0]).toBe('Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit')
  })

  it('handles null expiry_date', () => {
    const itemNoExpiry: InventoryItem = { ...mockItem, expiry_date: null }
    const csv = exportInventoryToCSV([itemNoExpiry])
    const lines = csv.split('\n')
    // Expiry date field should be empty
    expect(lines[1]).toBe('Fresh Tomatoes,Produce,50,lbs,,10,2.5')
  })
})

describe('CSV Parser', () => {
  it('parses valid CSV rows correctly', () => {
    const csv = `Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit
Fresh Tomatoes,Produce,50,lbs,2025-03-15,10,2.50
Mozzarella,Dairy,5,kg,,5,12.00`

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(2)
    expect(result.errors).toHaveLength(0)
    expect(result.valid[0].name).toBe('Fresh Tomatoes')
    expect(result.valid[0].quantity).toBe(50)
    expect(result.valid[1].expiry_date).toBeNull()
  })

  it('handles missing required fields gracefully', () => {
    const csv = `Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit
,Produce,50,lbs,,10,2.50`

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].row).toBe(2)
    expect(result.errors[0].message).toContain('Name is required')
  })

  it('handles malformed numbers', () => {
    const csv = `Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit
Tomatoes,Produce,abc,lbs,,10,2.50`

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
  })

  it('returns empty result for empty file', () => {
    const result = parseInventoryCSV('')
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('returns empty result for header-only file', () => {
    const csv = 'Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit'
    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects files exceeding row limit', () => {
    const header = 'Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit'
    const rows = Array.from({ length: 501 }, (_, i) =>
      `Item ${i},Produce,1,lbs,,1,1.00`
    )
    const csv = [header, ...rows].join('\n')

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('500')
  })

  it('handles rows with too few columns', () => {
    const csv = `Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit
Tomatoes,Produce,50`

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('Missing columns')
  })

  it('handles quoted fields with commas', () => {
    const csv = `Name,Category,Quantity,Unit,Expiry Date,Reorder Point,Price Per Unit
"Tomatoes, Fresh",Produce,50,lbs,,10,2.50`

    const result = parseInventoryCSV(csv)
    expect(result.valid).toHaveLength(1)
    expect(result.valid[0].name).toBe('Tomatoes, Fresh')
  })
})
