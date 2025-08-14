import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getCurrentUser } from '../../../lib/auth'
import { SECURITY_HEADERS, sanitizeString, getClientIP } from '../../../lib/security'
import { apiRateLimiter } from '../../../lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
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

    // Verify Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { feedbackType, message, pageUrl } = await request.json()

    // Validate required fields
    if (!feedbackType || !message) {
      return NextResponse.json(
        { error: 'Feedback type and message are required' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Validate feedback type
    const validTypes = ['bug', 'feature_request', 'general']
    if (!validTypes.includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Get current user (optional - feedback can be anonymous)
    const { user } = await getCurrentUser()
    
    // Sanitize inputs
    const sanitizedData = {
      user_id: user?.id || null,
      email: user?.email || null,
      feedback_type: sanitizeString(feedbackType, 50),
      message: sanitizeString(message, 2000),
      page_url: pageUrl ? sanitizeString(pageUrl, 500) : null,
      user_agent: request.headers.get('user-agent')?.substring(0, 500) || null,
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert([sanitizedData])
      .select()
      .single()

    if (error) {
      console.error('Error saving feedback:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback submitted successfully',
        id: data.id 
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}