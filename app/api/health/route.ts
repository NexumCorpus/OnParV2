import { NextRequest, NextResponse } from 'next/server'

// Simple health check endpoint for deployment verification
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check basic environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const responseTime = Date.now() - startTime
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime,
      checks: {
        server: {
          status: 'healthy',
          uptime: process.uptime()
        },
        environment: {
          status: hasSupabaseUrl && hasSupabaseKey ? 'configured' : 'partial',
          supabase: hasSupabaseUrl && hasSupabaseKey
        }
      }
    }
    
    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}