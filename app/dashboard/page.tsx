'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ModernCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/modern-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MetricCard } from '@/components/ui/metric-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardLayout } from '@/components/layout/main-layout'
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
  
  // Memoized metrics to prevent unnecessary re-renders
  const metrics = useMemo(() => ({
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
  }), [])

  // Memoized calculations
  const calculatedMetrics = useMemo(() => ({
    totalAttentionItems: metrics.lowStockItems + metrics.expiringItems,
    wasteImprovement: (metrics.wasteBeforeBeta - metrics.wasteAfterBeta).toFixed(1),
    efficiencyTrend: "+12% this month"
  }), [metrics])

  const handleLoadingComplete = useCallback(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    // Optimized loading with cleanup
    const timer = setTimeout(handleLoadingComplete, 600)
    return () => clearTimeout(timer)
  }, [handleLoadingComplete])

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
      <div className="space-y-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl"></div>
          <ModernCard gradient="blue" className="relative border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-green-500/25">
                        <Star className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        🎉 Beta Success Story!
                      </h1>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {metrics.wasteReduction}% Waste Reduction Achieved
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        You've saved <span className="font-bold text-green-600">${metrics.monthlySavings.toLocaleString()}</span> in just {metrics.daysInBeta} days!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        On track for <span className="font-semibold">${metrics.projectedAnnualSavings.toLocaleString()}</span> annual savings
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 text-lg font-bold shadow-lg">
                      ⭐ BETA PIONEER
                    </Badge>
                    <GradientButton variant="success" size="lg" glow>
                      <Sparkles className="h-5 w-5 mr-2" />
                      View Full Report
                    </GradientButton>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          </div>

          {/* Modern Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Inventory Value"
              value={`$${metrics.totalInventoryValue.toLocaleString()}`}
              subtitle="Current stock value"
              icon={Package}
              trend={{
                value: "+5.2% from last month",
                positive: true,
                icon: TrendingUp
              }}
              gradient="blue"
            />

            <MetricCard
              title="Monthly Savings"
              value={`$${metrics.monthlySavings.toLocaleString()}`}
              subtitle={`${metrics.wasteReduction}% waste reduction`}
              icon={DollarSign}
              trend={{
                value: `${metrics.wasteReduction}% improvement`,
                positive: true,
                icon: ArrowUpRight
              }}
              gradient="green"
            />

            <MetricCard
              title="Items Need Attention"
              value={metrics.lowStockItems + metrics.expiringItems}
              subtitle={`${metrics.lowStockItems} low stock, ${metrics.expiringItems} expiring`}
              icon={AlertTriangle}
              gradient="orange"
            />

            <MetricCard
              title="Efficiency Score"
              value={`${metrics.efficiency}%`}
              subtitle="Operational efficiency"
              icon={Target}
              trend={{
                value: "+12% this month",
                positive: true,
                icon: TrendingUp
              }}
              gradient="purple"
            />
          </div>

          {/* Modern Navigation Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Restaurant Management Hub
              </h2>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                8 Modules Available
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/dashboard/inventory">
                <ModernCard gradient="blue" className="cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Smart Inventory</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI-powered inventory tracking with waste reduction insights
                    </p>
                    <GradientButton variant="primary" size="sm" className="w-full">
                      Manage Inventory
                    </GradientButton>
                  </CardContent>
                </ModernCard>
              </Link>

              <Link href="/dashboard/analytics">
                <ModernCard gradient="green" className="cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                      <TrendingDown className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Waste Analytics</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deep insights into waste patterns and cost optimization
                    </p>
                    <GradientButton variant="success" size="sm" className="w-full">
                      View Analytics
                    </GradientButton>
                  </CardContent>
                </ModernCard>
              </Link>

              <ModernCard gradient="purple" className="cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Menu Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recipe costing and menu performance tracking
                  </p>
                  <GradientButton variant="purple" size="sm" className="w-full">
                    Coming Soon
                  </GradientButton>
                </CardContent>
              </ModernCard>

              <Link href="/dashboard/mobile">
                <ModernCard gradient="cyan" className="cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Mobile Interface</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Kitchen-optimized mobile experience
                    </p>
                    <GradientButton variant="info" size="sm" className="w-full">
                      Try Mobile
                    </GradientButton>
                  </CardContent>
                </ModernCard>
              </Link>

              <ModernCard gradient="orange" className="cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Intelligent notifications for critical items
                  </p>
                  <GradientButton variant="warning" size="sm" className="w-full">
                    Configure
                  </GradientButton>
                </CardContent>
              </ModernCard>

              <ModernCard gradient="pink" className="cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Supplier Hub</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage suppliers and automate ordering
                  </p>
                  <GradientButton variant="danger" size="sm" className="w-full">
                    Coming Soon
                  </GradientButton>
                </CardContent>
              </ModernCard>

              <ModernCard gradient="blue" className="cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Reports</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Custom reports and business intelligence
                  </p>
                  <GradientButton variant="primary" size="sm" className="w-full">
                    Generate
                  </GradientButton>
                </CardContent>
              </ModernCard>

              <ModernCard gradient="green" className="cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">AI Insights</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Machine learning recommendations
                  </p>
                  <GradientButton variant="success" size="sm" className="w-full">
                    View Insights
                  </GradientButton>
                </CardContent>
              </ModernCard>
            </div>
          </div>

          {/* Modern Overview Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Waste Reduction Progress */}
            <ModernCard gradient="green" glow>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Waste Reduction Journey</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Your transformation from {metrics.wasteBeforeBeta}% to {metrics.wasteAfterBeta}% waste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Before OnPar</span>
                    <span className="text-lg font-bold text-red-500">{metrics.wasteBeforeBeta}%</span>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-red-200 to-red-300 dark:from-red-900 dark:to-red-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.wasteBeforeBeta * 10}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">After OnPar</span>
                    <span className="text-lg font-bold text-green-600">{metrics.wasteAfterBeta}%</span>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.wasteAfterBeta * 10}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-bold text-green-800 dark:text-green-200">
                      🎯 {(metrics.wasteBeforeBeta - metrics.wasteAfterBeta).toFixed(1)}% Improvement
                    </h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Monthly savings: ${metrics.monthlySavings.toLocaleString()}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    Annual projection: ${metrics.projectedAnnualSavings.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </ModernCard>

            {/* Quick Actions Hub */}
            <ModernCard gradient="blue" glow>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Essential tools for daily restaurant operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <GradientButton variant="primary" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-8 w-8" />
                    <span className="font-semibold">Add Item</span>
                  </GradientButton>
                  <GradientButton variant="success" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <Package className="h-8 w-8" />
                    <span className="font-semibold">Update Stock</span>
                  </GradientButton>
                  <GradientButton variant="warning" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <AlertTriangle className="h-8 w-8" />
                    <span className="font-semibold">View Alerts</span>
                  </GradientButton>
                  <GradientButton variant="info" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8" />
                    <span className="font-semibold">Reports</span>
                  </GradientButton>
                </div>
              </CardContent>
            </ModernCard>
          </div>

          {/* Recent Activity Stream */}
          <ModernCard gradient="purple" className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Live Activity Stream</span>
              </CardTitle>
              <CardDescription className="text-base">
                Real-time updates from your restaurant operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 dark:text-green-200">Pizza waste reduced by 2.1%</p>
                    <p className="text-sm text-green-600 dark:text-green-400">2 hours ago • Saved $45 this week</p>
                  </div>
                  <Badge className="bg-green-600 text-white">+$45</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Restocked tomatoes - 50 lbs</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">4 hours ago • Auto-reorder triggered</p>
                  </div>
                  <Badge className="bg-blue-600 text-white">Auto</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800 dark:text-orange-200">Lettuce expires in 2 days</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">6 hours ago • Consider daily special</p>
                  </div>
                  <Badge className="bg-orange-600 text-white">Alert</Badge>
                </div>
              </div>
            </CardContent>
          </ModernCard>

        </div>
      </div>
    </DashboardLayout>
  )
}