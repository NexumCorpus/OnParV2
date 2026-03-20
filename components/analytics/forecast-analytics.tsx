'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatting'
import { generateDemandForecast } from '@/lib/engines/demand-forecast'
import type { InventoryItem, WasteEvent } from '@/types'

interface ForecastAnalyticsProps {
  inventoryItems: InventoryItem[]
  wasteEvents: WasteEvent[]
}

const ACTION_CONFIG = {
  urgent: { label: 'Urgent', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
  soon: { label: 'Reorder Soon', variant: 'default' as const, icon: AlertTriangle, color: 'text-amber-600' },
  adequate: { label: 'Adequate', variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
  overstocked: { label: 'Overstocked', variant: 'outline' as const, icon: TrendingUp, color: 'text-blue-600' },
}

export function ForecastAnalytics({ inventoryItems, wasteEvents }: ForecastAnalyticsProps) {
  const { forecasts, summary } = useMemo(
    () => generateDemandForecast(inventoryItems, wasteEvents),
    [inventoryItems, wasteEvents]
  )

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Forecasted Weekly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalForecastedSpend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Need Reorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.itemsNeedingReorder}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgent Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{summary.urgentItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.avgConfidence.toFixed(0)}%</p>
            <Progress value={summary.avgConfidence} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Forecast table */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {forecasts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add inventory items and log waste events to see demand forecasts.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Daily Usage</TableHead>
                    <TableHead className="text-right">Weekly Need</TableHead>
                    <TableHead className="text-right">Days to Reorder</TableHead>
                    <TableHead className="text-right">Order Qty</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecasts.slice(0, 25).map((f) => {
                    const config = ACTION_CONFIG[f.action]
                    return (
                      <TableRow key={f.itemId}>
                        <TableCell className="font-medium">
                          <div>
                            {f.itemName}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({f.category})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {f.currentQuantity} {f.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {f.avgDailyUsage.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {f.predictedWeeklyUsage.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={f.daysUntilReorder <= 3 ? 'text-red-600 font-semibold' : ''}>
                            {f.daysUntilReorder >= 999 ? '30+' : `${f.daysUntilReorder}d`}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {f.recommendedOrderQty > 0
                            ? `${f.recommendedOrderQty.toFixed(0)} ${f.unit}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(f.estimatedWeeklyCost)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
