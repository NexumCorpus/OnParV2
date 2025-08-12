import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database'

// Health check endpoint for monitoring system status
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth()
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )
    
    // System metrics
    const responseTime = Date.now() - startTime
    const memoryUsage = process.memoryUsage()
    
    const health = {
      status: dbHealth.connected && missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime,
      checks: {
        database: {
          status: dbHealth.connected ? 'healthy' : 'unhealthy',
          latency: dbHealth.latency,
          error: dbHealth.error
        },
        environment: {
          status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
          missingVariables: missingEnvVars
        },
        memory: {
          status: memoryUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss
        }
      }
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}