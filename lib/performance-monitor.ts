'use client'

import { useCallback } from 'react'

// Performance monitoring and optimization utilities

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceThresholds {
  pageLoad: number
  apiResponse: number
  renderTime: number
  memoryUsage: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds: PerformanceThresholds = {
    pageLoad: 3000, // 3 seconds
    apiResponse: 1000, // 1 second
    renderTime: 100, // 100ms
    memoryUsage: 50 * 1024 * 1024 // 50MB
  }
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.monitorPageLoad()
      this.monitorMemoryUsage()
    }
  }

  private initializeObservers() {
    // Monitor Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long-task', entry.duration, {
              startTime: entry.startTime,
              name: entry.name
            })
            
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`, entry)
            }
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        console.warn('Long task observer not supported')
      }

      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              this.recordMetric('cumulative-layout-shift', entry.value, {
                sources: entry.sources?.map((source: any) => source.node)
              })
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('Layout shift observer not supported')
      }

      // Monitor Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.recordMetric('largest-contentful-paint', lastEntry.startTime, {
            element: (lastEntry as any).element?.tagName
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }
    }
  }

  private monitorPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          if (navigation) {
            this.recordMetric('page-load-time', navigation.loadEventEnd - navigation.fetchStart)
            this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
            this.recordMetric('first-byte', navigation.responseStart - navigation.fetchStart)
          }
        }, 0)
      })
    }
  }

  private monitorMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric('memory-used', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        })
        
        if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
          console.warn(`High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
        }
      }, 30000) // Check every 30 seconds
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }
    
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
    
    // Check thresholds
    this.checkThresholds(metric)
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.getThreshold(metric.name)
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${threshold}ms)`)
      
      // In a real app, send to monitoring service
      this.reportPerformanceIssue(metric)
    }
  }

  private getThreshold(metricName: string): number | null {
    switch (metricName) {
      case 'page-load-time':
        return this.thresholds.pageLoad
      case 'api-response':
        return this.thresholds.apiResponse
      case 'render-time':
        return this.thresholds.renderTime
      default:
        return null
    }
  }

  private reportPerformanceIssue(metric: PerformanceMetric) {
    // In a real app, send to monitoring service like DataDog, New Relic, etc.
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/performance/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error)
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }

  getAverageMetric(name: string, timeWindow?: number): number {
    const now = Date.now()
    const windowStart = timeWindow ? now - timeWindow : 0
    
    const relevantMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp >= windowStart
    )
    
    if (relevantMetrics.length === 0) return 0
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0)
    return sum / relevantMetrics.length
  }

  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {}
    const uniqueMetrics = [...new Set(this.metrics.map(m => m.name))]
    
    uniqueMetrics.forEach(name => {
      const metrics = this.getMetrics(name)
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value)
        report[name] = {
          count: metrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: metrics[metrics.length - 1].value
        }
      }
    })
    
    return report
  }

  clearMetrics() {
    this.metrics = []
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const recordRenderTime = useCallback((componentName: string, renderTime: number) => {
    performanceMonitor.recordMetric(`render-${componentName}`, renderTime)
  }, [])

  const recordApiCall = useCallback((endpoint: string, duration: number, success: boolean) => {
    performanceMonitor.recordMetric('api-response', duration, {
      endpoint,
      success,
      status: success ? 'success' : 'error'
    })
  }, [])

  const recordUserAction = useCallback((action: string, duration: number) => {
    performanceMonitor.recordMetric(`user-action-${action}`, duration)
  }, [])

  return {
    recordRenderTime,
    recordApiCall,
    recordUserAction,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor)
  }
}

// Utility for measuring async operations
export async function measureAsync<T>(
  operation: () => Promise<T>,
  metricName: string,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric(metricName, duration, { ...metadata, success: true })
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric(metricName, duration, { ...metadata, success: false, error: (error as Error).message })
    throw error
  }
}