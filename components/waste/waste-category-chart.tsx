'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WastePattern } from '@/lib/engines/waste-analysis'

interface WasteCategoryChartProps {
  patterns: WastePattern[]
}

export function WasteCategoryChart({ patterns }: WasteCategoryChartProps) {
  // Group by category
  const categoryTotals = new Map<string, number>()
  for (const pattern of patterns) {
    const current = categoryTotals.get(pattern.category) ?? 0
    categoryTotals.set(pattern.category, current + pattern.totalWasteValue)
  }

  const categories = Array.from(categoryTotals.entries())
    .sort(([, a], [, b]) => b - a)

  const totalValue = categories.reduce((sum, [, value]) => sum + value, 0)
  const maxValue = categories.length > 0 ? categories[0][1] : 0

  const riskColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  // Find highest risk level per category
  function getCategoryRisk(category: string): string {
    const categoryPatterns = patterns.filter((p) => p.category === category)
    const riskOrder = ['critical', 'high', 'medium', 'low']
    for (const risk of riskOrder) {
      if (categoryPatterns.some((p) => p.riskLevel === risk)) return risk
    }
    return 'low'
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waste by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No waste data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(([category, value]) => {
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
            const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0
            const risk = getCategoryRisk(category)

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">
                    ${value.toFixed(0)} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-3 rounded-full transition-all ${riskColors[risk] ?? 'bg-primary'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {risk === 'critical' && (
                    <span className="text-xs text-red-500 font-medium">!</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
