'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function saveOnboardingStep1(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const restaurantName = formData.get('restaurant_name') as string
  const monthlyBudget = parseFloat(formData.get('monthly_budget') as string) || 0
  const restaurantType = formData.get('restaurant_type') as string

  const { error } = await supabase
    .from('users')
    .update({
      restaurant_name: restaurantName,
      monthly_budget: monthlyBudget,
      settings: supabase.rpc ? undefined : undefined,
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  // Save restaurant type to settings JSONB via raw update
  const { error: settingsError } = await supabase.rpc('update_user_settings', {
    p_user_id: user.id,
    p_settings: { restaurant_type: restaurantType },
  }).catch(() => ({ error: null })) as { error: { message: string } | null }

  // If RPC doesn't exist, try direct settings merge
  if (settingsError) {
    await supabase
      .from('users')
      .update({
        settings: {
          restaurant_type: restaurantType,
          onboarding_completed: false,
        },
      })
      .eq('id', user.id)
  }

  return { success: true }
}

export async function completeOnboarding(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch current settings and merge
  const { data: userData } = await supabase
    .from('users')
    .select('settings')
    .eq('id', user.id)
    .single()

  const currentSettings = (userData?.settings as Record<string, unknown>) ?? {}

  const { error } = await supabase
    .from('users')
    .update({
      settings: { ...currentSettings, onboarding_completed: true },
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  redirect('/dashboard')
}
