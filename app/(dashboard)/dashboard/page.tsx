import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  BarChart3,
  Upload,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const kpiCards = [
  {
    title: 'Total Items',
    value: '47',
    subtitle: '+3 new this week',
    icon: Package,
    iconColor: 'text-brand-600',
  },
  {
    title: 'Low Stock',
    value: '5',
    subtitle: 'Needs attention',
    icon: AlertTriangle,
    iconColor: 'text-warning-500',
  },
  {
    title: 'Expiring Soon',
    value: '8',
    subtitle: 'Within 7 days',
    icon: Clock,
    iconColor: 'text-danger-500',
  },
  {
    title: 'Monthly Spend',
    value: '$3,240',
    subtitle: '68% of budget',
    icon: DollarSign,
    iconColor: 'text-brand-600',
  },
]

const recentActivity = [
  'Added 5 lbs tomatoes',
  'Updated chicken price',
  'Low stock: Mozzarella',
  'Waste logged: lettuce',
  'AI: Reduce pizza waste',
]

const inventoryStatus = [
  { category: 'Produce', percentage: 85 },
  { category: 'Dairy', percentage: 62 },
  { category: 'Meat', percentage: 45 },
  { category: 'Pantry', percentage: 92 },
  { category: 'Seafood', percentage: 38 },
]

function getStatusColor(percentage: number): string {
  if (percentage >= 70) return 'bg-brand-500'
  if (percentage >= 50) return 'bg-warning-500'
  return 'bg-danger-500'
}

function getStatusIndicator(percentage: number): string {
  if (percentage >= 70) return ''
  if (percentage >= 50) return ''
  return ''
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">March 2026</p>
      </header>

      {/* KPI Cards */}
      <section aria-label="Key performance indicators">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <section className="lg:col-span-2" aria-label="Recent activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3" role="list">
                {recentActivity.map((activity) => (
                  <li
                    key={activity}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                    {activity}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick actions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
                <a href="/inventory">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Item
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
                <a href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Run Analysis
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
                <a href="/inventory">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Import CSV
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
                <a href="/analytics">
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Export Report
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Inventory Status */}
      <section aria-label="Inventory status by category">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryStatus.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">
                      {item.percentage}% {getStatusIndicator(item.percentage)}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-muted overflow-hidden"
                    role="progressbar"
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.category} stock level: ${item.percentage}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${getStatusColor(item.percentage)}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Screen reader accessible table */}
            <table className="sr-only">
              <caption>Inventory status by category</caption>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {inventoryStatus.map((item) => (
                  <tr key={item.category}>
                    <td>{item.category}</td>
                    <td>{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
