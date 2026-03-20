import type { InventoryItem, MenuItem, WasteEvent, AIInsight } from '@/types'
import { SEASONAL_MULTIPLIERS } from './waste-analysis'

// --- Insight Generation ---

// Helper to build a partial AIInsight (without DB-generated fields)
interface GeneratedInsight {
  type: AIInsight['type']
  title: string
  description: string
  impact: AIInsight['impact']
  estimated_savings: number
  confidence: number
  data_points: string[]
  recommended_actions: string[]
  related_items: AIInsight['related_items']
  timeframe: string
  priority: AIInsight['priority']
  category: string
}

function getPriorityFromSavings(savings: number): AIInsight['priority'] {
  if (savings >= 150) return 'urgent'
  if (savings >= 75) return 'high'
  if (savings >= 25) return 'medium'
  return 'low'
}

function getImpactFromSavings(savings: number): AIInsight['impact'] {
  if (savings >= 100) return 'high'
  if (savings >= 30) return 'medium'
  return 'low'
}

// INSIGHT 1: High-waste menu items
function generateHighWasteMenuInsights(
  menuItems: MenuItem[]
): GeneratedInsight[] {
  if (menuItems.length === 0) return []

  const avgWaste =
    menuItems.reduce((sum, m) => sum + m.waste_percentage, 0) / menuItems.length

  const highWasteItems = menuItems.filter(
    (m) => m.waste_percentage > avgWaste + 2
  )

  return highWasteItems.map((item) => {
    const targetWaste = avgWaste
    const wasteReduction = item.waste_percentage - targetWaste
    // estimatedMonthlyCost based on sales_percentage
    const estimatedMonthlyCost = item.selling_price * (item.sales_percentage / 100) * 30
    const estimatedSavings = (wasteReduction / 100) * estimatedMonthlyCost

    return {
      type: 'waste_reduction' as const,
      title: `Reduce ${item.name} waste by ${wasteReduction.toFixed(0)}%`,
      description: `AI analysis shows ${item.name} has ${item.waste_percentage.toFixed(1)}% waste rate, ${wasteReduction.toFixed(1)}% above optimal. Implementing portion control could save $${estimatedSavings.toFixed(0)}/month.`,
      impact: getImpactFromSavings(estimatedSavings),
      estimated_savings: estimatedSavings,
      confidence: 0, // set later
      data_points: [
        `Current waste rate: ${item.waste_percentage.toFixed(1)}%`,
        `Average waste rate: ${avgWaste.toFixed(1)}%`,
        `Monthly cost impact: $${estimatedMonthlyCost.toFixed(0)}`,
      ],
      recommended_actions: [
        'Implement standardized portion scoops',
        'Train staff on consistent portioning',
        'Monitor waste daily for 2 weeks',
      ],
      related_items: [{
        id: item.id,
        name: item.name,
        type: 'menu' as const,
        currentValue: item.waste_percentage,
        suggestedValue: targetWaste,
        unit: '%',
      }],
      timeframe: '2-3 weeks',
      priority: getPriorityFromSavings(estimatedSavings),
      category: 'Waste Reduction',
    }
  })
}

// INSIGHT 2: Inventory optimization
function generateInventoryOptimizationInsights(
  inventoryItems: InventoryItem[]
): GeneratedInsight[] {
  const overstockedItems = inventoryItems.filter(
    (item) => item.quantity > item.reorder_point * 3
  )

  return overstockedItems.map((item) => {
    const optimalQuantity = item.reorder_point * 2
    const excessQuantity = item.quantity - optimalQuantity
    const estimatedSavings = excessQuantity * item.price_per_unit * 0.15

    return {
      type: 'inventory_optimization' as const,
      title: `Optimize ${item.name} ordering`,
      description: `Your ${item.name} inventory is ${(item.quantity / item.reorder_point).toFixed(1)}x reorder point. Reducing to optimal levels could save $${estimatedSavings.toFixed(0)}/month in holding costs.`,
      impact: getImpactFromSavings(estimatedSavings),
      estimated_savings: estimatedSavings,
      confidence: 0,
      data_points: [
        `Current quantity: ${item.quantity} ${item.unit}`,
        `Reorder point: ${item.reorder_point} ${item.unit}`,
        `Optimal quantity: ${optimalQuantity} ${item.unit}`,
      ],
      recommended_actions: [
        'Reduce next order quantity',
        'Implement just-in-time ordering',
        'Review reorder point settings',
      ],
      related_items: [{
        id: item.id,
        name: item.name,
        type: 'inventory' as const,
        currentValue: item.quantity,
        suggestedValue: optimalQuantity,
        unit: item.unit,
      }],
      timeframe: '1-2 weeks',
      priority: getPriorityFromSavings(estimatedSavings),
      category: 'Inventory Optimization',
    }
  })
}

