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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { RECIPE_CATEGORIES } from '@/lib/config'
import { menuItemSchema, type MenuItemFormValues } from '@/lib/utils/validation'
import {
  createMenuItem,
  updateMenuItem as updateMenuItemAction,
} from '@/lib/actions/menu'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import type { MenuItem, Recipe } from '@/types'

interface AddMenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: Recipe[]
  editItem?: MenuItem | null
  onSuccess: () => void
}

export function AddMenuItemDialog({
  open,
  onOpenChange,
  recipes,
  editItem,
  onSuccess,
}: AddMenuItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    editItem?.recipe_id ?? ''
  )

  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MenuItemFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(menuItemSchema),
    defaultValues: editItem
      ? {
          name: editItem.name,
          category: editItem.category,
          selling_price: editItem.selling_price,
          sales_percentage: editItem.sales_percentage,
          waste_percentage: editItem.waste_percentage,
          is_active: editItem.is_active,
        }
      : {
          name: '',
          category: '',
          selling_price: 0,
          sales_percentage: 0,
          waste_percentage: 0,
          is_active: true,
        },
  })

  // Reset form when editItem changes
  useState(() => {
    if (editItem) {
      reset({
        name: editItem.name,
        category: editItem.category,
        selling_price: editItem.selling_price,
        sales_percentage: editItem.sales_percentage,
        waste_percentage: editItem.waste_percentage,
        is_active: editItem.is_active,
      })
      setSelectedRecipeId(editItem.recipe_id ?? '')
    } else {
      reset({
        name: '',
        category: '',
        selling_price: 0,
        sales_percentage: 0,
        waste_percentage: 0,
        is_active: true,
      })
      setSelectedRecipeId('')
    }
  })

  const selectedCategory = watch('category')
  const isActive = watch('is_active')

  const onSubmit = async (data: MenuItemFormValues) => {
    setLoading(true)

    const formData = new FormData()
    formData.set('name', data.name)
    formData.set('category', data.category)
    formData.set('selling_price', String(data.selling_price))
    if (data.sales_percentage !== undefined) {
      formData.set('sales_percentage', String(data.sales_percentage))
    }
    if (data.waste_percentage !== undefined) {
      formData.set('waste_percentage', String(data.waste_percentage))
    }
    formData.set('is_active', String(data.is_active))
    if (selectedRecipeId) {
      formData.set('recipe_id', selectedRecipeId)
    }

    const result = isEditing
      ? await updateMenuItemAction(editItem.id, formData)
      : await createMenuItem(formData)

    if (!result.success) {
      toast.error(getUserFriendlyError(result.error))
      setLoading(false)
      return
    }

    toast.success(isEditing ? 'Menu item updated' : 'Menu item added')
    reset()
    setSelectedRecipeId('')
    onOpenChange(false)
    onSuccess()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="menu-item-name">Item Name *</Label>
            <Input
              id="menu-item-name"
              placeholder="e.g., Margherita Pizza"
              {...register('name')}
              className="min-h-[44px] text-base"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category and Price */}
          <div className="space-y-1">
            <Label>Category *</Label>
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat, { shouldValidate: true })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]',
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="menu-selling-price">Selling Price *</Label>
              <Input
                id="menu-selling-price"
                type="number"
                min={0}
                step="0.01"
                {...register('selling_price', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
              {errors.selling_price && (
                <p className="text-sm text-destructive">{errors.selling_price.message}</p>
              )}
            </div>
          </div>

          {/* Sales & Waste percentages */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="menu-sales-pct">Sales % (0-100)</Label>
              <Input
                id="menu-sales-pct"
                type="number"
                min={0}
                max={100}
                step="0.1"
                {...register('sales_percentage', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="menu-waste-pct">Waste % (0-100)</Label>
              <Input
                id="menu-waste-pct"
                type="number"
                min={0}
                max={100}
                step="0.1"
                {...register('waste_percentage', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
            </div>
          </div>

          {/* Linked Recipe */}
          <div className="space-y-1">
            <Label htmlFor="menu-recipe">Linked Recipe (optional)</Label>
            <select
              id="menu-recipe"
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background min-h-[44px]"
            >
              <option value="">None</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="menu-active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', !!checked)}
            />
            <Label htmlFor="menu-active" className="cursor-pointer">
              Active on menu
            </Label>
          </div>

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
              {loading ? 'Saving...' : isEditing ? 'Save Menu Item' : 'Add Menu Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
