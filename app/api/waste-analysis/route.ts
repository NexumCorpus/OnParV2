import { NextRequest, NextResponse } from 'next/server'
import { wasteAnalysisEngine } from '@/lib/waste-analysis'
import { wasteInsightsService } from '@/lib/waste-insights'
import { wastePredictionEngine } from '@/lib/waste-predictions'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const analysisType = searchParams.get('type') || 'patterns'
    const period = parseInt(searchParams.get('period') || '90')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', session.user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 403 })
    }

    let result

    switch (analysisType) {
      case 'patterns':
        result = await wasteAnalysisEngine.analyzeWastePatterns(businessId, period)
        break

      case 'insights':
        result = await wasteInsightsService.generateWasteInsightsReport(businessId)
        break

      case 'predictions':
        const forecastDays = parseInt(searchParams.get('forecastDays') || '30')
        result = await wastePredictionEngine.predictWasteForPeriod(businessId, forecastDays)
        break

      case 'alerts':
        result = await wastePredictionEngine.generateWasteAlerts(businessId)
        break

      case 'seasonal':
        const itemId = searchParams.get('itemId')
        result = await wasteAnalysisEngine.analyzeSeasonalTrends(businessId, itemId || undefined)
        break

      case 'high-waste':
        const limit = parseInt(searchParams.get('limit') || '10')
        result = await wasteAnalysisEngine.identifyHighWasteItems(businessId, limit)
        break

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        businessId,
        analysisType,
        period,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Waste analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, action, data } = body

    if (!businessId || !action) {
      return NextResponse.json({ error: 'Business ID and action are required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', session.user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 403 })
    }

    let result

    switch (action) {
      case 'calculate_savings':
        const { currentWasteValue, targetReduction, implementationCost } = data
        result = wasteAnalysisEngine.calculateWasteSavings(
          currentWasteValue,
          targetReduction,
          implementationCost || 0
        )
        break

      case 'calculate_prevention_roi':
        const { wasteValue, preventionCost, expectedReduction } = data
        result = wastePredictionEngine.calculatePreventionROI(
          wasteValue,
          preventionCost,
          expectedReduction
        )
        break

      case 'generate_full_report':
        result = await wasteInsightsService.generateWasteInsightsReport(businessId)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        businessId,
        action,
        processedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Waste analysis POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}