import { wasteAnalysisEngine, WastePattern, WasteSavingsCalculation } from './waste-analysis'
import { wasteBenchmarkEngine, BenchmarkComparison } from './waste-benchmarks'
import { supabase } from './supabase'

export interface WasteInsightReport {
  businessId: string
  generatedAt: Date
  summary: {
    totalWasteValue: number
    highRiskItems: number
    potentialSavings: number
    performanceScore: number
  }
  patterns: WastePattern[]
  benchmarks: BenchmarkComparison[]
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
  actionSteps: string[]
  successMetrics: string[]
  affectedItems: string[]
}

export interface WasteReductionTarget {
  itemId: string
  itemName: string
  category: string
  currentWasteRate: number
  targetWasteRate: number
  potentialMonthlySavings: number
  timeframe: string
  strategies: string[]
}

export interface SeasonalInsight {
  period: string
  insight: string
  impact: 'positive' | 'negative' | 'neutral'
  recommendedActions: string[]
}

export class WasteInsightsService {
  /**
   * Generate comprehensive waste insights report for a business
   */
  async generateWasteInsightsReport(businessId: string): Promise<WasteInsightReport> {
    try {
      // Analyze current waste patterns
      const patterns = await wasteAnalysisEngine.analyzeWastePatterns(businessId)
      
      // Benchmark against industry standards
      const benchmarks = wasteBenchmarkEngine.benchmarkWastePatterns(patterns)
      
      // Generate performance score
      const performanceData = wasteBenchmarkEngine.calculateWastePerformanceScore(patterns)
      
      // Generate reduction targets
      const targetData = wasteBenchmarkEngine.generateWasteReductionTargets(patterns)
      
      // Create recommendations
      const recommendations = await this.generateRecommendations(businessId, patterns, benchmarks)
      
      // Analyze seasonal insights
      const seasonalInsights = await this.generateSeasonalInsights(businessId, patterns)
      
      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(patterns, targetData.totalPotentialSavings, performanceData.overallScore)
      
      const report: WasteInsightReport = {
        businessId,
        generatedAt: new Date(),
        summary,
        patterns,
        benchmarks,
        recommendations,
        targets: targetData.targets.map(target => ({
          itemId: target.itemId,
          itemName: target.itemName,
          category: this.getCategoryForItem(target.itemId, patterns),
          currentWasteRate: target.currentWasteRate,
          targetWasteRate: target.targetWasteRate,
          potentialMonthlySavings: target.potentialSavings,
          timeframe: target.timeframe,
          strategies: wasteBenchmarkEngine.getImprovementStrategies(this.getCategoryForItem(target.itemId, patterns))
        })),
        seasonalInsights
      }

      // Store the report in the database
      await this.storeInsightsReport(report)
      
      return report
    } catch (error) {
      console.error('Error generating waste insights report:', error)
      throw new Error('Failed to generate waste insights report')
    }
  }

  /**
   * Generate specific recommendations based on waste patterns and benchmarks
   */
  private async generateRecommendations(
    businessId: string,
    patterns: WastePattern[],
    benchmarks: BenchmarkComparison[]
  ): Promise<WasteRecommendation[]> {
    const recommendations: WasteRecommendation[] = []

    // High-impact recommendations based on worst performers
    const criticalPatterns = patterns.filter(p => p.riskLevel === 'critical').slice(0, 3)
    
    for (const pattern of criticalPatterns) {
      const benchmark = benchmarks.find(b => b.itemCategory === pattern.category)
      
      if (benchmark) {
        const recommendation = this.createHighImpactRecommendation(pattern, benchmark)
        recommendations.push(recommendation)
      }
    }

    // Category-specific recommendations
    const categoryRecommendations = await this.generateCategoryRecommendations(businessId, patterns)
    recommendations.push(...categoryRecommendations)

    // Seasonal recommendations
    const seasonalRecommendations = this.generateSeasonalRecommendations(patterns)
    recommendations.push(...seasonalRecommendations)

    // Sort by expected savings (highest first)
    return recommendations.sort((a, b) => b.expectedSavings - a.expectedSavings)
  }

  private createHighImpactRecommendation(pattern: WastePattern, benchmark: BenchmarkComparison): WasteRecommendation {
    const potentialReduction = Math.min(pattern.wasteRate * 0.4, pattern.wasteRate - benchmark.bestPractice)
    const expectedSavings = pattern.averageWasteValue * (potentialReduction / pattern.wasteRate)

    return {
      id: `high-impact-${pattern.itemId}`,
      priority: 'high',
      category: pattern.category,
      title: `Reduce ${pattern.itemName} waste by ${Math.round(potentialReduction)}%`,
      description: `${pattern.itemName} has a waste rate of ${pattern.wasteRate.toFixed(1)}%, significantly above the industry best practice of ${benchmark.bestPractice}%. Implementing targeted improvements could save $${Math.round(expectedSavings)} monthly.`,
      expectedSavings: Math.round(expectedSavings),
      implementationCost: this.estimateImplementationCost(potentialReduction, pattern.averageWasteValue),
      difficulty: this.assessDifficulty(potentialReduction / pattern.wasteRate),
      timeframe: this.estimateTimeframe(potentialReduction / pattern.wasteRate),
      actionSteps: benchmark.recommendedActions,
      successMetrics: [
        `Reduce waste rate to ${(pattern.wasteRate - potentialReduction).toFixed(1)}%`,
        `Save $${Math.round(expectedSavings)} monthly`,
        'Improve inventory turnover ratio',
        'Reduce expired item incidents'
      ],
      affectedItems: [pattern.itemName]
    }
  }

