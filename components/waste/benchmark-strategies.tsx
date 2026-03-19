'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import type { BenchmarkComparison } from '@/lib/engines/waste-benchmarks'

interface BenchmarkStrategiesProps {
  benchmarks: BenchmarkComparison[]
}

const categoryStrategies: Record<string, string[]> = {
  Produce: [
    'Implement first-in-first-out (FIFO) rotation',
    'Store at optimal temperature and humidity',
    'Use produce within planned menu cycle',
  ],
  Dairy: [
    'First-in-first-out (FIFO) rotation (-2% waste)',
    'Temperature monitoring (-1% waste)',
    'Smaller, more frequent orders (-1% waste)',
  ],
  Meat: [
    'Proper vacuum sealing and storage',
    'Use trim and bones for stocks',
    'Strict temperature control during prep',
  ],
  Seafood: [
    'Daily freshness checks',
    'Reduce order frequency, buy fresher',
    'Cross-utilize in daily specials',
  ],
  Bakery: [
    'Implement day-old bread program (-3% waste)',
    'Reduce batch sizes during slow days (-2% waste)',
    'Partner with food banks for surplus (-5% waste)',
  ],
  Pantry: [
    'Regular inventory audits',
    'Proper storage in cool, dry conditions',
    'Use-by date tracking system',
  ],
  Beverages: [
    'Track expiration dates',
    'Adjust stock to match sales trends',
    'Rotate stock regularly',
  ],
  Frozen: [
    'Maintain consistent freezer temperature',
    'Label with freeze dates',
    'Regular freezer organization',
  ],
}

export function BenchmarkStrategies({ benchmarks }: BenchmarkStrategiesProps) {
  // Only show strategies for categories that need improvement (below_average or poor)
  const needsImprovement = benchmarks.filter(
    (b) => b.rating === 'below_average' || b.rating === 'poor'
  )

  if (needsImprovement.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Improvement Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Great job! All your categories are at or above industry average.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsImprovement.map((benchmark) => {
          const strategies = categoryStrategies[benchmark.category] ?? [
            'Review handling procedures',
            'Implement waste tracking',
            'Train staff on best practices',
          ]
          const Icon = benchmark.rating === 'poor' ? AlertTriangle : AlertCircle
          const iconColor =
            benchmark.rating === 'poor' ? 'text-red-500' : 'text-orange-500'

          const potentialReduction = benchmark.userRate - benchmark.industryAverage
          const estimatedSavings = potentialReduction > 0 ? potentialReduction * 10 : 0

          return (
            <div key={benchmark.category} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <span className="font-medium">
                  {benchmark.category}: {benchmark.userRate.toFixed(1)}% waste
                </span>
                <span className="text-sm text-muted-foreground">
                  (industry avg: {benchmark.industryAverage.toFixed(0)}%)
                </span>
              </div>
              <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                {strategies.map((strategy) => (
                  <li key={strategy}>{strategy}</li>
                ))}
              </ul>
              {estimatedSavings > 0 && (
                <p className="mt-2 text-sm font-medium">
                  Potential savings: ~${estimatedSavings.toFixed(0)}/month
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
