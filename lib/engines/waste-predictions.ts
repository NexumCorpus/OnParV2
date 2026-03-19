import type { InventoryItem, WasteEvent } from '@/types'
import { SEASONAL_MULTIPLIERS } from './waste-analysis'

// --- Types ---

export interface WastePrediction {
  itemId: string
  itemName: string
  predictedWasteQuantity: number
  predictedWasteValue: number
  confidence: number // 0-100
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  name: string
  impact: number // multiplier, e.g., 1.2 = 20% increase
  description: string
}

export interface WasteAlert {
  id: string
  type: 'expiration' | 'high_waste_risk' | 'overstock' | 'seasonal_spike'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  itemId?: string
  itemName?: string
  estimatedImpact: number // dollar value
  suggestedAction: string
  createdAt: Date
}

export interface PreventionROI {
  strategy: string
  monthlySavings: number
  implementationCost: number
  annualSavings: number
  roi: number
  paybackMonths: number
}

// --- Prediction Functions ---

function getBaseWasteRate(
  wasteEvents: WasteEvent[],
  itemId: string,
  quantity: number
): number {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  const itemEvents = wasteEvents.filter(
    (e) =>
      e.inventory_item_id === itemId &&
      new Date(e.recorded_at) >= sixMonthsAgo
  )
  const totalWaste = itemEvents.reduce((sum, e) => sum + e.quantity, 0)
  const totalInbound = quantity + totalWaste
  if (totalInbound <= 0) return 0
  return totalWaste / totalInbound
}

function getStockFactor(item: InventoryItem): PredictionFactor {
  const maxStock = item.max_stock_level
  if (maxStock && maxStock > 0) {
    if (item.quantity > maxStock * 1.2) {
      return {
        name: 'Stock Level',
        impact: 1.3,
        description: `Overstocked: ${item.quantity} vs max ${maxStock}`,
      }
    }
    if (item.quantity > maxStock) {
      return {
        name: 'Stock Level',
        impact: 1.15,
        description: `Above max stock: ${item.quantity} vs max ${maxStock}`,
      }
    }
  }
  return { name: 'Stock Level', impact: 1.0, description: 'Normal stock levels' }
}

function getExpiryFactor(item: InventoryItem): PredictionFactor {
  if (!item.expiry_date) {
    return { name: 'Expiration', impact: 1.0, description: 'No expiry date set' }
  }
  const now = new Date()
  const expiryDate = new Date(item.expiry_date)
  const daysToExpiry = (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)

  if (daysToExpiry < 1) {
    return { name: 'Expiration', impact: 2.0, description: 'Expires today or past due' }
  }
  if (daysToExpiry < 3) {
    return { name: 'Expiration', impact: 1.5, description: `Expires in ${Math.ceil(daysToExpiry)} days` }
  }
  if (daysToExpiry < 7) {
    return { name: 'Expiration', impact: 1.2, description: `Expires in ${Math.ceil(daysToExpiry)} days` }
  }
  return { name: 'Expiration', impact: 1.0, description: 'Not expiring soon' }
}

function getTrendFactor(
  wasteEvents: WasteEvent[],
  itemId: string
): PredictionFactor {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const itemEvents = wasteEvents.filter((e) => e.inventory_item_id === itemId)

  const currentPeriod = itemEvents
    .filter((e) => new Date(e.recorded_at) >= thirtyDaysAgo)
    .reduce((sum, e) => sum + e.quantity, 0)

  const previousPeriod = itemEvents
    .filter(
      (e) =>
        new Date(e.recorded_at) >= sixtyDaysAgo &&
        new Date(e.recorded_at) < thirtyDaysAgo
    )
    .reduce((sum, e) => sum + e.quantity, 0)

  if (previousPeriod > 0 && currentPeriod > previousPeriod * 1.1) {
    return { name: 'Recent Trend', impact: 1.2, description: 'Waste is increasing' }
  }
  if (previousPeriod > 0 && currentPeriod < previousPeriod * 0.9) {
    return { name: 'Recent Trend', impact: 0.85, description: 'Waste is decreasing' }
  }
  return { name: 'Recent Trend', impact: 1.0, description: 'Waste trend is stable' }
}

