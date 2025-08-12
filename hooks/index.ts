'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// ASYNC HOOKS
// ============================================================================

export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
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

// ============================================================================
// DEBOUNCE HOOKS
// ============================================================================

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

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, cancel]
}

// ============================================================================
// STORAGE HOOKS
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// ============================================================================
// TOAST HOOK (Simplified)
// ============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

let toastCount = 0
const toastListeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]))
}

export function useToast() {
  const [state, setState] = useState<Toast[]>(toasts)

  useEffect(() => {
    toastListeners.push(setState)
    return () => {
      const index = toastListeners.indexOf(setState)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  const toast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = `toast-${++toastCount}`
    const newToast: Toast = { id, type, title, description }
    
    toasts.push(newToast)
    notifyListeners()

    // Auto remove after 5 seconds
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      notifyListeners()
    }, 5000)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    notifyListeners()
  }, [])

  return {
    toasts: state,
    toast,
    dismiss,
    success: (title: string, description?: string) => toast('success', title, description),
    error: (title: string, description?: string) => toast('error', title, description),
    warning: (title: string, description?: string) => toast('warning', title, description),
    info: (title: string, description?: string) => toast('info', title, description),
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => setValue(v => !v), [])
  const setToggle = useCallback((newValue: boolean) => setValue(newValue), [])
  
  return [value, toggle, setToggle]
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const useEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect
  return useEffect(effect, deps)
}

// Re-export individual hooks for backward compatibility
export { useAsync as useAsyncState }
export { useDebounce as useDebouncedValue }
export { useLocalStorage as usePersistedState }