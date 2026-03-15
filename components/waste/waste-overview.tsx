'use client'

import { WasteKPICards } from './waste-kpi-cards'
import { WasteCategoryChart } from './waste-category-chart'
import { TopWasteTable } from './top-waste-table'
import type { WastePattern } from '@/lib/engines/waste-analysis'
import type { WasteInsightReport } from '@/lib/engines/waste-insights'

interface WasteOverviewProps {
  patterns: WastePattern[]
  report: Omit<WasteInsightReport, 'userId'> | null
  totalWasteValue: number
  highRiskItemsCount: number
  criticalAlertsCount: number
  potentialSavings: number
}

export function WasteOverview({
  patterns,
  report,
  totalWasteValue,
  highRiskItemsCount,
  criticalAlertsCount,
  potentialSavings,
}: WasteOverviewProps) {
  const performanceScore = report?.summary.performanceScore ?? 0

  return (
    <div className="space-y-6">
      <WasteKPICards
        totalWasteValue={totalWasteValue}
        highRiskItems={highRiskItemsCount}
        criticalCount={criticalAlertsCount}
        potentialSavings={potentialSavings}
        performanceScore={performanceScore}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <WasteCategoryChart patterns={patterns} />
        <TopWasteTable patterns={patterns} />
      </div>
    </div>
  )
}
