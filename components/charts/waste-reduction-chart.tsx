'use client'

import * as React from 'react'
import { ChartContainer, SimpleLineChart, SimpleBarChart, ChartActions } from '../ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Typography } from '../ui/typography'
import { Progress } from '../ui/progress'
import { Stack, Inline } from '../ui/spacing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Leaf, 
  Target, 
  TrendingDown,
  Award,
  DollarSign,
  Calendar,
  BarChart3,
  LineChart
} from 'lucide-react'

interface WasteData {
  period: string
  wasteAmount: number
  wasteValue: number
  wastePercentage: number
  target?: number
  savings?: number
}

interface WasteReductionChartProps {
  data: WasteData[]
  title?: string
  targetReduction?: number
  loading?: boolean
  className?: string
}

export function WasteReductionChart({ 
  data, 
  title = 'Waste Reduction Progress',
  targetReduction = 20,
  loading = false,
  className 
}: WasteReductionChartProps) {
  // Calculate metrics
  const currentWaste = data[data.length - 1]?.wastePercentage || 0
  const initialWaste = data[0]?.wastePercentage || 0
  const wasteReduction = initialWaste - currentWaste
  const reductionPercentage = initialWaste > 0 ? (wasteReduction / initialWaste) * 100 : 0
  
  const totalSavings = data.reduce((sum, item) => sum + (item.savings || 0), 0)
  const averageWaste = data.reduce((sum, item) => sum + item.wastePercentage, 0) / data.length
  
  const targetProgress = (reductionPercentage / targetReduction) * 100

  // Chart data
  const wastePercentageData = data.map(item => ({
    label: item.period,
    value: item.wastePercentage,
  }))

  const wasteValueData = data.map(item => ({
    label: item.period,
    value: item.wasteValue,
  }))

  const savingsData = data.map(item => ({
    label: item.period,
    value: item.savings || 0,
  }))

  return (
    <ChartContainer
      title={title}
      description={`Tracking waste reduction progress towards ${targetReduction}% target`}
      loading={loading}
      className={className}
      trend={{
        value: reductionPercentage,
        label: 'waste reduction achieved',
        isPositive: reductionPercentage > 0,
      }}
      actions={
        <ChartActions 
          onDownload={() => console.log('Download waste chart')}
          onExpand={() => console.log('Expand waste chart')}
        />
      }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <TrendingDown className="w-6 h-6 text-success mx-auto mb-2" />
            <Typography variant="h3" weight="bold" color="success">
              {reductionPercentage.toFixed(1)}%
            </Typography>
            <Typography variant="small" color="muted">
              Waste Reduced
            </Typography>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
            <Leaf className="w-6 h-6 text-primary mx-auto mb-2" />
            <Typography variant="h3" weight="bold">
              {currentWaste.toFixed(1)}%
            </Typography>
            <Typography variant="small" color="muted">
              Current Waste
            </Typography>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
            <DollarSign className="w-6 h-6 text-warning mx-auto mb-2" />
            <Typography variant="h3" weight="bold" color="warning">
              ${totalSavings.toLocaleString()}
            </Typography>
            <Typography variant="small" color="muted">
              Total Savings
            </Typography>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-info/10 border border-info/20">
            <Target className="w-6 h-6 text-info mx-auto mb-2" />
            <Typography variant="h3" weight="bold" color="info">
              {targetProgress.toFixed(0)}%
            </Typography>
            <Typography variant="small" color="muted">
              Target Progress
            </Typography>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <Inline space={2} align="center">
              <Award className="w-4 h-4 text-primary" />
              <Typography variant="label" weight="semibold">
                Waste Reduction Goal
              </Typography>
            </Inline>
            <Badge 
              variant={targetProgress >= 100 ? 'success' : targetProgress >= 75 ? 'warning' : 'info'}
            >
              {Math.min(targetProgress, 100).toFixed(0)}% Complete
            </Badge>
          </div>
          <Progress
            value={Math.min(targetProgress, 100)}
            variant={targetProgress >= 100 ? 'success' : 'default'}
            animated
            showValue
            label={`Target: ${targetReduction}% reduction`}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Current: {reductionPercentage.toFixed(1)}%</span>
            <span>Target: {targetReduction}%</span>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="percentage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="percentage" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Waste %
            </TabsTrigger>
            <TabsTrigger value="value" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Waste Value
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Savings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="percentage" className="space-y-4">
            <div className="h-64">
              <SimpleLineChart
                data={wastePercentageData}
                height={256}
                color="hsl(var(--primary))"
                showDots
                animated
              />
            </div>
            <Typography variant="small" color="muted" className="text-center">
              Waste percentage over time (lower is better)
            </Typography>
          </TabsContent>
          
          <TabsContent value="value" className="space-y-4">
            <div className="h-64">
              <SimpleBarChart
                data={wasteValueData}
                height={256}
                color="hsl(var(--destructive))"
                animated
              />
            </div>
            <Typography variant="small" color="muted" className="text-center">
              Dollar value of waste over time
            </Typography>
          </TabsContent>
          
          <TabsContent value="savings" className="space-y-4">
            <div className="h-64">
              <SimpleBarChart
                data={savingsData}
                height={256}
                color="hsl(var(--success))"
                animated
              />
            </div>
            <Typography variant="small" color="muted" className="text-center">
              Cost savings achieved through waste reduction
            </Typography>
          </TabsContent>
        </Tabs>

        {/* Achievement Badges */}
        {reductionPercentage > 0 && (
          <div className="flex flex-wrap gap-2">
            {reductionPercentage >= 5 && (
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                5% Reduction Achieved
              </Badge>
            )}
            {reductionPercentage >= 10 && (
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                10% Reduction Achieved
              </Badge>
            )}
            {reductionPercentage >= 15 && (
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                15% Reduction Achieved
              </Badge>
            )}
            {targetProgress >= 100 && (
              <Badge variant="success" className="flex items-center gap-1 animate-pulse">
                <Award className="w-3 h-3" />
                Target Achieved!
              </Badge>
            )}
          </div>
        )}
      </div>
    </ChartContainer>
  )
}