  private async generateCategoryRecommendations(businessId: string, patterns: WastePattern[]): Promise<WasteRecommendation[]> {
    const categoryGroups = this.groupPatternsByCategory(patterns)
    const recommendations: WasteRecommendation[] = []

    for (const [category, categoryPatterns] of categoryGroups.entries()) {
      const totalCategoryWaste = categoryPatterns.reduce((sum, p) => sum + p.averageWasteValue, 0)
      
      if (totalCategoryWaste > 100) { // Only create recommendations for significant waste categories
        const recommendation = this.createCategoryRecommendation(category, categoryPatterns)
        recommendations.push(recommendation)
      }
    }

    return recommendations
  }

  private createCategoryRecommendation(category: string, patterns: WastePattern[]): WasteRecommendation {
    const totalWaste = patterns.reduce((sum, p) => sum + p.averageWasteValue, 0)
    const avgWasteRate = patterns.reduce((sum, p) => sum + p.wasteRate, 0) / patterns.length
    const strategies = wasteBenchmarkEngine.getImprovementStrategies(category)

    return {
      id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
      priority: totalWaste > 300 ? 'high' : 'medium',
      category,
      title: `Optimize ${category} inventory management`,
      description: `Your ${category} category shows an average waste rate of ${avgWasteRate.toFixed(1)}% across ${patterns.length} items, costing $${Math.round(totalWaste)} monthly. Implementing category-wide improvements could significantly reduce waste.`,
      expectedSavings: Math.round(totalWaste * 0.25), // Conservative 25% improvement
      implementationCost: Math.round(totalWaste * 0.1), // 10% of waste value as implementation cost
      difficulty: 'moderate',
      timeframe: '1-3 months',
      actionSteps: strategies,
      successMetrics: [
        `Reduce category waste rate by 25%`,
        `Save $${Math.round(totalWaste * 0.25)} monthly`,
        'Improve category inventory turnover',
        'Standardize category storage procedures'
      ],
      affectedItems: patterns.map(p => p.itemName)
    }
  }

  private generateSeasonalRecommendations(patterns: WastePattern[]): WasteRecommendation[] {
    const recommendations: WasteRecommendation[] = []
    const currentSeason = this.getCurrentSeason()
    
    // Find items with high seasonal variation
    const seasonalItems = patterns.filter(pattern => {
      const currentSeasonTrend = pattern.seasonalTrends.find(t => t.period === currentSeason)
      return currentSeasonTrend && currentSeasonTrend.wasteMultiplier > 1.3
    })

    if (seasonalItems.length > 0) {
      const totalSeasonalWaste = seasonalItems.reduce((sum, p) => sum + p.averageWasteValue, 0)
      
      recommendations.push({
        id: `seasonal-${currentSeason}`,
        priority: 'medium',
        category: 'Seasonal Management',
        title: `Prepare for ${currentSeason} seasonal waste patterns`,
        description: `Historical data shows ${seasonalItems.length} items have higher waste rates during ${currentSeason}. Proactive management could prevent $${Math.round(totalSeasonalWaste * 0.3)} in additional waste.`,
        expectedSavings: Math.round(totalSeasonalWaste * 0.3),
        implementationCost: 50, // Low cost for planning adjustments
        difficulty: 'easy',
        timeframe: '2-4 weeks',
        actionSteps: [
          'Review historical seasonal patterns',
          'Adjust ordering quantities for seasonal items',
          'Implement seasonal menu planning',
          'Train staff on seasonal inventory management'
        ],
        successMetrics: [
          'Maintain waste rates below seasonal averages',
          'Reduce seasonal waste spikes by 30%',
          'Improve seasonal demand forecasting accuracy'
        ],
        affectedItems: seasonalItems.map(p => p.itemName)
      })
    }

    return recommendations
  }

  private async generateSeasonalInsights(businessId: string, patterns: WastePattern[]): Promise<SeasonalInsight[]> {
    const insights: SeasonalInsight[] = []
    const currentSeason = this.getCurrentSeason()
    
    // Analyze seasonal trends across all patterns
    const seasonalData = this.aggregateSeasonalTrends(patterns)
    
    for (const [period, data] of seasonalData.entries()) {
      if (data.avgMultiplier !== 1.0) {
        const impact = data.avgMultiplier > 1.1 ? 'negative' : data.avgMultiplier < 0.9 ? 'positive' : 'neutral'
        const insight = this.generateSeasonalInsightText(period, data.avgMultiplier, data.itemCount)
        const actions = this.getSeasonalActions(period, impact)
        
        insights.push({
          period,
          insight,
          impact,
          recommendedActions: actions
        })
      }
    }

    return insights
  }

