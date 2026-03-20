'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { INVENTORY_CATEGORIES } from '@/lib/config'
import { UNIT_GROUPS } from '@/lib/config'
import { inventoryItemSchema, type InventoryItemFormValues } from '@/lib/utils/validation'
import { createItem } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'

export default function AddInventoryItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InventoryItemFormValues>({
    mode: 'onBlur',
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
        toast.error('Plan limit reached. Upgrade to add more items.')
      } else {
        toast.error(getUserFriendlyError(result.error))
      }
      return
    }

    toast.success('Item added')
    router.push('/inventory')
    router.refresh()
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-accent min-h-[44px] min-w-[44px]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Add Item</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="add-name">Item Name *</Label>
          <Input
            id="add-name"
            placeholder="e.g., Fresh Tomatoes"
            {...register('name')}
            autoFocus
            className="min-h-[48px] text-base"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Category chips - compact 2-row grid */}
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <div className="grid grid-cols-5 gap-1.5">
            {INVENTORY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setValue('category', cat, { shouldValidate: true })}
                className={cn(
                  'rounded-lg px-2 py-2 text-xs font-medium transition-colors min-h-[40px]',
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

        {/* Unit - grouped select dropdown instead of 16 chips */}
        <div className="space-y-1.5">
          <Label htmlFor="add-unit">Unit *</Label>
          <select
            id="add-unit"
            value={selectedUnit}
            onChange={(e) => setValue('unit', e.target.value, { shouldValidate: true })}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background min-h-[48px]"
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

        {/* Quantity and Price - side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="add-quantity">Quantity *</Label>
            <Input
              id="add-quantity"
              type="number"
              min={0}
              step="any"
              {...register('quantity', { valueAsNumber: true })}
              className="min-h-[48px] text-base"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="add-price">Price/Unit *</Label>
            <Input
              id="add-price"
              type="number"
              min={0}
              step="0.01"
              {...register('price_per_unit', { valueAsNumber: true })}
              className="min-h-[48px] text-base"
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
          {showMore ? 'Hide' : 'More'} options (reorder point, expiry, max stock)
        </button>

        {showMore && (
          <div className="space-y-4 border-l-2 border-border pl-4">
            {/* Reorder Point and Max Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-reorder">Reorder Point</Label>
                <Input
                  id="add-reorder"
                  type="number"
                  min={0}
                  {...register('reorder_point', { valueAsNumber: true })}
                  className="min-h-[44px] text-base"
                />
                {errors.reorder_point && (
                  <p className="text-sm text-destructive">{errors.reorder_point.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-max-stock">Max Stock</Label>
                <Input
                  id="add-max-stock"
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
              <Label htmlFor="add-expiry">Expiry Date</Label>
              <Input
                id="add-expiry"
                type="date"
                {...register('expiry_date', {
                  setValueAs: (v: string) => (v === '' ? null : v),
                })}
                className="min-h-[44px] text-base"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-h-[48px] text-base"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 min-h-[48px] text-base" disabled={loading}>
            {loading ? 'Saving...' : 'Save Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}
