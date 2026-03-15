'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatting'
import type { InventoryItem } from '@/types'

export interface IngredientRow {
  id?: string
  inventory_item_id: string
  inventory_item_name: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
}

interface IngredientPickerProps {
  ingredients: IngredientRow[]
  inventoryItems: InventoryItem[]
  onChange: (ingredients: IngredientRow[]) => void
}

export function IngredientPicker({
  ingredients,
  inventoryItems,
  onChange,
}: IngredientPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ingredients.some((ing) => ing.inventory_item_id === item.id)
  )

  const addIngredient = (item: InventoryItem) => {
    onChange([
      ...ingredients,
      {
        inventory_item_id: item.id,
        inventory_item_name: item.name,
        quantity_needed: 1,
        unit: item.unit,
        cost_per_unit: item.price_per_unit,
      },
    ])
    setSearchTerm('')
  }

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateIngredient = (index: number, field: keyof IngredientRow, value: string | number) => {
    const updated = ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    )
    onChange(updated)
  }

  const totalCost = ingredients.reduce(
    (sum, ing) => sum + ing.quantity_needed * ing.cost_per_unit,
    0
  )

  return (
    <div className="space-y-3">
      {/* Existing ingredients */}
      {ingredients.map((ing, index) => (
        <div key={ing.inventory_item_id} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-4">
            {index === 0 && (
              <Label className="text-xs text-muted-foreground">Item</Label>
            )}
            <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm">
              {ing.inventory_item_name}
            </div>
          </div>
          <div className="col-span-2">
            {index === 0 && (
              <Label className="text-xs text-muted-foreground">Qty</Label>
            )}
            <Input
              type="number"
              min={0.01}
              step="0.01"
              value={ing.quantity_needed}
              onChange={(e) =>
                updateIngredient(index, 'quantity_needed', Number(e.target.value))
              }
              className="h-10"
            />
          </div>
          <div className="col-span-2">
            {index === 0 && (
              <Label className="text-xs text-muted-foreground">Unit</Label>
            )}
            <Input
              value={ing.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              className="h-10"
            />
          </div>
          <div className="col-span-3">
            {index === 0 && (
              <Label className="text-xs text-muted-foreground">$/Unit</Label>
            )}
            <Input
              type="number"
              min={0}
              step="0.01"
              value={ing.cost_per_unit}
              onChange={(e) =>
                updateIngredient(index, 'cost_per_unit', Number(e.target.value))
              }
              className="h-10"
            />
          </div>
          <div className="col-span-1 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-destructive"
              onClick={() => removeIngredient(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      ))}

      {/* Add ingredient search */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Search inventory items to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
          {searchTerm && filteredItems.length > 0 && (
            <div className="absolute z-10 w-full mt-1 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
              {filteredItems.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                  onClick={() => addIngredient(item)}
                >
                  <span>
                    {item.name}{' '}
                    <span className="text-muted-foreground">
                      ({item.quantity} {item.unit})
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.price_per_unit)}/{item.unit}
                  </span>
                </button>
              ))}
            </div>
          )}
          {searchTerm && filteredItems.length === 0 && (
            <div className="absolute z-10 w-full mt-1 rounded-md border bg-popover shadow-lg p-3 text-sm text-muted-foreground">
              No matching inventory items found.
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSearchTerm(searchTerm || ' ')}
          className="min-h-[36px]"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Ingredient
        </Button>
      </div>

      {/* Total */}
      {ingredients.length > 0 && (
        <div className="flex justify-end text-sm font-medium pt-1">
          <span className="text-muted-foreground mr-2">Total ingredient cost:</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      )}
    </div>
  )
}
