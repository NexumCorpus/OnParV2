'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for debouncing callbacks
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, cancel]
}

// Hook for throttling values
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

// Hook for throttling callbacks
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef<boolean>(false)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callbackRef.current(...args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    }) as T,
    [limit]
  )

  return throttledCallback
}

// Advanced debounce hook with immediate execution option
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean // Execute immediately on first call
    trailing?: boolean // Execute after delay (default behavior)
    maxWait?: number // Maximum time to wait before executing
  } = {}
): T {
  const { leading = false, trailing = true, maxWait } = options
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const maxTimeoutRef = useRef<NodeJS.Timeout>()
  const lastCallTime = useRef<number>(0)
  const lastInvokeTime = useRef<number>(0)

  useEffect(() => {
    const invokeFunc = () => {
      setDebouncedValue(value)
      lastInvokeTime.current = Date.now()
    }

    const leadingEdge = () => {
      lastInvokeTime.current = Date.now()
      if (leading) {
        invokeFunc()
      }
    }

    const trailingEdge = () => {
      if (trailing && lastCallTime.current > lastInvokeTime.current) {
        invokeFunc()
      }
    }

    const timerExpired = () => {
      const timeSinceLastCall = Date.now() - lastCallTime.current
      if (timeSinceLastCall < delay) {
        timeoutRef.current = setTimeout(timerExpired, delay - timeSinceLastCall)
      } else {
        trailingEdge()
      }
    }

    lastCallTime.current = Date.now()
    const timeSinceLastInvoke = lastCallTime.current - lastInvokeTime.current

    if (lastInvokeTime.current === 0) {
      leadingEdge()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (maxWait && timeSinceLastInvoke >= maxWait) {
      invokeFunc()
    } else {
      timeoutRef.current = setTimeout(timerExpired, delay)
    }

    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        if (lastCallTime.current > lastInvokeTime.current) {
          invokeFunc()
        }
      }, maxWait)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
        maxTimeoutRef.current = undefined
      }
    }
  }, [value, delay, leading, trailing, maxWait])

  return debouncedValue
}

// Hook for search with debounce
export function useSearchDebounce(
  searchTerm: string,
  delay: number = 300
): {
  debouncedSearchTerm: string
  isSearching: boolean
} {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(true)
    
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay])

  return { debouncedSearchTerm, isSearching }
}

// Hook for API calls with debounce
export function useApiDebounce<T>(
  apiCall: (query: string) => Promise<T>,
  query: string,
  delay: number = 300,
  dependencies: any[] = []
): {
  data: T | null
  loading: boolean
  error: Error | null
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    apiCall(debouncedQuery)
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, ...dependencies])

  return { data, loading, error }
}