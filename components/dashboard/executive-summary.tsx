'use client'

import * as React from 'react'
import { 
  MetricCard, 
  RevenueCard, 
  PercentageCard, 
  CountCard, 
  StatusCard,
  MetricCardGrid 
} from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress, CircularProgress } from '@/components/ui/progress'
import { Typography } from '@/components/ui/typography'
import { Stack, Inline } from '@/components/ui/spacing'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Users,
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react'

interface ExecutiveSummaryProps {
  data?: {
    totalRevenue: number
    revenueGrowth: number
    totalInventoryValue: number
    inventoryTurnover: number
    monthlySavings: number
    savingsGrowth: number
    wasteReduction: number
    wasteTarget: number
    lowStockItems: number
    expiringItems: number
    efficiency: number
    customerSatisfaction: number
    ordersFulfilled: number
    totalOrders: number
    avgOrderValue: number
    orderValueGrowth: number
  }
  loading?: boolean
  period?: string
}

export function ExecutiveSummary({ 
  data = {
    totalRevenue: 45250,
    revenueGrowth: 12.5,
    totalInventoryValue: 12450,
    inventoryTurnover: 8.2,
    monthlySavings: 1250,
    savingsGrowth: 18.5,
    wasteReduction: 15.8,
    wasteTarget: 20,
    lowStockItems: 8,
    expiringItems: 3,
    efficiency: 94.2,
    customerSatisfaction: 4.8,
    ordersFulfilled: 1247,
    totalOrders: 1285,
    avgOrderValue: 35.20,
    orderValueGrowth: 8.3,
  },
  loading = false,
  period = 'this month'
}: ExecutiveSummaryProps) {
  const { isDesktop, isMobile } = useBreakpoint()

  const fulfillmentRate = (data.ordersFulfilled / data.totalOrders) * 100

  return (
    <div className="space-y-8">
      {/* Primary Metrics */}
      <div>
        <div className="mb-6">
          <Typography variant="h2" weight="bold" className="mb-2">
            Executive Summary
          </Typography>
          <Typography variant="body" color="muted">
            Key performance indicators for {period}
          </Typography>
        </div>

        <MetricCardGrid columns={isDesktop ? 4 : isMobile ? 1 : 2} gap={6}>
          <RevenueCard
            title="Total Revenue"
            value={`$${data.totalRevenue.toLocaleString()}`}
            trend={{
              value: data.revenueGrowth,
              label: 'vs last month',
              isPositive: data.revenueGrowth > 0,
            }}
            description="Monthly revenue performance"
            variant="elevated"
            loading={loading}
          />

          <MetricCard
            title="Inventory Value"
            value={`$${data.totalInventoryValue.toLocaleString()}`}
            icon={Package}
            iconColor="bg-secondary/10 text-secondary group-hover:bg-secondary/20"
            trend={{
              value: 5.2,
              label: 'vs last month',
              isPositive: true,
            }}
            description="Current stock valuation"
            variant="elevated"
            loading={loading}
          />

          <MetricCard
            title="Monthly Savings"
            value={`$${data.monthlySavings.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="bg-success/10 text-success group-hover:bg-success/20"
            trend={{
              value: data.savingsGrowth,
              label: 'waste reduction',
              isPositive: data.savingsGrowth > 0,
            }}
            description="Cost savings achieved"
            variant="success"
            loading={loading}
          />

          <PercentageCard
            title="Operational Efficiency"
            value={`${data.efficiency}%`}
            trend={{
              value: 2.1,
              label: 'improvement',
              isPositive: true,
            }}
            progress={{
              value: data.efficiency,
              max: 100,
              label: 'Efficiency Score',
              variant: 'success',
            }}
            variant="elevated"
            loading={loading}
          />
        </MetricCardGrid>
      </div>

      {/* Secondary Metrics */}
      <div>
        <div className="mb-6">
          <Typography variant="h3" weight="semibold" className="mb-2">
            Operational Metrics
          </Typography>
          <Typography variant="body" color="muted">
            Detailed performance indicators
          </Typography>
        </div>

        <MetricCardGrid columns={isDesktop ? 3 : isMobile ? 1 : 2} gap={6}>
          <MetricCard
            title="Waste Reduction"
            value={`${data.wasteReduction}%`}
            icon={Target}
            iconColor="bg-warning/10 text-warning group-hover:bg-warning/20"
            progress={{
              value: data.wasteReduction,
              max: data.wasteTarget,
              label: `Target: ${data.wasteTarget}%`,
              variant: data.wasteReduction >= data.wasteTarget * 0.8 ? 'success' : 'warning',
            }}
            badge={{
              text: data.wasteReduction >= data.wasteTarget ? 'Target Met' : 'In Progress',
              variant: data.wasteReduction >= data.wasteTarget ? 'success' : 'warning',
            }}
            variant="gradient"
            loading={loading}
          />

          <MetricCard
            title="Inventory Turnover"
            value={`${data.inventoryTurnover}x`}
            icon={Activity}
            iconColor="bg-info/10 text-info group-hover:bg-info/20"
            trend={{
              value: 0.8,
              label: 'vs last month',
              isPositive: true,
            }}
            description="Annual turnover rate"
            variant="gradient"
            loading={loading}
          />

          <MetricCard
            title="Customer Satisfaction"
            value={`${data.customerSatisfaction}/5.0`}
            icon={Award}
            iconColor="bg-success/10 text-success group-hover:bg-success/20"
            trend={{
              value: 0.3,
              label: 'improvement',
              isPositive: true,
            }}
            progress={{
              value: (data.customerSatisfaction / 5) * 100,
              max: 100,
              label: 'Rating Score',
              variant: 'success',
            }}
            variant="gradient"
            loading={loading}
          />
        </MetricCardGrid>
      </div>

      {/* Alert Metrics */}
      <div>
        <div className="mb-6">
          <Typography variant="h3" weight="semibold" className="mb-2">
            Attention Required
          </Typography>
          <Typography variant="body" color="muted">
            Items that need immediate attention
          </Typography>
        </div>

        <MetricCardGrid columns={isDesktop ? 4 : isMobile ? 1 : 2} gap={6}>
          <StatusCard
            title="Low Stock Items"
            value={data.lowStockItems}
            status={data.lowStockItems > 10 ? 'error' : data.lowStockItems > 5 ? 'warning' : 'success'}
            description="Items below reorder point"
            badge={{
              text: data.lowStockItems > 5 ? 'Action Needed' : 'Good',
              variant: data.lowStockItems > 5 ? 'warning' : 'success',
            }}
            loading={loading}
          />

          <StatusCard
            title="Expiring Soon"
            value={data.expiringItems}
            status={data.expiringItems > 5 ? 'error' : data.expiringItems > 2 ? 'warning' : 'success'}
            description="Items expiring within 7 days"
            badge={{
              text: data.expiringItems > 2 ? 'Urgent' : 'Good',
              variant: data.expiringItems > 2 ? 'destructive' : 'success',
            }}
            loading={loading}
          />

          <MetricCard
            title="Order Fulfillment"
            value={`${fulfillmentRate.toFixed(1)}%`}
            icon={CheckCircle}
            iconColor="bg-success/10 text-success group-hover:bg-success/20"
            description={`${data.ordersFulfilled}/${data.totalOrders} orders`}
            progress={{
              value: fulfillmentRate,
              max: 100,
              label: 'Fulfillment Rate',
              variant: fulfillmentRate >= 95 ? 'success' : fulfillmentRate >= 90 ? 'warning' : 'destructive',
            }}
            variant={fulfillmentRate >= 95 ? 'success' : fulfillmentRate >= 90 ? 'warning' : 'destructive'}
            loading={loading}
          />

          <RevenueCard
            title="Avg Order Value"
            value={`$${data.avgOrderValue.toFixed(2)}`}
            trend={{
              value: data.orderValueGrowth,
              label: 'vs last month',
              isPositive: data.orderValueGrowth > 0,
            }}
            description="Average transaction value"
            loading={loading}
          />
        </MetricCardGrid>
      </div>

      {/* Performance Summary Card */}
      <Card variant="gradient" className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Performance Summary
              </CardTitle>
              <Typography variant="body" color="muted" className="mt-1">
                Overall business health indicators
              </Typography>
            </div>
            <Badge variant="success" className="animate-pulse">
              Excellent
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CircularProgress
                value={data.efficiency}
                size={80}
                strokeWidth={6}
                variant="success"
                showValue
                animated
                className="mx-auto mb-3"
              />
              <Typography variant="label" weight="semibold">
                Operational Efficiency
              </Typography>
              <Typography variant="small" color="muted">
                Above industry average
              </Typography>
            </div>

            <div className="text-center">
              <CircularProgress
                value={(data.wasteReduction / data.wasteTarget) * 100}
                size={80}
                strokeWidth={6}
                variant="warning"
                showValue
                animated
                className="mx-auto mb-3"
              />
              <Typography variant="label" weight="semibold">
                Waste Reduction Goal
              </Typography>
              <Typography variant="small" color="muted">
                {data.wasteReduction}% of {data.wasteTarget}% target
              </Typography>
            </div>

            <div className="text-center">
              <CircularProgress
                value={(data.customerSatisfaction / 5) * 100}
                size={80}
                strokeWidth={6}
                variant="info"
                showValue
                animated
                className="mx-auto mb-3"
              />
              <Typography variant="label" weight="semibold">
                Customer Satisfaction
              </Typography>
              <Typography variant="small" color="muted">
                {data.customerSatisfaction}/5.0 rating
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}