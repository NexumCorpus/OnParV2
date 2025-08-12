'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MenuForm } from './menu-form'
import { Edit, Trash2, TrendingUp, TrendingDown, ChefHat, Target, Search, Filter } from 'lucide-react'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'
import { deleteMenuItem } from '@/lib/menu'
import { debounce } from '@/lib/performance'
import { useMemo } from 'react'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuListProps {
  items: MenuItem[]
  onUpdate: () => void
}

export function MenuList({ items, onUpdate }: MenuListProps) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'high_performers' | 'high_waste'>('all')

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  )

  // Calculate averages for filtering
  const avgSales = items.length > 0 ? items.reduce((sum, item) => sum + item.sales_percentage, 0) / items.length : 0
  const avgWaste = items.length > 0 ? items.reduce((sum, item) => sum + item.waste_percentage, 0) / items.length : 0

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
    if (filterType === 'high_performers') {
      filtered = filtered.filter(item => item.sales_percentage > avgSales)
    } else if (filterType === 'high_waste') {
      filtered = filtered.filter(item => item.waste_percentage > avgWaste)
    }

    return filtered.sort((a, b) => b.sales_percentage - a.sales_percentage)
  }, [items, searchTerm, filterType, avgSales, avgWaste])
  
  const handleDelete = async (id: string) => {
    const { error } = await deleteMenuItem(id)
    if (error) {
      toast.error('Failed to delete menu item')
    } else {
      toast.success('Menu item deleted successfully')
      onUpdate()
    }
  }

  const getPerformanceLevel = (item: MenuItem) => {
    if (item.sales_percentage > 20) return { level: 'excellent', color: 'green' }
    if (item.sales_percentage > 10) return { level: 'good', color: 'blue' }
    if (item.sales_percentage > 5) return { level: 'fair', color: 'yellow' }
    return { level: 'needs attention', color: 'red' }
  }

  if (items.length === 0) {
    return (
      <Card className="card-premium">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-6">
            <ChefHat className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No menu items yet</h3>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-md mx-auto mb-6">
            Add your first menu item to track performance and optimize waste.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary-enhanced">
                <ChefHat className="h-4 w-4 mr-2" />
                Add Your First Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
              </DialogHeader>
              <MenuForm onSuccess={onUpdate} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10 form-input"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="hover-lift"
          >
            All ({items.length})
          </Button>
          <Button
            variant={filterType === 'high_performers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('high_performers')}
            className="hover-lift"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Top Performers ({items.filter(item => item.sales_percentage > avgSales).length})
          </Button>
          <Button
            variant={filterType === 'high_waste' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('high_waste')}
            className="hover-lift"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            High Waste ({items.filter(item => item.waste_percentage > avgWaste).length})
          </Button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {filteredItems.map((item) => {
          const performance = getPerformanceLevel(item)
          
          return (
            <Card key={item.id} className="card-interactive relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-3 flex items-center space-x-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <span>{item.name}</span>
                    </CardTitle>
                    <Badge 
                      className={`
                        text-xs px-3 py-1
                        ${performance.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${performance.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        ${performance.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                        ${performance.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                      `}
                    >
                      {performance.level}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} className="hover-lift">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Edit Menu Item</DialogTitle>
                        </DialogHeader>
                        <MenuForm
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
                      className="hover-lift hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-2xl font-bold text-green-600">{item.sales_percentage}%</span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 font-medium">Sales Performance</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-4 w-4 text-orange-600 mr-1" />
                      <span className="text-2xl font-bold text-orange-600">{item.waste_percentage}%</span>
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Waste Rate</div>
                  </div>
                </div>

                {/* Efficiency Score */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Efficiency Score</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {Math.max(0, item.sales_percentage - item.waste_percentage).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Sales - Waste</div>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                {item.waste_percentage > avgWaste + 2 && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">High waste detected - consider portion optimization</span>
                    </div>
                  </div>
                )}
                
                {item.sales_percentage > 20 && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Top performer - consider featuring more prominently</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <Card className="card-premium">
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items match your filters</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all') }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}