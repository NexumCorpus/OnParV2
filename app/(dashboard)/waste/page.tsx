'use client'

import { useEffect, useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, ClipboardList, AlertTriangle, Target, RefreshCw } from 'lucide-react'
import { useWasteAnalysis } from '@/hooks/use-waste-analysis'
import { getInventoryItemsForWaste } from '@/lib/actions/waste'
import { WasteOverview } from '@/components/waste/waste-overview'
import { LogWasteForm } from '@/components/waste/log-waste-form'
import { WasteEventsList } from '@/components/waste/waste-events-list'
import { WasteAlerts } from '@/components/waste/waste-alerts'
import { WasteBenchmarksTable } from '@/components/waste/waste-benchmarks'
import { BenchmarkStrategies } from '@/components/waste/benchmark-strategies'
import { Skeleton } from '@/components/ui/skeleton'
import type { InventoryItem } from '@/types'

export default function WastePage() {
  const analysis = useWasteAnalysis()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [initialLoaded, setInitialLoaded] = useState(false)

  const loadData = useCallback(async () => {
    const [, , invResult] = await Promise.all([
      analysis.fetchAnalysis(),
      analysis.fetchWasteEvents(),
      getInventoryItemsForWaste(),
    ])
    if (invResult.success && invResult.data) {
      setInventoryItems(invResult.data as InventoryItem[])
    }
    setInitialLoaded(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleRecorded = useCallback(() => {
    void analysis.fetchAnalysis()
    void analysis.fetchWasteEvents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Empty state
  if (initialLoaded && analysis.wasteEvents.length === 0 && !analysis.loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Waste Management</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No waste recorded yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start logging waste events to see analytics, predictions, and
              AI-powered recommendations.
            </p>
            <div className="w-full max-w-xl">
              <LogWasteForm
                inventoryItems={inventoryItems}
                onRecorded={handleRecorded}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Waste Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void analysis.fetchAnalysis()}
          disabled={analysis.loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${analysis.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Log Waste</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
            {analysis.criticalAlertsCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {analysis.criticalAlertsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Benchmarks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {analysis.loading && !initialLoaded ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-lg" />
            </div>
          ) : (
            <WasteOverview
              patterns={analysis.patterns}
              report={analysis.report}
              totalWasteValue={analysis.totalWasteValue}
              highRiskItemsCount={analysis.highRiskItemsCount}
              criticalAlertsCount={analysis.criticalAlertsCount}
              potentialSavings={analysis.potentialSavings}
            />
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <LogWasteForm
              inventoryItems={inventoryItems}
              onRecorded={handleRecorded}
            />
            <WasteEventsList
              wasteEvents={analysis.wasteEvents}
              inventoryItems={inventoryItems}
            />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <WasteAlerts alerts={analysis.alerts} />
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-6">
          <div className="space-y-6">
            <WasteBenchmarksTable benchmarks={analysis.benchmarks} />
            <BenchmarkStrategies benchmarks={analysis.benchmarks} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
