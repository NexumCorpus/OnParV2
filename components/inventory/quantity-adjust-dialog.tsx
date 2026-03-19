'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus } from 'lucide-react'
import { adjustItemQuantity } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import type { InventoryItem } from '@/types'

interface QuantityAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onUpdated: (item: InventoryItem) => void
}

export function QuantityAdjustDialog({
  open,
  onOpenChange,
  item,
  onUpdated,
}: QuantityAdjustDialogProps) {
  const [newQty, setNewQty] = useState(item.quantity)
  const [loading, setLoading] = useState(false)

  const handleAdjust = (delta: number) => {
    setNewQty((prev) => Math.max(0, prev + delta))
  }

  const handleSubmit = async () => {
    const delta = newQty - item.quantity
    if (delta === 0) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    const result = await adjustItemQuantity(item.id, delta)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    const updatedItem = result.data as InventoryItem
    onUpdated(updatedItem)
    toast.success('Quantity updated')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Quantity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Current: {item.quantity} {item.unit}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => handleAdjust(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold tabular-nums min-w-[4rem] text-center">
              {newQty}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => handleAdjust(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="directQty">Or enter new quantity:</Label>
            <Input
              id="directQty"
              type="number"
              min={0}
              value={newQty}
              onChange={(e) => setNewQty(Math.max(0, Number(e.target.value)))}
              className="mt-1 min-h-[44px] text-base"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
