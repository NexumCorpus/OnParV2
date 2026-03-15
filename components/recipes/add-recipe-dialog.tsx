'use client'

import { useState, useMemo } from 'react'
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
import { RECIPE_CATEGORIES } from '@/lib/config'
import { recipeSchema, type RecipeFormValues } from '@/lib/utils/validation'
import { createRecipe } from '@/lib/actions/recipes'
import { addIngredient } from '@/lib/actions/recipes'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting'
import { IngredientPicker, type IngredientRow } from './ingredient-picker'
import { toast } from 'sonner'
import type { InventoryItem } from '@/types'

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const

interface AddRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventoryItems: InventoryItem[]
  onSuccess: () => void
}

export function AddRecipeDialog({
  open,
  onOpenChange,
  inventoryItems,
  onSuccess,
}: AddRecipeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [ingredients, setIngredients] = useState<IngredientRow[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: null,
      category: '',
      serving_size: 1,
      prep_time_minutes: null,
      cook_time_minutes: null,
      difficulty_level: 'medium',
      instructions: null,
      selling_price: 0,
    },
  })

  const selectedCategory = watch('category')
  const selectedDifficulty = watch('difficulty_level')
  const sellingPrice = watch('selling_price')
  const servingSize = watch('serving_size')

  const totalCost = useMemo(
    () => ingredients.reduce((sum, ing) => sum + ing.quantity_needed * ing.cost_per_unit, 0),
    [ingredients]
  )

  const costPerServing = useMemo(
    () => (servingSize > 0 ? totalCost / servingSize : 0),
    [totalCost, servingSize]
  )

  const profitMargin = useMemo(
    () => (sellingPrice > 0 ? ((sellingPrice - costPerServing) / sellingPrice) * 100 : 0),
    [sellingPrice, costPerServing]
  )

  const onSubmit = async (data: RecipeFormValues) => {
    setLoading(true)

    const formData = new FormData()
    formData.set('name', data.name)
    if (data.description) formData.set('description', data.description)
    formData.set('category', data.category)
    formData.set('serving_size', String(data.serving_size))
    if (data.prep_time_minutes !== null && data.prep_time_minutes !== undefined) {
      formData.set('prep_time_minutes', String(data.prep_time_minutes))
    }
    if (data.cook_time_minutes !== null && data.cook_time_minutes !== undefined) {
      formData.set('cook_time_minutes', String(data.cook_time_minutes))
    }
    formData.set('difficulty_level', data.difficulty_level)
    if (data.instructions) formData.set('instructions', data.instructions)
    formData.set('selling_price', String(data.selling_price))

    const result = await createRecipe(formData)

    if (!result.success) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    // Add ingredients to the new recipe
    const recipe = result.data as { id: string }
    for (const ing of ingredients) {
      await addIngredient({
        recipe_id: recipe.id,
        inventory_item_id: ing.inventory_item_id,
        quantity_needed: ing.quantity_needed,
        unit: ing.unit,
        cost_per_unit: ing.cost_per_unit,
      })
    }

    toast.success('Recipe created successfully')
    reset()
    setIngredients([])
    onOpenChange(false)
    onSuccess()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic Info section */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground">Basic Info</h3>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="recipe-name">Recipe Name *</Label>
            <Input
              id="recipe-name"
              placeholder="e.g., Margherita Pizza"
              {...register('name')}
              className="min-h-[44px] text-base"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="recipe-desc">Description</Label>
            <textarea
              id="recipe-desc"
              placeholder="Brief description of the recipe"
              {...register('description')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Category chips */}
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

          {/* Difficulty chips */}
          <div className="space-y-1">
            <Label>Difficulty *</Label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setValue('difficulty_level', level, { shouldValidate: true })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px] capitalize',
                    selectedDifficulty === level
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background hover:bg-accent'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Servings, Prep, Cook, Price */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="serving_size">Servings *</Label>
              <Input
                id="serving_size"
                type="number"
                min={1}
                {...register('serving_size', { valueAsNumber: true })}
                className="min-h-[44px] text-base"
              />
              {errors.serving_size && (
                <p className="text-sm text-destructive">{errors.serving_size.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="prep_time">Prep (min)</Label>
              <Input
                id="prep_time"
                type="number"
                min={0}
                {...register('prep_time_minutes', {
                  setValueAs: (v: string) => (v === '' ? null : Number(v)),
                })}
                className="min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cook_time">Cook (min)</Label>
              <Input
                id="cook_time"
                type="number"
                min={0}
                {...register('cook_time_minutes', {
                  setValueAs: (v: string) => (v === '' ? null : Number(v)),
                })}
                className="min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="selling_price">Sell Price *</Label>
              <Input
                id="selling_price"
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

          {/* Ingredients section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Ingredients</h3>
            <IngredientPicker
              ingredients={ingredients}
              inventoryItems={inventoryItems}
              onChange={setIngredients}
            />
          </div>

          {/* Live cost calculations */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calculated cost/serving:</span>
              <span className="font-medium">{formatCurrency(costPerServing)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit margin:</span>
              <span
                className={cn(
                  'font-medium',
                  profitMargin >= 60
                    ? 'text-green-600'
                    : profitMargin >= 40
                      ? 'text-yellow-600'
                      : 'text-red-600'
                )}
              >
                {formatPercentage(profitMargin)}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground">Instructions</h3>
            <textarea
              placeholder="Step-by-step instructions..."
              {...register('instructions')}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
              {loading ? 'Saving...' : 'Save Recipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
