// Environment variable validation and defaults for deployment
export const env = {
  // Supabase (required for core functionality)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key',
  
  // Stripe (optional for payments)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  
  // Email service (optional)
  RESEND_API_KEY: process.env.RESEND_API_KEY || 're_placeholder',
  
  // App configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Feature flags for graceful degradation
  ENABLE_STRIPE: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder',
  ENABLE_EMAIL: process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder',
  ENABLE_SUPABASE: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co',
}

// Validation function for critical environment variables
export function validateEnvironment() {
  const errors: string[] = []
  
  // Only validate in production
  if (env.NODE_ENV === 'production') {
    if (!env.ENABLE_SUPABASE) {
      console.warn('⚠️  Supabase not configured - database features will be limited')
    }
    
    if (!env.ENABLE_STRIPE) {
      console.warn('⚠️  Stripe not configured - payment features will be disabled')
    }
    
    if (!env.ENABLE_EMAIL) {
      console.warn('⚠️  Email service not configured - notifications will be disabled')
    }
  }
  
  return errors
}

// Initialize environment validation
if (typeof window === 'undefined') {
  validateEnvironment()
}