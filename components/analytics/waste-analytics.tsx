'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { WasteEvent, WasteAnalysisSnapshot } from '@/types'

const BarChartComponent = dynamic(() => import('@/components/charts/bar-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const DonutChartComponent = dynamic(() => import('@/components/charts/donut-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

const LineChartComponent = dynamic(() => import('@/components/charts/line-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
})

interface WasteAnalyticsProps {
  wasteEvents: WasteEvent[]
  snapshots: WasteAnalysisSnapshot[]
  dateRangeStart: Date
}

export function WasteAnalytics({
  wasteEvents,
  snapshots,
  dateRangeStart,
}: WasteAnalyticsProps) {
  const filteredEvents = wasteEvents.filter(
    (e) => new Date(e.recorded_at) >= dateRangeStart
  )

  // Monthly waste value (bar chart)
  const monthlyWasteMap = new Map<string, number>()
  for (const event of filteredEvents) {
    const date = new Date(event.recorded_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyWasteMap.set(key, (monthlyWasteMap.get(key) ?? 0) + event.estimated_value)
  }

  const monthlyWasteData = Array.from(monthlyWasteMap.entries())
    .filter(([key]) => !key.startsWith('label:'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split('-')
      const date = new Date(Number(year), Number(month) - 1)
      return {
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(value),
      }
    })

  // Waste by reason (donut chart)
  const reasonMap = new Map<string, number>()
  for (const event of filteredEvents) {
    const reason = event.reason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + event.estimated_value)
  }

  const wasteByReason = Array.from(reasonMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value: Math.round(value) }))

  // Waste rate trend (line chart) from snapshots
  const filteredSnapshots = snapshots.filter(
    (s) => new Date(s.analysis_date) >= dateRangeStart
  )
  const wasteTrendData = filteredSnapshots
    .slice()
    .sort((a, b) => a.analysis_date.localeCompare(b.analysis_date))
    .map((s) => ({
      label: new Date(s.analysis_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: Number(s.average_waste_percentage.toFixed(1)),
      benchmark: 5, // Industry average benchmark
    }))

  return (
    <div className="space-y-6">
      <BarChartComponent
        data={monthlyWasteData}
        title="Monthly Waste Value"
        description="Total value of waste recorded each month"
        color="#ef4444"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DonutChartComponent
          data={wasteByReason}
          title="Waste by Reason"
          description="Breakdown of waste by reason"
          valuePrefix="$"
          valueSuffix=""
        />

        <LineChartComponent
          data={wasteTrendData}
          title="Waste Rate Trend"
          description="Your waste rate over time vs industry average"
          showBenchmark
          benchmarkLabel="Industry avg"
          color="#ef4444"
        />
      </div>
    </div>
  )
}
