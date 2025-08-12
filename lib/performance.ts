// Performance optimization utilities for OnPar

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiResponseTime: number
  memoryUsage?: number
}

// Debounce function for search and input fields
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Measure component render time
export function measureRenderTime(componentName: string) {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
    }
    
    return renderTime
  }
}

// Optimize large lists with virtual scrolling helper
export function getVisibleItems<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { visibleItems: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  
  return { visibleItems, startIndex, endIndex }
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  // Skip memoization during SSR
  if (typeof window === 'undefined') {
    return fn
  }
  
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }) as T
}

// Batch API calls to reduce server load
export class APIBatcher {
  private batches: Map<string, any[]> = new Map()
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  
  batch<T>(
    key: string,
    item: T,
    batchProcessor: (items: T[]) => Promise<void>,
    delay: number = 100
  ): void {
    // Add item to batch
    if (!this.batches.has(key)) {
      this.batches.set(key, [])
    }
    this.batches.get(key)!.push(item)
    
    // Clear existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!)
    }
    
    // Set new timeout to process batch
    const timeout = setTimeout(async () => {
      const items = this.batches.get(key) || []
      this.batches.delete(key)
      this.timeouts.delete(key)
      
      if (items.length > 0) {
        try {
          await batchProcessor(items)
        } catch (error) {
          console.error(`Batch processing failed for ${key}:`, error)
        }
      }
    }, delay)
    
    this.timeouts.set(key, timeout)
  }
}

// Image optimization helper
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  // For Pexels images, add size parameters
  if (url.includes('pexels.com')) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('auto', 'compress')
    
    return `${url}?${params.toString()}`
  }
  
  return url
}

// Local storage with expiration
export class ExpiringStorage {
  static set(key: string, value: any, expirationMinutes: number): void {
    if (typeof window === 'undefined') return
    
    const item = {
      value,
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    }
    localStorage.setItem(key, JSON.stringify(item))
  }
  
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null
    
    try {
      const item = JSON.parse(itemStr)
      if (Date.now() > item.expiration) {
        localStorage.removeItem(key)
        return null
      }
      return item.value
    } catch {
      localStorage.removeItem(key)
      return null
    }
  }
  
  static remove(key: string): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(key)
  }
}

// Performance monitoring
export function trackPageLoad(pageName: string): void {
  if (typeof window === 'undefined') return
  
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${pageName} load time: ${loadTime.toFixed(2)}ms`)
      }
      
      // In production, you could send this to analytics
      // analytics.track('page_load', { page: pageName, loadTime })
    })
  }
}