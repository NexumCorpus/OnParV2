'use client'

import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardStats {
  totalItems: number
  lowStockCount: number
  expiringCount: number
  totalValue: number
  monthlySpend: number
  budgetUsed: number
  wasteRate: number
  potentialSavings: number
  activeInsights: number
  monthlyBudget: number | null
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value.toFixed(0)}`
}

export function KpiCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: 'Low Stock',
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      iconColor: stats.lowStockCount > 0 ? 'text-amber-500' : 'text-muted-foreground',
      urgent: stats.lowStockCount > 0,
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringCount.toString(),
      icon: Clock,
      iconColor: stats.expiringCount > 0 ? 'text-red-500' : 'text-muted-foreground',
      urgent: stats.expiringCount > 0,
    },
    {
      title: 'Total Items',
      value: stats.totalItems.toString(),
      icon: Package,
      iconColor: 'text-brand-600',
      urgent: false,
    },
    {
      title: 'Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      iconColor: 'text-brand-600',
      urgent: false,
    },
  ]

  return (
    <section aria-label="Key metrics">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className={card.urgent ? 'border-amber-500/40' : ''}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-5 w-5 shrink-0 ${card.iconColor}`} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-2xl font-bold leading-none">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
