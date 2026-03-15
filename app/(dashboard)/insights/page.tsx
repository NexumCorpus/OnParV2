'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAIInsights } from '@/hooks/use-ai-insights'
import { InsightStats } from '@/components/insights/insight-stats'
import { InsightFilters } from '@/components/insights/insight-filters'
import { InsightCard } from '@/components/insights/insight-card'

export default function InsightsPage() {
  const {
    insights,
    allInsights,
    loading,
    statusFilter,
    fetchInsights,
    refreshInsights,
    updateStatus,
    dismissInsight: handleDismiss,
    setStatusFilter,
    totalSavings,
    avgConfidence,
    pendingCount,
    completedCount,
  } = useAIInsights()

  useEffect(() => {
    void fetchInsights()
  }, [fetchInsights])

  const handleStart = (id: string) => {
    void updateStatus(id, 'in_progress')
  }

  const handleDismissInsight = (id: string) => {
    void handleDismiss(id)
  }

  // Empty state
  if (!loading && allInsights.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">
              Smart recommendations to optimize your restaurant
            </p>
          </div>
          <Button onClick={() => void refreshInsights()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No insights yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add inventory items, menu items, and log waste events to generate
              AI-powered insights and recommendations.
            </p>
            <Button onClick={() => void refreshInsights()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            Smart recommendations to optimize your restaurant
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshInsights()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <InsightStats
            totalInsights={allInsights.length}
            totalSavings={totalSavings}
            avgConfidence={avgConfidence}
            completedCount={completedCount}
          />

          <InsightFilters
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />

          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No insights match the current filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onStart={handleStart}
                  onDismiss={handleDismissInsight}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