// INSIGHT 3: Menu performance analysis
function generateMenuPerformanceInsights(
  menuItems: MenuItem[]
): GeneratedInsight[] {
  const lowPerformers = menuItems.filter(
    (m) => m.sales_percentage < 5 && m.waste_percentage > 3
  )

  return lowPerformers.map((item) => {
    const estimatedSavings = item.selling_price * (item.waste_percentage / 100) * 30

    return {
      type: 'menu_optimization' as const,
      title: `Review low-performing: ${item.name}`,
      description: `${item.name} has only ${item.sales_percentage.toFixed(1)}% of sales but ${item.waste_percentage.toFixed(1)}% waste. Consider removing from menu, reducing portion size, or running a promotion.`,
      impact: getImpactFromSavings(estimatedSavings),
      estimated_savings: estimatedSavings,
      confidence: 0,
      data_points: [
        `Sales percentage: ${item.sales_percentage.toFixed(1)}%`,
        `Waste percentage: ${item.waste_percentage.toFixed(1)}%`,
        `Selling price: $${item.selling_price.toFixed(2)}`,
      ],
      recommended_actions: [
        'Remove from menu if consistently low',
        'Reduce portion size to minimize waste',
        'Run promotion to increase sales',
      ],
      related_items: [{
        id: item.id,
        name: item.name,
        type: 'menu' as const,
        currentValue: item.sales_percentage,
        suggestedValue: 5,
        unit: '%',
      }],
      timeframe: '1-2 weeks',
      priority: getPriorityFromSavings(estimatedSavings),
      category: 'Menu Optimization',
    }
  })
}

// INSIGHT 4: Budget monitoring
function generateBudgetInsights(
  inventoryItems: InventoryItem[],
  monthlyBudget: number | null
): GeneratedInsight[] {
  if (!monthlyBudget || monthlyBudget <= 0) return []

  const totalSpend = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.price_per_unit,
    0
  )
  const budgetPercentage = (totalSpend / monthlyBudget) * 100

  if (budgetPercentage <= 80) return []

  const overage = totalSpend - monthlyBudget * 0.8
  const estimatedSavings = overage * 0.1

  return [{
    type: 'cost_optimization' as const,
    title: `Budget alert: ${budgetPercentage.toFixed(0)}% of monthly budget used`,
    description: `Current inventory spend is $${totalSpend.toFixed(0)}, which is ${budgetPercentage.toFixed(0)}% of your $${monthlyBudget.toFixed(0)} monthly budget. Consider reviewing high-cost items.`,
    impact: budgetPercentage > 100 ? 'high' as const : 'medium' as const,
    estimated_savings: estimatedSavings,
    confidence: 0,
    data_points: [
      `Total inventory value: $${totalSpend.toFixed(0)}`,
      `Monthly budget: $${monthlyBudget.toFixed(0)}`,
      `Budget utilization: ${budgetPercentage.toFixed(0)}%`,
    ],
    recommended_actions: [
      'Review high-cost inventory items',
      'Negotiate better prices with suppliers',
      'Reduce order quantities for low-turnover items',
    ],
    related_items: [],
    timeframe: 'Immediate',
    priority: budgetPercentage > 100 ? 'urgent' as const : 'high' as const,
    category: 'Cost Management',
  }]
}

// INSIGHT 5: Seasonal bulk ordering
function generateSeasonalBulkInsights(
  inventoryItems: InventoryItem[],
  currentMonth: number
): GeneratedInsight[] {
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const nextMonthMultiplier = SEASONAL_MULTIPLIERS[nextMonth] ?? 1.0

  if (nextMonthMultiplier <= 1.05) return []

  // Find fast-moving items with low stock
  const candidates = inventoryItems.filter(
    (item) => item.quantity < item.reorder_point * 1.5
  )

  if (candidates.length === 0) return []

  const totalOrderValue = candidates.reduce(
    (sum, item) => sum + item.reorder_point * item.price_per_unit,
    0
  )
  const estimatedSavings = totalOrderValue * 0.15 // 15% bulk discount estimate

  return [{
    type: 'cost_optimization' as const,
    title: 'Seasonal bulk ordering opportunity',
    description: `Demand is expected to increase ${((nextMonthMultiplier - 1) * 100).toFixed(0)}% next month. ${candidates.length} items are running low. Bulk ordering now could save $${estimatedSavings.toFixed(0)}.`,
    impact: getImpactFromSavings(estimatedSavings),
    estimated_savings: estimatedSavings,
    confidence: 0,
    data_points: [
      `Next month demand multiplier: ${nextMonthMultiplier.toFixed(2)}x`,
      `Items running low: ${candidates.length}`,
      `Estimated order value: $${totalOrderValue.toFixed(0)}`,
    ],
    recommended_actions: [
      'Place bulk orders for fast-moving items',
      'Negotiate volume discounts with suppliers',
      'Pre-order seasonal ingredients',
    ],
    related_items: candidates.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      type: 'inventory' as const,
      currentValue: item.quantity,
      suggestedValue: item.reorder_point * 2,
      unit: item.unit,
    })),
    timeframe: '1-2 weeks',
    priority: getPriorityFromSavings(estimatedSavings),
    category: 'Purchasing Optimization',
  }]
}

