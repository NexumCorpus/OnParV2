import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getCount,
  getLowStockItems,
  getExpiringItems,
  getTotalInventoryValue,
  calculateEstimatedSavings,
  getInventoryItems,
} from '@/lib/services/inventory'
import { Button } from '@/components/ui/button'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentAlerts } from '@/components/dashboard/recent-alerts'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import type { WasteAnalysisSnapshot } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  // Fetch ALL dashboard data in PARALLEL for performance
  const [
    totalItems,
    lowStockItems,
    expiringItems,
    totalValue,
    savings,
    snapshotResult,
    insightsResult,
    inventoryItems,
    profileResult,
  ] = await Promise.all([
    getCount(userId),
    getLowStockItems(userId),
    getExpiringItems(userId),
    getTotalInventoryValue(userId),
    calculateEstimatedSavings(userId),
    supabase
      .from('waste_analysis_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false })
      .limit(1),
    supabase
      .from('ai_insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending'),
    getInventoryItems(userId),
    supabase
      .from('users')
      .select('monthly_budget, restaurant_name')
      .eq('id', userId)
      .maybeSingle(),
  ])

  const latestSnapshot = (snapshotResult.data?.[0] ?? null) as WasteAnalysisSnapshot | null
  const monthlySpend = latestSnapshot?.monthly_spend ?? 0
  const profile = profileResult.data as { monthly_budget: number | null; restaurant_name: string | null } | null
  const monthlyBudget = profile?.monthly_budget ?? null
  const restaurantName = profile?.restaurant_name ?? null

  const stats = {
    totalItems,
    lowStockCount: lowStockItems.length,
    expiringCount: expiringItems.length,
    totalValue,
    monthlySpend,
    budgetUsed: monthlyBudget ? (monthlySpend / monthlyBudget) * 100 : 0,
    wasteRate: latestSnapshot?.average_waste_percentage ?? 0,
    potentialSavings: savings.totalSavings,
    activeInsights: insightsResult.count ?? 0,
    monthlyBudget,
  }

  // Prepare chart data
  // Inventory by category (Pie chart)
  const categoryValueMap = new Map<string, number>()
  for (const item of inventoryItems) {
    const value = item.quantity * item.price_per_unit
    categoryValueMap.set(
      item.category,
      (categoryValueMap.get(item.category) ?? 0) + value
    )
  }
  const categoryPieData = Array.from(categoryValueMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value: Math.round(value) }))

  // Waste trend data from snapshots (last 6)
  const { data: recentSnapshotsRaw } = await supabase
    .from('waste_analysis_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('analysis_date', { ascending: true })
    .limit(6)

  const recentSnapshots = (recentSnapshotsRaw ?? []) as WasteAnalysisSnapshot[]
  const wasteTrendData = recentSnapshots.map((s) => ({
    label: new Date(s.analysis_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: Number(s.average_waste_percentage.toFixed(1)),
    benchmark: 5,
  }))

  // Greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {restaurantName && (
            <p className="text-sm text-muted-foreground">{restaurantName}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {greeting}, {user.email?.split('@')[0] ?? 'there'}
        </p>
      </header>

      {/* Empty state when zero items */}
      {totalItems === 0 ? (
        <>
          {/* KPI cards still show zeroes */}
          <KpiCards stats={stats} />

          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to OnPar!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first inventory items to see your dashboard come alive with
              real-time KPIs, charts, and AI insights.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link href="/inventory/add">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Your First Item
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/inventory">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Import CSV
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick actions still render */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2" />
            <QuickActions />
          </div>
        </>
      ) : (
        <>
          {/* KPI Cards */}
          <KpiCards stats={stats} />

          {/* Charts */}
          <DashboardCharts
            categoryPieData={categoryPieData}
            wasteTrendData={wasteTrendData}
          />

          {/* Quick Actions + Recent Alerts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <QuickActions />
            <RecentAlerts
              lowStockItems={lowStockItems}
              expiringItems={expiringItems}
            />
          </div>
        </>
      )}
    </div>
  )
}
