'use client'

import { cn } from '@/lib/utils'

interface PricingToggleProps {
  isAnnual: boolean
  onToggle: (annual: boolean) => void
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          !isAnnual
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          isAnnual
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Annual
        <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
          Save 20%
        </span>
      </button>
    </div>
  )
}
