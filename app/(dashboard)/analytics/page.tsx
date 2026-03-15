import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getLowStockItems,
  getExpiringItems,
  getTotalInventoryValue,
  getInventoryItems,
} from '@/lib/services/inventory'
import type { InventoryItem, WasteAnalysisSnapshot, WasteEvent, Recipe } from '@/types'
import { AnalyticsPageClient } from './analytics-page-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  // Fetch all data in parallel
  const [
    inventoryItems,
    lowStockItems,
    expiringItems,
    totalValue,
    snapshotsResult,
    wasteEventsResult,
    recipesResult,
    profileResult,
  ] = await Promise.all([
    getInventoryItems(userId),
    getLowStockItems(userId),
    getExpiringItems(userId),
    getTotalInventoryValue(userId),
    supabase
      .from('waste_analysis_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false }),
    supabase
      .from('waste_events')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false }),
    supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('profiles')
      .select('monthly_budget')
      .eq('id', userId)
      .single(),
  ])

  const snapshots = (snapshotsResult.data ?? []) as WasteAnalysisSnapshot[]
  const wasteEvents = (wasteEventsResult.data ?? []) as WasteEvent[]
  const recipes = (recipesResult.data ?? []) as Recipe[]
  const monthlyBudget = (profileResult.data as { monthly_budget: number | null } | null)?.monthly_budget ?? null

  return (
    <AnalyticsPageClient
      inventoryItems={inventoryItems}
      lowStockItems={lowStockItems}
      expiringItems={expiringItems}
      totalInventoryValue={totalValue}
      snapshots={snapshots}
      wasteEvents={wasteEvents}
      recipes={recipes}
      monthlyBudget={monthlyBudget}
    />
  )
}
