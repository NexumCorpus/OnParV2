'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDraftPO } from '@/lib/actions/purchasing'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatting'

interface LowStockItem {
  id: string
  name: string
  unit: string
  quantity: number
  reorder_point: number
  price_per_unit: number
}

interface CreatePOFormProps {
  supplierId: string
  items: LowStockItem[]
}

export function CreatePOForm({ supplierId, items }: CreatePOFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // State to manage quantities
  const [quantities, setQuantities] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.reorder_point || 10 }), {})
  )

  const handleQuantityChange = (id: string, val: string) => {
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      setQuantities(prev => ({ ...prev, [id]: num }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Map payload
    const payload = items.map(item => ({
      id: item.id,
      quantity: quantities[item.id],
      price: item.price_per_unit,
    }))

    const result = await createDraftPO(supplierId, payload)
    setIsSubmitting(false)

    if (result.success) {
      const data = result.data as { id: string }
      toast.success('Draft Purchase Order created successfully.')
      router.push(`/purchasing/${data.id}`)
    } else {
      toast.error(result.error || 'Failed to create PO.')
    }
  }

  const totalPoAmount = items.reduce((acc, item) => acc + (quantities[item.id] * item.price_per_unit), 0)

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No low-stock items found for this supplier. Everything looks fully stocked!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="font-medium p-3">Item</th>
              <th className="font-medium p-3">Current Stock</th>
              <th className="font-medium p-3">Unit Price</th>
              <th className="font-medium p-3">Order Qty</th>
              <th className="font-medium p-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const qty = quantities[item.id]
              const lineTotal = qty * item.price_per_unit

              return (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium">{item.name} <span className="text-muted-foreground ml-1">({item.unit})</span></td>
                  <td className="p-3">
                    <span className={item.quantity <= item.reorder_point ? 'text-amber-600 font-medium' : ''}>
                      {item.quantity} / {item.reorder_point}
                    </span>
                  </td>
                  <td className="p-3">{formatCurrency(item.price_per_unit)}</td>
                  <td className="p-3">
                    <Input 
                      type="number" 
                      min="1" 
                      step="0.01"
                      className="w-24 h-8"
                      value={qty}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-right font-medium">{formatCurrency(lineTotal)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-muted/50 font-medium">
            <tr>
              <td colSpan={4} className="p-3 text-right">Total Estimated Cost</td>
              <td className="p-3 text-right text-lg">{formatCurrency(totalPoAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Draft PO'}
        </Button>
      </div>
    </div>
  )
}
