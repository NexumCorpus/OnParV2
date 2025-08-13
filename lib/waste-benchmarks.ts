import { WastePattern } from './waste-analysis'

export interface IndustryBenchmark {
  category: string
  averageWasteRate: number
  bestPracticeWasteRate: number
  typicalCauses: string[]
  improvementStrategies: string[]
}

export interface BenchmarkComparison {
  itemCategory: string
  currentWasteRate: number
  industryAverage: number
  bestPractice: number
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'critical'
  improvementPotential: number
  recommendedActions: string[]
}

export class WasteBenchmarkEngine {
  // Industry benchmarks based on restaurant industry data
  private readonly industryBenchmarks: Record<string, IndustryBenchmark> = {
    'produce': {
      category: 'Produce',
      averageWasteRate: 15.2,
      bestPracticeWasteRate: 8.5,
      typicalCauses: ['Over-ripening', 'Poor storage conditions', 'Overordering', 'Seasonal demand fluctuations'],
      improvementStrategies: [
        'Implement FIFO rotation strictly',
        'Optimize storage temperature and humidity',
        'Reduce order quantities and increase frequency',
        'Use produce earlier in prep cycle'
      ]
    },
    'dairy': {
      category: 'Dairy',
      averageWasteRate: 8.7,
      bestPracticeWasteRate: 4.2,
      typicalCauses: ['Expiration', 'Temperature abuse', 'Overordering', 'Cross-contamination'],
      improvementStrategies: [
        'Monitor refrigeration temperatures closely',
        'Use smaller package sizes',
        'Implement strict expiration date tracking',
        'Train staff on proper handling'
      ]
    },
    'meat': {
      category: 'Meat & Seafood',
      averageWasteRate: 12.3,
      bestPracticeWasteRate: 6.8,
      typicalCauses: ['Spoilage', 'Freezer burn', 'Overordering', 'Poor portion control'],
      improvementStrategies: [
        'Vacuum seal for longer storage',
        'Implement portion control training',
        'Use predictive ordering based on sales',
        'Rotate stock more frequently'
      ]
    },
    'pantry': {
      category: 'Pantry Items',
      averageWasteRate: 5.1,
      bestPracticeWasteRate: 2.3,
      typicalCauses: ['Pest contamination', 'Moisture damage', 'Overordering', 'Poor storage'],
      improvementStrategies: [
        'Improve dry storage conditions',
        'Use airtight containers',
        'Implement pest control measures',
        'Regular inventory rotation'
      ]
    },
    'beverages': {
      category: 'Beverages',
      averageWasteRate: 6.8,
      bestPracticeWasteRate: 3.1,
      typicalCauses: ['Expiration', 'Overordering', 'Equipment issues', 'Seasonal demand'],
      improvementStrategies: [
        'Monitor expiration dates closely',
        'Adjust ordering for seasonal patterns',
        'Maintain beverage equipment properly',
        'Offer specials to move slow items'
      ]
    },
    'prepared_foods': {
      category: 'Prepared Foods',
      averageWasteRate: 18.5,
      bestPracticeWasteRate: 11.2,
      typicalCauses: ['Overproduction', 'Quality degradation', 'Menu changes', 'Poor demand forecasting'],
      improvementStrategies: [
        'Implement just-in-time preparation',
        'Use sales data for better forecasting',
        'Repurpose ingredients across menu items',
        'Offer daily specials to use excess prep'
      ]
    }
  }

  /**
   * Compare business waste patterns against industry benchmarks
   */
  benchmarkWastePatterns(wastePatterns: WastePattern[]): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = []

    for (const pattern of wastePatterns) {
      const categoryKey = this.mapCategoryToBenchmark(pattern.category)
      const benchmark = this.industryBenchmarks[categoryKey]

      if (benchmark) {
        const comparison = this.createBenchmarkComparison(pattern, benchmark)
        comparisons.push(comparison)
      }
    }

