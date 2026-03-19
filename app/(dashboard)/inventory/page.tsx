import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getInventoryItems,
  getLowStockItems,
  getExpiringItems,
} from '@/lib/services/inventory'
import { getSuppliers } from '@/lib/services/suppliers'
import { InventoryPageClient } from './inventory-page-client'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [items, lowStockItems, expiringItems, suppliers] = await Promise.all([
    getInventoryItems(user.id),
    getLowStockItems(user.id),
    getExpiringItems(user.id),
    getSuppliers(user.id),
  ])

  return (
    <InventoryPageClient
      initialItems={items}
      lowStockCount={lowStockItems.length}
      expiringCount={expiringItems.length}
      suppliers={suppliers}
    />
  )
}
