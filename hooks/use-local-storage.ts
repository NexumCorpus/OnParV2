'use client'

import { useState, useEffect, useCallback } from 'react'

// Hook for managing localStorage with React state synchronization

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
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

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Remove from localStorage
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

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue]
}

// Hook for managing session storage
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// Hook for managing multiple localStorage keys
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: (keyof T)[],
  initialValues: T
): [T, (key: keyof T, value: T[keyof T]) => void, (key: keyof T) => void, () => void] {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValues
    }

    const stored: Partial<T> = {}
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(String(key))
        stored[key] = item ? JSON.parse(item) : initialValues[key]
      } catch (error) {
        console.warn(`Error reading localStorage key "${String(key)}":`, error)
        stored[key] = initialValues[key]
      }
    })
    
    return { ...initialValues, ...stored }
  })

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    try {
      setValues(prev => ({ ...prev, [key]: value }))
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(String(key), JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${String(key)}":`, error)
    }
  }, [])

  const removeValue = useCallback((key: keyof T) => {
    try {
      setValues(prev => ({ ...prev, [key]: initialValues[key] }))
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(String(key))
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${String(key)}":`, error)
    }
  }, [initialValues])

  const clearAll = useCallback(() => {
    try {
      setValues(initialValues)
      
      if (typeof window !== 'undefined') {
        keys.forEach(key => {
          window.localStorage.removeItem(String(key))
        })
      }
    } catch (error) {
      console.warn('Error clearing localStorage keys:', error)
    }
  }, [keys, initialValues])

  return [values, setValue, removeValue, clearAll]
}

// Hook for localStorage with expiration
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryMinutes: number = 60
): [T, (value: T) => void, () => void, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        const now = new Date().getTime()
        
        if (parsed.expiry && now > parsed.expiry) {
          // Item has expired
          window.localStorage.removeItem(key)
          setIsExpired(true)
          setValue(initialValue)
        } else {
          setValue(parsed.value)
          setIsExpired(false)
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      setValue(initialValue)
    }
  }, [key, initialValue])

  const setValueWithExpiry = useCallback((newValue: T) => {
    try {
      const now = new Date().getTime()
      const expiry = now + (expiryMinutes * 60 * 1000)
      
      const item = {
        value: newValue,
        expiry
      }
      
      setValue(newValue)
      setIsExpired(false)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(item))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, expiryMinutes])

  const removeValue = useCallback(() => {
    try {
      setValue(initialValue)
      setIsExpired(false)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [value, setValueWithExpiry, removeValue, isExpired]
}