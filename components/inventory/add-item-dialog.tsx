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
import { createItem, lookupBarcode } from '@/lib/actions/inventory'
import type { Product } from '@/types'
import { toast } from 'sonner'
import type { Supplier } from '@/types'
import { ChevronDown } from 'lucide-react'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
  onSuccess: () => void
}

export function AddItemDialog({
  open,
  onOpenChange,
  suppliers,
  onSuccess,
}: AddItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [barcodeSearch, setBarcodeSearch] = useState('')
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      expiry_date: null,
      reorder_point: 0,
      max_stock_level: null,
      price_per_unit: 0,
      supplier_id: null,
    },
  })

  const selectedCategory = watch('category')
  const selectedUnit = watch('unit')

  const handleBarcodeSearch = async () => {
    if (!barcodeSearch.trim()) return
    setBarcodeLoading(true)
    try {
      const result = await lookupBarcode(barcodeSearch.trim())
      if (result.success && result.data) {
        const product = result.data as Product
        setValue('name', product.name)
        if (product.category) setValue('category', product.category)
        setValue('unit', product.unit)
        setValue('price_per_unit', product.average_price)
        toast.success('Product found! Fields auto-filled.')
      } else {
        toast.info('No product found for this barcode.')
      }
    } catch {
      toast.error('Failed to look up barcode.')
    }
    setBarcodeLoading(false)
  }

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

    const result = await createItem(formData)
    setLoading(false)

    if (!result.success) {
      if (result.error === 'PLAN_LIMIT_REACHED') {
        toast.error('You have reached your plan limit. Please upgrade to add more items.')
      } else {
        toast.error(result.error)
      }
      return
    }

    toast.success('Item added successfully')
    reset()
    setBarcodeSearch('')
    setShowMore(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Barcode search */}
          <div className="space-y-1">
            <Label>Barcode lookup</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Scan or enter barcode..."
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                className="min-h-[44px] text-base"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleBarcodeSearch}
                disabled={barcodeLoading}
                className="min-h-[44px]"
              >
                {barcodeLoading ? '...' : 'Lookup'}
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
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
            <Label htmlFor="dialog-unit">Unit *</Label>
            <select
              id="dialog-unit"
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
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
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
              <Label htmlFor="price_per_unit">Price/Unit *</Label>
              <Input
                id="price_per_unit"
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

          {/* Collapsible optional fields */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showMore && 'rotate-180')} />
            {showMore ? 'Hide' : 'More'} options
          </button>

          {showMore && (
            <div className="space-y-3 border-l-2 border-border pl-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="reorder_point">Reorder Point</Label>
                  <Input
                    id="reorder_point"
                    type="number"
                    min={0}
                    {...register('reorder_point', { valueAsNumber: true })}
                    className="min-h-[44px] text-base"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="max_stock_level">Max Stock</Label>
                  <Input
                    id="max_stock_level"
                    type="number"
                    min={0}
                    {...register('max_stock_level', {
                      setValueAs: (v: string) => (v === '' ? null : Number(v)),
                    })}
                    className="min-h-[44px] text-base"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register('expiry_date', {
                    setValueAs: (v: string) => (v === '' ? null : v),
                  })}
                  className="min-h-[44px] text-base"
                />
              </div>

              {suppliers.length > 0 && (
                <div className="space-y-1">
                  <Label htmlFor="supplier_id">Supplier</Label>
                  <select
                    id="supplier_id"
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
