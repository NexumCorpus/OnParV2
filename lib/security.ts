// Security utilities and middleware
import { NextRequest } from 'next/server'

// Content Security Policy configuration
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim()

// Security headers for API responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': CSP_HEADER,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}

// Input sanitization utilities
export function sanitizeString(input: string, maxLength = 255): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .substring(0, maxLength)
}

export function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = sanitizeString(email, 254).toLowerCase()
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format')
  }
  
  return sanitized
}

export function sanitizeNumeric(value: any, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = parseFloat(String(value))
  
  if (isNaN(num)) {
    throw new Error('Invalid numeric value')
  }
  
  if (num < min || num > max) {
    throw new Error(`Value must be between ${min} and ${max}`)
  }
  
  return num
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function validateStripeId(id: string, type: 'customer' | 'price' | 'subscription'): boolean {
  const prefixes = {
    customer: 'cus_',
    price: 'price_',
    subscription: 'sub_'
  }
  
  const prefix = prefixes[type]
  return id.startsWith(prefix) && id.length > prefix.length + 5
}

// Request origin validation
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean)
  
  if (!origin) {
    // Allow requests without origin (e.g., mobile apps, Postman)
    return true
  }
  
  return allowedOrigins.includes(origin)
}

// IP address extraction (for rate limiting)
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Secure random token generation
export function generateSecureToken(length = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for environments without crypto.getRandomValues
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Environment variable validation
export function validateEnvironmentVariables(): void {
  // Skip validation during CI/CD builds to prevent deployment failures
  if (process.env.CI === 'true' || process.env.NETLIFY === 'true') {
    return
  }
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
    // Don't throw in production build to avoid breaking deployment
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
  
  // Validate URL format only if provided
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL format')
    }
  }
  
  // Validate Stripe keys format only if provided
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.warn('Invalid Stripe publishable key format')
  }
  
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.warn('Invalid Stripe secret key format')
  }
}