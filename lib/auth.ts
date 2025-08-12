import { supabase, isSupabaseConfigured } from './supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { logError, logUserAction } from './error-logging'

export async function signInWithEmailPassword(email: string, password: string) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up environment variables.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      logError(error.message, 'signInWithEmailPassword', undefined, email)
    } else if (data.user) {
      logUserAction('user_signed_in', { email }, data.user.id)
    }
    
    return { data, error }
  } catch (error) {
    logError(error as Error, 'signInWithEmailPassword', undefined, email)
    return { data: null, error }
  }
}

export async function signUpWithEmailPassword(email: string, password: string) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up environment variables.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    
    if (error) {
      logError(error.message, 'signUpWithEmailPassword', undefined, email)
    } else if (data.user) {
      logUserAction('user_signed_up', { email }, data.user.id)
    }
    
    return { data, error }
  } catch (error) {
    logError(error as Error, 'signUpWithEmailPassword', undefined, email)
    return { data: null, error }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  try {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error('Supabase not configured') }
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, error }
  }
}

export async function createUserProfile(userId: string, email: string, restaurantName?: string) {
  try {
    logUserAction('creating_user_profile', { email, restaurantName }, userId)
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          restaurant_name: restaurantName,
          premium_subscription: false,
        }
      ])
      .select()
      .single()
  
    if (error) {
      logError(error.message, 'createUserProfile', userId, email)
    }
  
    return { data, error }
  } catch (error) {
    logError(error as Error, 'createUserProfile', userId, email)
    return { data: null, error }
  }
}

export async function updateUserProfile(userId: string, updates: any): Promise<{ data: any; error: PostgrestError | null }> {
  try {
    // Input validation
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' } as PostgrestError }
    }

    // Validate userId format (should be a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return { data: null, error: { message: 'Invalid user ID format' } as PostgrestError }
    }

    // Sanitize and validate updates object
    const allowedFields = [
      'restaurant_name', 'monthly_budget', 'premium_subscription',
      'default_reorder_multiplier', 'low_stock_threshold', 'expiry_warning_days',
      'budget_warning_threshold', 'email_notifications', 'fcm_token', 'stripe_customer_id'
    ]
    
    const sanitizedUpdates: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value
      }
    }

    // Additional validation for specific fields
    if (sanitizedUpdates.monthly_budget !== undefined) {
      const budget = parseFloat(sanitizedUpdates.monthly_budget)
      if (isNaN(budget) || budget < 0 || budget > 1000000) {
        return { data: null, error: { message: 'Invalid monthly budget value' } as PostgrestError }
      }
      sanitizedUpdates.monthly_budget = budget
    }

    if (sanitizedUpdates.restaurant_name !== undefined) {
      const name = String(sanitizedUpdates.restaurant_name).trim()
      if (name.length > 100) {
        return { data: null, error: { message: 'Restaurant name too long' } as PostgrestError }
      }
      sanitizedUpdates.restaurant_name = name
    }

    const { data, error } = await supabase
      .from('users')
      .update(sanitizedUpdates)
      .eq('id', userId)
      .select()
      .single()
  
    return { data, error }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { data: null, error: { message: (error as Error).message || 'Unknown error occurred' } as PostgrestError }
  }
}