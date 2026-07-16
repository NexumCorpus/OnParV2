'use client'

import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react'

interface SizedContainerProps {
  height: number
  children: React.ReactNode
}

/**
 * Drop-in replacement for recharts' ResponsiveContainer, which fails to
 * re-measure in this app (charts froze at a 14px-wide first measurement).
 * Measures the wrapper div directly and passes explicit pixel dimensions
 * to the chart root.
 */
export function SizedContainer({ height, children }: SizedContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      if (w > 0) setWidth(w)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={ref} style={{ width: '100%', height }}>
      {width > 0 && isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, {
            width,
            height,
          })
        : null}
    </div>
  )
}
