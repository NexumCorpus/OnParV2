import { createClient } from '@supabase/supabase-js'

// Graceful fallback for missing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create client with fallback values
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Helper function to get configuration status
export const getSupabaseStatus = () => {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return {
    configured: hasUrl && hasKey,
    url: hasUrl,
    key: hasKey,
    message: hasUrl && hasKey 
      ? 'Supabase is properly configured' 
      : 'Supabase environment variables are missing'
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          restaurant_name: string | null
          monthly_budget: number | null
          premium_subscription: boolean
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          restaurant_name?: string | null
          monthly_budget?: number | null
          premium_subscription?: boolean
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          restaurant_name?: string | null
          monthly_budget?: number | null
          premium_subscription?: boolean
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number
          unit: string
          expiry_date: string | null
          reorder_point: number
          price_per_unit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity: number
          unit: string
          expiry_date?: string | null
          reorder_point: number
          price_per_unit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          quantity?: number
          unit?: string
          expiry_date?: string | null
          reorder_point?: number
          price_per_unit?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          user_id: string
          name: string
          sales_percentage: number
          waste_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sales_percentage: number
          waste_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sales_percentage?: number
          waste_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string
          serving_size: number
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          difficulty_level: string
          instructions: string | null
          cost_per_serving: number
          selling_price: number
          profit_margin: number
          popularity_score: number
          waste_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: string
          serving_size: number
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          difficulty_level: string
          instructions?: string | null
          cost_per_serving: number
          selling_price: number
          profit_margin: number
          popularity_score: number
          waste_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string
          serving_size?: number
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          difficulty_level?: string
          instructions?: string | null
          cost_per_serving?: number
          selling_price?: number
          profit_margin?: number
          popularity_score?: number
          waste_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          inventory_item_id: string
          quantity_needed: number
          unit: string
          cost_per_unit: number
          total_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          inventory_item_id: string
          quantity_needed: number
          unit: string
          cost_per_unit: number
          total_cost: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          inventory_item_id?: string
          quantity_needed?: number
          unit?: string
          cost_per_unit?: number
          total_cost?: number
          created_at?: string
        }
      }
    }
  }
}