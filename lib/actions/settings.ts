'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
} from '@/lib/services/stripe'
import { APP_URL } from '@/lib/config'
import { logger } from '@/lib/utils/logger'
import type { ActionResult } from '@/types'

async function getAuthenticatedUser(): Promise<{
  id: string
  email: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return { id: user.id, email: user.email ?? '' }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()

    const restaurantName = formData.get('restaurant_name') as string
    const monthlyBudget = formData.get('monthly_budget')
      ? Number(formData.get('monthly_budget'))
      : null

    if (!restaurantName || restaurantName.trim().length === 0) {
      return { success: false, error: 'Restaurant name is required' }
    }

    if (restaurantName.trim().length > 200) {
      return { success: false, error: 'Restaurant name must be under 200 characters' }
    }

    if (monthlyBudget !== null && (isNaN(monthlyBudget) || monthlyBudget < 0)) {
      return { success: false, error: 'Monthly budget must be a positive number' }
    }

    const { error } = await supabase
      .from('users')
      .update({
        restaurant_name: restaurantName.trim(),
        monthly_budget: monthlyBudget,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      logger.error({ error, userId: user.id }, 'Failed to update profile')
      return { success: false, error: 'Failed to update profile' }
    }

    return { success: true }
  } catch (err) {
    logger.error({ err }, 'Failed to update profile')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateNotificationSettings(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()

    const emailNotifications = formData.get('email_notifications') === 'true'
    const lowStockThreshold = Number(formData.get('low_stock_threshold') ?? 0.8)
    const expiryWarningDays = Number(formData.get('expiry_warning_days') ?? 7)
    const budgetWarningThreshold = Number(
      formData.get('budget_warning_threshold') ?? 90
    )
    const reorderMultiplier = Number(formData.get('reorder_multiplier') ?? 2.0)

    if (lowStockThreshold < 0 || lowStockThreshold > 1) {
      return { success: false, error: 'Low stock threshold must be between 0 and 1' }
    }
    if (expiryWarningDays < 1 || expiryWarningDays > 90) {
      return { success: false, error: 'Expiry warning days must be between 1 and 90' }
    }
    if (budgetWarningThreshold < 1 || budgetWarningThreshold > 100) {
      return { success: false, error: 'Budget warning must be between 1% and 100%' }
    }
    if (reorderMultiplier < 0.1 || reorderMultiplier > 10) {
      return { success: false, error: 'Reorder multiplier must be between 0.1 and 10' }
    }

    // Get current settings to preserve other fields
    const { data: userData } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.id)
      .single()

    const currentSettings =
      (userData?.settings as Record<string, unknown>) ?? {}

    const newSettings = {
      ...currentSettings,
      email_notifications: emailNotifications,
      low_stock_threshold: lowStockThreshold,
      expiry_warning_days: expiryWarningDays,
      budget_warning_threshold: budgetWarningThreshold,
      reorder_multiplier: reorderMultiplier,
    }

    const { error } = await supabase
      .from('users')
      .update({
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      logger.error({ error, userId: user.id }, 'Failed to update notification settings')
      return { success: false, error: 'Failed to save notification settings' }
    }

    return { success: true }
  } catch (err) {
    logger.error({ err }, 'Failed to update notification settings')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateAvatar(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()

    const file = formData.get('avatar') as File | null
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File must be JPEG, PNG, or WebP' }
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: 'File must be under 2MB' }
    }

    // Determine extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const ext = extMap[file.type] ?? 'jpg'
    const filePath = `${user.id}/avatar.${ext}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      logger.error({ uploadError, userId: user.id }, 'Failed to upload avatar')
      return { success: false, error: 'Failed to upload avatar' }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      logger.error({ updateError, userId: user.id }, 'Failed to update avatar URL')
      return { success: false, error: 'Failed to update avatar' }
    }

    return { success: true, data: { avatarUrl: publicUrl } }
  } catch (err) {
    logger.error({ err }, 'Failed to update avatar')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function createCheckout(
  priceId: string
): Promise<{ url: string } | { error: string }> {
  try {
    const user = await getAuthenticatedUser()

    const result = await createCheckoutSession({
      userId: user.id,
      priceId,
      successUrl: `${APP_URL}/settings?tab=billing&success=true`,
      cancelUrl: `${APP_URL}/pricing`,
    })

    return { url: result.url }
  } catch (err) {
    logger.error({ err }, 'Failed to create checkout session')
    return { error: 'Failed to create checkout session' }
  }
}

export async function createPortal(): Promise<
  { url: string } | { error: string }
> {
  try {
    const user = await getAuthenticatedUser()
    const status = await getSubscriptionStatus(user.id)

    if (!status.customerId) {
      return { error: 'No billing account found' }
    }

    const result = await createPortalSession({
      customerId: status.customerId,
      returnUrl: `${APP_URL}/settings?tab=billing`,
    })

    return { url: result.url }
  } catch (err) {
    logger.error({ err }, 'Failed to create portal session')
    return { error: 'Failed to create portal session' }
  }
}

export async function exportAllData(): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()

    // Query all user data in parallel
    const [
      inventoryResult,
      recipesResult,
      recipeIngredientsResult,
      menuItemsResult,
      suppliersResult,
      wasteEventsResult,
      insightsResult,
      snapshotsResult,
      profileResult,
    ] = await Promise.all([
      supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null),
      supabase.from('recipes').select('*').eq('user_id', user.id),
      supabase
        .from('recipe_ingredients')
        .select('*, recipes!inner(user_id)')
        .eq('recipes.user_id', user.id),
      supabase.from('menu_items').select('*').eq('user_id', user.id),
      supabase.from('suppliers').select('*').eq('user_id', user.id),
      supabase.from('waste_events').select('*').eq('user_id', user.id),
      supabase.from('ai_insights').select('*').eq('user_id', user.id),
      supabase
        .from('waste_analysis_snapshots')
        .select('*')
        .eq('user_id', user.id),
      supabase.from('users').select('*').eq('id', user.id).single(),
    ])

    // Dynamic import of JSZip (server-only)
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Helper to convert array of objects to CSV
    function toCSV(data: Record<string, unknown>[]): string {
      if (data.length === 0) return ''
      const headers = Object.keys(data[0])
      const rows = data.map((row) =>
        headers
          .map((h) => {
            const val = row[h]
            const str = val === null || val === undefined ? '' : String(val)
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str
          })
          .join(',')
      )
      return [headers.join(','), ...rows].join('\n')
    }

    // Add CSV files
    const dataSets: Array<{ name: string; data: Record<string, unknown>[] | null }> = [
      { name: 'inventory_items', data: inventoryResult.data as Record<string, unknown>[] | null },
      { name: 'recipes', data: recipesResult.data as Record<string, unknown>[] | null },
      { name: 'recipe_ingredients', data: recipeIngredientsResult.data as Record<string, unknown>[] | null },
      { name: 'menu_items', data: menuItemsResult.data as Record<string, unknown>[] | null },
      { name: 'suppliers', data: suppliersResult.data as Record<string, unknown>[] | null },
      { name: 'waste_events', data: wasteEventsResult.data as Record<string, unknown>[] | null },
      { name: 'ai_insights', data: insightsResult.data as Record<string, unknown>[] | null },
      { name: 'waste_analysis_snapshots', data: snapshotsResult.data as Record<string, unknown>[] | null },
    ]

    for (const { name, data } of dataSets) {
      if (data && data.length > 0) {
        zip.file(`${name}.csv`, toCSV(data))
      }
    }

    // Add JSON profile
    zip.file(
      'profile.json',
      JSON.stringify(profileResult.data, null, 2)
    )

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Upload to Supabase Storage (exports bucket)
    const fileName = `${user.id}/export-${Date.now()}.zip`
    const adminClient = createAdminClient()

    const { error: uploadError } = await adminClient.storage
      .from('exports')
      .upload(fileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true,
      })

    if (uploadError) {
      logger.error({ uploadError, userId: user.id }, 'Failed to upload export')
      return { success: false, error: 'Failed to create data export' }
    }

    // Create signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } =
      await adminClient.storage
        .from('exports')
        .createSignedUrl(fileName, 3600)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logger.error({ signedUrlError }, 'Failed to create signed URL')
      return { success: false, error: 'Failed to create download link' }
    }

    return { success: true, data: { downloadUrl: signedUrlData.signedUrl } }
  } catch (err) {
    logger.error({ err }, 'Failed to export data')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteAccount(
  confirmEmail: string
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()

    // Verify email matches
    if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      return { success: false, error: 'Email does not match your account email' }
    }

    const adminClient = createAdminClient()

    // Cancel Stripe subscription if exists
    const status = await getSubscriptionStatus(user.id)
    if (status.customerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default
        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)

        // Cancel all subscriptions
        const subscriptions = await stripeClient.subscriptions.list({
          customer: status.customerId,
        })
        for (const sub of subscriptions.data) {
          await stripeClient.subscriptions.cancel(sub.id)
        }

        // Delete Stripe customer
        await stripeClient.customers.del(status.customerId)
      } catch (stripeErr) {
        logger.error({ stripeErr }, 'Error cleaning up Stripe data')
      }

      // Clean up local stripe records
      await adminClient
        .from('stripe_subscriptions')
        .delete()
        .eq('stripe_customer_id', status.customerId)

      await adminClient
        .from('stripe_customers')
        .delete()
        .eq('user_id', user.id)
    }

    // Delete uploaded files from storage
    try {
      const { data: avatarFiles } = await adminClient.storage
        .from('avatars')
        .list(user.id)

      if (avatarFiles && avatarFiles.length > 0) {
        const filesToRemove = avatarFiles.map((f) => `${user.id}/${f.name}`)
        await adminClient.storage.from('avatars').remove(filesToRemove)
      }
    } catch (storageErr) {
      logger.error({ storageErr }, 'Error cleaning up storage files')
    }

    // Delete user data (CASCADE handles most via FK)
    // Explicit deletes for tables without FK cascade
    await adminClient.from('ai_insights').delete().eq('user_id', user.id)
    await adminClient
      .from('waste_analysis_snapshots')
      .delete()
      .eq('user_id', user.id)
    await adminClient.from('waste_events').delete().eq('user_id', user.id)
    await adminClient.from('menu_items').delete().eq('user_id', user.id)
    await adminClient.from('recipes').delete().eq('user_id', user.id)
    await adminClient.from('inventory_items').delete().eq('user_id', user.id)
    await adminClient.from('suppliers').delete().eq('user_id', user.id)
    await adminClient.from('users').delete().eq('id', user.id)

    // Delete auth user
    await adminClient.auth.admin.deleteUser(user.id)

    return { success: true }
  } catch (err) {
    logger.error({ err }, 'Failed to delete account')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
