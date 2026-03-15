import { createClient } from '@/lib/supabase/server'
import type { InventoryItem, WasteAnalysisSnapshot } from '@/types'

export interface AppNotification {
  id: string
  type: 'low_stock' | 'expiring_soon' | 'waste_alert' | 'budget_warning' | 'insight_available'
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  actionUrl?: string
  createdAt: Date
}

function generateId(type: string, itemId: string): string {
  // Deterministic ID for dedup
  return `${type}-${itemId}`
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = await createClient()
  const notifications: AppNotification[] = []
  const now = new Date()

  // Run all checks in PARALLEL
  const [lowStockResult, expiringResult, snapshotResult, profileResult, insightsResult] =
    await Promise.all([
      // 1. Low stock items
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .filter('quantity', 'lt', 'reorder_point' as unknown as number),

      // 2. Expiring items (within 3 days)
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', now.toISOString().split('T')[0])
        .lte(
          'expiry_date',
          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ),

      // 3. Latest waste snapshot
      supabase
        .from('waste_analysis_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('analysis_date', { ascending: false })
        .limit(1),

      // 4. User profile for budget
      supabase
        .from('profiles')
        .select('monthly_budget')
        .eq('id', userId)
        .single(),

      // 5. Pending insights count
      supabase
        .from('ai_insights')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
    ])

  // 1. Low stock notifications
  const lowStockItems = (lowStockResult.data ?? []) as InventoryItem[]
  for (const item of lowStockItems) {
    notifications.push({
      id: generateId('low_stock', item.id),
      type: 'low_stock',
      title: 'Low Stock',
      message: `${item.name} is below reorder point (${item.quantity} ${item.unit} remaining)`,
      severity: 'warning',
      actionUrl: '/inventory',
      createdAt: new Date(item.updated_at),
    })
  }

  // 2. Expiring soon notifications
  const expiringItems = (expiringResult.data ?? []) as InventoryItem[]
  for (const item of expiringItems) {
    const daysLeft = item.expiry_date
      ? Math.ceil(
          (new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0
    notifications.push({
      id: generateId('expiring_soon', item.id),
      type: 'expiring_soon',
      title: 'Expiring Soon',
      message:
        daysLeft <= 1
          ? `${item.name} expires ${daysLeft <= 0 ? 'today' : 'tomorrow'}`
          : `${item.name} expires in ${daysLeft} days`,
      severity: daysLeft <= 1 ? 'critical' : 'warning',
      actionUrl: '/inventory',
      createdAt: new Date(item.updated_at),
    })
  }

  // 3. Waste alert
  const latestSnapshot = (snapshotResult.data?.[0] ?? null) as WasteAnalysisSnapshot | null
  if (latestSnapshot && latestSnapshot.average_waste_percentage > 10) {
    notifications.push({
      id: generateId('waste_alert', latestSnapshot.id),
      type: 'waste_alert',
      title: 'High Waste Rate',
      message: `Average waste rate is ${latestSnapshot.average_waste_percentage.toFixed(1)}% — above the 10% threshold`,
      severity: 'warning',
      actionUrl: '/waste',
      createdAt: new Date(latestSnapshot.created_at),
    })
  }

  // 4. Budget warning
  const monthlyBudget = (profileResult.data as { monthly_budget: number | null } | null)
    ?.monthly_budget
  if (monthlyBudget && latestSnapshot) {
    const budgetUsedPct = (latestSnapshot.monthly_spend / monthlyBudget) * 100
    if (budgetUsedPct > 80) {
      notifications.push({
        id: generateId('budget_warning', 'budget'),
        type: 'budget_warning',
        title: budgetUsedPct >= 100 ? 'Over Budget' : 'Budget Warning',
        message: `Monthly spend is at ${budgetUsedPct.toFixed(0)}% of your $${monthlyBudget.toLocaleString()} budget`,
        severity: budgetUsedPct >= 100 ? 'critical' : 'warning',
        actionUrl: '/analytics',
        createdAt: new Date(latestSnapshot.created_at),
      })
    }
  }

  // 5. Pending insights
  const pendingCount = insightsResult.count ?? 0
  if (pendingCount > 0) {
    notifications.push({
      id: generateId('insight_available', 'insights'),
      type: 'insight_available',
      title: 'New AI Insights',
      message: `${pendingCount} pending insight${pendingCount > 1 ? 's' : ''} available for review`,
      severity: 'info',
      actionUrl: '/insights',
      createdAt: now,
    })
  }

  // Sort: critical first, then warning, then info; within same severity, newest first
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 }
  notifications.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  // Max 20
  return notifications.slice(0, 20)
}
