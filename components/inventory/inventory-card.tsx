'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatting'
import { cn } from '@/lib/utils'
import { QuantityStepper } from './quantity-stepper'
import type { InventoryItem } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface InventoryCardProps {
  item: InventoryItem
  onQuantityUpdated: (item: InventoryItem) => void
  onItemDeleted: (itemId: string) => void
  onLogWaste: (item: InventoryItem) => void
  onTap: (item: InventoryItem) => void
}

function isExpiringSoon(expiryDate: string | null, days: number = 7): boolean {
  if (!expiryDate) return false
  const expiry = parseISO(expiryDate)
  const now = new Date()
  const diff = differenceInDays(expiry, now)
  return diff >= 0 && diff <= days
}

function isLowStock(item: InventoryItem): boolean {
  return item.quantity < item.reorder_point
}

export function InventoryCard({
  item,
  onQuantityUpdated,
  onItemDeleted,
  onLogWaste,
  onTap,
}: InventoryCardProps) {
  const expiring = isExpiringSoon(item.expiry_date)
  const expiringCritical = isExpiringSoon(item.expiry_date, 3)
  const lowStock = isLowStock(item)

  return (
    <Card
      className="overflow-hidden"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Only fire on card body, not on buttons
        const target = e.target as HTMLElement
        if (target.closest('button')) return
        onTap(item)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap(item)
        }
      }}
    >
      <CardContent className="p-4 space-y-2">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {expiringCritical && (
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
            )}
            <h3 className="font-semibold text-base">{item.name}</h3>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">{item.category}</Badge>
          <span className="text-muted-foreground">{'·'}</span>
          {lowStock ? (
            <Badge variant="destructive" className="text-xs">
              &#9888; LOW
            </Badge>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-medium text-xs">OK</span>
          )}
          <span className="ml-auto font-semibold">
            {item.quantity} {item.unit}
          </span>
        </div>

        {/* Expiry row */}
        <p
          className={cn(
            'text-sm',
            expiring ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'
          )}
        >
          {item.expiry_date ? `Exp ${formatDate(item.expiry_date)}` : 'No expiry'}
        </p>

        {/* Quantity stepper */}
        <div className="flex justify-center pt-1">
          <QuantityStepper
            item={item}
            onQuantityUpdated={onQuantityUpdated}
            onItemDeleted={onItemDeleted}
          />
        </div>

        {/* Log Waste quick action */}
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive min-h-[44px]"
            onClick={(e) => {
              e.stopPropagation()
              onLogWaste(item)
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Log Waste
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
