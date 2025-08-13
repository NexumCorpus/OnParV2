'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Typography, Display, Heading, Text } from '@/components/ui/typography'
import { Stack, Inline, Container, Section, Grid } from '@/components/ui/spacing'
import { MetricsGrid, CardsGrid } from '@/components/ui/responsive-grid'
import { DashboardLayout } from '@/components/layout/main-layout'
import { ExecutiveSummary } from '@/components/dashboard/executive-summary'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Clock,
  Plus,
  BarChart3,
  Users,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Zap
} from 'lucide-react'
import { AIInsightsDashboard } from '@/components/ai-insights-dashboard'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const { isDesktop, isMobile } = useBreakpoint()
  const [metrics, setMetrics] = useState({
    totalValue: 12450,
    monthlySpend: 8200,
    lowStockItems: 8,
    expiringItems: 3,
    monthlySavings: 1250,
    wasteReduction: 18.5,
    efficiency: 94.2,
    alerts: 5
  })

  useEffect(() => {
    // Simulate loading with realistic delay
    setTimeout(() => setLoading(false), 800)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Loading OnPar Dashboard</h3>
            <p className="text-muted-foreground">Preparing your restaurant insights...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's how your restaurant is performing today."
      actions={
        <Inline space={3} align="center">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button variant="gradient" size={isDesktop ? "lg" : "default"} className="shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </Inline>
      }
    >

      {/* Executive Summary */}
      <ExecutiveSummary
        data={{
          totalRevenue: 45250,
          revenueGrowth: 12.5,
          totalInventoryValue: metrics.totalValue,
          inventoryTurnover: 8.2,
          monthlySavings: metrics.monthlySavings,
          savingsGrowth: metrics.wasteReduction,
          wasteReduction: 15.8,
          wasteTarget: 20,
          lowStockItems: metrics.lowStockItems,
          expiringItems: metrics.expiringItems,
          efficiency: metrics.efficiency,
          customerSatisfaction: 4.8,
          ordersFulfilled: 1247,
          totalOrders: 1285,
          avgOrderValue: 35.20,
          orderValueGrowth: 8.3,
        }}
        loading={loading}
        period="this month"
      />

      {/* AI Insights Section */}
      <div className="mt-12">
        <AIInsightsDashboard isPremium={true} />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="mt-12">
        <CardsGrid gap={6} minItemWidth="400px">
          <Card variant="gradient" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Streamline your daily operations with one-click actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover:border-primary/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Add Inventory Item</div>
                    <div className="text-sm text-muted-foreground">Track new products and supplies</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4 hover:bg-secondary/5 hover:border-secondary/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-sm text-muted-foreground">View detailed analytics and insights</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4 hover:bg-info/5 hover:border-info/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Users className="w-4 h-4 text-info" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Manage Suppliers</div>
                    <div className="text-sm text-muted-foreground">Update contacts and orders</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Stay updated with the latest changes in your inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="p-2 bg-success/10 rounded-full">
                  <Package className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Tomatoes restocked</div>
                  <div className="text-sm text-muted-foreground">Added 20 lbs • 2 hours ago</div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  +20 lbs
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="p-2 bg-warning/10 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Low stock alert</div>
                  <div className="text-sm text-muted-foreground">Lettuce below threshold • 4 hours ago</div>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  Alert
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-info/5 border border-info/20">
                <div className="p-2 bg-info/10 rounded-full">
                  <BarChart3 className="w-4 h-4 text-info" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Weekly report generated</div>
                  <div className="text-sm text-muted-foreground">Performance summary • 1 day ago</div>
                </div>
                <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                  Report
                </Badge>
              </div>
            </CardContent>
          </Card>
        </CardsGrid>
      </div>
    </DashboardLayout>
  )
}