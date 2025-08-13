import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateAndSaveInsights, getAIInsights } from '@/lib/ai-insights'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing AI insights for the user
    const insights = await getAIInsights(user.id)
    
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { regenerate = false } = body

    // Fetch user's inventory and menu data
    const [inventoryResult, menuResult, userResult] = await Promise.all([
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('users')
        .select('restaurant_name, monthly_budget')
        .eq('id', user.id)
        .single()
    ])

    if (inventoryResult.error || menuResult.error || userResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const inventoryItems = inventoryResult.data || []
    const menuItems = menuResult.data || []
    const userProfile = userResult.data

    // Calculate monthly spend (placeholder calculation)
    const monthlySpend = inventoryItems.reduce((sum, item) => 
      sum + (item.quantity * item.price_per_unit * 0.3), 0) // Assume 30% turnover monthly

    // Generate new insights if requested or if no recent insights exist
    if (regenerate) {
      // Delete existing insights for regeneration
      await supabase
        .from('ai_insights')
        .delete()
        .eq('user_id', user.id)
    }

    // Check if we have recent insights (within last 7 days)
    const { data: recentInsights } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    let insights
    if (!recentInsights || recentInsights.length === 0 || regenerate) {
      // Generate new insights
      insights = await generateAndSaveInsights(
        user.id,
        inventoryItems,
        menuItems,
        monthlySpend,
        userProfile?.monthly_budget,
        userProfile?.restaurant_name
      )
    } else {
      // Return existing insights
      insights = await getAIInsights(user.id)
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}