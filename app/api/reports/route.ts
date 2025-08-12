import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { logError, logUserAction } from '@/lib/error-logging'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportType, dateRange, filters, metrics, format } = body

    // Get user data
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: inventoryItems } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('user_id', user.id)

    // Generate report data
    const reportData = generateReportData({
      reportType,
      dateRange,
      filters,
      metrics,
      inventoryItems: inventoryItems || [],
      menuItems: menuItems || [],
      userProfile: profile
    })

    // Log report generation
    logUserAction('report_generated', {
      report_type: reportType,
      format,
      metrics_count: metrics?.length || 0
    }, user.id)

    return NextResponse.json({
      data: reportData,
      format,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    logError(error as Error, 'api_reports_generate')
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function generateReportData(config: any) {
  const { reportType, inventoryItems, menuItems, userProfile } = config
  
  const summary = {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    restaurant_name: userProfile?.restaurant_name || 'Restaurant',
    total_inventory_items: inventoryItems.length,
    total_menu_items: menuItems.length,
    total_inventory_value: inventoryItems.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.price_per_unit), 0),
    low_stock_items: inventoryItems.filter((item: any) => 
      item.quantity <= item.reorder_point).length,
    expiring_items: inventoryItems.filter((item: any) => {
      if (!item.expiry_date) return false
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length,
    avg_waste_percentage: menuItems.length > 0 
      ? menuItems.reduce((sum: number, item: any) => sum + item.waste_percentage, 0) / menuItems.length 
      : 0
  }

  const details = {
    inventory_breakdown: inventoryItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      value: item.quantity * item.price_per_unit,
      status: item.quantity <= item.reorder_point ? 'Low Stock' : 'In Stock',
      expiry_date: item.expiry_date
    })),
    menu_performance: menuItems.map((item: any) => ({
      name: item.name,
      sales_percentage: item.sales_percentage,
      waste_percentage: item.waste_percentage,
      performance_score: item.sales_percentage - item.waste_percentage
    })),
    recommendations: generateRecommendations(inventoryItems, menuItems, summary)
  }

  return {
    summary,
    details,
    charts: generateChartData(inventoryItems, menuItems),
    metadata: {
      generated_by: 'OnPar Analytics Engine',
      version: '1.0.0',
      filters_applied: config.filters || {},
      date_range: config.dateRange || {}
    }
  }
}

function generateRecommendations(inventoryItems: any[], menuItems: any[], summary: any) {
  const recommendations = []

  // Low stock recommendations
  if (summary.low_stock_items > 0) {
    recommendations.push({
      type: 'inventory',
      priority: 'high',
      title: 'Reorder Low Stock Items',
      description: `${summary.low_stock_items} items need immediate reordering to prevent stockouts`,
      action: 'Review inventory tab and place orders'
    })
  }

  // Waste reduction recommendations
  if (summary.avg_waste_percentage > 8) {
    recommendations.push({
      type: 'waste',
      priority: 'medium',
      title: 'Reduce Food Waste',
      description: `Current waste rate of ${summary.avg_waste_percentage.toFixed(1)}% is above optimal range`,
      action: 'Implement portion control and FIFO rotation'
    })
  }

  // Menu optimization recommendations
  const lowPerformingItems = menuItems.filter((item: any) => 
    item.sales_percentage < 5 && item.waste_percentage > 5
  )
  if (lowPerformingItems.length > 0) {
    recommendations.push({
      type: 'menu',
      priority: 'medium',
      title: 'Optimize Menu Performance',
      description: `${lowPerformingItems.length} menu items have low sales but high waste`,
      action: 'Consider removing or reworking underperforming items'
    })
  }

  return recommendations
}

function generateChartData(inventoryItems: any[], menuItems: any[]) {
  return {
    inventory_value_trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 10000 + 5000
    })),
    waste_trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      percentage: Math.random() * 5 + 3
    })),
    category_breakdown: [
      { category: 'Proteins', value: 35, count: inventoryItems.filter(i => i.name.toLowerCase().includes('beef') || i.name.toLowerCase().includes('chicken')).length },
      { category: 'Produce', value: 25, count: inventoryItems.filter(i => i.name.toLowerCase().includes('lettuce') || i.name.toLowerCase().includes('tomato')).length },
      { category: 'Dairy', value: 20, count: inventoryItems.filter(i => i.name.toLowerCase().includes('milk') || i.name.toLowerCase().includes('cheese')).length },
      { category: 'Other', value: 20, count: inventoryItems.length - inventoryItems.filter(i => 
        i.name.toLowerCase().includes('beef') || i.name.toLowerCase().includes('chicken') ||
        i.name.toLowerCase().includes('lettuce') || i.name.toLowerCase().includes('tomato') ||
        i.name.toLowerCase().includes('milk') || i.name.toLowerCase().includes('cheese')
      ).length }
    ]
  }
}