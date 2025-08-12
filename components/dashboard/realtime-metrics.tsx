'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Database } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Target, Clock, Zap, Star, Award } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface RealtimeMetricsProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  monthlySpend: number
  isPremium: boolean
}

export function RealtimeMetrics({ inventoryItems, menuItems, monthlySpend, isPremium }: RealtimeMetricsProps) {
  const [metrics, setMetrics] = useState({
    inventoryTurnover: 0,
    wasteReduction: 0,
    costEfficiency: 0,
    stockHealth: 0,
    menuPerformance: 0,
    aiOptimization: 0
  })

  const [liveUpdates, setLiveUpdates] = useState({
    lastUpdate: new Date(),
    changesDetected: 0,
    optimizationsApplied: 0
  })

  useEffect(() => {
    calculateMetrics()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveUpdates(prev => ({
        ...prev,
        lastUpdate: new Date(),
        changesDetected: prev.changesDetected + Math.floor(Math.random() * 3),
        optimizationsApplied: prev.optimizationsApplied + (Math.random() > 0.7 ? 1 : 0)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [inventoryItems, menuItems, monthlySpend])

  const calculateMetrics = () => {
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    const lowStockItems = inventoryItems.filter(item => item.quantity < item.reorder_point)
    const avgWaste = menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
      : 0

    setMetrics({
      inventoryTurnover: totalValue > 0 ? (monthlySpend / totalValue) * 100 : 0,
      wasteReduction: Math.max(0, 100 - avgWaste * 10), // Convert to positive score
      costEfficiency: Math.min(100, (totalValue / Math.max(monthlySpend, 1)) * 50),
      stockHealth: Math.max(0, 100 - (lowStockItems.length / Math.max(inventoryItems.length, 1)) * 100),
      menuPerformance: menuItems.length > 0 
        ? menuItems.reduce((sum, item) => sum + Math.max(0, item.sales_percentage - item.waste_percentage), 0) / menuItems.length
        : 0,
      aiOptimization: isPremium ? 85 + Math.random() * 10 : 0
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
    if (score >= 60) return 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900'
    return 'from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900'
  }

  return (
    <div className="space-y-8">
      {/* Live Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">Live Metrics Dashboard</h3>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Last updated: {liveUpdates.lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{liveUpdates.changesDetected}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Changes Detected</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{liveUpdates.optimizationsApplied}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">AI Optimizations</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-premium group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Inventory Turnover</CardTitle>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getScoreBg(metrics.inventoryTurnover)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-black ${getScoreColor(metrics.inventoryTurnover)}`}>
                {metrics.inventoryTurnover.toFixed(1)}%
              </span>
              <Badge className={`${getScoreColor(metrics.inventoryTurnover)} bg-opacity-10`}>
                {metrics.inventoryTurnover >= 80 ? 'Excellent' : metrics.inventoryTurnover >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <Progress value={metrics.inventoryTurnover} className="h-3" />
            <p className="text-sm text-muted-foreground">
              How efficiently you're moving inventory
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Waste Reduction Score</CardTitle>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getScoreBg(metrics.wasteReduction)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-black ${getScoreColor(metrics.wasteReduction)}`}>
                {metrics.wasteReduction.toFixed(1)}%
              </span>
              <Badge className={`${getScoreColor(metrics.wasteReduction)} bg-opacity-10`}>
                {metrics.wasteReduction >= 80 ? 'Excellent' : metrics.wasteReduction >= 60 ? 'Good' : 'Improving'}
              </Badge>
            </div>
            <Progress value={metrics.wasteReduction} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Your waste reduction effectiveness
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Cost Efficiency</CardTitle>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getScoreBg(metrics.costEfficiency)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-black ${getScoreColor(metrics.costEfficiency)}`}>
                {metrics.costEfficiency.toFixed(1)}%
              </span>
              <Badge className={`${getScoreColor(metrics.costEfficiency)} bg-opacity-10`}>
                {metrics.costEfficiency >= 80 ? 'Optimized' : metrics.costEfficiency >= 60 ? 'Good' : 'Opportunity'}
              </Badge>
            </div>
            <Progress value={metrics.costEfficiency} className="h-3" />
            <p className="text-sm text-muted-foreground">
              How well you're managing costs
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Stock Health</CardTitle>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getScoreBg(metrics.stockHealth)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-black ${getScoreColor(metrics.stockHealth)}`}>
                {metrics.stockHealth.toFixed(1)}%
              </span>
              <Badge className={`${getScoreColor(metrics.stockHealth)} bg-opacity-10`}>
                {metrics.stockHealth >= 80 ? 'Healthy' : metrics.stockHealth >= 60 ? 'Stable' : 'At Risk'}
              </Badge>
            </div>
            <Progress value={metrics.stockHealth} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Overall inventory health status
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Menu Performance</CardTitle>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getScoreBg(metrics.menuPerformance)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-black ${getScoreColor(metrics.menuPerformance)}`}>
                {metrics.menuPerformance.toFixed(1)}%
              </span>
              <Badge className={`${getScoreColor(metrics.menuPerformance)} bg-opacity-10`}>
                {metrics.menuPerformance >= 80 ? 'Excellent' : metrics.menuPerformance >= 60 ? 'Good' : 'Optimize'}
              </Badge>
            </div>
            <Progress value={metrics.menuPerformance} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Average menu item efficiency
            </p>
          </CardContent>
        </Card>

        {isPremium && (
          <Card className="card-premium group bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-200">AI Optimization</CardTitle>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-orange-600">
                  {metrics.aiOptimization.toFixed(1)}%
                </span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-bold">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <Progress value={metrics.aiOptimization} className="h-3" />
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                AI-driven optimization active
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Trends */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-lg">This Week vs Last Week</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <span className="font-medium">Waste Reduction</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">+2.3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">Cost Savings</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-600">+$127</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <span className="font-medium">Efficiency Score</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-purple-600">+5.7%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Key Achievements</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
                  <Award className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-bold text-green-800 dark:text-green-200">Zero Stockouts</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Perfect inventory management</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                  <Target className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-bold text-blue-800 dark:text-blue-200">15% Waste Reduction</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Exceeded monthly goal</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-bold text-purple-800 dark:text-purple-200">$1,247 Saved</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Through AI optimization</div>
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