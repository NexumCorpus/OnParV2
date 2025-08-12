'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InventoryForm } from './inventory-form'
import { Edit, Trash2, AlertTriangle, Calendar, Package, DollarSign, Search, Filter } from 'lucide-react'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'
import { deleteInventoryItem } from '@/lib/inventory'
import { debounce } from '@/lib/performance'
import { useMemo } from 'react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryListProps {
  items: InventoryItem[]
  onUpdate: () => void
}

export function InventoryList({ items, onUpdate }: InventoryListProps) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'expiring'>('all')

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  )

  // Filter items based on search term and filter type
  const filteredItems = useMemo(() => {
    let filtered = items

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType === 'low_stock') {
      filtered = filtered.filter(item => item.quantity < item.reorder_point)
    } else if (filterType === 'expiring') {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      filtered = filtered.filter(item => {
        if (!item.expiry_date) return false
        return new Date(item.expiry_date) <= sevenDaysFromNow
      })
    }

    return filtered
  }, [items, searchTerm, filterType])
  
  const handleDelete = async (id: string) => {
    const { error } = await deleteInventoryItem(id)
    if (error) {
      toast.error('Failed to delete item')
    } else {
      toast.success('Item deleted successfully')
      onUpdate()
    }
  }

  const isLowStock = (item: InventoryItem) => item.quantity < item.reorder_point
  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiry_date) return false
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    return new Date(item.expiry_date) <= sevenDaysFromNow
  }

  if (items.length === 0) {
    return (
      <Card className="card-premium border-dashed border-2">
        <CardContent className="py-20 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-3xl font-bold mb-4">No inventory items yet</h3>
          <p className="text-xl text-foreground/75 leading-relaxed max-w-lg mx-auto mb-8">
            Add your first item to start tracking inventory and reducing waste.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary-enhanced px-8 py-4 text-lg font-semibold">
                <Package className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add Inventory Item</DialogTitle>
              </DialogHeader>
              <InventoryForm onSuccess={onUpdate} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search inventory items..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-12 form-input h-12 text-base rounded-xl border-2"
          />
        </div>
        <div className="flex space-x-3">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="default"
            onClick={() => setFilterType('all')}
            className="hover-lift px-4 py-3 font-semibold rounded-xl"
          >
            All ({items.length})
          </Button>
          <Button
            variant={filterType === 'low_stock' ? 'default' : 'outline'}
            size="default"
            onClick={() => setFilterType('low_stock')}
            className="hover-lift px-4 py-3 font-semibold rounded-xl"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock ({items.filter(item => isLowStock(item)).length})
          </Button>
          <Button
            variant={filterType === 'expiring' ? 'default' : 'outline'}
            size="default"
            onClick={() => setFilterType('expiring')}
            className="hover-lift px-4 py-3 font-semibold rounded-xl"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Expiring ({items.filter(item => isExpiringSoon(item)).length})
          </Button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {filteredItems.map((item) => {
          const lowStock = isLowStock(item)
          const expiring = isExpiringSoon(item)
          
          return (
            <Card 
              key={item.id} 
              className={`
                card-interactive relative overflow-hidden
                ${lowStock ? 'border-orange-300 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 dark:from-orange-950/30 dark:to-yellow-950/30' : ''}
                ${expiring ? 'border-red-300 bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/30 dark:to-pink-950/30' : ''}
              `}
            >
              {/* Status Indicator */}
              {(lowStock || expiring) && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[48px] border-l-transparent border-t-[48px] border-t-orange-500">
                  <AlertTriangle className="absolute -top-10 -right-7 h-5 w-5 text-white" />
                </div>
              )}
              
              <CardHeader className="pb-6 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-3 flex items-center space-x-2">
                      <span>{item.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                        {item.unit}
                      </Badge>
                      <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                        ${item.price_per_unit.toFixed(2)}/unit
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} className="hover-lift w-10 h-10 rounded-xl">
                          <Edit className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-3xl font-bold">Edit Inventory Item</DialogTitle>
                        </DialogHeader>
                        <InventoryForm
                          item={editingItem}
                          onSuccess={() => {
                            setEditingItem(null)
                            onUpdate()
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="hover-lift hover:bg-red-50 hover:text-red-600 w-10 h-10 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6 pt-0">
                {/* Quantity Display */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-sm">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-black">{item.quantity}</div>
                      <div className="text-sm text-muted-foreground font-medium">Current Stock</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{item.reorder_point}</div>
                    <div className="text-sm text-muted-foreground font-medium">Reorder Point</div>
                  </div>
                </div>

                {/* Value and Expiry */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/20">
                    <div className="flex items-center justify-center mb-3">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-black text-green-600 text-lg">
                        ${(item.quantity * item.price_per_unit).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Total Value</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/20">
                    {item.expiry_date ? (
                      <>
                        <div className="flex items-center justify-center mb-3">
                          <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="font-bold text-blue-600 text-base">
                            {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Expires</div>
                      </>
                    ) : (
                      <>
                        <div className="text-base font-bold text-muted-foreground mb-3">No Expiry</div>
                        <div className="text-sm text-muted-foreground font-medium">Set</div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Alert Badges */}
                <div className="flex flex-wrap gap-3">
                  {lowStock && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-4 py-2 font-bold shadow-md">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                  {expiring && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-4 py-2 font-bold shadow-md">
                      <Calendar className="h-3 w-3 mr-1" />
                      Expires Soon
                    </Badge>
                  )}
                  {!lowStock && !expiring && (
                    <Badge variant="outline" className="text-sm px-4 py-2 bg-green-50 text-green-700 border-green-200 font-semibold">
                      ✓ Good Stock
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <Card className="card-premium border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">No items match your filters</h3>
            <p className="text-muted-foreground mb-6 text-lg">Try adjusting your search or filter criteria</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all') }} className="px-6 py-3 font-semibold">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}