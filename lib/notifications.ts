// Notification system for OnPar application
import { supabase } from './supabase'
import { updateUserProfile } from './auth'

export interface NotificationData {
  type: 'low_stock' | 'expiry' | 'budget_overspend'
  userId: string
  data: any
}

export async function sendAlert(notification: NotificationData): Promise<{ success: boolean; error?: string }> {
  try {
    // Call the Supabase Edge Function for sending alerts
    const { data, error } = await supabase.functions.invoke('send-alerts', {
      body: notification
    })

    if (error) {
      console.error('Error sending alert:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error invoking alert function:', error)
    return { success: false, error: 'Failed to send alert' }
  }
}

export async function enablePushNotifications(userId: string): Promise<{ success: boolean; token?: string }> {
  try {
    if (typeof window === 'undefined') {
      return { success: false }
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return { success: false }
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { success: false }
    }

    // Generate a unique push notification token using Supabase real-time
    const pushToken = `supabase_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store the push token in the user's profile and set up real-time subscription
    const { error } = await supabase
      .from('users')
      .update({ fcm_token: pushToken })
      .eq('id', userId)

    if (error) {
      console.error('Error saving push token:', error)
      return { success: false }
    }

    // Set up Supabase real-time notifications
    setupSupabaseNotifications(userId, pushToken)
    
    return { success: true, token: pushToken }
  } catch (error) {
    console.error('Error enabling push notifications:', error)
    return { success: false }
  }
}

function setupSupabaseNotifications(userId: string, token: string) {
  // Set up Supabase real-time channel for notifications
  const channel = supabase.channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const notification = payload.new
      showBrowserNotification(notification.title, notification.message, notification.type)
    })
    .on('broadcast', { event: 'alert' }, (payload) => {
      const { title, message, type } = payload.payload
      showBrowserNotification(title, message, type)
    })
    .subscribe()

  // Store channel reference for cleanup
  if (typeof window !== 'undefined') {
    (window as any).onparNotificationChannel = channel
  }
}

function showBrowserNotification(title: string, body: string, type?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const icon = type === 'low_stock' ? '📦' : 
                 type === 'expiry' ? '📅' : 
                 type === 'budget_overspend' ? '💰' : '🔔'
      
    new Notification(`${icon} ${title}`, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'onpar-notification',
      requireInteraction: type === 'budget_overspend', // Budget alerts require interaction
      silent: false,
      timestamp: Date.now()
    })
  }
}

export async function sendPushNotification(userId: string, title: string, message: string, type?: string) {
  try {
    // Send real-time notification via Supabase broadcast
    const channel = supabase.channel(`notifications:${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'alert',
      payload: { title, message, type }
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false }
  }
}

export async function sendRealtimeAlert(userId: string, alertType: string, data: any) {
  try {
    // Send alert through Supabase Edge Function
    const alertData: NotificationData = {
      type: alertType as 'low_stock' | 'expiry' | 'budget_overspend',
      userId,
      data
    }
    
    const result = await sendAlert(alertData)
    
    // Also send real-time notification for immediate feedback
    if (result.success) {
      const title = alertType === 'low_stock' ? 'Low Stock Alert' :
                   alertType === 'expiry' ? 'Items Expiring Soon' :
                   alertType === 'budget_overspend' ? 'Budget Alert' : 'OnPar Alert'
      
      const message = alertType === 'low_stock' ? `${data.items?.length || 0} items need reordering` :
                     alertType === 'expiry' ? `${data.items?.length || 0} items expire within 7 days` :
                     alertType === 'budget_overspend' ? `You've reached 90% of your monthly budget` :
                     'Check your dashboard for details'
      
      await sendPushNotification(userId, title, message, alertType)
    }
    
    return result
  } catch (error) {
    console.error('Error sending realtime alert:', error)
    return { success: false, error: 'Failed to send alert' }
  }
}
export function checkForAlerts(inventoryItems: any[], menuItems: any[], userSettings: any) {
  const alerts = []

  // Check for low stock items
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity < (item.reorder_point * (userSettings.low_stock_threshold || 0.8))
  )

  if (lowStockItems.length > 0) {
    alerts.push({
      type: 'low_stock',
      items: lowStockItems,
      estimatedSavings: lowStockItems.reduce((total, item) => 
        total + (item.quantity * item.price_per_unit * 0.1), 0
      )
    })
  }

  // Check for expiring items
  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiry_date) return false
    const daysFromNow = new Date()
    daysFromNow.setDate(daysFromNow.getDate() + (userSettings.expiry_warning_days || 7))
    return new Date(item.expiry_date) <= daysFromNow
  })

  if (expiringItems.length > 0) {
    alerts.push({
      type: 'expiry',
      items: expiringItems
    })
  }

  return alerts
}