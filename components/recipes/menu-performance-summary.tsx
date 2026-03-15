'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatPercentage } from '@/lib/utils/formatting'
import { AlertTriangle } from 'lucide-react'
import type { MenuItem } from '@/types'

interface MenuPerformanceSummaryProps {
  totalItems: number
  activeItems: number
  avgWastePercentage: number
  topPerformers: MenuItem[]
  worstPerformers: MenuItem[]
}

export function MenuPerformanceSummary({
  activeItems,
  avgWastePercentage,
  topPerformers,
  worstPerformers,
}: MenuPerformanceSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Menu Performance Summary</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Items</p>
            <p className="text-2xl font-bold mt-1">{activeItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Waste</p>
            <p className="text-2xl font-bold mt-1">
              {formatPercentage(avgWastePercentage)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Top Seller</p>
            <p className="text-lg font-bold mt-1 truncate">
              {topPerformers[0]?.name ?? 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low performers */}
      {worstPerformers.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Low performers ({'>'}3% waste):
            </span>
          </div>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            {worstPerformers.map((item) => (
              <li key={item.id}>
                <span className="font-medium">{item.name}</span>
                {' -- '}
                {formatPercentage(item.waste_percentage)} waste,{' '}
                {formatPercentage(item.sales_percentage)} sales
              </li>
            ))}
          </ul>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Consider: smaller portions or removing from menu
          </p>
        </div>
      )}
    </div>
  )
}
