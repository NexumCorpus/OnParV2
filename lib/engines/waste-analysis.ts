import type { WasteEvent, InventoryItem } from '@/types'

// --- Types ---

export interface WastePattern {
  itemId: string
  itemName: string
  category: string
  totalWasteQuantity: number
  totalWasteValue: number
  wasteRate: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  primaryReason: string
  occurrences: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface WasteSavingsCalculation {
  currentMonthlyWaste: number
  potentialSavings: number
  reductionPercentage: number
  implementationCost: number
  paybackPeriodMonths: number
  roi: number
}

export interface SeasonalTrend {
  month: number
  monthName: string
  wasteMultiplier: number
  historicalAverage: number
}

// --- Constants ---

export const SEASONAL_MULTIPLIERS: Record<number, number> = {
  1: 0.95,
  2: 0.92,
  3: 0.98,
  4: 1.02,
  5: 1.05,
  6: 1.12,
  7: 1.15,
  8: 1.10,
  9: 1.03,
  10: 1.00,
  11: 1.08,
  12: 1.18,
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// --- Core Analysis Functions ---

function determineRiskLevel(
  wasteRate: number,
  totalWasteValue: number
): 'critical' | 'high' | 'medium' | 'low' {
  if (wasteRate > 20 || totalWasteValue > 500) return 'critical'
  if (wasteRate > 10 || totalWasteValue > 200) return 'high'
  if (wasteRate > 5 || totalWasteValue > 50) return 'medium'
  return 'low'
}

function determineTrend(
  wasteEvents: WasteEvent[],
  itemId: string
): 'increasing' | 'stable' | 'decreasing' {
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

  if (previousPeriod === 0) return 'stable'
  if (currentPeriod > previousPeriod * 1.1) return 'increasing'
  if (currentPeriod < previousPeriod * 0.9) return 'decreasing'
  return 'stable'
}

function findPrimaryReason(events: WasteEvent[]): string {
  if (events.length === 0) return 'unknown'
  const counts: Record<string, number> = {}
  for (const e of events) {
    counts[e.reason] = (counts[e.reason] ?? 0) + 1
  }
  let maxReason = 'unknown'
  let maxCount = 0
  for (const [reason, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      maxReason = reason
    }
  }
  return maxReason
}

export function analyzeWastePatterns(
  wasteEvents: WasteEvent[],
  inventoryItems: InventoryItem[]
): WastePattern[] {
  if (wasteEvents.length === 0) return []

  const itemMap = new Map<string, InventoryItem>()
  for (const item of inventoryItems) {
    itemMap.set(item.id, item)
  }

  // Group waste events by inventory item
  const grouped = new Map<string, WasteEvent[]>()
  for (const event of wasteEvents) {
    if (!event.inventory_item_id) continue
    const existing = grouped.get(event.inventory_item_id) ?? []
    existing.push(event)
    grouped.set(event.inventory_item_id, existing)
  }

  const patterns: WastePattern[] = []

  for (const [itemId, events] of grouped) {
    const item = itemMap.get(itemId)
    if (!item) continue

    const totalWasteQuantity = events.reduce((sum, e) => sum + e.quantity, 0)
    const totalWasteValue = events.reduce((sum, e) => sum + e.estimated_value, 0)

    // totalInboundQuantity approximated from current quantity + total waste
    const totalInboundQuantity = item.quantity + totalWasteQuantity
    const wasteRate =
      totalInboundQuantity > 0
        ? (totalWasteQuantity / totalInboundQuantity) * 100
        : 0

    const riskLevel = determineRiskLevel(wasteRate, totalWasteValue)
    const primaryReason = findPrimaryReason(events)
    const trend = determineTrend(wasteEvents, itemId)

    patterns.push({
      itemId,
      itemName: item.name,
      category: item.category,
      totalWasteQuantity,
      totalWasteValue,
      wasteRate,
      riskLevel,
      primaryReason,
      occurrences: events.length,
      trend,
    })
  }

  // Sort by totalWasteValue descending
  patterns.sort((a, b) => b.totalWasteValue - a.totalWasteValue)
  return patterns
}

// --- Seasonal Analysis ---

export function getSeasonalTrends(): SeasonalTrend[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
      month,
      monthName: MONTH_NAMES[i],
      wasteMultiplier: SEASONAL_MULTIPLIERS[month],
      historicalAverage: SEASONAL_MULTIPLIERS[month],
    }
  })
}

// --- Savings Calculations ---

export function calculateSavings(
  currentMonthlyWaste: number,
  reductionPercentage: number,
  implementationCost: number
): WasteSavingsCalculation {
  const potentialSavings = currentMonthlyWaste * (reductionPercentage / 100)
  const paybackPeriodMonths =
    potentialSavings > 0 ? implementationCost / potentialSavings : 0
  const roi =
    implementationCost > 0
      ? ((potentialSavings * 12 - implementationCost) / implementationCost) * 100
      : 0

  return {
    currentMonthlyWaste,
    potentialSavings,
    reductionPercentage,
    implementationCost,
    paybackPeriodMonths,
    roi,
  }
}
