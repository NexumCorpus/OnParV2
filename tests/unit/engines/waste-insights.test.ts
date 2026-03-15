import { describe, it, expect } from 'vitest'
import { generateReport } from '@/lib/engines/waste-insights'
import type { WastePattern } from '@/lib/engines/waste-analysis'
import type { BenchmarkComparison } from '@/lib/engines/waste-benchmarks'
import type { WastePrediction } from '@/lib/engines/waste-predictions'

function makePattern(overrides: Partial<WastePattern> = {}): WastePattern {
  return {
    itemId: 'item-1',
    itemName: 'Lettuce',
    category: 'Produce',
    totalWasteQuantity: 10,
    totalWasteValue: 50,
    wasteRate: 8,
    riskLevel: 'medium',
    primaryReason: 'expired',
    occurrences: 3,
    trend: 'stable',
    ...overrides,
  }
}

function makeBenchmark(overrides: Partial<BenchmarkComparison> = {}): BenchmarkComparison {
  return {
    category: 'Produce',
    userRate: 8,
    industryAverage: 12,
    bestInClass: 5,
    percentile: 65,
    rating: 'average',
    ...overrides,
  }
}

function makePrediction(overrides: Partial<WastePrediction> = {}): WastePrediction {
  return {
    itemId: 'item-1',
    itemName: 'Lettuce',
    predictedWasteQuantity: 5,
    predictedWasteValue: 25,
    confidence: 75,
    factors: [],
    ...overrides,
  }
}

describe('Waste Insights Engine', () => {
  describe('generateReport', () => {
    it('generates a report with summary, patterns, recommendations, targets, and seasonal insights', () => {
      const report = generateReport({
        wastePatterns: [makePattern()],
        benchmarks: [makeBenchmark()],
        predictions: [makePrediction()],
        avgWasteRate: 8,
      })

      expect(report.summary).toBeDefined()
      expect(report.patterns).toHaveLength(1)
      expect(report.recommendations.length).toBeGreaterThanOrEqual(1)
      expect(report.targets.length).toBeGreaterThanOrEqual(1)
      expect(report.seasonalInsights.length).toBeGreaterThan(0)
      expect(report.generatedAt).toBeInstanceOf(Date)
    })

    it('calculates performance score from average waste rate', () => {
      const report = generateReport({
        wastePatterns: [],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 5,
      })

      // score = 100 - 5*5 = 75
      expect(report.summary.performanceScore).toBe(75)
    })

    it('deducts 10 from performance score for critical patterns', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ riskLevel: 'critical' })],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 5,
      })

      // score = 100 - 25 - 10 (critical) = 65
      expect(report.summary.performanceScore).toBe(65)
    })

    it('deducts 5 per high risk item from performance score', () => {
      const report = generateReport({
        wastePatterns: [
          makePattern({ riskLevel: 'high', itemId: 'a' }),
          makePattern({ riskLevel: 'high', itemId: 'b' }),
        ],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 5,
      })

      // score = 100 - 25 - 10 (2 high) = 65
      expect(report.summary.performanceScore).toBe(65)
    })

    it('clamps performance score to 0-100', () => {
      const report = generateReport({
        wastePatterns: [],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 30,
      })

      // score = 100 - 150 = -50, clamped to 0
      expect(report.summary.performanceScore).toBe(0)
    })

    it('calculates totalWasteValue from patterns', () => {
      const report = generateReport({
        wastePatterns: [
          makePattern({ totalWasteValue: 100 }),
          makePattern({ totalWasteValue: 200, itemId: 'item-2' }),
        ],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      expect(report.summary.totalWasteValue).toBe(300)
    })

    it('counts high risk items correctly', () => {
      const report = generateReport({
        wastePatterns: [
          makePattern({ riskLevel: 'critical' }),
          makePattern({ riskLevel: 'high', itemId: 'item-2' }),
          makePattern({ riskLevel: 'low', itemId: 'item-3' }),
        ],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      expect(report.summary.highRiskItems).toBe(2)
    })

    it('generates recommendations for expired items', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ primaryReason: 'expired', riskLevel: 'high' })],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      const rec = report.recommendations.find((r) => r.title.includes('FIFO'))
      expect(rec).toBeDefined()
      expect(rec?.difficulty).toBe('easy')
    })

    it('generates recommendations for spoiled items', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ primaryReason: 'spoiled', riskLevel: 'high' })],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      const rec = report.recommendations.find((r) => r.title.includes('Temperature'))
      expect(rec).toBeDefined()
      expect(rec?.difficulty).toBe('moderate')
    })

    it('generates recommendations for overproduction', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ primaryReason: 'overproduction', riskLevel: 'medium' })],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      const rec = report.recommendations.find((r) => r.title.includes('batch sizes'))
      expect(rec).toBeDefined()
    })

    it('generates recommendations for prep waste', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ primaryReason: 'prep_waste', riskLevel: 'medium' })],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      const rec = report.recommendations.find((r) => r.title.includes('training'))
      expect(rec).toBeDefined()
    })

    it('generates reduction targets using benchmarks', () => {
      const report = generateReport({
        wastePatterns: [makePattern({ wasteRate: 10 })],
        benchmarks: [makeBenchmark({ category: 'Produce', bestInClass: 5, industryAverage: 12 })],
        predictions: [],
        avgWasteRate: 10,
      })

      const target = report.targets.find((t) => t.category === 'Produce')
      expect(target).toBeDefined()
      // targetRate = (5 + 12) / 2 = 8.5
      expect(target?.targetRate).toBe(8.5)
      expect(target?.strategies.length).toBeGreaterThan(0)
    })

    it('returns seasonal insights for summer, holidays, and winter', () => {
      const report = generateReport({
        wastePatterns: [],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 5,
      })

      expect(report.seasonalInsights).toHaveLength(3)
      expect(report.seasonalInsights[0].month).toContain('June')
      expect(report.seasonalInsights[1].month).toContain('November')
      expect(report.seasonalInsights[2].month).toContain('January')
    })

    it('handles empty input gracefully', () => {
      const report = generateReport({
        wastePatterns: [],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 0,
      })

      expect(report.summary.totalWasteValue).toBe(0)
      expect(report.summary.highRiskItems).toBe(0)
      expect(report.recommendations).toHaveLength(0)
      expect(report.targets).toHaveLength(0)
      expect(report.summary.performanceScore).toBe(100)
    })

    it('sorts recommendations by expectedSavings descending', () => {
      const report = generateReport({
        wastePatterns: [
          makePattern({ totalWasteValue: 50, riskLevel: 'medium', itemId: 'a' }),
          makePattern({ totalWasteValue: 200, riskLevel: 'high', itemId: 'b' }),
        ],
        benchmarks: [],
        predictions: [],
        avgWasteRate: 8,
      })

      if (report.recommendations.length >= 2) {
        expect(report.recommendations[0].expectedSavings).toBeGreaterThanOrEqual(
          report.recommendations[1].expectedSavings
        )
      }
    })
  })
})
