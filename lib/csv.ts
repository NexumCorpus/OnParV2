import { Database } from './supabase'

type InventoryInsert = Database['public']['Tables']['inventory_items']['Insert']

export interface CSVParseResult {
  success: boolean
  data: InventoryInsert[]
  errors: string[]
  totalRows: number
  validRows: number
}

export function parseInventoryCSV(csvContent: string, userId: string): CSVParseResult {
  const result: CSVParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0
  }

  if (!userId) {
    result.errors.push('User ID is required')
    return result
  }

  // Validate userId format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    result.errors.push('Invalid user ID format')
    return result
  }

  if (!csvContent || !csvContent.trim()) {
    result.errors.push('CSV content is empty')
    return result
  }

  // Limit CSV size to prevent DoS attacks
  if (csvContent.length > 1024 * 1024) { // 1MB limit
    result.errors.push('CSV file too large (maximum 1MB)')
    return result
  }

  try {
    // Split into lines and remove empty lines
    const lines = csvContent.trim().split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      result.errors.push('CSV file is empty')
      return result
    }

    if (lines.length === 1) {
      result.errors.push('CSV file contains only headers, no data rows')
      return result
    }

    // Limit number of rows to prevent resource exhaustion
    if (lines.length > 1001) { // 1000 data rows + 1 header
      result.errors.push('CSV file contains too many rows (maximum 1000)')
      return result
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().substring(0, 50)) // Limit header length
    const dataLines = lines.slice(1)
    
    result.totalRows = dataLines.length

    // Expected headers mapping
    const headerMap = {
      name: ['name', 'item_name', 'product_name', 'item'],
      quantity: ['quantity', 'qty', 'amount', 'stock'],
      unit: ['unit', 'units', 'measurement', 'uom'],
      expiry_date: ['expiry_date', 'expiry', 'expires', 'expiration_date', 'exp_date'],
      reorder_point: ['reorder_point', 'reorder', 'min_stock', 'minimum', 'reorder_level'],
      price_per_unit: ['price_per_unit', 'price', 'unit_price', 'cost', 'cost_per_unit']
    }

    // Find column indices
    const columnIndices: Record<string, number> = {}
    for (const [field, possibleHeaders] of Object.entries(headerMap)) {
      const index = headers.findIndex(h => possibleHeaders.includes(h))
      if (index !== -1) {
        columnIndices[field] = index
      }
    }

    // Validate required columns
    const requiredFields = ['name', 'quantity', 'unit', 'reorder_point', 'price_per_unit']
    const missingFields = requiredFields.filter(field => !(field in columnIndices))
    
    if (missingFields.length > 0) {
      result.errors.push(`Missing required columns: ${missingFields.join(', ')}`)
      return result
    }

    // Parse data rows
    dataLines.forEach((line, index) => {
      const rowNumber = index + 2 // +2 because we start from line 2 (after header)
      const values = line.split(',').map(v => v.trim())

      try {
        // Extract values
        const name = (values[columnIndices.name]?.replace(/['"]/g, '') || '').substring(0, 100)
        const quantityStr = values[columnIndices.quantity] || '0'
        const unit = (values[columnIndices.unit]?.replace(/['"]/g, '') || 'pieces').substring(0, 20)
        const expiryDateStr = values[columnIndices.expiry_date]?.replace(/['"]/g, '') || ''
        const reorderPointStr = values[columnIndices.reorder_point] || '0'
        const priceStr = values[columnIndices.price_per_unit] || '0'

        // Validate and convert values
        if (!name) {
          result.errors.push(`Row ${rowNumber}: Name is required`)
          return
        }

        const quantity = parseInt(quantityStr)
        if (isNaN(quantity) || quantity < 0 || quantity > 999999) {
          result.errors.push(`Row ${rowNumber}: Invalid quantity "${quantityStr}"`)
          return
        }

        const reorderPoint = parseInt(reorderPointStr)
        if (isNaN(reorderPoint) || reorderPoint < 0 || reorderPoint > 999999) {
          result.errors.push(`Row ${rowNumber}: Invalid reorder point "${reorderPointStr}"`)
          return
        }

        const pricePerUnit = parseFloat(priceStr)
        if (isNaN(pricePerUnit) || pricePerUnit < 0 || pricePerUnit > 999999) {
          result.errors.push(`Row ${rowNumber}: Invalid price "${priceStr}"`)
          return
        }

        // Parse expiry date if provided
        let expiryDate: string | null = null
        if (expiryDateStr) {
          const date = new Date(expiryDateStr)
          if (isNaN(date.getTime())) {
            result.errors.push(`Row ${rowNumber}: Invalid expiry date "${expiryDateStr}". Use YYYY-MM-DD format`)
            return
          }
          
          // Validate expiry date range
          const now = new Date()
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          const tenYearsFromNow = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate())
          
          if (date < oneYearAgo || date > tenYearsFromNow) {
            result.errors.push(`Row ${rowNumber}: Expiry date out of reasonable range`)
            return
          }
          
          expiryDate = date.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        }

        // Create inventory item
        const item: InventoryInsert = {
          user_id: userId,
          name: name,
          quantity: quantity,
          unit: unit,
          expiry_date: expiryDate,
          reorder_point: reorderPoint,
          price_per_unit: pricePerUnit
        }

        result.data.push(item)
        result.validRows++

      } catch (error) {
        result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    result.success = result.validRows > 0
    return result

  } catch (error) {
    result.errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return result
  }
}

export function generateSampleCSV(): string {
  return `name,quantity,unit,expiry_date,reorder_point,price_per_unit
Tomato Sauce,24,cans,2025-08-15,10,2.50
Mozzarella Cheese,5,kg,2025-02-05,8,12.00
Pasta Spaghetti,50,kg,,20,3.20
Olive Oil,8,liters,2025-12-01,3,15.00
Ground Beef,20,kg,2025-02-01,25,9.00
Lettuce,12,kg,2025-01-29,15,2.30`
}