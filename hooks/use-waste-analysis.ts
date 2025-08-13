import { useState, useEffect, useCallback } from 'react'
import { WastePattern, WasteSavingsCalculation } from '@/lib/waste-analysis'
import { WasteInsightReport } from '@/lib/waste-insights'
import { WastePrediction, WasteAlert } from '@/lib/waste-predictions'

interface UseWasteAnalysisOptions {
  businessId: string
  autoRefresh?: boolean
  refreshInterval?: number // minutes
}

interface WasteAnalysisState {
  patterns: WastePattern[]
  insights: WasteInsightReport | null
  predictions: WastePrediction[]
  alerts: WasteAlert[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useWasteAnalysis({ businessId, autoRefresh = false, refreshInterval = 30 }: UseWasteAnalysisOptions) {
  const [state, setState] = useState<WasteAnalysisState>({
    patterns: [],
    insights: null,
    predictions: [],
    alerts: [],
    loading: false,
    error: null,
    lastUpdated: null
  })

  // Fetch waste patterns
  const fetchPatterns = useCallback(async (period: number = 90) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=patterns&period=${period}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch waste patterns')
      }
      
      setState(prev => ({
        ...prev,
        patterns: result.data,
        loading: false,
        lastUpdated: new Date()
      }))
      
      return result.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }))
      throw error
    }
  }, [businessId])

  // Fetch comprehensive insights report
  const fetchInsights = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=insights`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch waste insights')
      }
      
      setState(prev => ({
        ...prev,
        insights: result.data,
        loading: false,
        lastUpdated: new Date()
      }))
      
      return result.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }))
      throw error
    }
  }, [businessId])

  // Fetch waste predictions
  const fetchPredictions = useCallback(async (forecastDays: number = 30) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=predictions&forecastDays=${forecastDays}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch waste predictions')
      }
      
      setState(prev => ({
        ...prev,
        predictions: result.data,
        loading: false,
        lastUpdated: new Date()
      }))
      
      return result.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }))
      throw error
    }
  }, [businessId])

  // Fetch waste alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=alerts`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch waste alerts')
      }
      
      setState(prev => ({
        ...prev,
        alerts: result.data,
        loading: false,
        lastUpdated: new Date()
      }))
      
      return result.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }))
      throw error
    }
  }, [businessId])

  // Fetch high waste items
  const fetchHighWasteItems = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=high-waste&limit=${limit}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch high waste items')
      }
      
      return result.data
    } catch (error) {
      console.error('Error fetching high waste items:', error)
      throw error
    }
  }, [businessId])

  // Calculate waste savings
  const calculateSavings = useCallback(async (
    currentWasteValue: number,
    targetReduction: number,
    implementationCost: number = 0
  ): Promise<WasteSavingsCalculation> => {
    try {
      const response = await fetch('/api/waste-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'calculate_savings',
          data: { currentWasteValue, targetReduction, implementationCost }
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate savings')
      }
      
      return result.data
    } catch (error) {
      console.error('Error calculating savings:', error)
      throw error
    }
  }, [businessId])

  // Calculate prevention ROI
  const calculatePreventionROI = useCallback(async (
    wasteValue: number,
    preventionCost: number,
    expectedReduction: number
  ) => {
    try {
      const response = await fetch('/api/waste-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'calculate_prevention_roi',
          data: { wasteValue, preventionCost, expectedReduction }
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate prevention ROI')
      }
      
      return result.data
    } catch (error) {
      console.error('Error calculating prevention ROI:', error)
      throw error
    }
  }, [businessId])

  // Generate full waste report
  const generateFullReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/waste-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'generate_full_report'
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate full report')
      }
      
      setState(prev => ({
        ...prev,
        insights: result.data,
        loading: false,
        lastUpdated: new Date()
      }))
      
      return result.data
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }))
      throw error
    }
  }, [businessId])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      await Promise.all([
        fetchPatterns(),
        fetchPredictions(),
        fetchAlerts()
      ])
      
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        loading: false
      }))
    }
  }, [fetchPatterns, fetchPredictions, fetchAlerts])

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshAll, refreshInterval * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshAll])

  // Initial data load
  useEffect(() => {
    if (businessId) {
      refreshAll()
    }
  }, [businessId, refreshAll])

  return {
    // State
    ...state,
    
    // Actions
    fetchPatterns,
    fetchInsights,
    fetchPredictions,
    fetchAlerts,
    fetchHighWasteItems,
    calculateSavings,
    calculatePreventionROI,
    generateFullReport,
    refreshAll,
    
    // Computed values
    totalWasteValue: state.patterns.reduce((sum, p) => sum + p.averageWasteValue, 0),
    highRiskItemsCount: state.patterns.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
    criticalAlertsCount: state.alerts.filter(a => a.severity === 'critical').length,
    potentialSavings: state.insights?.summary.potentialSavings || 0,
    performanceScore: state.insights?.summary.performanceScore || 0
  }
}

// Specialized hook for waste alerts only
export function useWasteAlerts(businessId: string) {
  const [alerts, setAlerts] = useState<WasteAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/waste-analysis?businessId=${businessId}&type=alerts`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch alerts')
      }
      
      setAlerts(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    if (businessId) {
      fetchAlerts()
    }
  }, [businessId, fetchAlerts])

  // Auto-refresh alerts every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  return {
    alerts,
    loading,
    error,
    refresh: fetchAlerts,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    highAlerts: alerts.filter(a => a.severity === 'high'),
    expirationAlerts: alerts.filter(a => a.alertType === 'expiration_warning'),
    wasteRiskAlerts: alerts.filter(a => a.alertType === 'high_waste_risk')
  }
}