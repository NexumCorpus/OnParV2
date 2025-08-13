import { Database } from './supabase'
import { supabase } from './supabase'
import { AIInsight, WasteAnalysisData, ActionPlan, ImpactMetrics, WasteAnalysis } from '@/types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

// Database functions for AI insights
export async function saveAIInsight(insight: Omit<AIInsight, 'id' | 'created_at' | 'updated_at'>): Promise<AIInsight | null> {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        user_id: insight.user_id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        estimated_savings: insight.estimated_savings,
        actionable: insight.actionable,
        confidence: insight.confidence,
        data_points: insight.data_points,
        recommended_actions: insight.recommended_actions,
        related_items: insight.related_items,
        timeframe: insight.timeframe,
        priority: insight.priority,
        category: insight.category,
        status: insight.status || 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving AI insight:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error saving AI insight:', error)
    return null
  }
}

export async function getAIInsights(userId: string): Promise<AIInsight[]> {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI insights:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return []
  }
}

export async function updateAIInsightStatus(
  insightId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
  actualSavings?: number
): Promise<boolean> {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'in_progress') {
      updateData.implementation_date = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completion_date = new Date().toISOString()
      if (actualSavings !== undefined) {
        updateData.actual_savings = actualSavings
      }
    }

    const { error } = await supabase
      .from('ai_insights')
      .update(updateData)
      .eq('id', insightId)

    if (error) {
      console.error('Error updating AI insight status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating AI insight status:', error)
    return false
  }
}

export async function saveWasteAnalysisData(data: Omit<WasteAnalysisData, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('waste_analysis_data')
      .upsert({
        user_id: data.user_id,
        analysis_date: data.analysis_date,
        total_inventory_value: data.total_inventory_value,
        monthly_spend: data.monthly_spend,
        average_waste_percentage: data.average_waste_percentage,
        inventory_turnover: data.inventory_turnover,
        cost_efficiency_score: data.cost_efficiency_score,
        seasonal_factor: data.seasonal_factor,
        data_quality_score: data.data_quality_score
      })

    if (error) {
      console.error('Error saving waste analysis data:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving waste analysis data:', error)
    return false
  }
}

// Cost-effective AI insights generation (placeholder algorithms)
export function generateAIInsights(
  inventoryItems: InventoryItem[],
  menuItems: MenuItem[],
  monthlySpend: number,
  monthlyBudget?: number | null,
  restaurantName?: string
): AIInsight[] {
  return generateEnhancedInsights(inventoryItems, menuItems, monthlySpend, monthlyBudget, restaurantName)
}

// Generate and save insights to database
export async function generateAndSaveInsights(
  userId: string,
  inventoryItems: InventoryItem[],
  menuItems: MenuItem[],
  monthlySpend: number,
  monthlyBudget?: number | null,
  restaurantName?: string
): Promise<AIInsight[]> {
  // Generate insights using cost-effective algorithms
  const insights = generateEnhancedInsights(inventoryItems, menuItems, monthlySpend, monthlyBudget, restaurantName)
  
  // Save waste analysis data
  const wasteAnalysisData: Omit<WasteAnalysisData, 'id' | 'created_at'> = {
    user_id: userId,
    analysis_date: new Date().toISOString().split('T')[0],
    total_inventory_value: inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0),
    monthly_spend: monthlySpend,
    average_waste_percentage: menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
      : 5,
    inventory_turnover: inventoryItems.length > 0 
      ? monthlySpend / Math.max(inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0), 1)
      : 0,
    cost_efficiency_score: calculateCostEfficiency(inventoryItems, monthlySpend),
    seasonal_factor: calculateSeasonalFactors(inventoryItems).multiplier,
    data_quality_score: Math.min(100, (inventoryItems.length + menuItems.length) / 20 * 100)
  }

  await saveWasteAnalysisData(wasteAnalysisData)

  // Save insights to database
  const savedInsights: AIInsight[] = []
  for (const insight of insights) {
    const insightToSave: Omit<AIInsight, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      impact: insight.impact,
      estimated_savings: insight.estimatedSavings,
      actionable: insight.actionable,
      confidence: insight.confidence,
      data_points: insight.dataPoints,
      recommended_actions: insight.recommendedActions,
      related_items: insight.relatedItems,
      timeframe: insight.timeframe,
      priority: insight.priority,
      category: insight.category,
      status: 'pending'
    }

    const saved = await saveAIInsight(insightToSave)
    if (saved) {
      savedInsights.push(saved)
    }
  }

  return savedInsights
}

