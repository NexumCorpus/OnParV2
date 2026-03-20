'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartErrorBoundary } from '@/components/charts/chart-error-boundary'

const PieChartComponent = dynamic(() => import('@/components/charts/pie-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const LineChartComponent = dynamic(() => import('@/components/charts/line-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

interface DashboardChartsProps {
  categoryPieData: Array<{ name: string; value: number }>
  wasteTrendData: Array<{ label: string; value: number; benchmark: number }>
}

export function DashboardCharts({ categoryPieData, wasteTrendData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartErrorBoundary>
        <PieChartComponent
          data={categoryPieData}
          title="Inventory by Category"
          description="Value distribution across categories"
        />
      </ChartErrorBoundary>
      <ChartErrorBoundary>
        <LineChartComponent
          data={wasteTrendData}
          title="Waste Trend"
          description="Waste rate over recent analysis periods"
          showBenchmark
          benchmarkLabel="Industry avg"
          color="#ef4444"
        />
      </ChartErrorBoundary>
    </div>
  )
}
