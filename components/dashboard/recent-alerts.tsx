'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import type { InventoryItem } from '@/types'

interface RecentAlertsProps {
  lowStockItems: InventoryItem[]
  expiringItems: InventoryItem[]
}

export function RecentAlerts({ lowStockItems, expiringItems }: RecentAlertsProps) {
  const alerts: Array<{
    id: string
    icon: typeof AlertTriangle
    iconColor: string
    message: string
    severity: 'critical' | 'warning'
  }> = []

  for (const item of expiringItems.slice(0, 5)) {
    const daysLeft = item.expiry_date
      ? Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0
    alerts.push({
      id: `exp-${item.id}`,
      icon: daysLeft <= 1 ? AlertCircle : Clock,
      iconColor: daysLeft <= 1 ? 'text-red-500' : 'text-amber-500',
      message: daysLeft <= 0
        ? `${item.name} — expires today`
        : daysLeft === 1
          ? `${item.name} — expires tomorrow`
          : `${item.name} — ${daysLeft}d left`,
      severity: daysLeft <= 1 ? 'critical' : 'warning',
    })
  }

  for (const item of lowStockItems.slice(0, 5)) {
    alerts.push({
      id: `low-${item.id}`,
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      message: `${item.name} — ${item.quantity} ${item.unit} left`,
      severity: 'warning',
    })
  }

  // Sort critical first
  alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1
    if (a.severity !== 'critical' && b.severity === 'critical') return 1
    return 0
  })

  if (alerts.length === 0) return null

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Needs Attention</h2>
        <Link href="/inventory" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      <ul className="space-y-2" role="list">
        {alerts.slice(0, 8).map((alert) => {
          const Icon = alert.icon
          return (
            <li key={alert.id} className="flex items-center gap-2 text-sm">
              <Icon className={`h-4 w-4 shrink-0 ${alert.iconColor}`} aria-hidden="true" />
              <span className="text-muted-foreground truncate">{alert.message}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