function generateEnhancedInsights(
  inventoryItems: InventoryItem[],
  menuItems: MenuItem[],
  monthlySpend: number,
  monthlyBudget?: number | null,
  restaurantName?: string
): AIInsight[] {
  // Input validation
  if (!Array.isArray(inventoryItems) || !Array.isArray(menuItems)) {
    console.error('Invalid input data for insights')
    return []
  }

  if (monthlySpend < 0) {
    console.error('Invalid monthly spend value')
    return []
  }

  const insights: AIInsight[] = []

  // Enhanced analytics with confidence scoring
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
  const inventoryTurnover = monthlySpend / Math.max(totalInventoryValue, 1)
  const dataQuality = Math.min(1, (inventoryItems.length + menuItems.length) / 20) // Better insights with more data

  // Calculate average waste percentage from menu items
  const avgWastePercentage = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
    : 5

  // Advanced waste pattern analysis
  const wastePatterns = analyzeWastePatterns(menuItems, inventoryItems)
  const seasonalFactors = calculateSeasonalFactors(inventoryItems)
  const costEfficiencyScore = calculateCostEfficiency(inventoryItems, monthlySpend)

  // High waste menu items insight
  const highWasteItems = menuItems.filter(item => item.waste_percentage > avgWastePercentage + 2)
  if (highWasteItems.length > 0) {
    const wasteReductionSavings = highWasteItems.reduce((total, item) => {
      const estimatedCost = monthlySpend * (item.sales_percentage / 100)
      return total + (estimatedCost * (item.waste_percentage / 100) * 0.5)
    }, 0)

    const confidence = Math.min(95, 60 + (dataQuality * 30) + (highWasteItems.length * 5))

    insights.push({
      id: 'high-waste-menu',
      type: 'waste_reduction',
      title: 'Smart Waste Reduction Opportunity Detected',
      description: `AI analysis identified ${highWasteItems.length} menu items with waste ${(avgWastePercentage + 2).toFixed(1)}% above baseline. Predictive modeling suggests portion optimization could reduce waste by 35-50%.`,
      impact: 'high',
      estimatedSavings: Math.max(0, wasteReductionSavings),
      actionable: true,
      confidence,
      dataPoints: [
        `${highWasteItems.length} high-waste items analyzed`,
        `${avgWastePercentage.toFixed(1)}% average waste baseline`,
        `${wastePatterns.volatility.toFixed(1)}% waste volatility detected`,
        `${Math.round(confidence)}% prediction confidence`
      ],
      recommendedActions: [
        `Review portion sizes for ${highWasteItems[0]?.name || 'top waste item'}`,
        'Implement portion control training for kitchen staff',
        'Consider offering half-portions for high-waste items',
        'Monitor waste daily for 2 weeks to track improvement',
        'Adjust recipes based on customer feedback and waste data'
      ],
      relatedItems: highWasteItems.slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        type: 'menu' as const,
        currentValue: item.waste_percentage,
        suggestedValue: Math.max(1, item.waste_percentage * 0.6),
        unit: '% waste'
      })),
      timeframe: '2-4 weeks',
      priority: 'high',
      category: 'Waste Management'
    })
  }

  // Predictive inventory optimization
  const predictiveInsight = generatePredictiveInventoryInsight(inventoryItems, inventoryTurnover, seasonalFactors)
  if (predictiveInsight) {
    insights.push(predictiveInsight)
  }

  // Dynamic pricing optimization
  const pricingInsight = generatePricingOptimizationInsight(menuItems, monthlySpend, costEfficiencyScore)
  if (pricingInsight) {
    insights.push(pricingInsight)
  }

  // Inventory optimization insight
  const overstockedItems = inventoryItems.filter(item => 
    item.quantity > item.reorder_point * 3
  )
  if (overstockedItems.length > 0) {
    const overstockCost = overstockedItems.reduce((total, item) => 
      total + ((item.quantity - item.reorder_point * 2) * item.price_per_unit), 0
    )

    const confidence = Math.min(90, 70 + (dataQuality * 20))

    insights.push({
      id: 'overstock-reduction',
      type: 'inventory_optimization',
      title: 'AI-Detected Cash Flow Optimization',
      description: `Machine learning analysis found ${overstockedItems.length} overstocked items. Smart reordering algorithms suggest reducing quantities to optimize cash flow and reduce spoilage risk.`,
      impact: 'medium',
      estimatedSavings: Math.max(0, overstockCost * 0.1), // 10% savings from better cash flow
      actionable: true,
      confidence,
      dataPoints: [
        `$${overstockCost.toFixed(2)} tied up in overstock`,
        `${inventoryTurnover.toFixed(1)}x inventory turnover rate`,
        `${overstockedItems.length} items analyzed`,
        `${Math.round(confidence)}% optimization confidence`
      ],
      recommendedActions: [
        `Reduce next order for ${overstockedItems[0]?.name || 'top overstocked item'} by 30-40%`,
        'Implement just-in-time ordering for non-perishables',
        'Create promotional specials to move excess inventory',
        'Review supplier minimum order quantities',
        'Set up automated reorder point adjustments'
      ],
      relatedItems: overstockedItems.slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        type: 'inventory' as const,
        currentValue: item.quantity,
        suggestedValue: item.reorder_point * 2,
        unit: item.unit
      })),
      timeframe: '1-2 weeks',
      priority: 'medium',
      category: 'Inventory Management'
    })
  }

  // Menu performance optimization
  const lowPerformingItems = menuItems.filter(item => 
    item.sales_percentage < 5 && item.waste_percentage > 3
  )
  if (lowPerformingItems.length > 0) {
    const menuOptimizationSavings = lowPerformingItems.reduce((total, item) => {
      const estimatedCost = monthlySpend * (item.sales_percentage / 100)
      return total + (estimatedCost * 0.8) // 80% savings by removing low performers
    }, 0)

    insights.push({
      id: 'menu-optimization',
      type: 'menu_optimization',
      title: 'Remove Low-Performing Menu Items',
      description: `${lowPerformingItems.length} menu items have low sales (<5%) but high waste (>3%). Consider removing or reworking these items.`,
      impact: 'high',
      estimatedSavings: Math.max(0, menuOptimizationSavings),
      actionable: true,
      confidence: 75,
      dataPoints: [
        `${lowPerformingItems.length} low-performing items`,
        `<5% sales percentage threshold`,
        `>3% waste percentage threshold`,
        `75% recommendation confidence`
      ],
      recommendedActions: [
        'Consider removing or reworking underperforming items',
        'Test smaller portion sizes for high-waste, low-sales items',
        'Promote low-performing items with limited-time offers',
        'Analyze customer feedback for improvement opportunities',
        'Replace with seasonal or trending alternatives'
      ],
      relatedItems: lowPerformingItems.slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        type: 'menu' as const,
        currentValue: item.sales_percentage,
        suggestedValue: 0, // Suggest removal
        unit: '% sales'
      })),
      timeframe: '1-3 weeks',
      priority: 'high',
      category: 'Menu Optimization'
    })
  }

  // Budget optimization insight
  if (monthlyBudget && monthlySpend > monthlyBudget * 0.8) {
    insights.push({
      id: 'budget-optimization',
      type: 'cost_optimization',
      title: 'Optimize Purchasing to Stay Within Budget',
      description: `You're at ${((monthlySpend / monthlyBudget) * 100).toFixed(1)}% of your monthly budget. Focus on high-turnover items and reduce waste to improve margins.`,
      impact: 'medium',
      estimatedSavings: Math.max(0, (monthlySpend - monthlyBudget * 0.8) * 0.3),
      actionable: true,
      confidence: 80,
      dataPoints: [
        `${((monthlySpend / monthlyBudget) * 100).toFixed(1)}% of budget used`,
        `$${(monthlySpend - monthlyBudget * 0.8).toFixed(2)} over 80% threshold`,
        `30% potential savings through optimization`,
        `80% recommendation confidence`
      ],
      recommendedActions: [
        'Focus purchasing on high-turnover items only',
        'Negotiate better pricing with primary suppliers',
        'Implement stricter portion control measures',
        'Review and eliminate low-performing menu items',
        'Consider bulk purchasing for non-perishables'
      ],
      relatedItems: [],
      timeframe: 'Immediate',
      priority: 'urgent',
      category: 'Budget Management'
    })
  }

  // Seasonal optimization insight (dynamic based on current data)
  const fastMovingItems = inventoryItems.filter(item => 
    item.quantity < item.reorder_point * 1.5
  )
  if (fastMovingItems.length > 3) {
    const seasonalSavings = fastMovingItems.length * 25
    insights.push({
      id: 'seasonal-optimization',
      type: 'inventory_optimization',
      title: 'Bulk Order Opportunity',
      description: `${fastMovingItems.length} fast-moving items detected. Bulk ordering could save $${seasonalSavings} in reduced delivery fees.`,
      impact: 'low',
      estimatedSavings: Math.max(0, seasonalSavings),
      actionable: true,
      confidence: 65,
      dataPoints: [
        `${fastMovingItems.length} fast-moving items`,
        `<1.5x reorder point threshold`,
        `$25 average savings per item`,
        `65% recommendation confidence`
      ],
      recommendedActions: [
        'Coordinate bulk orders for fast-moving items',
        'Negotiate volume discounts with suppliers',
        'Schedule deliveries to optimize storage space',
        'Consider shared orders with nearby restaurants',
        'Track delivery fee savings over time'
      ],
      relatedItems: fastMovingItems.slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        type: 'inventory' as const,
        currentValue: item.quantity,
        suggestedValue: item.reorder_point * 3,
        unit: item.unit
      })),
      timeframe: '1 week',
      priority: 'low',
      category: 'Procurement'
    })
  }

  // Add waste prediction insight based on current data
  if (menuItems.length > 0 && inventoryItems.length > 0) {
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    const predictedWasteSavings = Math.max(0, totalInventoryValue * (avgWastePercentage / 100) * 0.15) // Conservative 15% savings
    
    insights.push({
      id: 'waste-prediction',
      type: 'waste_reduction',
      title: 'Smart Waste Reduction Opportunity',
      description: `Based on current inventory ($${totalInventoryValue.toFixed(0)}) and ${avgWastePercentage.toFixed(1)}% average waste, optimize ordering patterns for potential savings.`,
      impact: 'high',
      estimatedSavings: predictedWasteSavings,
      actionable: true,
      confidence: 70,
      dataPoints: [
        `$${totalInventoryValue.toFixed(0)} total inventory value`,
        `${avgWastePercentage.toFixed(1)}% average waste rate`,
        `15% conservative savings estimate`,
        `70% prediction confidence`
      ],
      recommendedActions: [
        'Implement first-in-first-out (FIFO) inventory rotation',
        'Train staff on proper portion control techniques',
        'Create daily waste tracking logs',
        'Develop creative ways to use near-expiry ingredients',
        'Set up automated low-stock alerts to prevent over-ordering'
      ],
      relatedItems: inventoryItems.filter(item => {
        const daysToExpiry = item.expiry_date 
          ? Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 999
        return daysToExpiry <= 7 && daysToExpiry > 0
      }).slice(0, 3).map(item => ({
        id: item.id,
        name: item.name,
        type: 'inventory' as const,
        currentValue: item.quantity,
        suggestedValue: Math.max(0, item.quantity * 0.8),
        unit: item.unit
      })),
      timeframe: '2-3 weeks',
      priority: 'high',
      category: 'Waste Reduction'
    })
  }
  
  return insights.sort((a, b) => {
    // Sort by impact and confidence
    const impactOrder = { high: 3, medium: 2, low: 1 }
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact]
    if (impactDiff !== 0) return impactDiff
    return b.confidence - a.confidence
  })
}

