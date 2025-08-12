import { NextRequest, NextResponse } from 'next/server'

// Performance monitoring endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, userAgent, url, timestamp } = body
    
    // In a real application, you would send this to a monitoring service
    // like DataDog, New Relic, Sentry, etc.
    
    console.log('Performance Issue Reported:', {
      metric: {
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        metadata: metric.metadata
      },
      context: {
        userAgent,
        url,
        timestamp,
        environment: process.env.NODE_ENV
      }
    })
    
    // Simulate sending to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external monitoring service
      // await sendToMonitoringService({
      //   metric,
      //   userAgent,
      //   url,
      //   timestamp
      // })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Performance issue reported successfully'
    })
  } catch (error) {
    console.error('Failed to report performance issue:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to report performance issue'
    }, { status: 500 })
  }
}

// Get performance metrics summary
export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch this from your monitoring service
    // This is a mock response showing what performance data might look like
    
    const mockMetrics = {
      summary: {
        averagePageLoad: 1250, // ms
        averageApiResponse: 180, // ms
        errorRate: 0.02, // 2%
        throughput: 150, // requests per minute
        uptime: 99.9 // percentage
      },
      trends: {
        pageLoadTrend: 'improving', // improving, stable, degrading
        apiResponseTrend: 'stable',
        errorRateTrend: 'improving'
      },
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: 'API response time increased by 15% in the last hour',
          timestamp: new Date().toISOString(),
          resolved: false
        }
      ],
      topSlowPages: [
        { path: '/dashboard', averageLoadTime: 1800 },
        { path: '/inventory', averageLoadTime: 1600 },
        { path: '/reports', averageLoadTime: 1400 }
      ],
      topSlowApis: [
        { endpoint: '/api/reports', averageResponseTime: 450 },
        { endpoint: '/api/inventory', averageResponseTime: 280 },
        { endpoint: '/api/menu', averageResponseTime: 220 }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: mockMetrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch performance metrics'
    }, { status: 500 })
  }
}