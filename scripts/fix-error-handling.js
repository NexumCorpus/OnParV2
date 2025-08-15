#!/usr/bin/env node

/**
 * OnPar Error Handling Enhancement
 * Adds comprehensive error handling throughout the codebase
 */

const fs = require('fs')
const path = require('path')

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function header(title) {
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`)
}

// Error handling patterns to add
const errorHandlingPatterns = {
  // Async function without try-catch
  asyncWithoutTryCatch: {
    pattern: /(async\s+function\s+\w+\([^)]*\)\s*{[^}]*await[^}]*})/g,
    replacement: (match) => {
      if (match.includes('try') && match.includes('catch')) {
        return match // Already has error handling
      }
      
      const functionBody = match.replace(/(async\s+function\s+\w+\([^)]*\)\s*{)/, '$1\n  try {')
      return functionBody.replace(/}$/, '\n  } catch (error) {\n    console.error(\\'Function error:\\', error)\n    throw error\n  }\n}')
    }
  },
  
  // API calls without error handling
  fetchWithoutErrorHandling: {
    pattern: /(await\s+fetch\([^)]+\)(?!\s*\.catch))/g,
    replacement: (match) => {
      return `${match}.catch(error => { console.error('Fetch error:', error); throw error; })`
    }
  },
  
  // Supabase calls without error handling
  supabaseWithoutErrorHandling: {
    pattern: /(await\s+supabase\.[^.]+\.[^.]+\([^)]*\)(?!\s*\.catch)(?![^;]*if\s*\(\s*error\s*\)))/g,
    replacement: (match) => {
      return `${match}\n    if (error) {\n      console.error('Supabase error:', error)\n      throw new Error(error.message || 'Database operation failed')\n    }`
    }
  },
  
  // JSON.parse without error handling
  jsonParseWithoutTryCatch: {
    pattern: /(JSON\.parse\([^)]+\))/g,
    replacement: (match) => {
      return `(() => { try { return ${match} } catch (error) { console.error('JSON parse error:', error); return null; } })()`
    }
  },
  
  // localStorage without error handling
  localStorageWithoutTryCatch: {
    pattern: /(localStorage\.(getItem|setItem|removeItem)\([^)]+\))/g,
    replacement: (match) => {
      return `(() => { try { return ${match} } catch (error) { console.error('LocalStorage error:', error); return null; } })()`
    }
  }
}

// Global error handling utilities to add
const errorHandlingUtilities = {
  'lib/error-handler.ts': `/**
 * Comprehensive Error Handling Utilities
 * Provides centralized error handling for the OnPar application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(\`\${resource} not found\`, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
    this.name = 'RateLimitError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 503)
    this.name = 'NetworkError'
  }
}

// Error logging utility
export interface ErrorLogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info'
  message: string
  error?: Error
  context?: Record<string, unknown>
  userId?: string
  sessionId?: string
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = []
  private maxLogs = 1000

  log(entry: Omit<ErrorLogEntry, 'timestamp'>) {
    const logEntry: ErrorLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    }
    
    this.logs.push(logEntry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry)
    }
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(logEntry).catch(console.error)
    }
  }
  
  private async sendToMonitoring(entry: ErrorLogEntry) {
    try {
      // Send to monitoring service (implement based on your monitoring solution)
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send error to monitoring:', error)
    }
  }
  
  getLogs(level?: ErrorLogEntry['level']): ErrorLogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }
  
  clearLogs() {
    this.logs = []
  }
}

export const errorLogger = new ErrorLogger()

// Error handling decorators and utilities
export function handleAsyncErrors<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const contextMessage = context ? \`[\${context}] \${errorMessage}\` : errorMessage
      
      errorLogger.log({
        level: 'error',
        message: contextMessage,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { functionName: fn.name, args }
      })
      
      throw error
    }
  }) as T
}

export function handleSyncErrors<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const contextMessage = context ? \`[\${context}] \${errorMessage}\` : errorMessage
      
      errorLogger.log({
        level: 'error',
        message: contextMessage,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { functionName: fn.name, args }
      })
      
      throw error
    }
  }) as T
}

// Safe async wrapper
export async function safeAsync<T>(
  promise: Promise<T>,
  defaultValue?: T
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    errorLogger.log({
      level: 'error',
      message: 'Safe async operation failed',
      error: err
    })
    return { data: defaultValue || null, error: err }
  }
}

// Safe sync wrapper
export function safeSync<T>(
  fn: () => T,
  defaultValue?: T
): { data: T | null; error: Error | null } {
  try {
    const data = fn()
    return { data, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    errorLogger.log({
      level: 'error',
      message: 'Safe sync operation failed',
      error: err
    })
    return { data: defaultValue || null, error: err }
  }
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        errorLogger.log({
          level: 'error',
          message: \`Retry failed after \${maxRetries} attempts\`,
          error: lastError,
          context: { attempts: attempt + 1 }
        })
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess() {
    this.failures = 0
    this.state = 'closed'
  }
  
  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }
}

export const circuitBreaker = new CircuitBreaker()

// Global error handlers
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      errorLogger.log({
        level: 'error',
        message: 'Unhandled promise rejection',
        error: new Error(event.reason),
        context: { type: 'unhandledrejection' }
      })
    })
    
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      errorLogger.log({
        level: 'error',
        message: 'Uncaught error',
        error: event.error || new Error(event.message),
        context: { 
          type: 'uncaught',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
  } else {
    // Node.js environment
    process.on('unhandledRejection', (reason, promise) => {
      errorLogger.log({
        level: 'error',
        message: 'Unhandled promise rejection',
        error: reason instanceof Error ? reason : new Error(String(reason)),
        context: { type: 'unhandledrejection', promise }
      })
    })
    
    process.on('uncaughtException', (error) => {
      errorLogger.log({
        level: 'error',
        message: 'Uncaught exception',
        error,
        context: { type: 'uncaughtException' }
      })
      
      // Exit gracefully
      process.exit(1)
    })
  }
}

// Initialize global error handlers
setupGlobalErrorHandlers()
`,

  'components/error-boundary-enhanced.tsx': `'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { errorLogger } from '../lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = \`error_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to our error handling system
    errorLogger.log({
      level: 'error',
      message: 'React Error Boundary caught an error',
      error,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId
      }
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to monitoring service
    this.sendErrorToMonitoring(error, errorInfo)
  }

  private async sendErrorToMonitoring(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          errorId: this.state.errorId,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportBug = () => {
    const subject = encodeURIComponent(\`Bug Report: \${this.state.error?.message || 'Unknown Error'}\`)
    const body = encodeURIComponent(\`
Error ID: \${this.state.errorId}
Error Message: \${this.state.error?.message}
Stack Trace: \${this.state.error?.stack}
URL: \${window.location.href}
User Agent: \${navigator.userAgent}
Timestamp: \${new Date().toISOString()}

Please describe what you were doing when this error occurred:

\`)
    window.open(\`mailto:support@onpar.app?subject=\${subject}&body=\${body}\`)
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      const { error } = this.state

      if (Fallback && error) {
        return <Fallback error={error} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-800 dark:text-red-200">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {process.env.NODE_ENV === 'development' && error && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development Mode)
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                    {error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report this issue
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  If this problem persists, please contact our support team at{' '}
                  <a 
                    href="mailto:support@onpar.app" 
                    className="text-primary hover:underline"
                  >
                    support@onpar.app
                  </a>
                </p>
                {this.state.errorId && (
                  <p className="mt-1">
                    Reference ID: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                      {this.state.errorId}
                    </code>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <EnhancedErrorBoundary fallback={fallback}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    )
  }
}

// Hook for error reporting
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    errorLogger.log({
      level: 'error',
      message: 'Manual error report',
      error,
      context
    })
  }, [])

  return { reportError }
}
`
}

function addErrorHandlingToFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { fixed: false, reason: 'File not found' }
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  let fixCount = 0
  
  // Apply error handling patterns
  for (const [patternName, { pattern, replacement }] of Object.entries(errorHandlingPatterns)) {
    if (typeof replacement === 'function') {
      content = content.replace(pattern, (match) => {
        fixCount++
        return replacement(match)
      })
    } else {
      const matches = content.match(pattern)
      if (matches) {
        fixCount += matches.length
        content = content.replace(pattern, replacement)
      }
    }
  }
  
  // Add error handler import if error handling was added
  if (fixCount > 0 && !content.includes('error-handler') && filePath.endsWith('.ts')) {
    content = `import { errorLogger, safeAsync } from '../lib/error-handler'\n${content}`
    fixCount++
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8')
    return { fixed: true, count: fixCount }
  }
  
  return { fixed: false, reason: 'No changes needed' }
}

function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'out', 'dist', '.bolt'].includes(item)) {
        getAllTsFiles(fullPath, files)
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath.replace(/\\/g, '/'))
    }
  }
  
  return files
}

function createErrorHandlingUtilities() {
  for (const [fileName, content] of Object.entries(errorHandlingUtilities)) {
    const dir = path.dirname(fileName)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(fileName, content, 'utf8')
    log(`  ✅ Created ${fileName}`, 'green')
  }
}

function fixAllErrorHandling() {
  header('ERROR HANDLING ENHANCEMENT')
  
  log('🔧 Creating error handling utilities...', 'blue')
  createErrorHandlingUtilities()
  
  log('\n🔍 Scanning for TypeScript files...', 'blue')
  const allFiles = getAllTsFiles('.')
  log(`📁 Found ${allFiles.length} files to process`, 'cyan')
  
  let totalFixed = 0
  let totalChanges = 0
  const results = {
    fixed: [],
    skipped: [],
    errors: []
  }
  
  log('\n🔧 Processing files...', 'blue')
  
  allFiles.forEach((filePath, index) => {
    const progress = `[${index + 1}/${allFiles.length}]`
    
    try {
      const result = addErrorHandlingToFile(filePath)
      
      if (result.fixed) {
        totalFixed++
        totalChanges += result.count
        results.fixed.push({ file: filePath, changes: result.count })
        log(`  ✅ ${progress} ${filePath} (${result.count} fixes)`, 'green')
      } else {
        results.skipped.push({ file: filePath, reason: result.reason })
        log(`  ⚪ ${progress} ${filePath} (${result.reason})`, 'dim')
      }
    } catch (error) {
      results.errors.push({ file: filePath, error: error.message })
      log(`  ❌ ${progress} ${filePath} (Error: ${error.message})`, 'red')
    }
  })
  
  // Summary
  header('ERROR HANDLING SUMMARY')
  
  log('📊 Results:', 'blue')
  log(`  Files processed: ${allFiles.length}`, 'cyan')
  log(`  Files fixed: ${totalFixed}`, 'green')
  log(`  Total changes: ${totalChanges}`, 'green')
  log(`  Files skipped: ${results.skipped.length}`, 'yellow')
  log(`  Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green')
  
  if (results.fixed.length > 0) {
    log('\n✅ Fixed files:', 'green')
    results.fixed.slice(0, 10).forEach(({ file, changes }) => {
      log(`  • ${file} (${changes} changes)`, 'green')
    })
    if (results.fixed.length > 10) {
      log(`  ... and ${results.fixed.length - 10} more files`, 'dim')
    }
  }
  
  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red')
    results.errors.forEach(({ file, error }) => {
      log(`  • ${file}: ${error}`, 'red')
    })
  }
  
  const success = totalFixed > 0 && results.errors.length === 0
  
  log(`\n🎯 FINAL STATUS: ${success ? '✅ SUCCESS' : '⚠️  PARTIAL SUCCESS'}`, success ? 'green' : 'yellow')
  
  return {
    success,
    totalFixed,
    totalChanges,
    errors: results.errors.length
  }
}

// Main execution
function main() {
  log(`${colors.bold}${colors.magenta}`)
  log('  ███████╗██████╗ ██████╗  ██████╗ ██████╗     ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ')
  log('  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗')
  log('  █████╗  ██████╔╝██████╔╝██║   ██║██████╔╝    ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝')
  log('  ██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗    ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗')
  log('  ███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║    ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║')
  log('  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝')
  log(`${colors.reset}`)
  log(`${colors.bold}${colors.cyan}    OnPar Error Handling Enhancement${colors.reset}`)
  log(`${colors.dim}    Adding comprehensive error handling throughout the codebase${colors.reset}\n`)
  
  try {
    const result = fixAllErrorHandling()
    
    // Save results
    const summary = {
      timestamp: new Date().toISOString(),
      success: result.success,
      filesFixed: result.totalFixed,
      totalChanges: result.totalChanges,
      errors: result.errors
    }
    
    fs.writeFileSync('error-handling-results.json', JSON.stringify(summary, null, 2))
    log(`\n📄 Results saved to: error-handling-results.json`, 'dim')
    
    if (result.success) {
      log('\n🚀 Error handling has been enhanced! Application is now more reliable.', 'green')
      log('\nNext steps:', 'blue')
      log('  1. Test error scenarios', 'cyan')
      log('  2. Verify error logging works', 'cyan')
      log('  3. Set up monitoring alerts', 'cyan')
    }
    
    process.exit(result.success ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Error handling fixer failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { fixAllErrorHandling, addErrorHandlingToFile }