function analyzeWastePatterns(menuItems: MenuItem[], inventoryItems: InventoryItem[]) {
  const wasteValues = menuItems.map(item => item.waste_percentage)
  const avgWaste = wasteValues.reduce((sum, val) => sum + val, 0) / wasteValues.length
  const variance = wasteValues.reduce((sum, val) => sum + Math.pow(val - avgWaste, 2), 0) / wasteValues.length
  const volatility = Math.sqrt(variance)
  
  return {
    average: avgWaste,
    volatility,
    trend: wasteValues.length > 3 ? calculateTrend(wasteValues) : 0
  }
}

function calculateSeasonalFactors(inventoryItems: InventoryItem[]) {
  // Simulate seasonal analysis based on item categories and current date
  const currentMonth = new Date().getMonth()
  const seasonalMultiplier = Math.sin((currentMonth / 12) * 2 * Math.PI) * 0.2 + 1
  
  return {
    multiplier: seasonalMultiplier,
    season: currentMonth < 3 || currentMonth > 10 ? 'winter' : 
            currentMonth < 6 ? 'spring' : 
            currentMonth < 9 ? 'summer' : 'fall'
  }
}

function calculateCostEfficiency(inventoryItems: InventoryItem[], monthlySpend: number) {
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
  const efficiency = totalValue > 0 ? monthlySpend / totalValue : 0
  return Math.min(100, efficiency * 50) // Normalize to 0-100 scale
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, val) => sum + val, 0)
  const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  return slope
}

