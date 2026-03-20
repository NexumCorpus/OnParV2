'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ChartErrorFallbackProps {
  onRetry?: () => void
}

export function ChartErrorFallback({ onRetry }: ChartErrorFallbackProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
        <p className="text-sm font-medium">Unable to load chart</p>
        <p className="text-xs text-muted-foreground mt-1">Something went wrong while rendering this chart.</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
