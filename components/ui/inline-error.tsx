'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InlineErrorProps {
  message?: string
  onRetry?: () => void
}

export function InlineError({
  message = 'Some data could not be loaded.',
  onRetry,
}: InlineErrorProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      <span className="flex-1 text-muted-foreground">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  )
}