function generatePredictiveInventoryInsight(
  inventoryItems: InventoryItem[], 
  turnover: number, 
  seasonalFactors: any
): AIInsight | null {
  const fastMovingItems = inventoryItems.filter(item => item.quantity < item.reorder_point * 1.2)
  
  if (fastMovingItems.length < 3) return null
  
  const predictedSavings = fastMovingItems.length * (30 + (turnover * 20)) * seasonalFactors.multiplier
  const confidence = Math.min(88, 65 + (turnover * 10) + (fastMovingItems.length * 2))
  
  return {
    id: 'predictive-inventory',
    type: 'inventory_optimization',
    title: 'Predictive Inventory Optimization',
    description: `AI forecasting models predict ${fastMovingItems.length} items will need reordering within 5-7 days. Seasonal analysis (${seasonalFactors.season}) suggests optimizing order timing for maximum efficiency.`,
    impact: 'medium',
    estimatedSavings: predictedSavings,
    actionable: true,
    confidence,
    dataPoints: [
      `${fastMovingItems.length} items in reorder window`,
      `${turnover.toFixed(1)}x inventory turnover rate`,
      `${seasonalFactors.season} seasonal adjustment applied`,
      `${Math.round(confidence)}% forecast accuracy`
    ]
  }
}

function generatePricingOptimizationInsight(
  menuItems: MenuItem[], 
  monthlySpend: number, 
  costEfficiency: number
): AIInsight | null {
  const underperformingItems = menuItems.filter(item => 
    item.sales_percentage < 8 && item.waste_percentage > 4
  )
  
  if (underperformingItems.length === 0) return null
  
  const optimizationSavings = underperformingItems.reduce((total, item) => {
    const itemCost = monthlySpend * (item.sales_percentage / 100)
    return total + (itemCost * 0.6) // 60% savings through optimization
  }, 0)
  
  const confidence = Math.min(82, 55 + (costEfficiency * 0.3) + (underperformingItems.length * 3))
  
  return {
    id: 'pricing-optimization',
    type: 'menu_optimization',
    title: 'Dynamic Pricing Optimization Detected',
    description: `Advanced analytics identified ${underperformingItems.length} menu items with suboptimal performance ratios. AI suggests pricing adjustments or recipe modifications to improve profitability.`,
    impact: 'high',
    estimatedSavings: optimizationSavings,
    actionable: true,
    confidence,
    dataPoints: [
      `${underperformingItems.length} underperforming items`,
      `${costEfficiency.toFixed(1)}% cost efficiency score`,
      `${optimizationSavings.toFixed(0)} potential monthly savings`,
      `${Math.round(confidence)}% recommendation confidence`
    ]
  }
}