export function generatePredictions(
  inventoryItems: InventoryItem[],
  wasteEvents: WasteEvent[],
  currentMonth: number
): WastePrediction[] {
  if (inventoryItems.length === 0) return []

  const seasonalMultiplier = SEASONAL_MULTIPLIERS[currentMonth] ?? 1.0

  return inventoryItems.map((item) => {
    const baseWasteRate = getBaseWasteRate(wasteEvents, item.id, item.quantity)

    const seasonalFactor: PredictionFactor = {
      name: 'Seasonal',
      impact: seasonalMultiplier,
      description: `Month ${currentMonth} multiplier: ${seasonalMultiplier}`,
    }
    const stockFactor = getStockFactor(item)
    const expiryFactor = getExpiryFactor(item)
    const trendFactor = getTrendFactor(wasteEvents, item.id)

    const factors = [seasonalFactor, stockFactor, expiryFactor, trendFactor]
    const combinedFactor = factors.reduce((product, f) => product * f.impact, 1)

    const predictedWasteQuantity = baseWasteRate * combinedFactor * item.quantity
    const predictedWasteValue = predictedWasteQuantity * item.price_per_unit

    // Per-item confidence: min(95, dataQuality * 100)
    // where dataQuality = min(1, itemWasteEventsCount / 10)
    const itemWasteEventsCount = wasteEvents.filter(
      (e) => e.inventory_item_id === item.id
    ).length
    const dataQuality = Math.min(1, itemWasteEventsCount / 10)
    const confidence = Math.min(95, dataQuality * 100)

    return {
      itemId: item.id,
      itemName: item.name,
      predictedWasteQuantity,
      predictedWasteValue,
      confidence,
      factors,
    }
  })
}

// --- Alert Generation ---

