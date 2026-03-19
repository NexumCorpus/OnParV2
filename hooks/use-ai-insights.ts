'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  getAIInsights,
  refreshAIInsights,
  updateInsightStatus,
  dismissInsight,
} from '@/lib/actions/waste'
import type { AIInsight } from '@/types'

type StatusFilter = 'all' | AIInsight['status']
type TypeFilter = 'all' | AIInsight['type']

interface AIInsightsState {
  insights: AIInsight[]
  loading: boolean
  error: string | null
  statusFilter: StatusFilter
  typeFilter: TypeFilter
}

export function useAIInsights() {
  const [state, setState] = useState<AIInsightsState>({
    insights: [],
    loading: false,
    error: null,
    statusFilter: 'all',
    typeFilter: 'all',
  })

  const fetchInsights = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await getAIInsights()
      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          insights: result.data as AIInsight[],
          loading: false,
        }))
      } else if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: result.error }))
      }
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load insights',
      }))
    }
  }, [])

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await refreshAIInsights()
      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          insights: result.data as AIInsight[],
          loading: false,
        }))
      } else if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: result.error }))
      }
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to refresh insights',
      }))
    }
  }, [])

  const handleUpdateStatus = useCallback(
    async (insightId: string, status: string, savings?: number) => {
      const result = await updateInsightStatus(insightId, status, savings)
      if (result.success) {
        setState((prev) => ({
          ...prev,
          insights: prev.insights.map((i) =>
            i.id === insightId ? { ...i, status: status as AIInsight['status'] } : i
          ),
        }))
      }
      return result
    },
    []
  )

  const handleDismiss = useCallback(
    async (insightId: string) => {
      const result = await dismissInsight(insightId)
      if (result.success) {
        setState((prev) => ({
          ...prev,
          insights: prev.insights.map((i) =>
            i.id === insightId ? { ...i, status: 'dismissed' as const } : i
          ),
        }))
      }
      return result
    },
    []
  )

  const setStatusFilter = useCallback((filter: StatusFilter) => {
    setState((prev) => ({ ...prev, statusFilter: filter }))
  }, [])

  const setTypeFilter = useCallback((filter: TypeFilter) => {
    setState((prev) => ({ ...prev, typeFilter: filter }))
  }, [])

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return state.insights.filter((insight) => {
      if (state.statusFilter !== 'all' && insight.status !== state.statusFilter) return false
      if (state.typeFilter !== 'all' && insight.type !== state.typeFilter) return false
      return true
    })
  }, [state.insights, state.statusFilter, state.typeFilter])

  // Computed stats
  const totalSavings = useMemo(
    () => state.insights.reduce((sum, i) => sum + i.estimated_savings, 0),
    [state.insights]
  )

  const avgConfidence = useMemo(() => {
    if (state.insights.length === 0) return 0
    return state.insights.reduce((sum, i) => sum + i.confidence, 0) / state.insights.length
  }, [state.insights])

  const pendingCount = useMemo(
    () => state.insights.filter((i) => i.status === 'pending').length,
    [state.insights]
  )

  const completedCount = useMemo(
    () => state.insights.filter((i) => i.status === 'completed').length,
    [state.insights]
  )

  return {
    insights: filteredInsights,
    allInsights: state.insights,
    loading: state.loading,
    error: state.error,
    statusFilter: state.statusFilter,
    typeFilter: state.typeFilter,
    fetchInsights,
    refreshInsights: refresh,
    updateStatus: handleUpdateStatus,
    dismissInsight: handleDismiss,
    setStatusFilter,
    setTypeFilter,
    totalSavings,
    avgConfidence,
    pendingCount,
    completedCount,
  }
}
