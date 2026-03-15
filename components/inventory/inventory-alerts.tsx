'use client'

import { useState } from 'react'
import { AlertTriangle, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InventoryAlertsProps {
  lowStockCount: number
  expiringCount: number
}

export function InventoryAlerts({ lowStockCount, expiringCount }: InventoryAlertsProps) {
  const [dismissedLowStock, setDismissedLowStock] = useState(false)
  const [dismissedExpiring, setDismissedExpiring] = useState(false)

  if (lowStockCount === 0 && expiringCount === 0) return null

  return (
    <div className="space-y-2">
      {lowStockCount > 0 && !dismissedLowStock && (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3',
            'dark:border-yellow-800 dark:bg-yellow-950'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} below reorder point
            </span>
          </div>
          <button
            onClick={() => setDismissedLowStock(true)}
            className="rounded p-1 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
            aria-label="Dismiss low stock alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {expiringCount > 0 && !dismissedExpiring && (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3',
            'dark:border-red-800 dark:bg-red-950'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {expiringCount} {expiringCount === 1 ? 'item' : 'items'} expiring within 7 days
            </span>
          </div>
          <button
            onClick={() => setDismissedExpiring(true)}
            className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
            aria-label="Dismiss expiring items alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
