import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { logError, logUserAction } from '@/lib/error-logging'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's notification preferences
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Generate notifications based on current data
    const { data: inventoryItems } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('user_id', user.id)

    const notifications = generateNotifications(inventoryItems || [], menuItems || [], profile)

    logUserAction('notifications_fetched', { count: notifications.length }, user.id)
    return NextResponse.json({ data: notifications })
  } catch (error) {
    logError(error as Error, 'api_notifications_get')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationId } = body

    if (action === 'mark_read' && notificationId) {
      logUserAction('notification_marked_read', { notification_id: notificationId }, user.id)
      return NextResponse.json({ success: true })
    }

    if (action === 'dismiss' && notificationId) {
      logUserAction('notification_dismissed', { notification_id: notificationId }, user.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logError(error as Error, 'api_notifications_post')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateNotifications(inventoryItems: any[], menuItems: any[], userProfile: any) {
  const notifications = []
  const now = new Date()

  // Low stock notifications
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorder_point)
  lowStockItems.forEach(item => {
    notifications.push({
      id: `low_stock_${item.id}`,
      type: 'low_stock',
      priority: item.quantity === 0 ? 'critical' : 'high',
      title: `Low Stock Alert: ${item.name}`,
      message: `Only ${item.quantity} ${item.unit} remaining. Reorder point: ${item.reorder_point}`,
      read: false,
      dismissed: false,
      created_at: now.toISOString(),
      action_url: '/dashboard?tab=inventory',
      action_label: 'Reorder Now'
    })
  })

  // Expiring items notifications
  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiry_date) return false
    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  })

  expiringItems.forEach(item => {
    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    notifications.push({
      id: `expiring_${item.id}`,
      type: 'expiring',
      priority: daysUntilExpiry <= 2 ? 'critical' : 'high',
      title: `Expiring Soon: ${item.name}`,
      message: `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
      read: false,
      dismissed: false,
      created_at: now.toISOString(),
      expires_at: item.expiry_date,
      action_url: '/dashboard?tab=inventory',
      action_label: 'Use First'
    })
  })

  // Budget notifications
  if (userProfile?.monthly_budget) {
    const currentSpend = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    const budgetPercentage = (currentSpend / userProfile.monthly_budget) * 100

    if (budgetPercentage >= 80) {
      notifications.push({
        id: 'budget_warning',
        type: 'budget',
        priority: budgetPercentage >= 95 ? 'critical' : 'high',
        title: 'Budget Alert',
        message: `You've used ${budgetPercentage.toFixed(1)}% of your monthly budget ($${currentSpend.toFixed(2)} of $${userProfile.monthly_budget})`,
        read: false,
        dismissed: false,
        created_at: now.toISOString(),
        action_url: '/dashboard?tab=analytics',
        action_label: 'View Budget'
      })
    }
  }

  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}