// INSIGHT 6: Waste reduction prediction
function generateWasteReductionInsights(
  wasteEvents: WasteEvent[]
): GeneratedInsight[] {
  if (wasteEvents.length === 0) return []

  // Calculate total monthly waste value (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentEvents = wasteEvents.filter(
    (e) => new Date(e.recorded_at) >= thirtyDaysAgo
  )
  const totalMonthlyWaste = recentEvents.reduce(
    (sum, e) => sum + e.estimated_value,
    0
  )

  if (totalMonthlyWaste <= 100) return []

  const potentialSavings = totalMonthlyWaste * 0.15

  return [{
    type: 'waste_reduction' as const,
    title: `Save $${potentialSavings.toFixed(0)}/month with waste reduction`,
    description: `Your monthly waste is $${totalMonthlyWaste.toFixed(0)}. A conservative 15% reduction through better practices could save $${potentialSavings.toFixed(0)}/month ($${(potentialSavings * 12).toFixed(0)}/year).`,
    impact: getImpactFromSavings(potentialSavings),
    estimated_savings: potentialSavings,
    confidence: 0,
    data_points: [
      `Monthly waste value: $${totalMonthlyWaste.toFixed(0)}`,
      `Reduction target: 15%`,
      `Annual savings potential: $${(potentialSavings * 12).toFixed(0)}`,
    ],
    recommended_actions: [
      'Implement daily waste tracking',
      'Set waste reduction targets per category',
      'Review and optimize portion sizes',
      'Improve storage and FIFO practices',
    ],
    related_items: [],
    timeframe: '1-3 months',
    priority: getPriorityFromSavings(potentialSavings),
    category: 'Waste Reduction',
  }]
}

// --- Main function ---

export function generateInsights(data: {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  wasteEvents: WasteEvent[]
  monthlyBudget: number | null
  currentMonth: number
}): GeneratedInsight[] {
  const { inventoryItems, menuItems, wasteEvents, monthlyBudget, currentMonth } = data

  const insights: GeneratedInsight[] = [
    ...generateHighWasteMenuInsights(menuItems),
    ...generateInventoryOptimizationInsights(inventoryItems),
    ...generateMenuPerformanceInsights(menuItems),
    ...generateBudgetInsights(inventoryItems, monthlyBudget),
    ...generateSeasonalBulkInsights(inventoryItems, currentMonth),
    ...generateWasteReductionInsights(wasteEvents),
  ]

  // Set confidence for all insights
  const confidence = calculateConfidence({
    inventoryCount: inventoryItems.length,
    menuCount: menuItems.length,
    wasteEventCount: wasteEvents.length,
    hasLongHistory: hasLongHistory(wasteEvents),
  })

  return insights.map((insight) => ({
    ...insight,
    confidence,
  }))
}

// --- Confidence Scoring ---

export function calculateConfidence(counts: {
  inventoryCount: number
  menuCount: number
  wasteEventCount: number
  hasLongHistory: boolean // true if oldest waste event > 180 days ago
}): number {
  const dataQuality = Math.min(1, (counts.inventoryCount + counts.menuCount) / 20)
  let confidence = dataQuality * 80

  if (counts.wasteEventCount > 30) {
    confidence += 10
  }

  if (counts.hasLongHistory) {
    confidence += 10
  }

  return Math.max(0, Math.min(100, confidence))
}

// Helper to check if user has 6+ months of waste data
function hasLongHistory(wasteEvents: WasteEvent[]): boolean {
  if (wasteEvents.length === 0) return false
  const oldest = wasteEvents.reduce((earliest, e) => {
    const date = new Date(e.recorded_at)
    return date < earliest ? date : earliest
  }, new Date())
  const daysSinceOldest = (Date.now() - oldest.getTime()) / (24 * 60 * 60 * 1000)
  return daysSinceOldest > 180
}

export type { GeneratedInsight }
