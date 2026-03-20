'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MetricsSummaryTable } from './metrics-summary-table'
import type { WasteAnalysisSnapshot, WasteEvent } from '@/types'

interface PerformanceAnalyticsProps {
  totalInventoryValue: number
  monthlyBudget: number | null
  snapshots: WasteAnalysisSnapshot[]
  wasteEvents: WasteEvent[]
  dateRangeStart: Date
}

interface PerformanceScores {
  wasteManagement: number
  inventoryTurnover: number
  costEfficiency: number
  budgetAdherence: number
  overall: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function calculatePerformanceScores(
  avgWastePercentage: number,
  monthlySpend: number,
  totalInventoryValue: number,
  wasteValue: number,
  budgetUsedPercentage: number | null,
  hasBudget: boolean
): PerformanceScores {
  // Waste management: 100 - (avgWastePercentage * 10), clamped 0-100
  const wasteManagement = clamp(100 - avgWastePercentage * 10, 0, 100)

  // Inventory turnover: min(100, (monthlySpend / totalInventoryValue) * 50)
  const turnoverRatio = totalInventoryValue > 0 ? monthlySpend / totalInventoryValue : 0
  const inventoryTurnover = Math.min(100, turnoverRatio * 50)

  // Cost efficiency: 100 - (wasteValue / totalInventoryValue * 100), clamped 0-100
  const costEfficiency = clamp(
    totalInventoryValue > 0 ? 100 - (wasteValue / totalInventoryValue) * 100 : 100,
    0,
    100
  )

  // Budget adherence: if no budget: 75; else: 100 - max(0, budgetUsed - 100)
  let budgetAdherence: number
  if (!hasBudget || budgetUsedPercentage === null) {
    budgetAdherence = 75
  } else {
    budgetAdherence = clamp(100 - Math.max(0, budgetUsedPercentage - 100), 0, 100)
  }

  // Overall: average of 4 scores
  const overall = (wasteManagement + inventoryTurnover + costEfficiency + budgetAdherence) / 4

  return {
    wasteManagement: Math.round(wasteManagement),
    inventoryTurnover: Math.round(inventoryTurnover),
    costEfficiency: Math.round(costEfficiency),
    budgetAdherence: Math.round(budgetAdherence),
    overall: Math.round(overall),
  }
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 50) return 'Average'
  if (score >= 25) return 'Below Average'
  return 'Needs Improvement'
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function PerformanceAnalytics({
  totalInventoryValue,
  monthlyBudget,
  snapshots,
  wasteEvents,
  dateRangeStart,
}: PerformanceAnalyticsProps) {
  const filteredSnapshots = snapshots.filter(
    (s) => new Date(s.analysis_date) >= dateRangeStart
  )
  const filteredWaste = wasteEvents.filter(
    (e) => new Date(e.recorded_at) >= dateRangeStart
  )

  const latestSnapshot = filteredSnapshots.length > 0
    ? filteredSnapshots.sort((a, b) => b.analysis_date.localeCompare(a.analysis_date))[0]
    : null

  const avgWastePercentage = latestSnapshot?.average_waste_percentage ?? 0
  const monthlySpend = latestSnapshot?.monthly_spend ?? 0
  const wasteValue = filteredWaste.reduce((sum, e) => sum + e.estimated_value, 0)
  const budgetUsedPct = monthlyBudget && monthlyBudget > 0
    ? (monthlySpend / monthlyBudget) * 100
    : null

  const scores = calculatePerformanceScores(
    avgWastePercentage,
    monthlySpend,
    totalInventoryValue,
    wasteValue,
    budgetUsedPct,
    monthlyBudget !== null && monthlyBudget > 0
  )

  const scoreBreakdown = [
    { label: 'Waste Management', score: scores.wasteManagement },
    { label: 'Inventory Turnover', score: scores.inventoryTurnover },
    { label: 'Cost Efficiency', score: scores.costEfficiency },
    { label: 'Budget Adherence', score: scores.budgetAdherence },
  ]

  // Previous period metrics for comparison
  const now = new Date()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const prevSnapshots = snapshots.filter((s) => {
    const d = new Date(s.analysis_date)
    return d >= prevMonthStart && d <= prevMonthEnd
  })
  const prevSnapshot = prevSnapshots.length > 0
    ? prevSnapshots.sort((a, b) => b.analysis_date.localeCompare(a.analysis_date))[0]
    : null

  const prevWaste = wasteEvents.filter((e) => {
    const d = new Date(e.recorded_at)
    return d >= prevMonthStart && d <= prevMonthEnd
  })
  const prevWasteTotal = prevWaste.reduce((sum, e) => sum + e.estimated_value, 0)

  const turnoverCurrent = totalInventoryValue > 0
    ? (monthlySpend / totalInventoryValue).toFixed(2)
    : '0.00'
  const turnoverPrev = prevSnapshot && totalInventoryValue > 0
    ? (prevSnapshot.monthly_spend / (prevSnapshot.total_inventory_value || 1)).toFixed(2)
    : '0.00'

  function formatChange(current: number, previous: number, suffix: string = '', isInverse: boolean = false): { changeValue: number; changeLabel: string } {
    if (previous === 0) return { changeValue: 0, changeLabel: 'N/A' }
    const diff = current - previous
    const pct = ((diff / previous) * 100).toFixed(1)
    const direction = diff > 0 ? '\u2191' : '\u2193'
    const changeValue = isInverse ? -diff : diff
    return {
      changeValue,
      changeLabel: `${direction} ${Math.abs(Number(pct))}%${suffix}`,
    }
  }

  const metricsData = [
    {
      metric: 'Inventory Turnover',
      current: `${turnoverCurrent}x`,
      previous: `${turnoverPrev}x`,
      ...formatChange(Number(turnoverCurrent), Number(turnoverPrev)),
    },
    {
      metric: 'Waste Rate',
      current: `${avgWastePercentage.toFixed(1)}%`,
      previous: `${(prevSnapshot?.average_waste_percentage ?? 0).toFixed(1)}%`,
      ...formatChange(avgWastePercentage, prevSnapshot?.average_waste_percentage ?? 0, '', true),
    },
    {
      metric: 'Cost Efficiency',
      current: `${scores.costEfficiency}%`,
      previous: prevSnapshot
        ? `${clamp(
            prevSnapshot.total_inventory_value > 0
              ? Math.round(100 - (prevWasteTotal / prevSnapshot.total_inventory_value) * 100)
              : 100,
            0,
            100
          )}%`
        : 'N/A',
      ...formatChange(scores.costEfficiency, prevSnapshot
        ? clamp(
            prevSnapshot.total_inventory_value > 0
              ? 100 - (prevWasteTotal / prevSnapshot.total_inventory_value) * 100
              : 100,
            0,
            100
          )
        : 0),
    },
    {
      metric: 'Budget Usage',
      current: budgetUsedPct !== null ? `${budgetUsedPct.toFixed(0)}%` : 'N/A',
      previous: prevSnapshot && monthlyBudget
        ? `${((prevSnapshot.monthly_spend / monthlyBudget) * 100).toFixed(0)}%`
        : 'N/A',
      ...formatChange(
        budgetUsedPct ?? 0,
        prevSnapshot && monthlyBudget
          ? (prevSnapshot.monthly_spend / monthlyBudget) * 100
          : 0,
        '',
        true
      ),
    },
    {
      metric: 'Monthly Waste',
      current: `$${wasteValue.toLocaleString()}`,
      previous: `$${prevWasteTotal.toLocaleString()}`,
      ...formatChange(wasteValue, prevWasteTotal, '', true),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${getScoreColor(scores.overall)}`}>
                {scores.overall}
              </span>
              <span className="text-lg text-muted-foreground">/ 100</span>
              <span className="text-sm text-muted-foreground">
                — {getScoreLabel(scores.overall)}
              </span>
            </div>
            <Progress
              value={scores.overall}
              aria-label={`Overall performance: ${scores.overall} out of 100`}
              className="h-3"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Breakdown</h4>
            {scoreBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className={getScoreColor(item.score)}>
                    {item.score}/100
                  </span>
                </div>
                <Progress
                  value={item.score}
                  aria-label={`${item.label}: ${item.score} out of 100`}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MetricsSummaryTable metrics={metricsData} />
    </div>
  )
}
