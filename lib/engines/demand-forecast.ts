import type { InventoryItem, WasteEvent } from '@/types'
import { SEASONAL_MULTIPLIERS } from './waste-analysis'

export interface DemandForecast {
  itemId: string
  itemName: string
  category: string
  currentQuantity: number
  unit: string
  avgDailyUsage: number
  predictedWeeklyUsage: number
  daysUntilReorder: number
  reorderPoint: number
  recommendedOrderQty: number
  estimatedWeeklyCost: number
  confidence: number
  action: 'urgent' | 'soon' | 'adequate' | 'overstocked'
}

export interface ForecastSummary {
  totalForecastedSpend: number
  itemsNeedingReorder: number
  avgConfidence: number
  urgentItems: number
}

export function generateDemandForecast(
  inventoryItems: InventoryItem[],
  wasteEvents: WasteEvent[],
  forecastDays: number = 7
): { forecasts: DemandForecast[]; summary: ForecastSummary } {
  if (inventoryItems.length === 0) {
    return {
      forecasts: [],
      summary: { totalForecastedSpend: 0, itemsNeedingReorder: 0, avgConfidence: 0, urgentItems: 0 },
    }
  }

  const currentMonth = new Date().getMonth() + 1
  const seasonalMultiplier = SEASONAL_MULTIPLIERS[currentMonth] ?? 1.0
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const forecasts: DemandForecast[] = inventoryItems.map((item) => {
    // Calculate average daily usage from waste events in last 30 days
    const itemEvents = wasteEvents.filter(
      (e) =>
        e.inventory_item_id === item.id &&
        new Date(e.recorded_at) >= thirtyDaysAgo
    )

    const totalWasted = itemEvents.reduce((sum, e) => sum + e.quantity, 0)
    const daysWithData = Math.min(
      30,
      itemEvents.length > 0
        ? (Date.now() - new Date(itemEvents[itemEvents.length - 1].recorded_at).getTime()) /
            (24 * 60 * 60 * 1000)
        : 30
    )

    // Estimate daily usage: waste + assumed consumption
    // Rough heuristic: waste is ~10-15% of total usage, so multiply by factor
    const wasteBasedDailyUsage = daysWithData > 0 ? (totalWasted / Math.max(1, daysWithData)) * 5 : 0
    const avgDailyUsage = wasteBasedDailyUsage * seasonalMultiplier

    const predictedWeeklyUsage = avgDailyUsage * forecastDays
    const estimatedWeeklyCost = predictedWeeklyUsage * item.price_per_unit

    // Days until quantity hits reorder point
    const daysUntilReorder =
      avgDailyUsage > 0
        ? Math.max(0, (item.quantity - item.reorder_point) / avgDailyUsage)
        : item.quantity > item.reorder_point ? 999 : 0

    // Recommended order quantity to reach max stock or 2x reorder point
    const targetStock = item.max_stock_level ?? item.reorder_point * 2
    const recommendedOrderQty = Math.max(0, targetStock - item.quantity + predictedWeeklyUsage)

    // Confidence based on data volume
    const confidence = Math.min(95, Math.max(10, itemEvents.length * 10))

    // Action classification
    let action: DemandForecast['action']
    if (item.quantity <= item.reorder_point) {
      action = 'urgent'
    } else if (daysUntilReorder <= forecastDays) {
      action = 'soon'
    } else if (item.max_stock_level && item.quantity > item.max_stock_level) {
      action = 'overstocked'
    } else {
      action = 'adequate'
    }

    return {
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      currentQuantity: item.quantity,
      unit: item.unit,
      avgDailyUsage: Math.round(avgDailyUsage * 100) / 100,
      predictedWeeklyUsage: Math.round(predictedWeeklyUsage * 100) / 100,
      daysUntilReorder: Math.round(daysUntilReorder),
      reorderPoint: item.reorder_point,
      recommendedOrderQty: Math.round(recommendedOrderQty * 100) / 100,
      estimatedWeeklyCost: Math.round(estimatedWeeklyCost * 100) / 100,
      confidence,
      action,
    }
  })

  // Sort: urgent first, then soon, then adequate, then overstocked
  const actionOrder = { urgent: 0, soon: 1, adequate: 2, overstocked: 3 }
  forecasts.sort((a, b) => actionOrder[a.action] - actionOrder[b.action])

  const summary: ForecastSummary = {
    totalForecastedSpend: forecasts.reduce((s, f) => s + f.estimatedWeeklyCost, 0),
    itemsNeedingReorder: forecasts.filter((f) => f.action === 'urgent' || f.action === 'soon').length,
    avgConfidence:
      forecasts.length > 0
        ? forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length
        : 0,
    urgentItems: forecasts.filter((f) => f.action === 'urgent').length,
  }

  return { forecasts, summary }
}
