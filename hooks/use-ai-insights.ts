import { useState, useEffect } from 'react'
import { AIInsight } from '@/types'

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ai-insights')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights')
      }
      
      setInsights(data.insights || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async (regenerate = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights')
      }
      
      setInsights(data.insights || [])
      return data.insights
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
      return []
    } finally {
      setLoading(false)
    }
  }

  const updateInsightStatus = async (
    insightId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
    actualSavings?: number
  ) => {
    try {
      const response = await fetch(`/api/ai-insights/${insightId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, actual_savings: actualSavings }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update insight status')
      }
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { 
              ...insight, 
              status, 
              actual_savings: actualSavings || insight.actual_savings,
              updated_at: new Date().toISOString()
            }
          : insight
      ))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update insight status')
      return false
    }
  }

  const deleteInsight = async (insightId: string) => {
    try {
      const response = await fetch(`/api/ai-insights/${insightId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete insight')
      }
      
      // Update local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete insight')
      return false
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return {
    insights,
    loading,
    error,
    fetchInsights,
    generateInsights,
    updateInsightStatus,
    deleteInsight,
  }
}