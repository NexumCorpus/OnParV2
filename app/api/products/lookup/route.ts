import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SECURITY_HEADERS, getClientIP } from '@/lib/security'
import { apiRateLimiter } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode parameter is required' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Validate barcode format (basic validation)
    if (!/^\d{8,14}$/.test(barcode)) {
      return NextResponse.json(
        { error: 'Invalid barcode format' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Look up product in database
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No product found
        return NextResponse.json(
          { 
            error: 'Product not found',
            barcode,
            suggestion: 'You can add this product manually to your inventory'
          },
          { status: 404, headers: SECURITY_HEADERS }
        )
      }
      
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Return product information
    return NextResponse.json(
      {
        success: true,
        product: {
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          category: product.category,
          unit: product.unit,
          suggestedPrice: product.average_price,
          // Suggest reasonable defaults for inventory
          suggestedReorderPoint: product.category === 'Produce' ? 5 : 
                                product.category === 'Dairy' ? 3 :
                                product.category === 'Meat' ? 10 : 8
        }
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (error) {
    console.error('Product lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}