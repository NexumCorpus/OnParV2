'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  for (const item of expiringItems.slice(0, 3)) {
    const daysLeft = item.expiry_date
      ? Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0
    alerts.push({
      id: `exp-${item.id}`,
      icon: daysLeft <= 1 ? AlertCircle : Clock,
      iconColor: daysLeft <= 1 ? 'text-red-500' : 'text-amber-500',
      message: daysLeft <= 0
        ? `${item.name} expires today`
        : daysLeft === 1
          ? `${item.name} expires tomorrow`
          : `${item.name} expires in ${daysLeft} days`,
      severity: daysLeft <= 1 ? 'critical' : 'warning',
    })
  }

  for (const item of lowStockItems.slice(0, 3)) {
    alerts.push({
      id: `low-${item.id}`,
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      message: `${item.name} is low stock (${item.quantity} ${item.unit})`,
      severity: 'warning',
    })
  }

  // Sort critical first
  alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1
    if (a.severity !== 'critical' && b.severity === 'critical') return 1
    return 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts at this time.</p>
        ) : (
          <ul className="space-y-3" role="list">
            {alerts.slice(0, 5).map((alert) => {
              const Icon = alert.icon
              return (
                <li key={alert.id} className="flex items-start gap-2 text-sm">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${alert.iconColor}`} aria-hidden="true" />
                  <span className="text-muted-foreground">{alert.message}</span>
                </li>
              )
            })}
          </ul>
        )}
        <Button variant="link" className="mt-3 h-auto p-0 text-sm" asChild>
          <Link href="/inventory">View All Alerts</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
