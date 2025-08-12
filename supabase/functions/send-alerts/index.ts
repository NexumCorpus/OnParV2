import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3.2.0'

// Enhanced CORS headers with security considerations
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://onpar.solutions',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
}

// Rate limiting storage (simple in-memory for Edge Functions)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 10 // 10 requests per window

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = `alerts:${identifier}`
  const existing = rateLimitMap.get(key)
  
  if (!existing || now > existing.resetTime) {
    // New window or expired
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }
  
  if (existing.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  existing.count++
  return { allowed: true }
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  // Verify request origin
  const origin = req.headers.get('origin')
  const allowedOrigin = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://onpar.solutions'
  
  if (origin && origin !== allowedOrigin && origin !== 'http://localhost:3000') {
    return new Response(
      JSON.stringify({ error: 'Forbidden origin' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  // Extract client identifier for rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('x-real-ip') || 
                   'unknown'

  // Apply rate limiting
  const rateLimitResult = checkRateLimit(clientIP)
  if (!rateLimitResult.allowed) {
    const response = new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter || 900)
        }, 
        status: 429 
      }
    )
    return response
  }

  try {
    // Verify Content-Type
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const requestBody = await req.json()
    const { type, userId, data } = requestBody

    // Validate required parameters
    if (!type || !userId || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate userId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user ID format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate alert type
    const validTypes = ['low_stock', 'expiry', 'budget_overspend']
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid alert type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Additional data validation
    if (!data || typeof data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid data format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user email and preferences
    const { data: user } = await supabaseClient.auth.admin.getUserById(userId)
    if (!user.user?.email) {
      return new Response(
        JSON.stringify({ error: 'User not found or email missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get user notification preferences
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('email_notifications, restaurant_name')
      .eq('id', userId)
      .single()

    if (!userProfile?.email_notifications) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email notifications disabled for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize restaurant name to prevent XSS
    const restaurantName = (userProfile.restaurant_name || 'Your Restaurant')
      .replace(/[<>]/g, '')
      .substring(0, 100)

    let subject = ''
    let html = ''

    switch (type) {
      case 'low_stock':
        subject = `🚨 Low Stock Alert - ${restaurantName}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Low Stock Alert</h2>
            <p>The following items at <strong>${restaurantName}</strong> are running low and need reordering:</p>
            <ul style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              ${(data.items || []).slice(0, 20).map((item: any) => `
                <li style="margin-bottom: 8px;">
                  <strong>${String(item.name || '').replace(/[<>]/g, '').substring(0, 50)}</strong>: 
                  ${Math.max(0, parseInt(item.quantity) || 0)} 
                  ${String(item.unit || '').replace(/[<>]/g, '').substring(0, 20)} remaining 
                  (reorder at ${parseInt(item.reorder_point) || 0} ${String(item.unit || '').substring(0, 20)})
                </li>
              `).join('')}
            </ul>
            <p style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
              💰 <strong>Potential savings from timely reordering:</strong> $${Math.max(0, parseFloat(data.estimatedSavings) || 0).toFixed(2)}
            </p>
            <p style="margin-top: 20px;">
              <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://onpar.app'}/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </p>
          </div>
        `
        break

      case 'expiry':
        subject = `📅 Items Expiring Soon - ${restaurantName}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">📅 Expiry Alert</h2>
            <p>The following items at <strong>${restaurantName}</strong> expire within 7 days:</p>
            <ul style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c;">
              ${(data.items || []).slice(0, 20).map((item: any) => `
                <li style="margin-bottom: 8px;">
                  <strong>${String(item.name || '').replace(/[<>]/g, '').substring(0, 50)}</strong>: 
                  Expires ${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'Unknown'}
                  ${(parseInt(item.quantity) || 0) > 0 ? `(${parseInt(item.quantity) || 0} ${String(item.unit || '').substring(0, 20)} remaining)` : ''}
                </li>
              `).join('')}
            </ul>
            <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              ⚡ <strong>Action needed:</strong> Use these items soon to avoid waste and maintain food safety standards.
            </p>
            <p style="margin-top: 20px;">
              <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://onpar.app'}/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </p>
          </div>
        `
        break

      case 'budget_overspend':
        subject = `💰 Budget Alert - ${restaurantName}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">💰 Budget Alert</h2>
            <p>You've reached 90% of your monthly budget at <strong>${restaurantName}</strong>:</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="margin: 0 0 10px 0;"><strong>Spent:</strong> $${Math.max(0, parseFloat(data.spent) || 0).toFixed(2)}</p>
              <p style="margin: 0 0 10px 0;"><strong>Budget:</strong> $${Math.max(0, parseFloat(data.budget) || 0).toFixed(2)}</p>
              <p style="margin: 0;"><strong>Remaining:</strong> $${Math.max(0, (parseFloat(data.budget) || 0) - (parseFloat(data.spent) || 0)).toFixed(2)}</p>
            </div>
            <p style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              💡 <strong>Tip:</strong> Review your inventory purchases and focus on high-turnover items to stay within budget.
            </p>
            <p style="margin-top: 20px;">
              <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://onpar.app'}/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </p>
          </div>
        `
        break

      default:
        return new Response(
          JSON.stringify({ error: `Unknown alert type: ${type}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'OnPar Alerts <alerts@onpar.app>',
      to: [user.user.email],
      subject: subject,
      html: html,
    })

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alert sent successfully',
        emailId: emailResult.data?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Alert sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})