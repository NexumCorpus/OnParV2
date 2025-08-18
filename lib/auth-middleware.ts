/**
 * Enterprise Authentication Middleware
 * 
 * Provides middleware functions for protecting routes and checking permissions
 * using the enterprise authentication system.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { EnterpriseAuthService, AuthUser, Permission } from './enterprise-auth'
import { logError, logUserAction } from './error-logging'
import { getClientIP } from './security'

export interface AuthContext {
  user: AuthUser
  tenantId: string
  organizationId?: string
  locationId?: string
}

export interface AuthMiddlewareOptions {
  requiredPermissions?: Permission[]
  requireMFA?: boolean
  allowServiceRole?: boolean
  rateLimitKey?: string
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
): Promise<NextResponse> {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify access token
    const user = await EnterpriseAuthService.verifyAccessToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Check MFA requirement
    if (options.requireMFA && !user.mfaEnabled) {
      return NextResponse.json(
        { error: 'Multi-factor authentication required' },
        { status: 403 }
      )
    }
    
    // Check permissions
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasPermission = EnterpriseAuthService.hasAllPermissions(
        user,
        options.requiredPermissions
      )
      
      if (!hasPermission) {
        logUserAction('permission_denied', {
          requiredPermissions: options.requiredPermissions,
          userPermissions: user.permissions
        }, user.id, user.tenantId)
        
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }
    
    // Create auth context
    const context: AuthContext = {
      user,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      locationId: user.locationId
    }
    
    // Log successful authentication
    logUserAction('api_access', {
      endpoint: request.url,
      method: request.method,
      ip: getClientIP(request)
    }, user.id, user.tenantId)
    
    // Call the handler with auth context
    return await handler(request, context)
    
  } catch (error) {
    logError(error as Error, 'AuthMiddleware.withAuth')
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

/**
 * Permission checking middleware
 */
export function requirePermissions(...permissions: Permission[]) {
  return (options: Omit<AuthMiddlewareOptions, 'requiredPermissions'> = {}) => ({
    ...options,
    requiredPermissions: permissions
  })
}

/**
 * Role-based middleware
 */
export function requireRole(role: string) {
  return async (
    request: NextRequest,
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    return withAuth(request, async (req, context) => {
      if (context.user.role !== role) {
        return NextResponse.json(
          { error: `Role '${role}' required` },
          { status: 403 }
        )
      }
      return handler(req, context)
    })
  }
}

/**
 * MFA requirement middleware
 */
export function requireMFA() {
  return { requireMFA: true }
}

/**
 * Tenant isolation middleware
 */
export async function withTenantIsolation(
  request: NextRequest,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, context) => {
    // Set tenant context for database queries
    // This would typically be done through a database connection context
    req.headers.set('x-tenant-id', context.tenantId)
    
    return handler(req, context)
  })
}

/**
 * Rate limiting middleware with user context
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest, context?: AuthContext) => Promise<NextResponse>,
  options: { 
    limit: number
    window: number // in seconds
    keyGenerator?: (req: NextRequest, context?: AuthContext) => string
  }
): Promise<NextResponse> {
  try {
    // Try to get auth context (optional for rate limiting)
    let context: AuthContext | undefined
    
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const user = await EnterpriseAuthService.verifyAccessToken(token)
      if (user) {
        context = {
          user,
          tenantId: user.tenantId,
          organizationId: user.organizationId,
          locationId: user.locationId
        }
      }
    }
    
    // Generate rate limit key
    const key = options.keyGenerator 
      ? options.keyGenerator(request, context)
      : context?.user.id || getClientIP(request)
    
    // Check rate limit (implementation would use Redis or similar)
    const isAllowed = await checkRateLimit(key, options.limit, options.window)
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    return handler(request, context)
    
  } catch (error) {
    logError(error as Error, 'AuthMiddleware.withRateLimit')
    return NextResponse.json(
      { error: 'Rate limiting failed' },
      { status: 500 }
    )
  }
}

/**
 * Audit logging middleware
 */
export function withAuditLog(
  eventType: string,
  sensitiveFields: string[] = []
) {
  return (
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, context: AuthContext): Promise<NextResponse> => {
      const startTime = Date.now()
      
      try {
        // Execute handler
        const response = await handler(request, context)
        
        // Log successful operation
        const duration = Date.now() - startTime
        
        logUserAction(eventType, {
          method: request.method,
          url: request.url,
          duration,
          status: response.status,
          ip: getClientIP(request)
        }, context.user.id, context.tenantId)
        
        return response
        
      } catch (error) {
        // Log failed operation
        const duration = Date.now() - startTime
        
        logError(error as Error, `AuditLog.${eventType}`, context.user.id, undefined, context.tenantId)
        
        logUserAction(`${eventType}_failed`, {
          method: request.method,
          url: request.url,
          duration,
          error: (error as Error).message,
          ip: getClientIP(request)
        }, context.user.id, context.tenantId)
        
        throw error
      }
    }
  }
}

/**
 * Data access logging middleware
 */
export function withDataAccessLog(
  dataType: string,
  accessType: 'read' | 'write' | 'delete'
) {
  return (
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, context: AuthContext): Promise<NextResponse> => {
      try {
        const response = await handler(request, context)
        
        // Log data access
        logUserAction('data_access', {
          dataType,
          accessType,
          method: request.method,
          url: request.url,
          ip: getClientIP(request)
        }, context.user.id, context.tenantId)
        
        return response
        
      } catch (error) {
        // Log failed data access
        logUserAction('data_access_failed', {
          dataType,
          accessType,
          method: request.method,
          url: request.url,
          error: (error as Error).message,
          ip: getClientIP(request)
        }, context.user.id, context.tenantId)
        
        throw error
      }
    }
  }
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Helper functions

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  // Implementation would use Redis or similar for distributed rate limiting
  // For now, return true (no rate limiting)
  return true
}

/**
 * Utility function to extract user from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    return await EnterpriseAuthService.verifyAccessToken(token)
    
  } catch (error) {
    return null
  }
}

/**
 * Utility function to check if user has permission
 */
export async function checkUserPermission(
  request: NextRequest,
  permission: Permission
): Promise<boolean> {
  const user = await getUserFromRequest(request)
  if (!user) {
    return false
  }
  
  return EnterpriseAuthService.hasPermission(user, permission)
}

/**
 * Create a protected API route handler
 */
export function createProtectedRoute(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return withAuth(request, handler, options)
  }
}

/**
 * Create a public API route handler with optional auth
 */
export function createPublicRoute(
  handler: (req: NextRequest, context?: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Try to get auth context but don't require it
      const user = await getUserFromRequest(request)
      const context = user ? {
        user,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        locationId: user.locationId
      } : undefined
      
      return await handler(request, context)
      
    } catch (error) {
      logError(error as Error, 'PublicRoute')
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}