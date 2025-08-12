'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMenuItem, updateMenuItem } from '@/lib/menu'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuFormProps {
  item?: MenuItem | null
  onSuccess: () => void
}

export function MenuForm({ item, onSuccess }: MenuFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    sales_percentage: '',
    waste_percentage: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sales_percentage: item.sales_percentage.toString(),
        waste_percentage: item.waste_percentage.toString(),
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Menu item name is required')
      return
    }
    
    if (!formData.sales_percentage || parseFloat(formData.sales_percentage) < 0 || parseFloat(formData.sales_percentage) > 100) {
      toast.error('Sales percentage must be between 0 and 100')
      return
    }
    
    if (!formData.waste_percentage || parseFloat(formData.waste_percentage) < 0 || parseFloat(formData.waste_percentage) > 100) {
      toast.error('Waste percentage must be between 0 and 100')
      return
    }

    setLoading(true)

    try {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const data = {
        name: formData.name.trim(),
        sales_percentage: parseFloat(formData.sales_percentage),
        waste_percentage: parseFloat(formData.waste_percentage),
        user_id: user.id,
      }

      let error
      if (item) {
        ({ error } = await updateMenuItem(item.id, data))
      } else {
        ({ error } = await createMenuItem(data))
      }

      if (error) throw error

      toast.success(item ? 'Menu item updated successfully' : 'Menu item added successfully')
      onSuccess()
      
      if (!item) {
        setFormData({
          name: '',
          sales_percentage: '',
          waste_percentage: '',
        })
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Failed to save menu item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Menu Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="sales_percentage">Sales Percentage (%)</Label>
        <Input
          id="sales_percentage"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={formData.sales_percentage}
          onChange={(e) => setFormData({ ...formData, sales_percentage: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Percentage of total sales this item represents
        </p>
      </div>

      <div>
        <Label htmlFor="waste_percentage">Waste Percentage (%)</Label>
        <Input
          id="waste_percentage"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={formData.waste_percentage}
          onChange={(e) => setFormData({ ...formData, waste_percentage: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Percentage of this item that typically goes to waste
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : (item ? 'Update Menu Item' : 'Add Menu Item')}
      </Button>
    </form>
  )
}