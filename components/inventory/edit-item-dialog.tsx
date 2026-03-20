'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { INVENTORY_CATEGORIES, UNIT_GROUPS } from '@/lib/config'
import { inventoryItemSchema, type InventoryItemFormValues } from '@/lib/utils/validation'
import { updateItem } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import type { InventoryItem, Supplier } from '@/types'

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  suppliers: Supplier[]
  onSuccess: () => void
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  suppliers,
  onSuccess,
}: EditItemDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date,
      reorder_point: item.reorder_point,
      max_stock_level: item.max_stock_level,
      price_per_unit: item.price_per_unit,
      supplier_id: item.supplier_id,
    },
  })

  const selectedCategory = watch('category')
  const selectedUnit = watch('unit')

  const onSubmit = async (data: InventoryItemFormValues) => {
    setLoading(true)
    const formData = new FormData()
    formData.set('name', data.name)
    formData.set('category', data.category)
    formData.set('quantity', String(data.quantity))
    formData.set('unit', data.unit)
    if (data.expiry_date) formData.set('expiry_date', data.expiry_date)
    formData.set('reorder_point', String(data.reorder_point))
    if (data.max_stock_level !== null && data.max_stock_level !== undefined) {
      formData.set('max_stock_level', String(data.max_stock_level))
    }
    formData.set('price_per_unit', String(data.price_per_unit))
    if (data.supplier_id) formData.set('supplier_id', data.supplier_id)

    const result = await updateItem(item.id, formData)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Item updated')
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="edit-name">Item Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Fresh Tomatoes"
              {...register('name')}
              className="min-h-[44px] text-base"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category chips - compact grid */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {INVENTORY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat, { shouldValidate: true })}
                  className={cn(
                    'rounded-lg px-1.5 py-1.5 text-xs font-medium transition-colors min-h-[36px]',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background hover:bg-accent'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Unit - grouped select */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-unit">Unit *</Label>
            <select
              id="edit-unit"
              value={selectedUnit}
              onChange={(e) => setValue('unit', e.target.value, { shouldValidate: true })}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background min-h-[44px]"
            >
              <option value="">Select unit...</option>
              {UNIT_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.unit && (
              <p className="text-sm text-destructive">{errors.unit.message}</p>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-quantity">Quantity *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={0}
                step="any"
                {...register('quantity', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-price_per_unit">Price/Unit *</Label>
              <Input
                id="edit-price_per_unit"
                type="number"
                min={0}
                step="0.01"
                {...register('price_per_unit', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
              {errors.price_per_unit && (
                <p className="text-sm text-destructive">{errors.price_per_unit.message}</p>
              )}
            </div>
          </div>

          {/* Reorder Point and Max Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-reorder_point">Reorder Point</Label>
              <Input
                id="edit-reorder_point"
                type="number"
                min={0}
                {...register('reorder_point', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-max_stock_level">Max Stock</Label>
              <Input
                id="edit-max_stock_level"
                type="number"
                min={0}
                {...register('max_stock_level', {
                  setValueAs: (v: string) => (v === '' ? null : Number(v)),
                })}
                className="min-h-[44px] text-base"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <Label htmlFor="edit-expiry_date">Expiry Date</Label>
            <Input
              id="edit-expiry_date"
              type="date"
              {...register('expiry_date', {
                setValueAs: (v: string) => (v === '' ? null : v),
              })}
              className="min-h-[44px] text-base"
            />
          </div>

          {/* Supplier */}
          {suppliers.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor="edit-supplier_id">Supplier</Label>
              <select
                id="edit-supplier_id"
                {...register('supplier_id', {
                  setValueAs: (v: string) => (v === '' ? null : v),
                })}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background min-h-[44px]"
              >
                <option value="">No supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
