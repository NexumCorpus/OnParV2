import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/services/recipes'
import { getMenuItems, getMenuStats } from '@/lib/services/menu'
import { getInventoryItems } from '@/lib/services/inventory'
import type { Recipe, MenuItem, InventoryItem } from '@/types'

type MenuStats = {
  totalItems: number
  activeItems: number
  avgWastePercentage: number
  topPerformers: MenuItem[]
  worstPerformers: MenuItem[]
}
import { RecipesPageClient } from './recipes-page-client'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <p className="text-muted-foreground">Please sign in to view recipes.</p>
      </div>
    )
  }

  let recipes: Recipe[] = []
  let menuItems: MenuItem[] = []
  let menuStats: MenuStats = { totalItems: 0, activeItems: 0, avgWastePercentage: 0, topPerformers: [], worstPerformers: [] }
  let inventoryItems: InventoryItem[] = []

  try {
    ;[recipes, menuItems, menuStats, inventoryItems] = await Promise.all([
      getRecipes(user.id),
      getMenuItems(user.id),
      getMenuStats(user.id),
      getInventoryItems(user.id),
    ])
  } catch (error) {
    console.error('[RecipesPage] Data fetch failed:', error)
  }

  return (
    <RecipesPageClient
      initialRecipes={recipes}
      initialMenuItems={menuItems}
      initialMenuStats={menuStats}
      inventoryItems={inventoryItems}
    />
  )
}
