import { WastePattern } from './waste-analysis'
import { supabase } from './supabase'

export interface WastePrediction {
  itemId: string
  itemName: string
  predictedWasteValue: number
  predictedWasteQuantity: number
  confidence: number
  factors: PredictionFactor[]
  preventionActions: string[]
  alertThreshold: Date
}

export interface PredictionFactor {
  factor: string
  impact: number // -1 to 1, where 1 is maximum waste increase
  description: string
}

export interface WasteAlert {
  id: string
  itemId: string
  alertType: 'high_waste_risk' | 'expiration_warning' | 'overstock_alert' | 'seasonal_spike'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  recommendedActions: string[]
  estimatedImpact: number
  triggerDate: Date
  expiryDate?: Date
}

export class WastePredictionEngine {
  /**
   * Predict waste for the next 30 days based on patterns and external factors
   */
  async predictWasteForPeriod(
    businessId: string, 
    days: number = 30
  ): Promise<WastePrediction[]> {
    try {
      // Get current inventory levels
      const { data: inventory, error: invError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId)
        .gt('current_stock', 0)

      if (invError) throw invError

      // Get historical waste patterns
      const { data: wasteHistory, error: wasteError } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory_items (name, category, unit_cost)
        `)
        .eq('business_id', businessId)
        .in('transaction_type', ['waste', 'expired'])
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()) // Last 6 months
        .order('created_at', { ascending: false })

      if (wasteError) throw wasteError

      const predictions: WastePrediction[] = []

      for (const item of inventory || []) {
        const itemWasteHistory = wasteHistory?.filter(w => w.item_id === item.id) || []
        
        if (itemWasteHistory.length > 0) {
          const prediction = await this.predictItemWaste(item, itemWasteHistory, days)
          if (prediction) {
            predictions.push(prediction)
          }
        }
      }

      return predictions.sort((a, b) => b.predictedWasteValue - a.predictedWasteValue)
    } catch (error) {
      console.error('Error predicting waste:', error)
      throw new Error('Failed to predict waste patterns')
    }
  }

  /**
   * Generate waste alerts based on predictions and current inventory
   */
  async generateWasteAlerts(businessId: string): Promise<WasteAlert[]> {
    try {
      const predictions = await this.predictWasteForPeriod(businessId, 14) // 2-week prediction
      const alerts: WasteAlert[] = []

      // Get items approaching expiration
      const { data: expiringItems, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Next 7 days
        .gt('current_stock', 0)

      if (error) throw error

      // Create expiration alerts
      for (const item of expiringItems || []) {
        const wasteValue = item.current_stock * (item.unit_cost || 0)
        if (wasteValue > 10) { // Only alert for items worth more than $10
          alerts.push({
            id: `expiry-${item.id}`,
            itemId: item.id,
            alertType: 'expiration_warning',
            severity: this.calculateExpirationSeverity(new Date(item.expiry_date)),
            message: `${item.name} expires in ${this.getDaysUntilExpiry(new Date(item.expiry_date))} days (${item.current_stock} ${item.unit} worth $${wasteValue.toFixed(2)})`,
            recommendedActions: [
              'Use in today\'s specials',
              'Prep for freezing if possible',
              'Offer staff meal discount',
              'Contact local food bank for donation'
            ],
            estimatedImpact: wasteValue,
            triggerDate: new Date(),
            expiryDate: new Date(item.expiry_date)
          })
        }
      }

      // Create high waste risk alerts from predictions
      const highRiskPredictions = predictions.filter(p => p.confidence > 0.7 && p.predictedWasteValue > 50)
      
      for (const prediction of highRiskPredictions) {
        alerts.push({
          id: `waste-risk-${prediction.itemId}`,
          itemId: prediction.itemId,
          alertType: 'high_waste_risk',
          severity: this.calculateWasteRiskSeverity(prediction.predictedWasteValue),
          message: `${prediction.itemName} has high waste risk: $${prediction.predictedWasteValue.toFixed(2)} predicted waste in next 2 weeks`,
          recommendedActions: prediction.preventionActions,
          estimatedImpact: prediction.predictedWasteValue,
          triggerDate: new Date()
        })
      }

      // Create overstock alerts
      const overstockAlerts = await this.generateOverstockAlerts(businessId)
      alerts.push(...overstockAlerts)

      // Create seasonal alerts
      const seasonalAlerts = await this.generateSeasonalAlerts(businessId)
      alerts.push(...seasonalAlerts)

      return alerts.sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    } catch (error) {
      console.error('Error generating waste alerts:', error)
      return []
    }
  }

  /**
   * Calculate waste prevention ROI for specific actions
   */
  calculatePreventionROI(
    currentWasteValue: number,
    preventionCost: number,
    expectedReduction: number
  ): {
    monthlySavings: number
    annualSavings: number
    roi: number
    paybackMonths: number
  } {
    const monthlySavings = currentWasteValue * (expectedReduction / 100)
    const annualSavings = monthlySavings * 12
    const roi = ((annualSavings - preventionCost) / preventionCost) * 100
    const paybackMonths = preventionCost / monthlySavings

    return {
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      roi: Math.round(roi),
      paybackMonths: Math.round(paybackMonths * 10) / 10
    }
  }

  // Private helper methods

  private async predictItemWaste(
    item: any,
    wasteHistory: any[],
    days: number
  ): Promise<WastePrediction | null> {
    if (wasteHistory.length === 0) return null

    // Calculate base waste rate from history
    const totalWasteValue = wasteHistory.reduce((sum, w) => sum + Math.abs(w.quantity * (item.unit_cost || 0)), 0)
    const historyDays = Math.max(1, (Date.now() - new Date(wasteHistory[wasteHistory.length - 1].created_at).getTime()) / (24 * 60 * 60 * 1000))
    const dailyWasteRate = totalWasteValue / historyDays

    // Apply prediction factors
    const factors = await this.calculatePredictionFactors(item, wasteHistory)
    const adjustmentMultiplier = factors.reduce((mult, factor) => mult * (1 + factor.impact), 1)

    const predictedWasteValue = dailyWasteRate * days * adjustmentMultiplier
    const predictedWasteQuantity = predictedWasteValue / (item.unit_cost || 1)

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(wasteHistory, factors)

    // Generate prevention actions
    const preventionActions = this.generatePreventionActions(item, factors)

    // Calculate alert threshold (when to alert before predicted waste occurs)
    const alertThreshold = new Date(Date.now() + (days * 0.7 * 24 * 60 * 60 * 1000)) // Alert at 70% of prediction period

    return {
      itemId: item.id,
      itemName: item.name,
      predictedWasteValue: Math.round(predictedWasteValue),
      predictedWasteQuantity: Math.round(predictedWasteQuantity * 100) / 100,
      confidence,
      factors,
      preventionActions,
      alertThreshold
    }
  }

  private async calculatePredictionFactors(item: any, wasteHistory: any[]): Promise<PredictionFactor[]> {
    const factors: PredictionFactor[] = []

    // Seasonal factor
    const currentMonth = new Date().getMonth()
    const seasonalWaste = wasteHistory.filter(w => new Date(w.created_at).getMonth() === currentMonth)
    if (seasonalWaste.length > 0) {
      const seasonalRate = seasonalWaste.length / wasteHistory.length
      const seasonalImpact = (seasonalRate - 1/12) * 2 // Normalize around monthly average
      
      factors.push({
        factor: 'seasonal_pattern',
        impact: Math.max(-0.5, Math.min(0.5, seasonalImpact)),
        description: `Current season shows ${seasonalRate > 1/12 ? 'higher' : 'lower'} than average waste rates`
      })
    }

    // Stock level factor
    const avgStock = 100 // This would come from historical data
    const currentStockRatio = item.current_stock / avgStock
    const stockImpact = Math.max(-0.3, Math.min(0.3, (currentStockRatio - 1) * 0.5))
    
    factors.push({
      factor: 'stock_level',
      impact: stockImpact,
      description: `Current stock is ${currentStockRatio > 1 ? 'above' : 'below'} average levels`
    })

    // Expiration proximity factor
    if (item.expiry_date) {
      const daysToExpiry = (new Date(item.expiry_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      if (daysToExpiry < 14) {
        const expiryImpact = Math.max(0, (14 - daysToExpiry) / 14 * 0.8)
        factors.push({
          factor: 'expiration_proximity',
          impact: expiryImpact,
          description: `Item expires in ${Math.round(daysToExpiry)} days, increasing waste risk`
        })
      }
    }

    // Recent waste trend factor
    const recentWaste = wasteHistory.filter(w => 
      new Date(w.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    )
    const olderWaste = wasteHistory.filter(w => 
      new Date(w.created_at).getTime() <= Date.now() - 30 * 24 * 60 * 60 * 1000
    )
    
    if (recentWaste.length > 0 && olderWaste.length > 0) {
      const recentRate = recentWaste.length / 30
      const olderRate = olderWaste.length / Math.max(30, wasteHistory.length - recentWaste.length)
      const trendImpact = Math.max(-0.4, Math.min(0.4, (recentRate - olderRate) * 2))
      
      factors.push({
        factor: 'recent_trend',
        impact: trendImpact,
        description: `Recent waste trend is ${trendImpact > 0 ? 'increasing' : 'decreasing'}`
      })
    }

    return factors
  }

  private calculatePredictionConfidence(wasteHistory: any[], factors: PredictionFactor[]): number {
    let confidence = 0.5 // Base confidence

    // More data = higher confidence
    if (wasteHistory.length > 10) confidence += 0.2
    if (wasteHistory.length > 30) confidence += 0.1

    // Recent data = higher confidence
    const recentData = wasteHistory.filter(w => 
      new Date(w.created_at).getTime() > Date.now() - 60 * 24 * 60 * 60 * 1000
    )
    if (recentData.length > 0) confidence += 0.1

    // Strong factors = higher confidence
    const strongFactors = factors.filter(f => Math.abs(f.impact) > 0.3)
    confidence += strongFactors.length * 0.05

    return Math.min(1.0, confidence)
  }

  private generatePreventionActions(item: any, factors: PredictionFactor[]): string[] {
    const actions: string[] = []

    // Generic actions
    actions.push('Monitor stock levels more closely')
    actions.push('Review usage patterns and adjust ordering')

    // Factor-specific actions
    for (const factor of factors) {
      switch (factor.factor) {
        case 'expiration_proximity':
          actions.push('Use in daily specials or promotions')
          actions.push('Prep and freeze if possible')
          break
        case 'stock_level':
          if (factor.impact > 0) {
            actions.push('Reduce next order quantity')
            actions.push('Find alternative uses for excess stock')
          }
          break
        case 'seasonal_pattern':
          if (factor.impact > 0) {
            actions.push('Adjust menu for seasonal demand changes')
            actions.push('Implement seasonal storage best practices')
          }
          break
        case 'recent_trend':
          if (factor.impact > 0) {
            actions.push('Investigate cause of increasing waste')
            actions.push('Retrain staff on handling procedures')
          }
          break
      }
    }

    // Category-specific actions
    const category = item.category?.toLowerCase() || ''
    if (category.includes('produce')) {
      actions.push('Check storage temperature and humidity')
      actions.push('Implement strict FIFO rotation')
    } else if (category.includes('dairy')) {
      actions.push('Verify refrigeration temperature')
      actions.push('Check for cross-contamination')
    } else if (category.includes('meat')) {
      actions.push('Consider vacuum sealing for longer storage')
      actions.push('Review portion control procedures')
    }

    return [...new Set(actions)] // Remove duplicates
  }

  private async generateOverstockAlerts(businessId: string): Promise<WasteAlert[]> {
    const alerts: WasteAlert[] = []

    try {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId)
        .gt('current_stock', 0)

      if (error) throw error

      for (const item of items || []) {
        if (item.max_stock_level && item.current_stock > item.max_stock_level * 1.2) {
          const overstockValue = (item.current_stock - item.max_stock_level) * (item.unit_cost || 0)
          
          if (overstockValue > 25) {
            alerts.push({
              id: `overstock-${item.id}`,
              itemId: item.id,
              alertType: 'overstock_alert',
              severity: overstockValue > 100 ? 'high' : 'medium',
              message: `${item.name} is overstocked by ${item.current_stock - item.max_stock_level} ${item.unit} (worth $${overstockValue.toFixed(2)})`,
              recommendedActions: [
                'Reduce next order quantity',
                'Create promotional menu items',
                'Check for bulk usage opportunities',
                'Consider transferring to other locations'
              ],
              estimatedImpact: overstockValue,
              triggerDate: new Date()
            })
          }
        }
      }
    } catch (error) {
      console.error('Error generating overstock alerts:', error)
    }

    return alerts
  }

  private async generateSeasonalAlerts(businessId: string): Promise<WasteAlert[]> {
    const alerts: WasteAlert[] = []
    const currentMonth = new Date().getMonth()
    
    // This would be enhanced with actual seasonal data analysis
    const seasonalRiskItems = [
      { months: [5, 6, 7], items: ['ice cream', 'frozen'], message: 'Summer items may have higher waste due to power outages' },
      { months: [11, 0, 1], items: ['produce'], message: 'Winter produce may have shorter shelf life due to transport conditions' }
    ]

    for (const risk of seasonalRiskItems) {
      if (risk.months.includes(currentMonth)) {
        alerts.push({
          id: `seasonal-${currentMonth}-${risk.items.join('-')}`,
          itemId: 'seasonal',
          alertType: 'seasonal_spike',
          severity: 'medium',
          message: risk.message,
          recommendedActions: [
            'Monitor affected categories more closely',
            'Adjust storage procedures for season',
            'Review supplier delivery schedules',
            'Train staff on seasonal best practices'
          ],
          estimatedImpact: 0, // Would be calculated based on historical data
          triggerDate: new Date()
        })
      }
    }

    return alerts
  }

  private calculateExpirationSeverity(expiryDate: Date): 'low' | 'medium' | 'high' | 'critical' {
    const daysUntilExpiry = this.getDaysUntilExpiry(expiryDate)
    
    if (daysUntilExpiry <= 1) return 'critical'
    if (daysUntilExpiry <= 2) return 'high'
    if (daysUntilExpiry <= 5) return 'medium'
    return 'low'
  }

  private calculateWasteRiskSeverity(wasteValue: number): 'low' | 'medium' | 'high' | 'critical' {
    if (wasteValue > 200) return 'critical'
    if (wasteValue > 100) return 'high'
    if (wasteValue > 50) return 'medium'
    return 'low'
  }

  private getDaysUntilExpiry(expiryDate: Date): number {
    return Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  }
}

// Export singleton instance
export const wastePredictionEngine = new WastePredictionEngine()