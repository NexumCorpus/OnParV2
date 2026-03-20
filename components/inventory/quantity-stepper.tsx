'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUANTITY_STEPPER_DEBOUNCE_MS } from '@/lib/config'
import { adjustItemQuantity } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import type { InventoryItem } from '@/types'

interface QuantityStepperProps {
  item: InventoryItem
  onQuantityUpdated: (item: InventoryItem) => void
  onItemDeleted: (itemId: string) => void
}

export function QuantityStepper({
  item,
  onQuantityUpdated,
  onItemDeleted,
}: QuantityStepperProps) {
  const [displayQty, setDisplayQty] = useState(item.quantity)
  const pendingDeltaRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemIdRef = useRef(item.id)

  // Reset when item changes externally
  useEffect(() => {
    setDisplayQty(item.quantity)
    itemIdRef.current = item.id
  }, [item.id, item.quantity])

  const flushDelta = useCallback(async () => {
    const delta = pendingDeltaRef.current
    if (delta === 0) return

    pendingDeltaRef.current = 0
    const result = await adjustItemQuantity(itemIdRef.current, delta)

    if (!result.success) {
      if (result.error === 'ITEM_DELETED') {
        toast.error('Item no longer exists')
        onItemDeleted(itemIdRef.current)
        return
      }
      toast.error(getUserFriendlyError(result.error))
      // Revert optimistic display
      setDisplayQty((prev) => prev - delta)
      return
    }

    // Update from server response (not optimistic)
    const updatedItem = result.data as InventoryItem
    setDisplayQty(updatedItem.quantity)
    onQuantityUpdated(updatedItem)
  }, [onQuantityUpdated, onItemDeleted])

  const scheduleDelta = useCallback(
    (delta: number) => {
      pendingDeltaRef.current += delta
      setDisplayQty((prev) => Math.max(0, prev + delta))

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        flushDelta()
      }, QUANTITY_STEPPER_DEBOUNCE_MS)
    },
    [flushDelta]
  )

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      // Synchronous flush attempt — fire and forget on unmount
      if (pendingDeltaRef.current !== 0) {
        const delta = pendingDeltaRef.current
        pendingDeltaRef.current = 0
        adjustItemQuantity(itemIdRef.current, delta).catch(() => {
          // Best effort on unmount
        })
      }
    }
  }, [])

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
        onClick={() => scheduleDelta(-5)}
        aria-label="Decrease by 5"
      >
        <span className="text-xs font-medium">-5</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
        onClick={() => scheduleDelta(-1)}
        aria-label="Decrease by 1"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="min-w-[3rem] text-center text-base font-semibold tabular-nums">
        {displayQty}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
        onClick={() => scheduleDelta(1)}
        aria-label="Increase by 1"
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
        onClick={() => scheduleDelta(5)}
        aria-label="Increase by 5"
      >
        <span className="text-xs font-medium">+5</span>
      </Button>
    </div>
  )
}
