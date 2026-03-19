import type { InventoryItem } from '@/types'
import { inventoryItemSchema } from '@/lib/utils/validation'
import { CSV_MAX_ROWS } from '@/lib/config'

interface ParsedInventoryRow {
  name: string
  category: string
  quantity: number
  unit: string
  expiry_date: string | null
  reorder_point: number
  price_per_unit: number
}

export interface ParseResult {
  valid: ParsedInventoryRow[]
  errors: Array<{ row: number; message: string }>
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function exportInventoryToCSV(items: InventoryItem[]): string {
  const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Reorder Point', 'Price Per Unit']
  const rows = items.map((item) => [
    escapeCSVField(item.name),
    escapeCSVField(item.category),
    String(item.quantity),
    escapeCSVField(item.unit),
    item.expiry_date ?? '',
    String(item.reorder_point),
    String(item.price_per_unit),
  ])

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }
  fields.push(current.trim())
  return fields
}

export function parseInventoryCSV(csvString: string): ParseResult {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return { valid: [], errors: [] }
  }

  // Skip header row
  const dataLines = lines.slice(1)

  if (dataLines.length > CSV_MAX_ROWS) {
    return {
      valid: [],
      errors: [{ row: 0, message: `File exceeds maximum of ${CSV_MAX_ROWS} rows` }],
    }
  }

  const valid: ParsedInventoryRow[] = []
  const errors: Array<{ row: number; message: string }> = []

  for (let i = 0; i < dataLines.length; i++) {
    const rowNumber = i + 2 // 1-indexed, skip header
    const fields = parseCSVLine(dataLines[i])

    if (fields.length < 7) {
      errors.push({ row: rowNumber, message: 'Missing columns. Expected 7 columns.' })
      continue
    }

    const [name, category, quantityStr, unit, expiryDate, reorderPointStr, priceStr] = fields

    const raw = {
      name,
      category,
      quantity: Number(quantityStr),
      unit,
      expiry_date: expiryDate && expiryDate.length > 0 ? expiryDate : null,
      reorder_point: Number(reorderPointStr),
      price_per_unit: Number(priceStr),
    }

    // Validate with partial schema (no supplier_id, max_stock_level in CSV)
    const result = inventoryItemSchema.safeParse(raw)
    if (!result.success) {
      const messages = result.error.issues.map((e: { message: string }) => e.message).join(', ')
      errors.push({ row: rowNumber, message: messages })
      continue
    }

    valid.push({
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiry_date: result.data.expiry_date ?? null,
      reorder_point: result.data.reorder_point,
      price_per_unit: result.data.price_per_unit,
    })
  }

  return { valid, errors }
}

export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function generateCSVTemplate(): string {
  const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Reorder Point', 'Price Per Unit']
  const exampleRow = ['Fresh Tomatoes', 'Produce', '50', 'lbs', '2025-03-15', '10', '2.50']
  return [headers.join(','), exampleRow.join(',')].join('\n')
}