    return comparisons.sort((a, b) => b.improvementPotential - a.improvementPotential)
  }

  /**
   * Calculate overall waste performance score
   */
  calculateWastePerformanceScore(wastePatterns: WastePattern[]): {
    overallScore: number
    categoryScores: Record<string, number>
    improvementAreas: string[]
    strengths: string[]
  } {
    const categoryScores: Record<string, number> = {}
    const improvementAreas: string[] = []
    const strengths: string[] = []

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const pattern of wastePatterns) {
      const categoryKey = this.mapCategoryToBenchmark(pattern.category)
      const benchmark = this.industryBenchmarks[categoryKey]

      if (benchmark) {
        const score = this.calculateCategoryScore(pattern.wasteRate, benchmark)
        categoryScores[pattern.category] = score
        
        // Weight by waste value for overall score
        const weight = pattern.averageWasteValue
        totalWeightedScore += score * weight
        totalWeight += weight

        if (score < 60) {
          improvementAreas.push(pattern.category)
        } else if (score > 80) {
          strengths.push(pattern.category)
        }
      }
    }

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

    return {
      overallScore: Math.round(overallScore),
      categoryScores,
      improvementAreas,
      strengths
    }
  }

  /**
   * Generate waste reduction targets based on benchmarks
   */
  generateWasteReductionTargets(wastePatterns: WastePattern[]): {
    targets: Array<{
      itemId: string
      itemName: string
      currentWasteRate: number
      targetWasteRate: number
      potentialSavings: number
      timeframe: string
      difficulty: 'easy' | 'moderate' | 'challenging'
    }>
    totalPotentialSavings: number
  } {
    const targets = []
    let totalPotentialSavings = 0

    for (const pattern of wastePatterns) {
      const categoryKey = this.mapCategoryToBenchmark(pattern.category)
      const benchmark = this.industryBenchmarks[categoryKey]

      if (benchmark && pattern.wasteRate > benchmark.bestPracticeWasteRate) {
        // Set target between current rate and best practice, based on current performance
        const improvementPotential = pattern.wasteRate - benchmark.bestPracticeWasteRate
        const targetReduction = Math.min(improvementPotential * 0.6, pattern.wasteRate * 0.4) // Conservative target
        const targetWasteRate = pattern.wasteRate - targetReduction

        const potentialSavings = pattern.averageWasteValue * (targetReduction / pattern.wasteRate)
        totalPotentialSavings += potentialSavings

        const difficulty = this.assessImprovementDifficulty(pattern, benchmark)
        const timeframe = this.estimateImprovementTimeframe(difficulty)

        targets.push({
          itemId: pattern.itemId,
          itemName: pattern.itemName,
          currentWasteRate: Math.round(pattern.wasteRate * 10) / 10,
          targetWasteRate: Math.round(targetWasteRate * 10) / 10,
          potentialSavings: Math.round(potentialSavings),
          timeframe,
          difficulty
        })
      }
    }

    return {
      targets: targets.sort((a, b) => b.potentialSavings - a.potentialSavings),
      totalPotentialSavings: Math.round(totalPotentialSavings)
    }
  }

  /**
   * Get improvement strategies for specific categories
   */
  getImprovementStrategies(category: string): string[] {
    const categoryKey = this.mapCategoryToBenchmark(category)
    const benchmark = this.industryBenchmarks[categoryKey]
    return benchmark?.improvementStrategies || []
  }

  // Private helper methods

  private mapCategoryToBenchmark(category: string): string {
    const categoryLower = category.toLowerCase()
    
    if (categoryLower.includes('produce') || categoryLower.includes('vegetable') || categoryLower.includes('fruit')) {
      return 'produce'
    }
    if (categoryLower.includes('dairy') || categoryLower.includes('milk') || categoryLower.includes('cheese')) {
      return 'dairy'
    }
    if (categoryLower.includes('meat') || categoryLower.includes('seafood') || categoryLower.includes('fish') || categoryLower.includes('poultry')) {
      return 'meat'
    }
    if (categoryLower.includes('beverage') || categoryLower.includes('drink') || categoryLower.includes('soda')) {
      return 'beverages'
    }
    if (categoryLower.includes('prepared') || categoryLower.includes('ready')) {
      return 'prepared_foods'
    }
    
    return 'pantry' // Default category
  }

  private createBenchmarkComparison(pattern: WastePattern, benchmark: IndustryBenchmark): BenchmarkComparison {
    const performance = this.assessPerformance(pattern.wasteRate, benchmark)
    const improvementPotential = Math.max(0, pattern.wasteRate - benchmark.bestPracticeWasteRate)
    
    return {
      itemCategory: pattern.category,
      currentWasteRate: Math.round(pattern.wasteRate * 10) / 10,
      industryAverage: benchmark.averageWasteRate,
      bestPractice: benchmark.bestPracticeWasteRate,
      performance,
      improvementPotential: Math.round(improvementPotential * 10) / 10,
      recommendedActions: benchmark.improvementStrategies.slice(0, 3) // Top 3 strategies
    }
  }

  private assessPerformance(wasteRate: number, benchmark: IndustryBenchmark): 'excellent' | 'good' | 'average' | 'poor' | 'critical' {
    if (wasteRate <= benchmark.bestPracticeWasteRate * 1.1) return 'excellent'
    if (wasteRate <= benchmark.averageWasteRate * 0.8) return 'good'
    if (wasteRate <= benchmark.averageWasteRate * 1.2) return 'average'
    if (wasteRate <= benchmark.averageWasteRate * 1.5) return 'poor'
    return 'critical'
  }

  private calculateCategoryScore(wasteRate: number, benchmark: IndustryBenchmark): number {
    // Score from 0-100 based on position between worst case and best practice
    const worstCase = benchmark.averageWasteRate * 2 // Assume worst case is 2x industry average
    const bestCase = benchmark.bestPracticeWasteRate
    
    if (wasteRate <= bestCase) return 100
    if (wasteRate >= worstCase) return 0
    
    return Math.round(((worstCase - wasteRate) / (worstCase - bestCase)) * 100)
  }

  private assessImprovementDifficulty(pattern: WastePattern, benchmark: IndustryBenchmark): 'easy' | 'moderate' | 'challenging' {
    const improvementNeeded = pattern.wasteRate - benchmark.bestPracticeWasteRate
    const relativeImprovement = improvementNeeded / pattern.wasteRate
    
    if (relativeImprovement < 0.3) return 'easy'
    if (relativeImprovement < 0.6) return 'moderate'
    return 'challenging'
  }

  private estimateImprovementTimeframe(difficulty: 'easy' | 'moderate' | 'challenging'): string {
    switch (difficulty) {
      case 'easy': return '2-4 weeks'
      case 'moderate': return '1-3 months'
      case 'challenging': return '3-6 months'
    }
  }
}

// Export singleton instance
export const wasteBenchmarkEngine = new WasteBenchmarkEngine()