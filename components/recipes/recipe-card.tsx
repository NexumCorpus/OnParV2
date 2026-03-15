'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting'
import { Clock, Eye, MoreVertical, Pencil, Trash2, Users } from 'lucide-react'
import type { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
  onView: (recipe: Recipe) => void
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}

function getMarginColor(margin: number): string {
  if (margin >= 60) return 'border-l-green-500'
  if (margin >= 40) return 'border-l-yellow-500'
  return 'border-l-red-500'
}

function getMarginBadgeVariant(margin: number): 'default' | 'secondary' | 'destructive' {
  if (margin >= 60) return 'default'
  if (margin >= 40) return 'secondary'
  return 'destructive'
}

function getDifficultyLabel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function RecipeCard({ recipe, onView, onEdit, onDelete }: RecipeCardProps) {
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  const marginColor = getMarginColor(recipe.profit_margin)

  return (
    <Card
      className={cn('overflow-hidden border-l-4 cursor-pointer transition-shadow hover:shadow-md', marginColor)}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('button') || target.closest('[role="menu"]')) return
        onView(recipe)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onView(recipe)
        }
      }}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base leading-tight pr-2">{recipe.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(recipe)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(recipe)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(recipe)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {recipe.category}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.prep_time_minutes ?? 0} + {recipe.cook_time_minutes ?? 0} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {recipe.serving_size} serving{recipe.serving_size !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Difficulty */}
        <div className="text-sm text-muted-foreground">
          {getDifficultyLabel(recipe.difficulty_level)}
          {totalTime > 0 && <span className="ml-2">({totalTime} min total)</span>}
        </div>

        {/* Cost & Pricing */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-medium">{formatCurrency(recipe.cost_per_serving)}/srv</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{formatCurrency(recipe.selling_price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Margin:</span>
            <Badge variant={getMarginBadgeVariant(recipe.profit_margin)}>
              {formatPercentage(recipe.profit_margin)}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 min-h-[36px]" onClick={() => onView(recipe)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1 min-h-[36px]" onClick={() => onEdit(recipe)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
