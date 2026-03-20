import type { WastePattern } from './waste-analysis'
import type { WastePrediction } from './waste-predictions'
import type { BenchmarkComparison } from './waste-benchmarks'

// --- Types ---

export interface WasteInsightReport {
  userId: string
  generatedAt: Date
  summary: {
    totalWasteValue: number
    highRiskItems: number
    potentialSavings: number
    performanceScore: number // 0-100
  }
  patterns: WastePattern[]
  recommendations: WasteRecommendation[]
  targets: WasteReductionTarget[]
  seasonalInsights: SeasonalInsight[]
}

export interface WasteRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  expectedSavings: number
  implementationCost: number
  difficulty: 'easy' | 'moderate' | 'challenging'
  timeframe: string
}

export interface WasteReductionTarget {
  category: string
  currentRate: number
  targetRate: number
  timeframe: string
  strategies: string[]
}

export interface SeasonalInsight {
  month: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}

// --- Helper functions ---

function calculatePerformanceScore(
  avgWasteRate: number,
  patterns: WastePattern[]
): number {
  let score = 100 - avgWasteRate * 5
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))

  // Adjust: -10 if any critical patterns
  const hasCritical = patterns.some((p) => p.riskLevel === 'critical')
  if (hasCritical) {
    score -= 10
  }

  // -5 per high risk item
  const highRiskCount = patterns.filter((p) => p.riskLevel === 'high').length
  score -= highRiskCount * 5

  return Math.max(0, Math.min(100, score))
}

function generateRecommendationsFromPatterns(
  patterns: WastePattern[]
): WasteRecommendation[] {
  const recommendations: WasteRecommendation[] = []
  let recIndex = 0

  const mediumOrAbove = patterns.filter(
    (p) => p.riskLevel === 'critical' || p.riskLevel === 'high' || p.riskLevel === 'medium'
  )

  for (const pattern of mediumOrAbove) {
    const priority = pattern.riskLevel === 'critical' || pattern.riskLevel === 'high' ? 'high' : 'medium'
    const expectedSavings = pattern.totalWasteValue * 0.3 // 30% reduction target

    let title: string
    let description: string
    let difficulty: 'easy' | 'moderate' | 'challenging'
    let timeframe: string
    let implementationCost: number

    switch (pattern.primaryReason) {
      case 'expired':
        title = `Improve FIFO rotation for ${pattern.itemName}`
        description = `${pattern.itemName} has ${pattern.wasteRate.toFixed(1)}% waste rate due to expiration. Implement first-in-first-out storage and expiry date labeling.`
        difficulty = 'easy'
        timeframe = '1-2 weeks'
        implementationCost = 50
        break
      case 'spoiled':
        title = `Temperature monitoring for ${pattern.itemName}`
        description = `${pattern.itemName} spoilage indicates possible storage issues. Install temperature monitors and check storage conditions.`
        difficulty = 'moderate'
        timeframe = '2-4 weeks'
        implementationCost = 200
        break
      case 'overproduction':
        title = `Reduce batch sizes for ${pattern.itemName}`
        description = `${pattern.itemName} overproduction waste of $${pattern.totalWasteValue.toFixed(2)}. Reduce batch sizes and implement demand forecasting.`
        difficulty = 'moderate'
        timeframe = '1-2 weeks'
        implementationCost = 0
        break
      case 'prep_waste':
        title = `Staff training for ${pattern.itemName} preparation`
        description = `${pattern.itemName} prep waste of $${pattern.totalWasteValue.toFixed(2)}. Train staff on efficient preparation techniques.`
        difficulty = 'easy'
        timeframe = '1 week'
        implementationCost = 100
        break
      default:
        title = `Reduce waste for ${pattern.itemName}`
        description = `${pattern.itemName} has ${pattern.wasteRate.toFixed(1)}% waste rate ($${pattern.totalWasteValue.toFixed(2)} total). Review handling and storage procedures.`
        difficulty = 'moderate'
        timeframe = '2-4 weeks'
        implementationCost = 100
        break
    }

    recommendations.push({
      id: `rec-${recIndex++}`,
      priority,
      category: pattern.category,
      title,
      description,
      expectedSavings,
      implementationCost,
      difficulty,
      timeframe,
    })
  }

  // Sort by expectedSavings descending
  recommendations.sort((a, b) => b.expectedSavings - a.expectedSavings)
  return recommendations
}

function generateTargets(
  patterns: WastePattern[],
  benchmarks: BenchmarkComparison[]
): WasteReductionTarget[] {
  const benchmarkMap = new Map<string, BenchmarkComparison>()
  for (const b of benchmarks) {
    benchmarkMap.set(b.category, b)
  }

  // Group patterns by category
  const categoryRates = new Map<string, number[]>()
  for (const p of patterns) {
    const rates = categoryRates.get(p.category) ?? []
    rates.push(p.wasteRate)
    categoryRates.set(p.category, rates)
  }

  const targets: WasteReductionTarget[] = []
  for (const [category, rates] of categoryRates) {
    const currentRate = rates.reduce((sum, r) => sum + r, 0) / rates.length
    const benchmark = benchmarkMap.get(category)
    const targetRate = benchmark
      ? (benchmark.bestInClass + benchmark.industryAverage) / 2
      : currentRate * 0.7

    const strategies: string[] = []
    if (currentRate > 10) strategies.push('Implement portion control')
    if (currentRate > 5) strategies.push('Improve storage practices')
    strategies.push('Regular inventory audits')
    strategies.push('Staff training on waste reduction')

    targets.push({
      category,
      currentRate,
      targetRate,
      timeframe: '3 months',
      strategies,
    })
  }

  return targets
}

function generateSeasonalInsights(): SeasonalInsight[] {
  return [
    {
      month: 'June-August',
      insight: 'Summer heat increases spoilage for dairy and produce',
      impact: 'high',
      recommendation: 'Reduce order quantities and increase delivery frequency',
    },
    {
      month: 'November-December',
      insight: 'Holiday season increases demand but also surplus risk',
      impact: 'medium',
      recommendation: 'Plan holiday menus in advance, pre-order key ingredients',
    },
    {
      month: 'January-February',
      insight: 'Post-holiday slowdown reduces demand across all categories',
      impact: 'medium',
      recommendation: 'Reduce order quantities significantly, minimize perishable stock',
    },
  ]
}

// --- Main Report Generation ---

export function generateReport(data: {
  wastePatterns: WastePattern[]
  benchmarks: BenchmarkComparison[]
  predictions: WastePrediction[]
  avgWasteRate: number
}): Omit<WasteInsightReport, 'userId'> {
  const { wastePatterns, benchmarks, avgWasteRate } = data

  const totalWasteValue = wastePatterns.reduce((sum, p) => sum + p.totalWasteValue, 0)
  const highRiskItems = wastePatterns.filter(
    (p) => p.riskLevel === 'critical' || p.riskLevel === 'high'
  ).length

  const recommendations = generateRecommendationsFromPatterns(wastePatterns)
  const potentialSavings = recommendations.reduce((sum, r) => sum + r.expectedSavings, 0)
  const performanceScore = calculatePerformanceScore(avgWasteRate, wastePatterns)

  const targets = generateTargets(wastePatterns, benchmarks)
  const seasonalInsights = generateSeasonalInsights()

  return {
    generatedAt: new Date(),
    summary: {
      totalWasteValue,
      highRiskItems,
      potentialSavings,
      performanceScore,
    },
    patterns: wastePatterns,
    recommendations,
    targets,
    seasonalInsights,
  }
}
