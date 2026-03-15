'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, AlertTriangle, TrendingDown, Activity } from 'lucide-react'

interface WasteKPICardsProps {
  totalWasteValue: number
  highRiskItems: number
  criticalCount: number
  potentialSavings: number
  performanceScore: number
}

export function WasteKPICards({
  totalWasteValue,
  highRiskItems,
  criticalCount,
  potentialSavings,
  performanceScore,
}: WasteKPICardsProps) {
  const scoreLabel =
    performanceScore >= 80
      ? 'Excellent'
      : performanceScore >= 60
        ? 'Good'
        : performanceScore >= 40
          ? 'Average'
          : 'Needs Work'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Waste</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalWasteValue.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Total waste value this period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highRiskItems}</div>
          <p className="text-xs text-muted-foreground">
            {criticalCount > 0 ? `${criticalCount} critical` : 'No critical items'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${potentialSavings.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">/month with optimizations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performanceScore.toFixed(0)}/100</div>
          <div className="mt-1 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, performanceScore)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{scoreLabel}</p>
        </CardContent>
      </Card>
    </div>
  )
}
