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
import { recordBatchWasteEvents } from '@/lib/actions/waste'
import { Plus, Trash2 } from 'lucide-react'
import type { InventoryItem, WasteReason } from '@/types'

interface BatchWasteFormProps {
  inventoryItems: InventoryItem[]
  onRecorded: () => void
}

interface BatchRow {
  id: number
  itemId: string
  quantity: number
  reason: WasteReason | ''
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

let nextRowId = 1

function createRow(): BatchRow {
  return { id: nextRowId++, itemId: '', quantity: 1, reason: '' }
}

export function BatchWasteForm({ inventoryItems, onRecorded }: BatchWasteFormProps) {
  const [rows, setRows] = useState<BatchRow[]>(() => [createRow(), createRow(), createRow()])
  const [submitting, setSubmitting] = useState(false)

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createRow()])
  }, [])

  const removeRow = useCallback((id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }, [])

  const updateRow = useCallback((id: number, field: keyof BatchRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }, [])

  const filledRows = rows.filter((r) => r.itemId && r.reason)

  const totalValue = rows.reduce((sum, row) => {
    const item = inventoryItems.find((i) => i.id === row.itemId)
    return sum + (item ? row.quantity * item.price_per_unit : 0)
  }, 0)

  const handleSubmit = async () => {
    if (filledRows.length === 0) {
      toast.error('Fill in at least one row')
      return
    }

    setSubmitting(true)
    try {
      const events = filledRows.map((row) => {
        const item = inventoryItems.find((i) => i.id === row.itemId)
        return {
          inventory_item_id: row.itemId,
          quantity: row.quantity,
          unit: item?.unit ?? 'pieces',
          reason: row.reason as WasteReason,
          notes: null,
        }
      })

      const result = await recordBatchWasteEvents(events)

      if (result.success) {
        const data = result.data as { successCount: number; failCount: number; totalValue: number }
        if (data.failCount > 0) {
          toast.warning(`${data.successCount} recorded, ${data.failCount} failed`)
        } else {
          toast.success(`${data.successCount} waste events recorded ($${data.totalValue.toFixed(2)})`)
        }
        setRows([createRow(), createRow(), createRow()])
        onRecorded()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Failed to record batch waste events')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Batch Waste Log</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filledRows.length} item{filledRows.length !== 1 ? 's' : ''} — ${totalValue.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Header labels (desktop only) */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_1fr_40px] gap-2 text-xs text-muted-foreground font-medium px-1">
          <span>Item</span>
          <span>Qty</span>
          <span>Reason</span>
          <span />
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_80px_1fr_40px] gap-2 items-end border-b pb-3 sm:border-0 sm:pb-0"
          >
            {/* Item */}
            <div>
              <Label className="sm:hidden text-xs">Item</Label>
              <Select value={row.itemId} onValueChange={(v) => updateRow(row.id, 'itemId', v)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select item..." />
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

            {/* Qty */}
            <div>
              <Label className="sm:hidden text-xs">Qty</Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={row.quantity}
                onChange={(e) => updateRow(row.id, 'quantity', Math.max(0.01, Number(e.target.value)))}
                className="min-h-[44px] text-center"
              />
            </div>

            {/* Reason */}
            <div>
              <Label className="sm:hidden text-xs">Reason</Label>
              <Select value={row.reason} onValueChange={(v) => updateRow(row.id, 'reason', v)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Reason..." />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remove */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[40px]"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}

        {/* Add row */}
        <Button type="button" variant="outline" size="sm" className="w-full min-h-[44px]" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>

        {/* Submit */}
        <Button
          className="w-full h-14 sm:h-12 text-base"
          onClick={handleSubmit}
          disabled={submitting || filledRows.length === 0}
        >
          {submitting ? 'Recording...' : `Record ${filledRows.length} Item${filledRows.length !== 1 ? 's' : ''}`}
        </Button>
      </CardContent>
    </Card>
  )
}
