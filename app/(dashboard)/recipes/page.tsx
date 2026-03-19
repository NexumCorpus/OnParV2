import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/services/recipes'
import { getMenuItems, getMenuStats } from '@/lib/services/menu'
import { getInventoryItems } from '@/lib/services/inventory'
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

  const [recipes, menuItems, menuStats, inventoryItems] = await Promise.all([
    getRecipes(user.id),
    getMenuItems(user.id),
    getMenuStats(user.id),
    getInventoryItems(user.id),
  ])

  return (
    <RecipesPageClient
      initialRecipes={recipes}
      initialMenuItems={menuItems}
      initialMenuStats={menuStats}
      inventoryItems={inventoryItems}
    />
  )
}
