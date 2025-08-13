import { supabase } from './supabase'

export interface WastePattern {
  itemId: string
  itemName: string
  category: string
  wasteRate: number // Percentage of inventory that goes to waste
  averageWasteValue: number // Dollar value of waste per period
  wasteReasons: string[]
  seasonalTrends: SeasonalTrend[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SeasonalTrend {
  period: string // 'Q1', 'Q2', 'Q3', 'Q4' or 'Jan', 'Feb', etc.
  wasteMultiplier: number // 1.0 = average, >1.0 = higher waste, <1.0 = lower waste
  confidence: number // 0-1 confidence score
}

export interface WasteSavingsCalculation {
  currentWasteValue: number
  potentialSavings: number
  savingsPercentage: number
  implementationCost: number
  netSavings: number
  paybackPeriod: number // months
}

export class WasteAnalysisEngine {
  /**
   * Analyzes inventory patterns to identify high-waste items
   */
  async analyzeWastePatterns(businessId: string, periodDays: number = 90): Promise<WastePattern[]> {
    try {
      // Get inventory transactions for the analysis period
      const { data: transactions, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory_items (
            id,
            name,
            category,
            unit_cost,
            reorder_point,
            max_stock_level
          )
        `)
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group transactions by item
      const itemTransactions = this.groupTransactionsByItem(transactions || [])
      
      // Analyze each item for waste patterns
      const wastePatterns: WastePattern[] = []
      
      for (const [itemId, itemTxns] of itemTransactions.entries()) {
        const pattern = await this.analyzeItemWastePattern(itemId, itemTxns, periodDays)
        if (pattern) {
          wastePatterns.push(pattern)
        }
      }

      // Sort by waste value (highest first)
      return wastePatterns.sort((a, b) => b.averageWasteValue - a.averageWasteValue)
    } catch (error) {
      console.error('Error analyzing waste patterns:', error)
      throw new Error('Failed to analyze waste patterns')
    }
  }

  /**
   * Analyzes seasonal trends for waste patterns
   */
  async analyzeSeasonalTrends(businessId: string, itemId?: string): Promise<SeasonalTrend[]> {
    try {
      // Get historical data for at least 12 months
      const { data: transactions, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory_items (name, category)
        `)
        .eq('business_id', businessId)
        .eq(itemId ? 'item_id' : 'business_id', itemId || businessId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      return this.calculateSeasonalTrends(transactions || [])
    } catch (error) {
      console.error('Error analyzing seasonal trends:', error)
      return []
    }
  }

  /**
   * Calculates potential savings from waste reduction
   */
  calculateWasteSavings(
    currentWasteValue: number,
    targetReductionPercentage: number,
    implementationCost: number = 0
  ): WasteSavingsCalculation {
    const potentialSavings = currentWasteValue * (targetReductionPercentage / 100)
    const netSavings = potentialSavings - implementationCost
    const paybackPeriod = implementationCost > 0 ? implementationCost / (potentialSavings / 12) : 0

    return {
      currentWasteValue,
      potentialSavings,
      savingsPercentage: targetReductionPercentage,
      implementationCost,
      netSavings,
      paybackPeriod
    }
  }

  /**
   * Identifies items with highest waste potential for immediate action
   */
  async identifyHighWasteItems(businessId: string, limit: number = 10): Promise<WastePattern[]> {
    const patterns = await this.analyzeWastePatterns(businessId)
    
    return patterns
      .filter(pattern => pattern.riskLevel === 'high' || pattern.riskLevel === 'critical')
      .slice(0, limit)
  }

  /**
   * Predicts future waste based on current patterns and seasonal trends
   */
  async predictFutureWaste(
    businessId: string, 
    forecastDays: number = 30
  ): Promise<{ itemId: string; predictedWaste: number; confidence: number }[]> {
    const patterns = await this.analyzeWastePatterns(businessId)
    const predictions = []

    for (const pattern of patterns) {
      const currentSeason = this.getCurrentSeason()
      const seasonalMultiplier = pattern.seasonalTrends.find(
        trend => trend.period === currentSeason
      )?.wasteMultiplier || 1.0

      const predictedWaste = (pattern.averageWasteValue / 30) * forecastDays * seasonalMultiplier
      const confidence = this.calculatePredictionConfidence(pattern)

      predictions.push({
        itemId: pattern.itemId,
        predictedWaste,
        confidence
      })
    }

    return predictions.sort((a, b) => b.predictedWaste - a.predictedWaste)
  }

  // Private helper methods

  private groupTransactionsByItem(transactions: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>()
    
    for (const transaction of transactions) {
      const itemId = transaction.item_id
      if (!grouped.has(itemId)) {
        grouped.set(itemId, [])
      }
      grouped.get(itemId)!.push(transaction)
    }
    
    return grouped
  }

  private async analyzeItemWastePattern(
    itemId: string, 
    transactions: any[], 
    periodDays: number
  ): Promise<WastePattern | null> {
    if (transactions.length === 0) return null

    const item = transactions[0].inventory_items
    if (!item) return null

    // Calculate waste metrics
    const wasteTransactions = transactions.filter(t => 
      t.transaction_type === 'waste' || t.transaction_type === 'expired'
    )
    
    const totalWasteQuantity = wasteTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0)
    const totalWasteValue = wasteTransactions.reduce((sum, t) => sum + Math.abs(t.quantity * (item.unit_cost || 0)), 0)
    
    const totalInboundQuantity = transactions
      .filter(t => t.transaction_type === 'purchase' || t.transaction_type === 'adjustment_in')
      .reduce((sum, t) => sum + t.quantity, 0)

    const wasteRate = totalInboundQuantity > 0 ? (totalWasteQuantity / totalInboundQuantity) * 100 : 0
    const averageWasteValue = totalWasteValue / (periodDays / 30) // Monthly average

    // Determine waste reasons
    const wasteReasons = this.identifyWasteReasons(wasteTransactions)
    
    // Calculate seasonal trends
    const seasonalTrends = await this.analyzeSeasonalTrends(transactions[0].business_id, itemId)
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(wasteRate, averageWasteValue)

    return {
      itemId,
      itemName: item.name,
      category: item.category || 'Uncategorized',
      wasteRate,
      averageWasteValue,
      wasteReasons,
      seasonalTrends,
      riskLevel
    }
  }

  private identifyWasteReasons(wasteTransactions: any[]): string[] {
    const reasons = new Set<string>()
    
    for (const transaction of wasteTransactions) {
      if (transaction.transaction_type === 'expired') {
        reasons.add('Expiration')
      } else if (transaction.notes?.toLowerCase().includes('spoiled')) {
        reasons.add('Spoilage')
      } else if (transaction.notes?.toLowerCase().includes('overstock')) {
        reasons.add('Overordering')
      } else if (transaction.notes?.toLowerCase().includes('prep')) {
        reasons.add('Prep waste')
      } else {
        reasons.add('General waste')
      }
    }
    
    return Array.from(reasons)
  }

  private calculateSeasonalTrends(transactions: any[]): SeasonalTrend[] {
    const monthlyWaste = new Map<string, { waste: number; total: number }>()
    
    for (const transaction of transactions) {
      const date = new Date(transaction.created_at)
      const month = date.toLocaleString('default', { month: 'short' })
      
      if (!monthlyWaste.has(month)) {
        monthlyWaste.set(month, { waste: 0, total: 0 })
      }
      
      const monthData = monthlyWaste.get(month)!
      if (transaction.transaction_type === 'waste' || transaction.transaction_type === 'expired') {
        monthData.waste += Math.abs(transaction.quantity)
      }
      monthData.total += Math.abs(transaction.quantity)
    }
    
    // Calculate average waste rate
    const wasteRates = Array.from(monthlyWaste.values())
      .map(data => data.total > 0 ? data.waste / data.total : 0)
    const averageWasteRate = wasteRates.reduce((sum, rate) => sum + rate, 0) / wasteRates.length
    
    // Generate seasonal trends
    const trends: SeasonalTrend[] = []
    for (const [month, data] of monthlyWaste.entries()) {
      const wasteRate = data.total > 0 ? data.waste / data.total : 0
      const multiplier = averageWasteRate > 0 ? wasteRate / averageWasteRate : 1.0
      const confidence = Math.min(data.total / 100, 1.0) // Higher confidence with more data
      
      trends.push({
        period: month,
        wasteMultiplier: multiplier,
        confidence
      })
    }
    
    return trends
  }

  private calculateRiskLevel(wasteRate: number, averageWasteValue: number): 'low' | 'medium' | 'high' | 'critical' {
    if (wasteRate > 20 || averageWasteValue > 500) return 'critical'
    if (wasteRate > 10 || averageWasteValue > 200) return 'high'
    if (wasteRate > 5 || averageWasteValue > 50) return 'medium'
    return 'low'
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'Q2' // Spring
    if (month >= 5 && month <= 7) return 'Q3' // Summer
    if (month >= 8 && month <= 10) return 'Q4' // Fall
    return 'Q1' // Winter
  }

  private calculatePredictionConfidence(pattern: WastePattern): number {
    // Base confidence on data quality and consistency
    let confidence = 0.5 // Base confidence
    
    // Increase confidence with more seasonal data
    if (pattern.seasonalTrends.length >= 4) confidence += 0.2
    
    // Increase confidence for consistent patterns
    const avgConfidence = pattern.seasonalTrends.reduce((sum, trend) => sum + trend.confidence, 0) / pattern.seasonalTrends.length
    confidence += avgConfidence * 0.3
    
    return Math.min(confidence, 1.0)
  }
}

// Export singleton instance
export const wasteAnalysisEngine = new WasteAnalysisEngine()