'use client'

import { RecipeCard } from './recipe-card'
import type { Recipe } from '@/types'

interface RecipeGridProps {
  recipes: Recipe[]
  onView: (recipe: Recipe) => void
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}

export function RecipeGrid({ recipes, onView, onEdit, onDelete }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No recipes found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first recipe to get started with cost tracking.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
