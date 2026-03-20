'use client'

import { useEffect } from 'react'
import { InlineError } from '@/components/ui/inline-error'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Analytics error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <InlineError
        message="Failed to load analytics data."
        onRetry={reset}
      />
    </div>
  )
}
