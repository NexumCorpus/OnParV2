'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface DataErrorAlertProps {
  title?: string
  description?: string
}

export function DataErrorAlert({
  title = 'Failed to load data',
  description = 'Some data could not be loaded. You may see incomplete or missing information.',
}: DataErrorAlertProps) {
  const router = useRouter()

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => router.refresh()}
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
        Retry
      </Button>
    </div>
  )
}