  // Helper methods

  private calculateSummaryMetrics(patterns: WastePattern[], potentialSavings: number, performanceScore: number) {
    const totalWasteValue = patterns.reduce((sum, p) => sum + p.averageWasteValue, 0)
    const highRiskItems = patterns.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length

    return {
      totalWasteValue: Math.round(totalWasteValue),
      highRiskItems,
      potentialSavings: Math.round(potentialSavings),
      performanceScore: Math.round(performanceScore)
    }
  }

  private getCategoryForItem(itemId: string, patterns: WastePattern[]): string {
    const pattern = patterns.find(p => p.itemId === itemId)
    return pattern?.category || 'Uncategorized'
  }

  private groupPatternsByCategory(patterns: WastePattern[]): Map<string, WastePattern[]> {
    const groups = new Map<string, WastePattern[]>()
    
    for (const pattern of patterns) {
      if (!groups.has(pattern.category)) {
        groups.set(pattern.category, [])
      }
      groups.get(pattern.category)!.push(pattern)
    }
    
    return groups
  }

  private estimateImplementationCost(reductionAmount: number, wasteValue: number): number {
    // Estimate implementation cost as percentage of potential savings
    const potentialSavings = wasteValue * (reductionAmount / 100)
    return Math.round(potentialSavings * 0.15) // 15% of potential savings
  }

  private assessDifficulty(reductionPercentage: number): 'easy' | 'moderate' | 'challenging' {
    if (reductionPercentage < 0.3) return 'easy'
    if (reductionPercentage < 0.6) return 'moderate'
    return 'challenging'
  }

  private estimateTimeframe(reductionPercentage: number): string {
    if (reductionPercentage < 0.3) return '2-4 weeks'
    if (reductionPercentage < 0.6) return '1-3 months'
    return '3-6 months'
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'Spring'
    if (month >= 5 && month <= 7) return 'Summer'
    if (month >= 8 && month <= 10) return 'Fall'
    return 'Winter'
  }

  private aggregateSeasonalTrends(patterns: WastePattern[]): Map<string, { avgMultiplier: number; itemCount: number }> {
    const seasonalData = new Map<string, { totalMultiplier: number; itemCount: number }>()
    
    for (const pattern of patterns) {
      for (const trend of pattern.seasonalTrends) {
        if (!seasonalData.has(trend.period)) {
          seasonalData.set(trend.period, { totalMultiplier: 0, itemCount: 0 })
        }
        const data = seasonalData.get(trend.period)!
        data.totalMultiplier += trend.wasteMultiplier
        data.itemCount += 1
      }
    }
    
    // Calculate averages
    const result = new Map<string, { avgMultiplier: number; itemCount: number }>()
    for (const [period, data] of seasonalData.entries()) {
      result.set(period, {
        avgMultiplier: data.totalMultiplier / data.itemCount,
        itemCount: data.itemCount
      })
    }
    
    return result
  }

  private generateSeasonalInsightText(period: string, multiplier: number, itemCount: number): string {
    const percentage = Math.round((multiplier - 1) * 100)
    if (percentage > 10) {
      return `During ${period}, waste rates typically increase by ${percentage}% across ${itemCount} items. This seasonal pattern suggests higher demand volatility or storage challenges.`
    } else if (percentage < -10) {
      return `During ${period}, waste rates typically decrease by ${Math.abs(percentage)}% across ${itemCount} items. This is your most efficient season for inventory management.`
    }
    return `During ${period}, waste rates remain relatively stable across ${itemCount} items.`
  }

  private getSeasonalActions(period: string, impact: 'positive' | 'negative' | 'neutral'): string[] {
    if (impact === 'negative') {
      return [
        `Reduce order quantities during ${period}`,
        'Implement more frequent deliveries',
        'Adjust menu offerings for seasonal demand',
        'Increase staff training on waste prevention'
      ]
    } else if (impact === 'positive') {
      return [
        `Leverage ${period} efficiency for inventory optimization`,
        'Document best practices from this period',
        'Consider expanding menu during efficient seasons',
        'Use this period for staff training and process improvement'
      ]
    }
    return [
      'Monitor for any emerging seasonal patterns',
      'Maintain current inventory management practices'
    ]
  }

  private async storeInsightsReport(report: WasteInsightReport): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .insert({
          business_id: report.businessId,
          insight_type: 'waste_reduction',
          title: 'Waste Reduction Analysis',
          description: `Comprehensive waste analysis identifying $${report.summary.potentialSavings} in potential monthly savings`,
          confidence_score: report.summary.performanceScore / 100,
          impact_estimate: report.summary.potentialSavings,
          data: {
            summary: report.summary,
            patterns: report.patterns,
            benchmarks: report.benchmarks,
            recommendations: report.recommendations,
            targets: report.targets,
            seasonalInsights: report.seasonalInsights
          },
          generated_at: report.generatedAt.toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error storing insights report:', error)
      // Don't throw here - report generation should succeed even if storage fails
    }
  }
}

// Export singleton instance
export const wasteInsightsService = new WasteInsightsService()