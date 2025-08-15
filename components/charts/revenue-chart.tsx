'use client'

import * as React from 'react'
import { ChartContainer, SimpleLineChart, ChartActions, chartUtils } from '../ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Typography } from '../ui/typography'
import { Stack, Inline } from '../ui/spacing'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Target
} from 'lucide-react'

interface RevenueData {
  period: string
  revenue: number
  target?: number
  previousPeriod?: number
}

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  target?: number
  loading?: boolean
  className?: string
}

export function RevenueChart({ 
  data, 
  title = 'Revenue Performance',
  period = 'monthly',
  target,
  loading = false,
  className 
}: RevenueChartProps) {
  const chartData = data.map(item => ({
    label: item.period,
    value: item.revenue,
  }))

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const averageRevenue = totalRevenue / data.length
  const trend = chartUtils.calculateTrend(chartData)
  
  const currentPeriodRevenue = data[data.length - 1]?.revenue || 0
  const previousPeriodRevenue = data[data.length - 2]?.revenue || 0
  const periodChange = previousPeriodRevenue > 0 
    ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
    : 0

  const targetProgress = target ? (currentPeriodRevenue / target) * 100 : null

  return (
    <ChartContainer
      title={title}
      description={`Revenue trends over the last ${data.length} ${period}s`}
      loading={loading}
      className={className}
      trend={{
        value: trend.value,
        label: `vs previous ${period}`,
        isPositive: trend.isPositive,
      }}
      actions={
        <ChartActions 
          onDownload={() => console.log('Download revenue chart')}
          onExpand={() => console.log('Expand revenue chart')}
        />
      }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/20">
            <Typography variant="h3" weight="bold" className="text-success">
              ${totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="small" color="muted">
              Total Revenue
            </Typography>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/20">
            <Typography variant="h3" weight="bold">
              ${averageRevenue.toLocaleString()}
            </Typography>
            <Typography variant="small" color="muted">
              Average per {period}
            </Typography>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/20">
            <Inline space={1} align="center" justify="center">
              {periodChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <Typography 
                variant="h3" 
                weight="bold" 
                color={periodChange >= 0 ? 'success' : 'destructive'}
              >
                {Math.abs(periodChange).toFixed(1)}%
              </Typography>
            </Inline>
            <Typography variant="small" color="muted">
              Period Change
            </Typography>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <SimpleLineChart
            data={chartData}
            height={256}
            color="hsl(var(--success))"
            showDots
            animated
          />
        </div>

        {/* Target Progress */}
        {target && targetProgress && (
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Inline space={2} align="center">
                <Target className="w-4 h-4 text-primary" />
                <Typography variant="label" weight="semibold">
                  Target Progress
                </Typography>
              </Inline>
              <Badge 
                variant={targetProgress >= 100 ? 'success' : targetProgress >= 80 ? 'warning' : 'destructive'}
              >
                {targetProgress.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>${currentPeriodRevenue.toLocaleString()}</span>
              <span>${target.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  )
}