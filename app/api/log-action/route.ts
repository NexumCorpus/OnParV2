import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getCurrentUser } from '../../../lib/auth'
import { SECURITY_HEADERS, sanitizeString, getClientIP } from '../../../lib/security'
import { apiRateLimiter } from '../../../lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (more permissive for action logging)
    const clientIP = getClientIP(request)
    const rateLimitResult = await apiRateLimiter.checkLimit(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': String(rateLimitResult.retryAfter || 900)
          }
        }
      )
    }

    // Only log actions in production to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { success: true, message: 'Action logging disabled in development' },
        { headers: SECURITY_HEADERS }
      )
    }

    // Verify Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { actionType, details, pageUrl } = await request.json()

    // Validate required fields
    if (!actionType) {
      return NextResponse.json(
        { error: 'Action type is required' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Get current user (optional - actions can be anonymous)
    const { user } = await getCurrentUser()
    
    // Sanitize inputs
    const sanitizedData = {
      user_id: user?.id || null,
      action_type: sanitizeString(actionType, 100),
      details: details && typeof details === 'object' ? details : {},
      page_url: pageUrl ? sanitizeString(pageUrl, 500) : null,
    }

    // Insert action into database
    const { error } = await supabase
      .from('user_actions')
      .insert([sanitizedData])

    if (error) {
      console.error('Error logging user action:', error)
      return NextResponse.json(
        { error: 'Failed to log action' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Action logged successfully' },
      { headers: SECURITY_HEADERS }
    )
  } catch (error) {
    console.error('Action logging error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}