import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SECURITY_HEADERS, validateOrigin, getClientIP } from './lib/security'
import { apiRateLimiter, authRateLimiter, webhookRateLimiter } from './lib/rate-limiter'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  
  // Apply security headers to all responses
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Validate origin for sensitive endpoints
  if (pathname.startsWith('/api/') && !validateOrigin(request)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Apply rate limiting based on endpoint
  let rateLimitResult
  
  if (pathname.startsWith('/api/webhook/')) {
    // Webhook endpoints - more permissive but still limited
    rateLimitResult = await webhookRateLimiter.checkLimit(clientIP)
  } else if (pathname.includes('auth') || pathname.includes('login') || pathname.includes('signup')) {
    // Authentication endpoints - strict rate limiting
    rateLimitResult = await authRateLimiter.checkLimit(clientIP)
  } else if (pathname.startsWith('/api/')) {
    // General API endpoints
    rateLimitResult = await apiRateLimiter.checkLimit(clientIP)
  }
  
  if (rateLimitResult && !rateLimitResult.allowed) {
    const rateLimitResponse = new NextResponse('Too Many Requests', { status: 429 })
    
    // Add rate limit headers
    rateLimitResponse.headers.set('X-RateLimit-Limit', String(rateLimitResult.remaining + 1))
    rateLimitResponse.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    rateLimitResponse.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime))
    
    if (rateLimitResult.retryAfter) {
      rateLimitResponse.headers.set('Retry-After', String(rateLimitResult.retryAfter))
    }
    
    // Apply security headers to rate limit response
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      rateLimitResponse.headers.set(key, value)
    })
    
    return rateLimitResponse
  }
  
  // Add rate limit headers to successful responses
  if (rateLimitResult) {
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}