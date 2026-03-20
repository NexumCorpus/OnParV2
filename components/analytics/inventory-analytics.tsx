'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryItem, WasteAnalysisSnapshot } from '@/types'

const AreaChartComponent = dynamic(() => import('@/components/charts/area-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const StackedBarChartComponent = dynamic(() => import('@/components/charts/stacked-bar-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

interface InventoryAnalyticsProps {
  inventoryItems: InventoryItem[]
  snapshots: WasteAnalysisSnapshot[]
  lowStockItems: InventoryItem[]
  expiringItems: InventoryItem[]
}

export function InventoryAnalytics({
  inventoryItems,
  snapshots,
  lowStockItems,
  expiringItems,
}: InventoryAnalyticsProps) {
  const [renderTime] = useState(() => Date.now())
  // Inventory value over time from snapshots
  const valueOverTime = snapshots
    .slice()
    .sort((a, b) => a.analysis_date.localeCompare(b.analysis_date))
    .map((s) => ({
      label: new Date(s.analysis_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: Math.round(s.total_inventory_value),
    }))

  // Stock levels by category
  const categoryMap = new Map<string, { inStock: number; belowReorder: number }>()
  for (const item of inventoryItems) {
    const existing = categoryMap.get(item.category) ?? { inStock: 0, belowReorder: 0 }
    if (item.quantity < item.reorder_point) {
      existing.belowReorder += 1
    } else {
      existing.inStock += 1
    }
    categoryMap.set(item.category, existing)
  }

  const stockByCategory = Array.from(categoryMap.entries()).map(([label, data]) => ({
    label,
    inStock: data.inStock,
    belowReorder: data.belowReorder,
  }))

  return (
    <div className="space-y-6">
      <AreaChartComponent
        data={valueOverTime}
        title="Inventory Value Over Time"
        description="Total inventory value based on analysis snapshots"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StackedBarChartComponent
          data={stockByCategory}
          title="Stock Levels by Category"
          description="Items in stock vs below reorder point"
        />

        <Card>
          <CardHeader>
            <CardTitle>Items Needing Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Low Stock ({lowStockItems.length})
              </h4>
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock items.</p>
              ) : (
                <ul className="space-y-1" role="list">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <li key={item.id} className="text-sm text-muted-foreground">
                      {item.name} ({item.quantity} {item.unit})
                    </li>
                  ))}
                  {lowStockItems.length > 5 && (
                    <li className="text-sm text-muted-foreground">
                      ...and {lowStockItems.length - 5} more
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">
                Expiring Soon ({expiringItems.length})
              </h4>
              {expiringItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items expiring soon.</p>
              ) : (
                <ul className="space-y-1" role="list">
                  {expiringItems.slice(0, 5).map((item) => {
                    const daysLeft = item.expiry_date
                      ? Math.ceil(
                          (new Date(item.expiry_date).getTime() - renderTime) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0
                    return (
                      <li key={item.id} className="text-sm text-muted-foreground">
                        {item.name} ({daysLeft} day{daysLeft !== 1 ? 's' : ''})
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
