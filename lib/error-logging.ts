// Enhanced error logging and monitoring for enterprise authentication

import { supabase } from './supabase'

export interface ErrorLog {
  timestamp: string
  userId?: string
  userEmail?: string
  tenantId?: string
  error: string
  context: string
  userAgent?: string
  url?: string
  stackTrace?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress?: string
}

export interface UserActionLog {
  timestamp: string
  userId?: string
  tenantId?: string
  action: string
  details: Record<string, any>
  url?: string
  ipAddress?: string
  userAgent?: string
}

export function logError(
  error: Error | string, 
  context: string, 
  userId?: string, 
  userEmail?: string,
  tenantId?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    userId,
    userEmail,
    tenantId,
    error: error instanceof Error ? error.message : error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    stackTrace: error instanceof Error ? error.stack : undefined,
    severity
  }

  // Log to console for development
  console.error('OnPar Error Log:', errorLog)

  // Store in database for enterprise audit trail
  if (process.env.NODE_ENV === 'production') {
    storeErrorLog(errorLog).catch(err => 
      console.error('Failed to store error log:', err)
    )
  }
}

export function logUserAction(
  action: string,
  details: Record<string, any>,
  userId?: string,
  tenantId?: string,
  ipAddress?: string
): void {
  const actionLog: UserActionLog = {
    timestamp: new Date().toISOString(),
    userId,
    tenantId,
    action,
    details,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ipAddress,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  }

  console.log('OnPar User Action:', actionLog)

  // Store in database for enterprise audit trail
  if (process.env.NODE_ENV === 'production') {
    storeUserAction(actionLog).catch(err => 
      console.error('Failed to store user action:', err)
    )
  }
}

export function logSecurityEvent(
  eventType: string,
  eventData: Record<string, any>,
  userId?: string,
  tenantId?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ipAddress?: string
): void {
  const securityEvent = {
    user_id: userId,
    tenant_id: tenantId,
    event_type: eventType,
    event_data: eventData,
    severity,
    ip_address: ipAddress,
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    created_at: new Date().toISOString()
  }

  console.log('OnPar Security Event:', securityEvent)

  // Store in security_events table
  if (process.env.NODE_ENV === 'production') {
    storeSecurityEvent(securityEvent).catch(err => 
      console.error('Failed to store security event:', err)
    )
  }
}

async function sendActionToAPI(actionLog: any) {
  try {
    await fetch('/api/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionType: actionLog.action,
        details: actionLog.details,
        pageUrl: actionLog.url,
      }),
    })
  } catch (error) {
    // Silently fail to avoid disrupting user experience
    console.error('Failed to log user action:', error)
  }
}

export function createErrorBoundary() {
  return class ErrorBoundary extends Error {
    constructor(message: string, context: string) {
      super(message)
      this.name = 'OnParError'
      logError(this, context)
    }
  }
}
async 
function storeErrorLog(errorLog: ErrorLog): Promise<void> {
  try {
    await supabase
      .from('security_events')
      .insert({
        user_id: errorLog.userId,
        tenant_id: errorLog.tenantId,
        event_type: 'error',
        event_data: {
          error: errorLog.error,
          context: errorLog.context,
          stackTrace: errorLog.stackTrace,
          url: errorLog.url,
          userAgent: errorLog.userAgent
        },
        severity: errorLog.severity,
        ip_address: errorLog.ipAddress
      })
  } catch (error) {
    console.error('Failed to store error log in database:', error)
  }
}

async function storeUserAction(actionLog: UserActionLog): Promise<void> {
  try {
    await supabase
      .from('security_events')
      .insert({
        user_id: actionLog.userId,
        tenant_id: actionLog.tenantId,
        event_type: 'user_action',
        event_data: {
          action: actionLog.action,
          details: actionLog.details,
          url: actionLog.url,
          userAgent: actionLog.userAgent
        },
        severity: 'low',
        ip_address: actionLog.ipAddress
      })
  } catch (error) {
    console.error('Failed to store user action in database:', error)
  }
}

async function storeSecurityEvent(securityEvent: any): Promise<void> {
  try {
    await supabase
      .from('security_events')
      .insert(securityEvent)
  } catch (error) {
    console.error('Failed to store security event in database:', error)
  }
}

async function sendActionToAPI(actionLog: any) {
  try {
    await fetch('/api/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionType: actionLog.action,
        details: actionLog.details,
        pageUrl: actionLog.url,
      }),
    })
  } catch (error) {
    // Silently fail to avoid disrupting user experience
    console.error('Failed to log user action:', error)
  }
}

export function createErrorBoundary() {
  return class ErrorBoundary extends Error {
    constructor(message: string, context: string) {
      super(message)
      this.name = 'OnParError'
      logError(this, context)
    }
  }
}