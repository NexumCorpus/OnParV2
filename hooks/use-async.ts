'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Generic async state management hook
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null
  loading: boolean
  error: E | null
  execute: () => Promise<void>
  reset: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<E | null>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as E)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, dependencies)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    execute()
  }, [execute])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return { data, loading, error, execute, reset }
}

// Hook for async operations with manual trigger
export function useAsyncCallback<T, Args extends any[] = [], E = Error>(
  asyncFunction: (...args: Args) => Promise<T>
): {
  data: T | null
  loading: boolean
  error: E | null
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<E | null>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction(...args)
      if (mountedRef.current) {
        setData(result)
        return result
      }
      return null
    } catch (err) {
      if (mountedRef.current) {
        setError(err as E)
      }
      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return { data, loading, error, execute, reset }
}

// Hook for managing multiple async operations
export function useAsyncQueue<T>(): {
  queue: Array<{ id: string; status: 'pending' | 'loading' | 'success' | 'error'; data?: T; error?: Error }>
  addToQueue: (id: string, asyncFunction: () => Promise<T>) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  executeAll: () => Promise<void>
  isProcessing: boolean
} {
  const [queue, setQueue] = useState<Array<{
    id: string
    status: 'pending' | 'loading' | 'success' | 'error'
    data?: T
    error?: Error
    asyncFunction?: () => Promise<T>
  }>>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addToQueue = useCallback((id: string, asyncFunction: () => Promise<T>) => {
    setQueue(prev => [...prev, { id, status: 'pending', asyncFunction }])
  }, [])

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  const executeAll = useCallback(async () => {
    setIsProcessing(true)
    
    const pendingItems = queue.filter(item => item.status === 'pending')
    
    for (const item of pendingItems) {
      setQueue(prev => prev.map(queueItem => 
        queueItem.id === item.id 
          ? { ...queueItem, status: 'loading' as const }
          : queueItem
      ))

      try {
        const result = await item.asyncFunction!()
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'success' as const, data: result }
            : queueItem
        ))
      } catch (error) {
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'error' as const, error: error as Error }
            : queueItem
        ))
      }
    }
    
    setIsProcessing(false)
  }, [queue])

  return {
    queue: queue.map(({ asyncFunction, ...item }) => item),
    addToQueue,
    removeFromQueue,
    clearQueue,
    executeAll,
    isProcessing
  }
}

// Hook for retry logic
export function useAsyncRetry<T, E = Error>(
  asyncFunction: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  dependencies: any[] = []
): {
  data: T | null
  loading: boolean
  error: E | null
  retryCount: number
  execute: () => Promise<void>
  retry: () => Promise<void>
  reset: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<E | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const mountedRef = useRef(true)

  const executeWithRetry = useCallback(async (currentRetry: number = 0) => {
    setLoading(true)
    setError(null)
    setRetryCount(currentRetry)

    try {
      const result = await asyncFunction()
      if (mountedRef.current) {
        setData(result)
        setRetryCount(0)
      }
    } catch (err) {
      if (mountedRef.current) {
        if (currentRetry < maxRetries) {
          setTimeout(() => {
            if (mountedRef.current) {
              executeWithRetry(currentRetry + 1)
            }
          }, retryDelay * Math.pow(2, currentRetry)) // Exponential backoff
        } else {
          setError(err as E)
        }
      }
    } finally {
      if (mountedRef.current && (currentRetry >= maxRetries || data)) {
        setLoading(false)
      }
    }
  }, [asyncFunction, maxRetries, retryDelay, ...dependencies])

  const execute = useCallback(() => executeWithRetry(0), [executeWithRetry])
  const retry = useCallback(() => executeWithRetry(retryCount), [executeWithRetry, retryCount])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setRetryCount(0)
  }, [])

  useEffect(() => {
    execute()
  }, [execute])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return { data, loading, error, retryCount, execute, retry, reset }
}

// Hook for polling data
export function useAsyncPolling<T, E = Error>(
  asyncFunction: () => Promise<T>,
  interval: number = 5000,
  options: {
    immediate?: boolean
    enabled?: boolean
    maxPolls?: number
  } = {}
): {
  data: T | null
  loading: boolean
  error: E | null
  pollCount: number
  start: () => void
  stop: () => void
  reset: () => void
} {
  const { immediate = true, enabled = true, maxPolls } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<E | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  const poll = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      if (mountedRef.current) {
        setData(result)
        setPollCount(prev => prev + 1)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as E)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [asyncFunction])

  const start = useCallback(() => {
    if (isPolling) return

    setIsPolling(true)
    
    if (immediate) {
      poll()
    }

    intervalRef.current = setInterval(() => {
      if (maxPolls && pollCount >= maxPolls) {
        stop()
        return
      }
      poll()
    }, interval)
  }, [poll, interval, immediate, isPolling, maxPolls, pollCount])

  const stop = useCallback(() => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setData(null)
    setError(null)
    setLoading(false)
    setPollCount(0)
  }, [stop])

  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }

    return stop
  }, [enabled, start, stop])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      stop()
    }
  }, [stop])

  return { data, loading, error, pollCount, start, stop, reset }
}