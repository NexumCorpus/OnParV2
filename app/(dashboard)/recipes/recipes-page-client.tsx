'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RecipeGrid } from '@/components/recipes/recipe-grid'
import { RecipeDetailDialog } from '@/components/recipes/recipe-detail-dialog'
import { AddRecipeDialog } from '@/components/recipes/add-recipe-dialog'
import { EditRecipeDialog } from '@/components/recipes/edit-recipe-dialog'
import { MenuItemsTab } from '@/components/recipes/menu-items-tab'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteRecipe } from '@/lib/actions/recipes'
import { RECIPE_CATEGORIES, SEARCH_DEBOUNCE_MS } from '@/lib/config'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Recipe, MenuItem, InventoryItem } from '@/types'

interface RecipesPageClientProps {
  initialRecipes: Recipe[]
  initialMenuItems: MenuItem[]
  initialMenuStats: {
    totalItems: number
    activeItems: number
    avgWastePercentage: number
    topPerformers: MenuItem[]
    worstPerformers: MenuItem[]
  }
  inventoryItems: InventoryItem[]
}

export function RecipesPageClient({
  initialRecipes,
  initialMenuItems,
  initialMenuStats,
  inventoryItems,
}: RecipesPageClientProps) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null)
  const [viewRecipeId, setViewRecipeId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const filteredRecipes = recipes.filter((recipe) => {
    if (debouncedSearch && !recipe.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
      return false
    }
    if (categoryFilter && recipe.category !== categoryFilter) {
      return false
    }
    if (difficultyFilter && recipe.difficulty_level !== difficultyFilter) {
      return false
    }
    return true
  })

  const refreshRecipes = useCallback(async () => {
    try {
      const res = await fetch('/api/recipes')
      if (res.ok) {
        const data = (await res.json()) as Recipe[]
        setRecipes(data)
      }
    } catch {
      // keep stale data
    }
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteRecipe(deleteTarget.id)
    if (result.success) {
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      toast.success('Recipe deleted')
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recipes</h1>
        <p className="text-muted-foreground">
          Manage recipes and track ingredient costs
        </p>
      </div>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6 mt-4">
          {/* Filters & Add */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 min-h-[44px]"
                />
              </div>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[44px]"
              >
                <option value="">All Categories</option>
                {RECIPE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Difficulty filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[44px]"
              >
                <option value="">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <Button onClick={() => setAddDialogOpen(true)} className="min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </div>

          {/* Recipe Grid */}
          <RecipeGrid
            recipes={filteredRecipes}
            onView={(recipe) => setViewRecipeId(recipe.id)}
            onEdit={(recipe) => setEditRecipe(recipe)}
            onDelete={(recipe) => setDeleteTarget(recipe)}
          />

          {/* Detail Dialog */}
          <RecipeDetailDialog
            open={!!viewRecipeId}
            onOpenChange={(open) => { if (!open) setViewRecipeId(null) }}
            recipeId={viewRecipeId}
            onEdit={(recipe) => {
              setViewRecipeId(null)
              setEditRecipe(recipe)
            }}
          />

          {/* Add Dialog */}
          <AddRecipeDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            inventoryItems={inventoryItems}
            onSuccess={refreshRecipes}
          />

          {/* Edit Dialog */}
          <EditRecipeDialog
            open={!!editRecipe}
            onOpenChange={(open) => { if (!open) setEditRecipe(null) }}
            recipe={editRecipe}
            inventoryItems={inventoryItems}
            onSuccess={refreshRecipes}
          />

          {/* Delete Confirmation */}
          <AlertDialog
            open={!!deleteTarget}
            onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This will
                  remove all ingredients and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="menu-items" className="mt-4">
          <MenuItemsTab
            initialItems={initialMenuItems}
            initialRecipes={initialRecipes}
            initialStats={initialMenuStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
