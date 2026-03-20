'use client'

import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard,
  TrendingDown,
  Lightbulb,
  Brain,
  PieChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      title: 'Total Items',
      value: stats.totalItems.toString(),
      subtitle: 'items in inventory',
      icon: Package,
      iconColor: 'text-brand-600',
    },
    {
      title: 'Low Stock',
      value: stats.lowStockCount.toString(),
      subtitle: 'items need attention',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringCount.toString(),
      subtitle: 'within 7 days',
      icon: Clock,
      iconColor: 'text-red-500',
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.totalValue),
      subtitle: 'inventory value',
      icon: DollarSign,
      iconColor: 'text-brand-600',
    },
    {
      title: 'Monthly Spend',
      value: formatCurrency(stats.monthlySpend),
      subtitle: stats.monthlyBudget
        ? `${stats.budgetUsed.toFixed(0)}% of ${formatCurrency(stats.monthlyBudget)}`
        : 'no budget set',
      icon: CreditCard,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Budget Used',
      value: stats.monthlyBudget ? `${stats.budgetUsed.toFixed(0)}%` : 'N/A',
      subtitle: stats.budgetUsed > 100 ? 'over budget' : stats.monthlyBudget ? 'of monthly budget' : 'set a budget in settings',
      icon: PieChart,
      iconColor: stats.budgetUsed > 100 ? 'text-red-500' : stats.budgetUsed > 80 ? 'text-amber-500' : 'text-brand-600',
    },
    {
      title: 'Waste Rate',
      value: `${stats.wasteRate.toFixed(1)}%`,
      subtitle: 'average waste',
      icon: TrendingDown,
      iconColor: stats.wasteRate > 10 ? 'text-red-500' : stats.wasteRate > 5 ? 'text-amber-500' : 'text-brand-600',
    },
    {
      title: 'Potential Savings',
      value: formatCurrency(stats.potentialSavings),
      subtitle: 'estimated monthly',
      icon: Lightbulb,
      iconColor: 'text-amber-500',
    },
    {
      title: 'AI Insights',
      value: stats.activeInsights.toString(),
      subtitle: 'pending insights',
      icon: Brain,
      iconColor: 'text-violet-500',
    },
  ]

  return (
    <section aria-label="Key performance indicators">
      <div className="grid gap-4 grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-xl min-[400px]:text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
