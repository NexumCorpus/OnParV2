'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createInventoryItem, updateInventoryItem } from '@/lib/inventory'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryFormProps {
  item?: InventoryItem | null
  onSuccess: () => void
}

export function InventoryForm({ item, onSuccess }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pieces',
    expiry_date: '',
    reorder_point: '',
    price_per_unit: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        expiry_date: item.expiry_date || '',
        reorder_point: item.reorder_point.toString(),
        price_per_unit: item.price_per_unit.toString(),
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Item name is required')
      return
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      toast.error('Quantity must be a positive number')
      return
    }
    
    if (!formData.reorder_point || parseInt(formData.reorder_point) < 0) {
      toast.error('Reorder point must be a positive number')
      return
    }
    
    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) < 0) {
      toast.error('Price per unit must be a positive number')
      return
    }

    setLoading(true)

    try {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const data = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        expiry_date: formData.expiry_date || null,
        reorder_point: parseInt(formData.reorder_point),
        price_per_unit: parseFloat(formData.price_per_unit),
        user_id: user.id,
      }

      let error
      if (item) {
        ({ error } = await updateInventoryItem(item.id, data))
      } else {
        ({ error } = await createInventoryItem(data))
      }

      if (error) throw error

      toast.success(item ? 'Item updated successfully' : 'Item added successfully')
      onSuccess()
      
      if (!item) {
        setFormData({
          name: '',
          quantity: '',
          unit: 'pieces',
          expiry_date: '',
          reorder_point: '',
          price_per_unit: '',
        })
      }
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Tomato Sauce"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., kg, liters, pieces"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
        <Input
          id="expiry_date"
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reorder_point">Reorder Point</Label>
          <Input
            id="reorder_point"
            type="number"
            min="0"
            value={formData.reorder_point}
            onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Alert when quantity falls below this number
          </p>
        </div>
        <div>
          <Label htmlFor="price_per_unit">Price per Unit ($)</Label>
          <Input
            id="price_per_unit"
            type="number"
            min="0"
            step="0.01"
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
      </Button>
    </form>
  )
}