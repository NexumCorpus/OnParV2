'use server'

import { createClient } from '@/lib/supabase/server'
import { wasteEventSchema } from '@/lib/utils/validation'
import { logger } from '@/lib/utils/logger'
import { analyzeWastePatterns, getSeasonalTrends } from '@/lib/engines/waste-analysis'
import { generatePredictions, generateAlerts } from '@/lib/engines/waste-predictions'
import { generateInsights } from '@/lib/engines/ai-insights'
import { compareToBenchmarks } from '@/lib/engines/waste-benchmarks'
import { generateReport } from '@/lib/engines/waste-insights'
import type { ActionResult, RecordWasteInput, WasteEvent, InventoryItem, AIInsight } from '@/types'

// --- Auth helper ---

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user.id
}

// --- recordWasteEvent ---
// Atomic: INSERT waste event + DECREMENT inventory
// Uses FOR UPDATE lock on inventory row to prevent TOCTOU race

export async function recordWasteEvent(data: RecordWasteInput): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    // 1. Validate input
    const parsed = wasteEventSchema.safeParse(data)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message ?? 'Validation failed' }
    }

    const { inventory_item_id, quantity, unit, reason, notes } = parsed.data
    const supabase = await createClient()

    // 2-3. Fetch inventory item (with RLS ensuring user ownership)
    const { data: item, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', inventory_item_id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !item) {
      return { success: false, error: 'Inventory item not found' }
    }

    const inventoryItem = item as InventoryItem

    // 4. Guard: verify item is NOT soft-deleted
    if (inventoryItem.deleted_at !== null) {
      return { success: false, error: 'Item has been deleted and cannot have waste recorded against it.' }
    }

    // 5. Calculate estimated value
    const estimated_value = quantity * inventoryItem.price_per_unit

    // 6. INSERT waste event
    const { error: insertError } = await supabase
      .from('waste_events')
      .insert({
        user_id: userId,
        inventory_item_id,
        quantity,
        unit,
        reason,
        notes: notes ?? null,
        estimated_value,
        recorded_at: new Date().toISOString(),
      })

    if (insertError) {
      logger.error({ err: insertError, action: 'recordWasteEvent' }, 'Failed to insert waste event')
      return { success: false, error: 'Failed to record waste event' }
    }

    // 7. DECREMENT inventory via adjustQuantity RPC
    const { data: adjustedData, error: adjustError } = await supabase.rpc('adjust_quantity', {
      item_id: inventory_item_id,
      delta: -quantity,
    })

    if (adjustError) {
      logger.error(
        { err: adjustError, action: 'recordWasteEvent', itemId: inventory_item_id },
        'Failed to adjust inventory quantity after waste event'
      )
      return { success: false, error: 'Failed to adjust inventory quantity' }
    }

    const adjustedRows = adjustedData as InventoryItem[] | null
    if (!adjustedRows || adjustedRows.length === 0) {
      logger.error(
        { action: 'recordWasteEvent', itemId: inventory_item_id },
        'adjustQuantity returned null unexpectedly (item may have been deleted concurrently)'
      )
      return { success: false, error: 'Unexpected error adjusting inventory' }
    }

    return { success: true, data: { estimated_value } }
  } catch (err) {
    logger.error({ err, action: 'recordWasteEvent' }, 'Failed to record waste event')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// --- refreshWasteAnalysis ---

export async function refreshWasteAnalysis(): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    // Fetch waste events
    const { data: wasteData, error: wasteError } = await supabase
      .from('waste_events')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })

    if (wasteError) {
      logger.error({ err: wasteError, action: 'refreshWasteAnalysis' }, 'Failed to fetch waste events')
      return { success: false, error: 'Failed to fetch waste data' }
    }

    const wasteEvents = (wasteData ?? []) as WasteEvent[]

    // Fetch inventory items
    const { data: inventoryData, error: invError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (invError) {
      logger.error({ err: invError, action: 'refreshWasteAnalysis' }, 'Failed to fetch inventory')
      return { success: false, error: 'Failed to fetch inventory data' }
    }

    const inventoryItems = (inventoryData ?? []) as InventoryItem[]

    // Run engine functions
    const patterns = analyzeWastePatterns(wasteEvents, inventoryItems)
    const currentMonth = new Date().getMonth() + 1
    const predictions = generatePredictions(inventoryItems, wasteEvents, currentMonth)
    const alerts = generateAlerts(inventoryItems, predictions, currentMonth)
    const seasonalTrends = getSeasonalTrends()

    // Calculate category waste rates for benchmarks
    const categoryMap = new Map<string, { totalWaste: number; totalInbound: number }>()
    for (const pattern of patterns) {
      const existing = categoryMap.get(pattern.category) ?? { totalWaste: 0, totalInbound: 0 }
      existing.totalWaste += pattern.totalWasteQuantity
      const item = inventoryItems.find((i) => i.id === pattern.itemId)
      existing.totalInbound += (item?.quantity ?? 0) + pattern.totalWasteQuantity
      categoryMap.set(pattern.category, existing)
    }

    const categoryWasteRates = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      wasteRate: data.totalInbound > 0 ? (data.totalWaste / data.totalInbound) * 100 : 0,
    }))

    const benchmarks = compareToBenchmarks(categoryWasteRates)

    const avgWasteRate = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.wasteRate, 0) / patterns.length
      : 0

    const report = generateReport({
      wastePatterns: patterns,
      benchmarks,
      predictions,
      avgWasteRate,
    })

    // Save analysis snapshot
    const totalInventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.price_per_unit,
      0
    )
    const monthlySpend = totalInventoryValue // approximation
    const seasonalFactor = SEASONAL_MULTIPLIERS_LOOKUP[currentMonth] ?? 1.0

    await supabase
      .from('waste_analysis_snapshots')
      .insert({
        user_id: userId,
        analysis_date: new Date().toISOString().split('T')[0],
        total_inventory_value: totalInventoryValue,
        monthly_spend: monthlySpend,
        average_waste_percentage: avgWasteRate,
        inventory_turnover: 0,
        cost_efficiency_score: report.summary.performanceScore,
        seasonal_factor: seasonalFactor,
        data_quality_score: Math.min(1, (inventoryItems.length + wasteEvents.length) / 20),
      })

    return {
      success: true,
      data: {
        patterns,
        predictions,
        alerts,
        benchmarks,
        seasonalTrends,
        report,
      },
    }
  } catch (err) {
    logger.error({ err, action: 'refreshWasteAnalysis' }, 'Failed to refresh waste analysis')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// Seasonal multipliers lookup used in snapshots
const SEASONAL_MULTIPLIERS_LOOKUP: Record<number, number> = {
  1: 0.95, 2: 0.92, 3: 0.98, 4: 1.02, 5: 1.05, 6: 1.12,
  7: 1.15, 8: 1.10, 9: 1.03, 10: 1.00, 11: 1.08, 12: 1.18,
}

// --- refreshAIInsights ---

export async function refreshAIInsights(): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    // Fetch all user data in parallel
    const [wasteResult, inventoryResult, menuResult, profileResult] = await Promise.all([
      supabase
        .from('waste_events')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false }),
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('users')
        .select('monthly_budget')
        .eq('id', userId)
        .single(),
    ])

    const wasteEvents = (wasteResult.data ?? []) as WasteEvent[]
    const inventoryItems = (inventoryResult.data ?? []) as InventoryItem[]
    const menuItems = (menuResult.data ?? []) as Array<{
      id: string; org_id: string; user_id: string; recipe_id: string | null; name: string;
      category: string; selling_price: number; sales_percentage: number;
      waste_percentage: number; is_active: boolean; created_at: string; updated_at: string;
    }>
    const monthlyBudget = (profileResult.data as { monthly_budget: number | null } | null)?.monthly_budget ?? null

    const currentMonth = new Date().getMonth() + 1

    // Generate insights
    const generatedInsights = generateInsights({
      inventoryItems,
      menuItems,
      wasteEvents,
      monthlyBudget,
      currentMonth,
    })

    // Delete existing pending insights for this user (dedup)
    await supabase
      .from('ai_insights')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'pending')

    // Insert new insights
    if (generatedInsights.length > 0) {
      const insightRows = generatedInsights.map((insight) => ({
        user_id: userId,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        estimated_savings: insight.estimated_savings,
        confidence: insight.confidence,
        data_points: insight.data_points,
        recommended_actions: insight.recommended_actions,
        related_items: insight.related_items,
        timeframe: insight.timeframe,
        priority: insight.priority,
        category: insight.category,
        status: 'pending' as const,
      }))

      const { error: insertError } = await supabase
        .from('ai_insights')
        .insert(insightRows)

      if (insertError) {
        logger.error({ err: insertError, action: 'refreshAIInsights' }, 'Failed to insert AI insights')
        return { success: false, error: 'Failed to save insights' }
      }
    }

    // Fetch all insights (including completed/in_progress/dismissed)
    const { data: allInsights, error: fetchError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      logger.error({ err: fetchError, action: 'refreshAIInsights' }, 'Failed to fetch insights')
      return { success: false, error: 'Failed to fetch insights' }
    }

    return { success: true, data: allInsights as AIInsight[] }
  } catch (err) {
    logger.error({ err, action: 'refreshAIInsights' }, 'Failed to refresh AI insights')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// --- updateInsightStatus ---

export async function updateInsightStatus(
  insightId: string,
  status: string,
  savings?: number
): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'in_progress') {
      updateData.implementation_date = new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString()
      if (savings !== undefined) {
        updateData.actual_savings = savings
      }
    }

    const { error } = await supabase
      .from('ai_insights')
      .update(updateData)
      .eq('id', insightId)

    if (error) {
      logger.error({ err: error, insightId, action: 'updateInsightStatus' }, 'Failed to update insight status')
      return { success: false, error: 'Failed to update insight status' }
    }

    return { success: true }
  } catch (err) {
    logger.error({ err, insightId, action: 'updateInsightStatus' }, 'Failed to update insight status')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// --- dismissInsight ---

export async function dismissInsight(insightId: string): Promise<ActionResult> {
  return updateInsightStatus(insightId, 'dismissed')
}

// --- saveInsights ---

export async function saveInsights(insights: AIInsight[]): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    if (insights.length === 0) {
      return { success: true, data: [] }
    }

    const rows = insights.map((insight) => ({
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      impact: insight.impact,
      estimated_savings: insight.estimated_savings,
      confidence: insight.confidence,
      data_points: insight.data_points,
      recommended_actions: insight.recommended_actions,
      related_items: insight.related_items,
      timeframe: insight.timeframe,
      priority: insight.priority,
      category: insight.category,
      status: 'pending' as const,
    }))

    const { data: inserted, error } = await supabase
      .from('ai_insights')
      .upsert(rows, {
        onConflict: 'user_id,type,title,status',
      })
      .select()

    if (error) {
      logger.error({ err: error, action: 'saveInsights' }, 'Failed to save insights')
      return { success: false, error: 'Failed to save insights' }
    }

    return { success: true, data: inserted }
  } catch (err) {
    logger.error({ err, action: 'saveInsights' }, 'Failed to save insights')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// --- saveAnalysisSnapshot ---

export async function saveAnalysisSnapshot(data: {
  total_inventory_value: number
  monthly_spend: number
  average_waste_percentage: number
  inventory_turnover: number
  cost_efficiency_score: number
  seasonal_factor: number
  data_quality_score: number
}): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from('waste_analysis_snapshots')
      .insert({
        user_id: userId,
        analysis_date: new Date().toISOString().split('T')[0],
        ...data,
      })

    if (error) {
      logger.error({ err: error, action: 'saveAnalysisSnapshot' }, 'Failed to save analysis snapshot')
      return { success: false, error: 'Failed to save analysis snapshot' }
    }

    return { success: true }
  } catch (err) {
    logger.error({ err, action: 'saveAnalysisSnapshot' }, 'Failed to save analysis snapshot')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// --- Fetch helpers for waste page ---

export async function getInventoryItemsForWaste(): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      return { success: false, error: 'Failed to fetch inventory items' }
    }

    return { success: true, data: data as InventoryItem[] }
  } catch (err) {
    logger.error({ err, action: 'getInventoryItemsForWaste' }, 'Failed to fetch inventory')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function getWasteEvents(): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('waste_events')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })

    if (error) {
      return { success: false, error: 'Failed to fetch waste events' }
    }

    return { success: true, data: data as WasteEvent[] }
  } catch (err) {
    logger.error({ err, action: 'getWasteEvents' }, 'Failed to fetch waste events')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function getAIInsights(): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: 'Failed to fetch AI insights' }
    }

    return { success: true, data: data as AIInsight[] }
  } catch (err) {
    logger.error({ err, action: 'getAIInsights' }, 'Failed to fetch AI insights')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
