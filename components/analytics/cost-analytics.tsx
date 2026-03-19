'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { InventoryItem, WasteAnalysisSnapshot, Recipe } from '@/types'

const ComboChartComponent = dynamic(() => import('@/components/charts/combo-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const BarChartComponent = dynamic(() => import('@/components/charts/bar-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const ScatterChartComponent = dynamic(() => import('@/components/charts/scatter-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

interface CostAnalyticsProps {
  inventoryItems: InventoryItem[]
  snapshots: WasteAnalysisSnapshot[]
  recipes: Recipe[]
  monthlyBudget: number | null
  dateRangeStart: Date
}

export function CostAnalytics({
  inventoryItems,
  snapshots,
  recipes,
  monthlyBudget,
  dateRangeStart,
}: CostAnalyticsProps) {
  // Monthly spend vs budget (combo chart)
  const filteredSnapshots = snapshots
    .filter((s) => new Date(s.analysis_date) >= dateRangeStart)
    .slice()
    .sort((a, b) => a.analysis_date.localeCompare(b.analysis_date))

  const spendVsBudget = filteredSnapshots.map((s) => ({
    label: new Date(s.analysis_date).toLocaleDateString('en-US', {
      month: 'short',
    }),
    barValue: Math.round(s.monthly_spend),
    lineValue: monthlyBudget ?? undefined,
  }))

  // Top cost categories (bar chart, horizontal)
  const categorySpendMap = new Map<string, number>()
  for (const item of inventoryItems) {
    const spend = item.quantity * item.price_per_unit
    categorySpendMap.set(
      item.category,
      (categorySpendMap.get(item.category) ?? 0) + spend
    )
  }

  const topCostCategories = Array.from(categorySpendMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([label, value]) => ({ label, value: Math.round(value) }))

  // Recipe profitability (scatter plot)
  const recipeScatterData = recipes
    .filter((r) => r.cost_per_serving > 0 && r.profit_margin > 0)
    .map((r) => ({
      name: r.name,
      x: r.cost_per_serving,
      y: r.profit_margin,
      z: r.popularity_score,
    }))

  return (
    <div className="space-y-6">
      <ComboChartComponent
        data={spendVsBudget}
        title="Monthly Spend vs Budget"
        description={
          monthlyBudget
            ? `Budget: $${monthlyBudget.toLocaleString()}/month`
            : 'Set a budget in settings to track spending'
        }
        barName="Spend"
        lineName="Budget"
        budgetLine={monthlyBudget ?? undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartComponent
          data={topCostCategories}
          title="Top Cost Categories"
          description="Inventory value by category"
          layout="vertical"
          color="#3b82f6"
        />

        <ScatterChartComponent
          data={recipeScatterData}
          title="Recipe Profitability"
          description="Cost vs margin for each recipe"
          xLabel="Cost per Serving"
          yLabel="Margin"
          xPrefix="$"
          ySuffix="%"
          color="#8b5cf6"
        />
      </div>
    </div>
  )
}
