import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from './rate-limiter'

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .slice(0, 1000) // Limit length
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// API security middleware
export async function secureApiRoute(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Security headers
    const response = await handler(request)
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  } catch (error) {
    console.error('Security middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Validate request body
export function validateRequestBody(body: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!body || typeof body !== 'object') {
    errors.push('Invalid request body')
    return { valid: false, errors }
  }
  
  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Content Security Policy
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com;
`.replace(/\s+/g, ' ').trim()