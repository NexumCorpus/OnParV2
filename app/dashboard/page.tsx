'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/main-layout'
import { BetaInventoryManager } from '@/components/inventory/beta-inventory-manager'
import { BetaWasteAnalytics } from '@/components/analytics/beta-waste-analytics'
import { BetaMobileInterface } from '@/components/mobile/beta-mobile-interface'
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
  Zap,
  Target,
  Calendar,
  Truck,
  ChefHat,
  Bell,
  FileText,
  Smartphone,
  Star
} from 'lucide-react'

// Beta-focused dashboard with immediate value demonstration
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const { isDesktop, isMobile } = useBreakpoint()
  
  // Realistic beta demo data that shows clear value
  const [metrics, setMetrics] = useState({
    totalInventoryValue: 12450,
    monthlySpend: 8200,
    lowStockItems: 8,
    expiringItems: 3,
    monthlySavings: 1250,
    wasteReduction: 18.5,
    efficiency: 94.2,
    alerts: 5,
    daysInBeta: 14,
    wasteBeforeBeta: 8.2,
    wasteAfterBeta: 6.7,
    projectedAnnualSavings: 15000
  })

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate realistic loading
    setTimeout(() => setLoading(false), 600)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading your restaurant insights...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Beta Success Banner */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    🎉 Beta Success: {metrics.wasteReduction}% Waste Reduction!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    You've saved ${metrics.monthlySavings.toLocaleString()} in {metrics.daysInBeta} days. 
                    On track for ${metrics.projectedAnnualSavings.toLocaleString()} annual savings!
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white px-4 py-2">
                BETA TESTER
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                  <p className="text-2xl font-bold">${metrics.totalInventoryValue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2% from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-600">${metrics.monthlySavings.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {metrics.wasteReduction}% waste reduction
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Need Attention</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.lowStockItems + metrics.expiringItems}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.lowStockItems} low stock, {metrics.expiringItems} expiring
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-bold">{metrics.efficiency}%</p>
                  <Progress value={metrics.efficiency} className="mt-2 h-2" />
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="waste" className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Waste</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waste Reduction Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span>Waste Reduction Progress</span>
                  </CardTitle>
                  <CardDescription>
                    Your waste percentage has dropped from {metrics.wasteBeforeBeta}% to {metrics.wasteAfterBeta}% since joining beta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Before OnPar</span>
                      <span className="text-sm font-medium">{metrics.wasteBeforeBeta}%</span>
                    </div>
                    <Progress value={metrics.wasteBeforeBeta * 10} className="h-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">After OnPar</span>
                      <span className="text-sm font-medium text-green-600">{metrics.wasteAfterBeta}%</span>
                    </div>
                    <Progress value={metrics.wasteAfterBeta * 10} className="h-3" />
                    
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        🎯 Improvement: {(metrics.wasteBeforeBeta - metrics.wasteAfterBeta).toFixed(1)}% reduction
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        This equals ${metrics.monthlySavings.toLocaleString()} in monthly savings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>
                    Common tasks for busy restaurant operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Plus className="h-6 w-6" />
                      <span className="text-xs">Add Item</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Package className="h-6 w-6" />
                      <span className="text-xs">Update Stock</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-xs">View Alerts</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-xs">Generate Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reduced pizza waste by 2.1%</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • Saved $45 this week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Restocked tomatoes - 50 lbs</p>
                      <p className="text-xs text-muted-foreground">4 hours ago • Auto-reorder triggered</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lettuce expires in 2 days</p>
                      <p className="text-xs text-muted-foreground">6 hours ago • Consider daily special</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab - Full Featured */}
          <TabsContent value="inventory">
            <BetaInventoryManager />
          </TabsContent>

          {/* Waste Analytics Tab - Full Featured */}
          <TabsContent value="waste">
            <BetaWasteAnalytics />
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardContent className="p-8 text-center">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Menu Performance & Recipe Costing</h3>
                <p className="text-muted-foreground mb-4">
                  Track menu item performance, calculate recipe costs, and optimize profit margins...
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Supplier Management</h3>
                <p className="text-muted-foreground mb-4">
                  Track supplier performance, compare prices, and automate ordering...
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Alerts & Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Intelligent alerts for low stock, expiring items, and cost overruns...
                </p>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Custom Reports & Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Generate detailed reports on waste, costs, and operational efficiency...
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Interface Tab - Full Featured */}
          <TabsContent value="mobile">
            <BetaMobileInterface />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}