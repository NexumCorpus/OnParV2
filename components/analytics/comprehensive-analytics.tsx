'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Award,
  Clock,
  Users,
  Lightbulb
} from 'lucide-react'
import { Database } from '@/lib/supabase'
import { UserProfile, AnalyticsData, MetricCardData } from '@/types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface ComprehensiveAnalyticsProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  userProfile: UserProfile
  isPremium: boolean
}

interface AnalyticsData {
  totalInventoryValue: number
  monthlySpend: number
  wastePercentage: number
  savingsOpportunity: number
  topPerformingItems: MenuItem[]
  underperformingItems: MenuItem[]
  expiringItems: InventoryItem[]
  lowStockItems: InventoryItem[]
  costTrends: Array<{ date: string; value: number }>
  wasteTrends: Array<{ date: string; value: number }>
  categoryBreakdown: Array<{ category: string; value: number; percentage: number }>
}

export function ComprehensiveAnalytics({ 
  inventoryItems, 
  menuItems, 
  userProfile, 
  isPremium 
}: ComprehensiveAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const analyticsData = useMemo(() => {
    return calculateAnalytics(inventoryItems, menuItems, userProfile)
  }, [inventoryItems, menuItems, userProfile])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      restaurant: userProfile?.restaurant_name,
      timeRange,
      analytics: analyticsData
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onpar-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights for {userProfile?.restaurant_name || 'your restaurant'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inventory Value"
          value={`$${analyticsData.totalInventoryValue.toLocaleString()}`}
          change={+12.5}
          icon={Package}
          trend="up"
        />
        <MetricCard
          title="Monthly Food Spend"
          value={`$${analyticsData.monthlySpend.toLocaleString()}`}
          change={-3.2}
          icon={DollarSign}
          trend="down"
        />
        <MetricCard
          title="Waste Percentage"
          value={`${analyticsData.wastePercentage.toFixed(1)}%`}
          change={-15.8}
          icon={TrendingDown}
          trend="down"
          isGood={true}
        />
        <MetricCard
          title="Savings Opportunity"
          value={`$${analyticsData.savingsOpportunity.toLocaleString()}`}
          change={+8.7}
          icon={Target}
          trend="up"
          isGood={true}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="menu">Menu Performance</TabsTrigger>
          <TabsTrigger value="waste">Waste Analysis</TabsTrigger>
          <TabsTrigger value="forecasting" disabled={!isPremium}>
            AI Forecasting {!isPremium && <Badge variant="secondary" className="ml-1">Pro</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab analyticsData={analyticsData} isPremium={isPremium} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTab 
            inventoryItems={inventoryItems} 
            analyticsData={analyticsData}
            isPremium={isPremium}
          />
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <MenuPerformanceTab 
            menuItems={menuItems} 
            analyticsData={analyticsData}
            isPremium={isPremium}
          />
        </TabsContent>

        <TabsContent value="waste" className="space-y-4">
          <WasteAnalysisTab 
            analyticsData={analyticsData}
            isPremium={isPremium}
          />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          {isPremium ? (
            <ForecastingTab analyticsData={analyticsData} />
          ) : (
            <PremiumUpsell feature="AI Forecasting" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  isGood = false 
}: {
  title: string
  value: string
  change: number
  icon: any
  trend: 'up' | 'down'
  isGood?: boolean
}) {
  const isPositive = isGood ? change > 0 : change < 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' ? (
            <TrendingUp className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <TrendingDown className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Overview Tab Component
function OverviewTab({ analyticsData, isPremium }: { analyticsData: AnalyticsData; isPremium: boolean }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Waste Reduction Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Waste Reduction Goal
          </CardTitle>
          <CardDescription>
            Track your progress toward reducing food waste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {analyticsData.wastePercentage.toFixed(1)}%</span>
              <span>Goal: 5.0%</span>
            </div>
            <Progress 
              value={Math.max(0, (10 - analyticsData.wastePercentage) / 5 * 100)} 
              className="h-2"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {analyticsData.wastePercentage <= 5 ? (
              <span className="text-green-600 font-medium">🎉 Goal achieved! Great work!</span>
            ) : (
              <span>
                Reduce by {(analyticsData.wastePercentage - 5).toFixed(1)}% more to reach your goal
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Priority Alerts
          </CardTitle>
          <CardDescription>
            Items requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.expiringItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Expires {new Date(item.expiry_date!).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
            ))}
            {analyticsData.lowStockItems.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} remaining
                  </div>
                </div>
                <Badge variant="secondary">Low Stock</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Cost & Waste Trends
          </CardTitle>
          <CardDescription>
            Track your spending and waste patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Interactive charts coming soon</p>
              <p className="text-sm">Chart visualization will be implemented with a charting library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Inventory Tab Component
function InventoryTab({ 
  inventoryItems, 
  analyticsData, 
  isPremium 
}: { 
  inventoryItems: InventoryItem[]
  analyticsData: AnalyticsData
  isPremium: boolean 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory Value Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Value by Category</CardTitle>
          <CardDescription>
            Distribution of your inventory investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.categoryBreakdown.map((category, index) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{category.category}</span>
                  <span>${category.value.toLocaleString()} ({category.percentage.toFixed(1)}%)</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reorder Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Reorder Suggestions
            {isPremium && <Badge variant="secondary">AI-Powered</Badge>}
          </CardTitle>
          <CardDescription>
            Optimized ordering recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.lowStockItems.slice(0, 5).map((item) => {
              const suggestedQuantity = Math.ceil(item.reorder_point * 2.5)
              const estimatedCost = suggestedQuantity * item.price_per_unit
              
              return (
                <div key={item.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {item.quantity} {item.unit}
                      </div>
                    </div>
                    <Badge variant="outline">
                      Order {suggestedQuantity} {item.unit}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Estimated cost: ${estimatedCost.toFixed(2)}
                    {isPremium && (
                      <span className="ml-2 text-blue-600">
                        • AI optimized for 2-week supply
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Menu Performance Tab Component
function MenuPerformanceTab({ 
  menuItems, 
  analyticsData, 
  isPremium 
}: { 
  menuItems: MenuItem[]
  analyticsData: AnalyticsData
  isPremium: boolean 
}) {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Your most successful menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPerformingItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.sales_percentage.toFixed(1)}% of sales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {item.waste_percentage.toFixed(1)}% waste
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Needs Attention
            </CardTitle>
            <CardDescription>
              Items with optimization opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.underperformingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sales_percentage.toFixed(1)}% sales, {item.waste_percentage.toFixed(1)}% waste
                    </div>
                  </div>
                  <div className="text-right">
                    {isPremium ? (
                      <Badge variant="outline" className="text-xs">
                        AI Suggestions Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Review Needed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Waste Analysis Tab Component
function WasteAnalysisTab({ 
  analyticsData, 
  isPremium 
}: { 
  analyticsData: AnalyticsData
  isPremium: boolean 
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Waste Reduction Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of waste patterns and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.wastePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Current Waste Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${analyticsData.savingsOpportunity.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Savings Opportunity</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                15.8%
              </div>
              <div className="text-sm text-muted-foreground">Improvement This Month</div>
            </div>
          </div>

          {isPremium ? (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI-Powered Recommendations
              </h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="font-medium text-sm">Portion Size Optimization</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reduce Caesar Salad portions by 15% to cut waste while maintaining customer satisfaction
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Potential savings: $180/month</div>
                </div>
                <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="font-medium text-sm">Inventory Rotation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Implement FIFO system for dairy products to reduce expiration waste by 25%
                  </div>
                  <div className="text-xs text-green-600 mt-1">Potential savings: $240/month</div>
                </div>
                <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="font-medium text-sm">Menu Engineering</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Consider removing or reworking 3 low-performing items with high waste rates
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Potential savings: $320/month</div>
                </div>
              </div>
            </div>
          ) : (
            <PremiumUpsell feature="AI Waste Analysis" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Forecasting Tab Component
function ForecastingTab({ analyticsData }: { analyticsData: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Demand Forecasting
          </CardTitle>
          <CardDescription>
            Predictive analytics for inventory planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Next Week Forecast</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ground Beef</span>
                    <span className="font-medium">28 lbs needed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chicken Breast</span>
                    <span className="font-medium">22 lbs needed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fresh Mozzarella</span>
                    <span className="font-medium">12 lbs needed</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Seasonal Trends</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Soup ingredients</span>
                    <span className="text-green-600">↑ 15% (winter)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salad greens</span>
                    <span className="text-red-600">↓ 8% (winter)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hot beverages</span>
                    <span className="text-green-600">↑ 25% (winter)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Premium Upsell Component
function PremiumUpsell({ feature }: { feature: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Unlock {feature}</h3>
            <p className="text-muted-foreground">
              Get advanced AI insights and save an additional 10-15% on food costs
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Upgrade to Premium - $29/month
          </Button>
          <div className="text-xs text-muted-foreground">
            Typical premium users save an additional $300-500 monthly
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Analytics calculation function
function calculateAnalytics(
  inventoryItems: InventoryItem[], 
  menuItems: MenuItem[], 
  userProfile: UserProfile
): AnalyticsData {
  const totalInventoryValue = inventoryItems.reduce(
    (sum, item) => sum + (item.quantity * item.price_per_unit), 0
  )
  
  const monthlySpend = userProfile?.monthly_budget || totalInventoryValue * 0.8
  
  const avgWastePercentage = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
    : 5
  
  const savingsOpportunity = totalInventoryValue * (avgWastePercentage / 100) * 0.3
  
  const topPerformingItems = menuItems
    .filter(item => item.sales_percentage > 8 && item.waste_percentage < 5)
    .sort((a, b) => b.sales_percentage - a.sales_percentage)
    .slice(0, 5)
  
  const underperformingItems = menuItems
    .filter(item => item.sales_percentage < 5 || item.waste_percentage > 8)
    .sort((a, b) => b.waste_percentage - a.waste_percentage)
    .slice(0, 5)
  
  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiry_date) return false
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  })
  
  const lowStockItems = inventoryItems.filter(
    item => item.quantity <= item.reorder_point
  )
  
  // Mock data for trends and categories
  const costTrends = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: monthlySpend * (0.8 + Math.random() * 0.4)
  }))
  
  const wasteTrends = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: avgWastePercentage * (0.7 + Math.random() * 0.6)
  }))
  
  const categoryBreakdown = [
    { category: 'proteins', value: totalInventoryValue * 0.35, percentage: 35 },
    { category: 'produce', value: totalInventoryValue * 0.25, percentage: 25 },
    { category: 'dairy', value: totalInventoryValue * 0.15, percentage: 15 },
    { category: 'dry goods', value: totalInventoryValue * 0.15, percentage: 15 },
    { category: 'other', value: totalInventoryValue * 0.10, percentage: 10 }
  ]
  
  return {
    totalInventoryValue,
    monthlySpend,
    wastePercentage: avgWastePercentage,
    savingsOpportunity,
    topPerformingItems,
    underperformingItems,
    expiringItems,
    lowStockItems,
    costTrends,
    wasteTrends,
    categoryBreakdown
  }
}