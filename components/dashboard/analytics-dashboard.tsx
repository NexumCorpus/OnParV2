'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Stack, Inline } from '@/components/ui/spacing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardsGrid } from '@/components/ui/responsive-grid'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { InventoryChart } from '@/components/charts/inventory-chart'
import { WasteReductionChart } from '@/components/charts/waste-reduction-chart'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Leaf,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Award
} from 'lucide-react'

interface AnalyticsDashboardProps {
  data?: {
    revenue: Array<{
      period: string
      revenue: number
      target?: number
    }>
    inventory: Array<{
      name: string
      category: string
      currentStock: number
      reorderPoint: number
      maxStock: number
      value: number
      status: 'good' | 'low' | 'critical' | 'overstock'
      daysUntilExpiry?: number
    }>
    waste: Array<{
      period: string
      wasteAmount: number
      wasteValue: number
      wastePercentage: number
      savings?: number
    }>
  }
  loading?: boolean
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  onPeriodChange?: (period: string) => void
  onRefresh?: () => void
}

export function AnalyticsDashboard({ 
  data = {
    revenue: [
      { period: 'Jan', revenue: 42000, target: 45000 },
      { period: 'Feb', revenue: 38000, target: 45000 },
      { period: 'Mar', revenue: 45000, target: 45000 },
      { period: 'Apr', revenue: 48000, target: 45000 },
      { period: 'May', revenue: 52000, target: 45000 },
      { period: 'Jun', revenue: 49000, target: 45000 },
    ],
    inventory: [
      { name: 'Tomatoes', category: 'Vegetables', currentStock: 50, reorderPoint: 20, maxStock: 100, value: 150, status: 'good' },
      { name: 'Chicken Breast', category: 'Meat', currentStock: 15, reorderPoint: 25, maxStock: 80, value: 300, status: 'low' },
      { name: 'Flour', category: 'Dry Goods', currentStock: 5, reorderPoint: 15, maxStock: 50, value: 75, status: 'critical' },
      { name: 'Olive Oil', category: 'Oils', currentStock: 45, reorderPoint: 10, maxStock: 30, value: 200, status: 'overstock' },
      { name: 'Lettuce', category: 'Vegetables', currentStock: 25, reorderPoint: 15, maxStock: 40, value: 80, status: 'good', daysUntilExpiry: 3 },
    ],
    waste: [
      { period: 'Jan', wasteAmount: 45, wasteValue: 850, wastePercentage: 8.5, savings: 0 },
      { period: 'Feb', wasteAmount: 42, wasteValue: 780, wastePercentage: 7.8, savings: 70 },
      { period: 'Mar', wasteAmount: 38, wasteValue: 720, wastePercentage: 7.2, savings: 130 },
      { period: 'Apr', wasteAmount: 35, wasteValue: 650, wastePercentage: 6.5, savings: 200 },
      { period: 'May', wasteAmount: 32, wasteValue: 580, wastePercentage: 5.8, savings: 270 },
      { period: 'Jun', wasteAmount: 28, wasteValue: 520, wastePercentage: 5.2, savings: 330 },
    ]
  },
  loading = false,
  period = 'monthly',
  onPeriodChange,
  onRefresh
}: AnalyticsDashboardProps) {
  const { isDesktop, isMobile } = useBreakpoint()
  const [activeTab, setActiveTab] = React.useState('overview')

  // Calculate summary metrics
  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.revenue, 0)
  const totalInventoryValue = data.inventory.reduce((sum, item) => sum + item.value, 0)
  const currentWastePercentage = data.waste[data.waste.length - 1]?.wastePercentage || 0
  const totalSavings = data.waste.reduce((sum, item) => sum + (item.savings || 0), 0)

  const criticalItems = data.inventory.filter(item => item.status === 'critical').length
  const lowStockItems = data.inventory.filter(item => item.status === 'low').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            Analytics Dashboard
          </Typography>
          <Typography variant="body" color="muted">
            Comprehensive insights into your restaurant's performance
          </Typography>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="small" color="muted">Total Revenue</Typography>
              <Typography variant="h3" weight="bold" color="success">
                ${totalRevenue.toLocaleString()}
              </Typography>
            </div>
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="small" color="muted">Inventory Value</Typography>
              <Typography variant="h3" weight="bold">
                ${totalInventoryValue.toLocaleString()}
              </Typography>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="small" color="muted">Current Waste</Typography>
              <Typography variant="h3" weight="bold" color="warning">
                {currentWastePercentage.toFixed(1)}%
              </Typography>
            </div>
            <div className="p-2 bg-warning/10 rounded-lg">
              <Leaf className="w-5 h-5 text-warning" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="small" color="muted">Total Savings</Typography>
              <Typography variant="h3" weight="bold" color="success">
                ${totalSavings.toLocaleString()}
              </Typography>
            </div>
            <div className="p-2 bg-success/10 rounded-lg">
              <Award className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="waste">Waste</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CardsGrid gap={6} minItemWidth="400px">
            <RevenueChart
              data={data.revenue}
              title="Revenue Overview"
              period={period}
              target={45000}
              loading={loading}
            />
            
            <WasteReductionChart
              data={data.waste}
              title="Waste Reduction"
              targetReduction={20}
              loading={loading}
            />
          </CardsGrid>

          {/* Alerts */}
          {(criticalItems > 0 || lowStockItems > 0) && (
            <Card variant="warning" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="label" weight="semibold" className="mb-2 block">
                    Attention Required
                  </Typography>
                  <div className="space-y-1">
                    {criticalItems > 0 && (
                      <Typography variant="small" color="destructive">
                        {criticalItems} items at critical stock levels
                      </Typography>
                    )}
                    {lowStockItems > 0 && (
                      <Typography variant="small" color="warning">
                        {lowStockItems} items running low
                      </Typography>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart
            data={data.revenue}
            title="Detailed Revenue Analysis"
            period={period}
            target={45000}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryChart
            data={data.inventory}
            title="Inventory Management"
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <WasteReductionChart
            data={data.waste}
            title="Waste Reduction Analytics"
            targetReduction={20}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}