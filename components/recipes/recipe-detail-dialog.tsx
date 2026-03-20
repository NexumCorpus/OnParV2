'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, Clock, Users, Pencil } from 'lucide-react'
import type { Recipe, RecipeIngredient, InventoryItem } from '@/types'

type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { inventory_item: InventoryItem })[]
}

interface RecipeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipeId: string | null
  onEdit: (recipe: Recipe) => void
}

interface AvailabilityResult {
  available: boolean
  missingItems: Array<{
    ingredient: RecipeIngredient
    inventoryItem: InventoryItem
    shortfall: number
  }>
}

function getMarginColor(margin: number): string {
  if (margin >= 60) return 'text-green-600 dark:text-green-400'
  if (margin >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function RecipeDetailDialog({
  open,
  onOpenChange,
  recipeId,
  onEdit,
}: RecipeDetailDialogProps) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/recipes/${recipeId}`)
      if (res.ok) {
        const data = (await res.json()) as RecipeWithIngredients
        setRecipe(data)
      }
    } catch {
      // handled by loading state
    }
    setLoading(false)
  }, [recipeId])

  useEffect(() => {
    if (open && recipeId) {
      fetchRecipe().then(() => {
        // Auto-check availability when dialog opens
        void handleCheckAvailability()
      })
    } else {
      setAvailability(null)
    }
  }, [open, recipeId, fetchRecipe]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckAvailability = async () => {
    if (!recipeId) return
    setCheckingAvailability(true)
    try {
      const res = await fetch(`/api/recipes/${recipeId}/availability`)
      if (res.ok) {
        const data = (await res.json()) as AvailabilityResult
        setAvailability(data)
      }
    } catch {
      // handled by loading state
    }
    setCheckingAvailability(false)
  }

  if (!open) return null

  const totalTime = recipe
    ? (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
    : 0

  const ingredientTotal = recipe
    ? recipe.ingredients.reduce(
        (sum, ing) => sum + ing.quantity_needed * ing.cost_per_unit,
        0
      )
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{recipe?.name ?? 'Loading...'}</DialogTitle>
          {recipe?.description && (
            <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading recipe details...</p>
          </div>
        )}

        {recipe && !loading && (
          <div className="space-y-6">
            {/* Meta info cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium text-sm mt-1">{recipe.category}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">Serves</p>
                <p className="font-medium text-sm mt-1 flex items-center justify-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {recipe.serving_size}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-sm mt-1 flex items-center justify-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {totalTime} min
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <p className="font-medium text-sm mt-1 capitalize">{recipe.difficulty_level}</p>
              </div>
            </div>

            {/* Ingredients table */}
            <div>
              <h3 className="font-semibold mb-3">Ingredients</h3>
              {recipe.ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Qty Needed</TableHead>
                      <TableHead className="text-right">In Stock</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients.map((ing) => {
                      const stockOk = ing.inventory_item
                        ? ing.inventory_item.quantity >= ing.quantity_needed
                        : false
                      return (
                        <TableRow key={ing.id}>
                          <TableCell className="font-medium">
                            {ing.inventory_item?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right">
                            {ing.quantity_needed} {ing.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {ing.inventory_item ? (
                              <span className={cn(stockOk ? 'text-green-600' : 'text-red-600')}>
                                {ing.inventory_item.quantity} {stockOk ? '' : ''}
                                {stockOk ? (
                                  <CheckCircle className="inline h-3.5 w-3.5 ml-1" />
                                ) : (
                                  <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(ing.quantity_needed * ing.cost_per_unit)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(ingredientTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Cost Analysis */}
            <div>
              <h3 className="font-semibold mb-3">Cost Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per serving:</span>
                  <span className="font-medium">{formatCurrency(recipe.cost_per_serving)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling price:</span>
                  <span className="font-medium">{formatCurrency(recipe.selling_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profit margin:</span>
                  <span className={cn('font-semibold', getMarginColor(recipe.profit_margin))}>
                    {formatPercentage(recipe.profit_margin)}
                  </span>
                </div>
                <Progress
                  value={Math.min(recipe.profit_margin, 100)}
                  className="h-2 mt-1"
                />
              </div>
            </div>

            {/* Availability */}
            {availability && (
              <div>
                <h3 className="font-semibold mb-3">Availability Check</h3>
                {availability.available ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>All ingredients are available</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      <span>{availability.missingItems.length} item(s) short</span>
                    </div>
                    {availability.missingItems.map((mi) => (
                      <div key={mi.ingredient.id} className="text-sm pl-7">
                        <span className="font-medium">{mi.inventoryItem.name}</span>
                        {' — need '}
                        {mi.ingredient.quantity_needed} {mi.ingredient.unit}
                        {', have '}
                        {mi.inventoryItem.quantity}
                        {' (short '}
                        {mi.shortfall.toFixed(2)}
                        {')'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {recipe.instructions}
                </p>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => onEdit(recipe)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Recipe
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
              >
                {checkingAvailability ? 'Checking...' : 'Refresh Availability'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
