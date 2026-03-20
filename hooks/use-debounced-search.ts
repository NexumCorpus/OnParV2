import { useState, useRef, useCallback, useEffect } from 'react'
import { SEARCH_DEBOUNCE_MS } from '@/lib/config'

export function useDebouncedSearch(onChange: (value: string) => void) {
  const [value, setValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue)
      }, SEARCH_DEBOUNCE_MS)
    },
    [onChange]
  )

  const clear = useCallback(() => {
    setValue('')
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    onChange('')
  }, [onChange])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return { value, onChange: handleChange, clear }
}
