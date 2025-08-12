// Enhanced error logging and monitoring for beta testing

export interface ErrorLog {
  timestamp: string
  userId?: string
  userEmail?: string
  error: string
  context: string
  userAgent?: string
  url?: string
  stackTrace?: string
}

export function logError(
  error: Error | string, 
  context: string, 
  userId?: string, 
  userEmail?: string
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    userId,
    userEmail,
    error: error instanceof Error ? error.message : error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    stackTrace: error instanceof Error ? error.stack : undefined,
  }

  // Log to console for development
  console.error('OnPar Error Log:', errorLog)

  // In production, you could send this to a logging service like Sentry
  // or store in Supabase for analysis
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to external logging service
    // sendToLoggingService(errorLog)
  }
}

export function logUserAction(
  action: string,
  details: Record<string, any>,
  userId?: string
): void {
  const actionLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  }

  console.log('OnPar User Action:', actionLog)

  // In production, send to our logging API
  if (process.env.NODE_ENV === 'production') {
    sendActionToAPI(actionLog)
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