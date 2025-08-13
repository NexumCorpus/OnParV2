'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/main-layout'
import { ModernCard, CardContent } from '@/components/ui/modern-card'
import { MetricCard } from '@/components/ui/metric-card'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { DollarSign, Package, AlertTriangle, TrendingDown } from 'lucide-react'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const { isDesktop, isMobile } = useBreakpoint()
  
  const metrics = useMemo(() => ({
    totalInventoryValue: 12450,
    monthlySpend: 8200,
    lowStockItems: 8,
    expiringItems: 3,
    monthlySavings: 1250,
    wasteReduction: 18.5
  }), [])

  const handleLoadingComplete = useCallback(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Inventory Value"
            value={`$${metrics.totalInventoryValue.toLocaleString()}`}
            subtitle="Current stock value"
            icon={DollarSign}
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
            title="Waste Reduction"
            value={`${metrics.wasteReduction}%`}
            subtitle="Since using OnPar"
            icon={TrendingDown}
            gradient="purple"
          />
          <MetricCard
            title="Monthly Savings"
            value={`$${metrics.monthlySavings.toLocaleString()}`}
            subtitle="Cost reduction"
            icon={Package}
            gradient="blue"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}