export function generateAlerts(
  inventoryItems: InventoryItem[],
  predictions: WastePrediction[],
  currentMonth: number
): WasteAlert[] {
  const alerts: WasteAlert[] = []
  let alertIndex = 0

  // EXPIRATION WARNINGS
  for (const item of inventoryItems) {
    if (!item.expiry_date) continue
    const now = new Date()
    const expiryDate = new Date(item.expiry_date)
    const daysToExpiry = (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    const estimatedImpact = item.quantity * item.price_per_unit

    if (daysToExpiry < 1) {
      alerts.push({
        id: `alert-exp-${alertIndex++}`,
        type: 'expiration',
        severity: 'critical',
        title: `${item.name} expires today!`,
        description: `${item.quantity} ${item.unit} ($${estimatedImpact.toFixed(2)}) at risk`,
        itemId: item.id,
        itemName: item.name,
        estimatedImpact,
        suggestedAction: 'Prioritize in today\'s service or freeze immediately',
        createdAt: new Date(),
      })
    } else if (daysToExpiry < 2) {
      alerts.push({
        id: `alert-exp-${alertIndex++}`,
        type: 'expiration',
        severity: 'critical',
        title: `${item.name} expires tomorrow`,
        description: `${item.quantity} ${item.unit} ($${estimatedImpact.toFixed(2)}) at risk`,
        itemId: item.id,
        itemName: item.name,
        estimatedImpact,
        suggestedAction: 'Use in today\'s specials or freeze',
        createdAt: new Date(),
      })
    } else if (daysToExpiry < 3) {
      alerts.push({
        id: `alert-exp-${alertIndex++}`,
        type: 'expiration',
        severity: 'high',
        title: `${item.name} expires in ${Math.ceil(daysToExpiry)} days`,
        description: `${item.quantity} ${item.unit} ($${estimatedImpact.toFixed(2)}) at risk`,
        itemId: item.id,
        itemName: item.name,
        estimatedImpact,
        suggestedAction: 'Discount for quick sale or use in specials',
        createdAt: new Date(),
      })
    } else if (daysToExpiry < 7) {
      alerts.push({
        id: `alert-exp-${alertIndex++}`,
        type: 'expiration',
        severity: 'medium',
        title: `${item.name} expires in ${Math.ceil(daysToExpiry)} days`,
        description: `${item.quantity} ${item.unit} ($${estimatedImpact.toFixed(2)}) at risk`,
        itemId: item.id,
        itemName: item.name,
        estimatedImpact,
        suggestedAction: 'Plan to use soon or consider freezing',
        createdAt: new Date(),
      })
    }
  }

  // HIGH WASTE RISK
  for (const prediction of predictions) {
    if (prediction.predictedWasteValue > 50 && prediction.confidence > 70) {
      const severity = prediction.predictedWasteValue > 200 ? 'high' as const : 'medium' as const
      alerts.push({
        id: `alert-risk-${alertIndex++}`,
        type: 'high_waste_risk',
        severity,
        title: `High waste risk: ${prediction.itemName}`,
        description: `Predicted waste: $${prediction.predictedWasteValue.toFixed(2)} (${prediction.confidence.toFixed(0)}% confidence)`,
        itemId: prediction.itemId,
        itemName: prediction.itemName,
        estimatedImpact: prediction.predictedWasteValue,
        suggestedAction: 'Reduce order quantity by 20%',
        createdAt: new Date(),
      })
    }
  }

  // OVERSTOCK
  for (const item of inventoryItems) {
    if (item.max_stock_level && item.max_stock_level > 0 && item.quantity > item.max_stock_level * 1.2) {
      const overstockPercentage = Math.round(
        ((item.quantity - item.max_stock_level) / item.max_stock_level) * 100
      )
      const estimatedImpact = (item.quantity - item.max_stock_level) * item.price_per_unit
      alerts.push({
        id: `alert-over-${alertIndex++}`,
        type: 'overstock',
        severity: 'medium',
        title: `${item.name} overstocked by ${overstockPercentage}%`,
        description: `Current: ${item.quantity} ${item.unit}, Max: ${item.max_stock_level} ${item.unit}`,
        itemId: item.id,
        itemName: item.name,
        estimatedImpact,
        suggestedAction: 'Run promotion or adjust menu to use surplus',
        createdAt: new Date(),
      })
    }
  }

  // SEASONAL SPIKES
  const uniqueCategories = [...new Set(inventoryItems.map((i) => i.category))]

  if ([6, 7, 8].includes(currentMonth) && uniqueCategories.includes('Dairy')) {
    const dairyItems = inventoryItems.filter((i) => i.category === 'Dairy')
    const totalDairyValue = dairyItems.reduce(
      (sum, i) => sum + i.quantity * i.price_per_unit,
      0
    )
    alerts.push({
      id: `alert-season-${alertIndex++}`,
      type: 'seasonal_spike',
      severity: 'medium',
      title: 'Summer dairy spoilage season approaching',
      description: 'Dairy items may spoil 15% faster in June-August',
      estimatedImpact: totalDairyValue * 0.15,
      suggestedAction: 'Reduce dairy order quantities starting May',
      createdAt: new Date(),
    })
  }

  if ([11, 12].includes(currentMonth) && uniqueCategories.includes('Produce')) {
    const produceItems = inventoryItems.filter((i) => i.category === 'Produce')
    const totalProduceValue = produceItems.reduce(
      (sum, i) => sum + i.quantity * i.price_per_unit,
      0
    )
    alerts.push({
      id: `alert-season-${alertIndex++}`,
      type: 'seasonal_spike',
      severity: 'medium',
      title: 'Holiday produce surplus risk',
      description: 'Produce items may have higher waste during holiday season',
      estimatedImpact: totalProduceValue * 0.1,
      suggestedAction: 'Order produce in smaller batches during holidays',
      createdAt: new Date(),
    })
  }

  if ([1, 2].includes(currentMonth) && uniqueCategories.includes('Frozen')) {
    const frozenItems = inventoryItems.filter((i) => i.category === 'Frozen')
    const totalFrozenValue = frozenItems.reduce(
      (sum, i) => sum + i.quantity * i.price_per_unit,
      0
    )
    alerts.push({
      id: `alert-season-${alertIndex++}`,
      type: 'seasonal_spike',
      severity: 'medium',
      title: 'Winter frozen food demand drop',
      description: 'Frozen items demand typically drops in January-February',
      estimatedImpact: totalFrozenValue * 0.1,
      suggestedAction: 'Reduce frozen food orders during winter months',
      createdAt: new Date(),
    })
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return alerts
}

// --- Prevention ROI ---

export function calculatePreventionROI(
  currentMonthlyWaste: number,
  strategy: string,
  expectedReductionPercent: number,
  implementationCost: number
): PreventionROI {
  const monthlySavings = currentMonthlyWaste * (expectedReductionPercent / 100)
  const annualSavings = monthlySavings * 12
  const roi =
    implementationCost > 0
      ? ((annualSavings - implementationCost) / implementationCost) * 100
      : 0
  const paybackMonths =
    monthlySavings > 0 ? implementationCost / monthlySavings : 0

  return {
    strategy,
    monthlySavings,
    implementationCost,
    annualSavings,
    roi,
    paybackMonths,
  }
}
