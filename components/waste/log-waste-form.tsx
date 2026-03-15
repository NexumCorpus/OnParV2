'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { recordWasteEvent } from '@/lib/actions/waste'
import type { InventoryItem, WasteReason } from '@/types'

interface LogWasteFormProps {
  inventoryItems: InventoryItem[]
  onRecorded: () => void
  preselectedItemId?: string
}

const WASTE_REASONS: { value: WasteReason; label: string }[] = [
  { value: 'expired', label: 'Expired' },
  { value: 'spoiled', label: 'Spoiled' },
  { value: 'overproduction', label: 'Overproduction' },
  { value: 'prep_waste', label: 'Prep Waste' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'customer_return', label: 'Customer Return' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'other', label: 'Other' },
]

export function LogWasteForm({
  inventoryItems,
  onRecorded,
  preselectedItemId,
}: LogWasteFormProps) {
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId ?? '')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState<WasteReason | ''>('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedItem = inventoryItems.find((i) => i.id === selectedItemId)
  const estimatedValue = selectedItem ? quantity * selectedItem.price_per_unit : 0

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(0.01, prev + delta))
  }, [])

  const handleSubmit = async () => {
    if (!selectedItemId || !reason) {
      toast.error('Please select an item and reason')
      return
    }

    setSubmitting(true)
    try {
      const result = await recordWasteEvent({
        inventory_item_id: selectedItemId,
        quantity,
        unit: selectedItem?.unit ?? 'pieces',
        reason: reason as WasteReason,
        notes: notes || null,
      })

      if (result.success) {
        toast.success(`Logged: ${selectedItem?.name ?? 'Item'} ${quantity} ${selectedItem?.unit ?? ''}`)
        // Reset form
        if (!preselectedItemId) setSelectedItemId('')
        setQuantity(1)
        setReason('')
        setNotes('')
        setShowNotes(false)
        onRecorded()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Failed to record waste event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Waste Event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Selection */}
        <div className="space-y-2">
          <Label htmlFor="waste-item">Inventory Item *</Label>
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger id="waste-item">
              <SelectValue placeholder="Select an item..." />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} ({item.quantity} {item.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity + Unit + Value */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleQuantityChange(-5)}
              >
                -5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleQuantityChange(-1)}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.01, Number(e.target.value)))}
                className="h-9 w-16 text-center"
                min={0.01}
                step={0.01}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleQuantityChange(5)}
              >
                +5
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Input
              value={selectedItem?.unit ?? ''}
              readOnly
              className="h-9 bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Est. Value</Label>
            <Input
              value={`$${estimatedValue.toFixed(2)}`}
              readOnly
              className="h-9 bg-muted"
            />
          </div>
        </div>

        {/* Reason chips */}
        <div className="space-y-2">
          <Label>Reason *</Label>
          <div className="flex flex-wrap gap-2">
            {WASTE_REASONS.map((r) => (
              <Button
                key={r.value}
                type="button"
                variant={reason === r.value ? 'default' : 'outline'}
                size="sm"
                className="h-11 min-w-[44px]"
                onClick={() => setReason(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes (collapsed by default) */}
        {!showNotes ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="p-0"
            onClick={() => setShowNotes(true)}
          >
            + Add note
          </Button>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="waste-notes">Notes (optional)</Label>
            <Input
              id="waste-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              maxLength={500}
            />
          </div>
        )}

        {/* Submit */}
        <Button
          className="w-full h-12"
          onClick={handleSubmit}
          disabled={submitting || !selectedItemId || !reason}
        >
          {submitting ? 'Recording...' : 'Record Waste'}
        </Button>
      </CardContent>
    </Card>
  )
}
