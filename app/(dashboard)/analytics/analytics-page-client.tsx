'use client'

import { useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  DateRangeSelector,
  getDateRangeStart,
  type DateRangeOption,
} from '@/components/analytics/date-range-selector'
import { InventoryAnalytics } from '@/components/analytics/inventory-analytics'
import { WasteAnalytics } from '@/components/analytics/waste-analytics'
import { CostAnalytics } from '@/components/analytics/cost-analytics'
import { PerformanceAnalytics } from '@/components/analytics/performance-analytics'
import { ForecastAnalytics } from '@/components/analytics/forecast-analytics'
import type { InventoryItem, WasteAnalysisSnapshot, WasteEvent, Recipe } from '@/types'

interface AnalyticsPageClientProps {
  inventoryItems: InventoryItem[]
  lowStockItems: InventoryItem[]
  expiringItems: InventoryItem[]
  totalInventoryValue: number
  snapshots: WasteAnalysisSnapshot[]
  wasteEvents: WasteEvent[]
  recipes: Recipe[]
  monthlyBudget: number | null
}

export function AnalyticsPageClient({
  inventoryItems,
  lowStockItems,
  expiringItems,
  totalInventoryValue,
  snapshots,
  wasteEvents,
  recipes,
  monthlyBudget,
}: AnalyticsPageClientProps) {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d')
  const dateRangeStart = getDateRangeStart(dateRange)

  const handleExportCSV = useCallback(() => {
    const latestSnapshot = snapshots.length > 0
      ? snapshots.sort((a, b) => b.analysis_date.localeCompare(a.analysis_date))[0]
      : null

    const wasteTotal = wasteEvents
      .filter((e) => new Date(e.recorded_at) >= dateRangeStart)
      .reduce((sum, e) => sum + e.estimated_value, 0)

    const rows = [
      ['Metric', 'Value'],
      ['Total Inventory Items', inventoryItems.length.toString()],
      ['Low Stock Items', lowStockItems.length.toString()],
      ['Expiring Items', expiringItems.length.toString()],
      ['Total Inventory Value', `$${totalInventoryValue.toFixed(2)}`],
      ['Monthly Spend', `$${(latestSnapshot?.monthly_spend ?? 0).toFixed(2)}`],
      ['Average Waste Rate', `${(latestSnapshot?.average_waste_percentage ?? 0).toFixed(1)}%`],
      ['Total Waste Value (period)', `$${wasteTotal.toFixed(2)}`],
      ['Monthly Budget', monthlyBudget ? `$${monthlyBudget.toFixed(2)}` : 'Not set'],
      ['Date Range', dateRange],
      ['Export Date', new Date().toISOString()],
    ]

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `onpar-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [snapshots, wasteEvents, dateRangeStart, inventoryItems, lowStockItems, expiringItems, totalInventoryValue, monthlyBudget, dateRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="waste">Waste</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryAnalytics
            inventoryItems={inventoryItems}
            snapshots={snapshots}
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
          />
        </TabsContent>

        <TabsContent value="waste" className="mt-6">
          <WasteAnalytics
            wasteEvents={wasteEvents}
            snapshots={snapshots}
            dateRangeStart={dateRangeStart}
          />
        </TabsContent>

        <TabsContent value="cost" className="mt-6">
          <CostAnalytics
            inventoryItems={inventoryItems}
            snapshots={snapshots}
            recipes={recipes}
            monthlyBudget={monthlyBudget}
            dateRangeStart={dateRangeStart}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceAnalytics
            totalInventoryValue={totalInventoryValue}
            monthlyBudget={monthlyBudget}
            snapshots={snapshots}
            wasteEvents={wasteEvents}
            dateRangeStart={dateRangeStart}
          />
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          <ForecastAnalytics
            inventoryItems={inventoryItems}
            wasteEvents={wasteEvents}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
