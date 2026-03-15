'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { refreshWasteAnalysis, getWasteEvents } from '@/lib/actions/waste'
import type { WasteEvent } from '@/types'
import type { WastePattern } from '@/lib/engines/waste-analysis'
import type { WastePrediction, WasteAlert } from '@/lib/engines/waste-predictions'
import type { BenchmarkComparison } from '@/lib/engines/waste-benchmarks'
import type { WasteInsightReport } from '@/lib/engines/waste-insights'
import type { SeasonalTrend } from '@/lib/engines/waste-analysis'

interface WasteAnalysisState {
  patterns: WastePattern[]
  predictions: WastePrediction[]
  alerts: WasteAlert[]
  benchmarks: BenchmarkComparison[]
  seasonalTrends: SeasonalTrend[]
  report: Omit<WasteInsightReport, 'userId'> | null
  wasteEvents: WasteEvent[]
  loading: boolean
  error: string | null
}

export function useWasteAnalysis() {
  const [state, setState] = useState<WasteAnalysisState>({
    patterns: [],
    predictions: [],
    alerts: [],
    benchmarks: [],
    seasonalTrends: [],
    report: null,
    wasteEvents: [],
    loading: false,
    error: null,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchWasteEvents = useCallback(async () => {
    const result = await getWasteEvents()
    if (result.success && result.data) {
      setState((prev) => ({ ...prev, wasteEvents: result.data as WasteEvent[] }))
    }
  }, [])

  const fetchAnalysis = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await refreshWasteAnalysis()
      if (result.success && result.data) {
        const data = result.data as {
          patterns: WastePattern[]
          predictions: WastePrediction[]
          alerts: WasteAlert[]
          benchmarks: BenchmarkComparison[]
          seasonalTrends: SeasonalTrend[]
          report: Omit<WasteInsightReport, 'userId'>
        }
        setState((prev) => ({
          ...prev,
          patterns: data.patterns,
          predictions: data.predictions,
          alerts: data.alerts,
          benchmarks: data.benchmarks,
          seasonalTrends: data.seasonalTrends,
          report: data.report,
          loading: false,
        }))
      } else if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: result.error }))
      }
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load waste analysis',
      }))
    }
  }, [])

  // Auto-refresh alerts every 5 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void fetchAnalysis()
    }, 5 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchAnalysis])

  // Computed values
  const totalWasteValue = state.patterns.reduce(
    (sum, p) => sum + p.totalWasteValue,
    0
  )

  const highRiskItemsCount = state.patterns.filter(
    (p) => p.riskLevel === 'critical' || p.riskLevel === 'high'
  ).length

  const criticalAlertsCount = state.alerts.filter(
    (a) => a.severity === 'critical'
  ).length

  const potentialSavings = state.report?.summary.potentialSavings ?? 0

  return {
    ...state,
    fetchAnalysis,
    fetchWasteEvents,
    totalWasteValue,
    highRiskItemsCount,
    criticalAlertsCount,
    potentialSavings,
  }
}
