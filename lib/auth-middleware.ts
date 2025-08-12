import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Authentication middleware for API routes
export async function withAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requiredRole?: string
  } = {}
) {
  return async (request: NextRequest) => {
    try {
      // Check authentication if required
      if (options.requireAuth !== false) {
        // Get auth token from request headers
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
          return NextResponse.json(
            { error: 'Invalid authentication token' },
            { status: 401 }
          )
        }

        return handler(request, { user })
      }

      return handler(request, { user: null })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// CORS middleware
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    origin?: string | string[]
    methods?: string[]
    headers?: string[]
    credentials?: boolean
  } = {}
) {
  return async (request: NextRequest) => {
    const {
      origin = '*',
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers = ['Content-Type', 'Authorization'],
      credentials = true
    } = options

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
          'Access-Control-Allow-Methods': methods.join(', '),
          'Access-Control-Allow-Headers': headers.join(', '),
          'Access-Control-Allow-Credentials': credentials.toString(),
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    const response = await handler(request)

    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(', ') : origin)
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', headers.join(', '))
    response.headers.set('Access-Control-Allow-Credentials', credentials.toString())

    return response
  }
}

// Request validation middleware
export function withValidation<T>(
  handler: (request: NextRequest, context: { body: T; user?: any }) => Promise<NextResponse>,
  schema: {
    body?: (data: unknown) => T
    query?: (data: unknown) => any
  }
) {
  return async (request: NextRequest, context: { user?: any } = {}) => {
    try {
      let validatedBody: T | undefined
      let validatedQuery: any

      // Validate request body
      if (schema.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        try {
          const body = await request.json()
          validatedBody = schema.body(body)
        } catch (error) {
          return NextResponse.json(
            { 
              error: 'Invalid request body',
              details: error instanceof Error ? error.message : 'Validation failed'
            },
            { status: 400 }
          )
        }
      }

      // Validate query parameters
      if (schema.query) {
        try {
          const url = new URL(request.url)
          const queryParams = Object.fromEntries(url.searchParams.entries())
          validatedQuery = schema.query(queryParams)
        } catch (error) {
          return NextResponse.json(
            { 
              error: 'Invalid query parameters',
              details: error instanceof Error ? error.message : 'Validation failed'
            },
            { status: 400 }
          )
        }
      }

      return handler(request, { 
        body: validatedBody!,
        query: validatedQuery,
        user: context.user
      })
    } catch (error) {
      console.error('Validation middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Error handling middleware
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API Error:', error)

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Resource not found' },
            { status: 404 }
          )
        }

        if (error.message.includes('unauthorized')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        if (error.message.includes('forbidden')) {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          )
        }

        if (error.message.includes('validation')) {
          return NextResponse.json(
            { error: 'Validation error', details: error.message },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }
}

// Logging middleware
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    logRequests?: boolean
    logResponses?: boolean
    logErrors?: boolean
  } = {}
) {
  const { logRequests = true, logResponses = false, logErrors = true } = options

  return async (request: NextRequest) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()

    if (logRequests) {
      console.log(`[${requestId}] ${request.method} ${request.url}`, {
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString()
      })
    }

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime

      if (logResponses) {
        console.log(`[${requestId}] Response ${response.status}`, {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        })
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      if (logErrors) {
        console.error(`[${requestId}] Error after ${duration}ms:`, error)
      }

      throw error
    }
  }
}

// Compose multiple middlewares
export function compose<T>(...middlewares: Array<(handler: T) => T>) {
  return (handler: T): T => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}