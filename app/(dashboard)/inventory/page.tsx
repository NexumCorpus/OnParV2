import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getInventoryItems,
  getLowStockItems,
  getExpiringItems,
} from '@/lib/services/inventory'
import { getSuppliers } from '@/lib/services/suppliers'
import type { InventoryItem, Supplier } from '@/types'
import { InventoryPageClient } from './inventory-page-client'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let items: InventoryItem[] = []
  let lowStockItems: InventoryItem[] = []
  let expiringItems: InventoryItem[] = []
  let suppliers: Supplier[] = []

  try {
    ;[items, lowStockItems, expiringItems, suppliers] = await Promise.all([
      getInventoryItems(user.id),
      getLowStockItems(user.id),
      getExpiringItems(user.id),
      getSuppliers(user.id),
    ])
  } catch (error) {
    console.error('[InventoryPage] Data fetch failed:', error)
  }

  return (
    <InventoryPageClient
      initialItems={items}
      lowStockCount={lowStockItems.length}
      expiringCount={expiringItems.length}
      suppliers={suppliers}
    />
  )
}
