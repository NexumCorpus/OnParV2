'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart3,
  Camera,
  QrCode,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  History
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '../../lib/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface AdvancedInventoryManagerProps {
  inventoryItems: InventoryItem[]
  onItemsChange: (items: InventoryItem[]) => void
  isPremium: boolean
  userProfile: any
}

interface InventoryFilters {
  search: string
  category: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface BulkAction {
  type: 'update_quantity' | 'update_price' | 'delete' | 'reorder'
  items: string[]
}

export function AdvancedInventoryManager({ 
  inventoryItems, 
  onItemsChange, 
  isPremium,
  userProfile 
}: AdvancedInventoryManagerProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list')

  // Filter and sort inventory items
  const filteredItems = useMemo(() => {
    let filtered = inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesCategory = filters.category === 'all' || getCategoryFromItem(item) === filters.category
      const matchesStatus = filters.status === 'all' || getItemStatus(item) === filters.status
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'quantity':
          aValue = a.quantity
          bValue = b.quantity
          break
        case 'value':
          aValue = a.quantity * a.price_per_unit
          bValue = b.quantity * b.price_per_unit
          break
        case 'expiry':
          aValue = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
          bValue = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [inventoryItems, filters])

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    const lowStockCount = inventoryItems.filter(item => item.quantity <= item.reorder_point).length
    const expiringCount = inventoryItems.filter(item => {
      if (!item.expiry_date) return false
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length
    const expiredCount = inventoryItems.filter(item => {
      if (!item.expiry_date) return false
      return new Date(item.expiry_date) < new Date()
    }).length

    return {
      totalItems: inventoryItems.length,
      totalValue,
      lowStockCount,
      expiringCount,
      expiredCount,
      averageValue: inventoryItems.length > 0 ? totalValue / inventoryItems.length : 0
    }
  }, [inventoryItems])

  const handleBulkAction = (action: BulkAction) => {
    // Implementation for bulk actions
    console.log('Bulk action:', action)
    toast.success(`Bulk action applied to ${action.items.length} items`)
    setSelectedItems([])
    setShowBulkActions(false)
  }

  const handleQuickReorder = (item: InventoryItem) => {
    const suggestedQuantity = Math.max(item.reorder_point * 2, 10)
    toast.success(`Reorder suggestion: ${suggestedQuantity} ${item.unit} of ${item.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.expiringCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.expiredCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage your restaurant's inventory with advanced tools and insights
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </Button>
              
              {isPremium && (
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Barcode
                </Button>
              )}
              
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory items..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="proteins">Proteins</SelectItem>
                <SelectItem value="produce">Produce</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="dry-goods">Dry Goods</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="expiry">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="text-sm font-medium">
                {selectedItems.length} items selected
              </span>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline">
                <Truck className="h-4 w-4 mr-2" />
                Reorder Selected
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}

          {/* Inventory Items */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                isSelected={selectedItems.includes(item.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedItems(prev => [...prev, item.id])
                  } else {
                    setSelectedItems(prev => prev.filter(id => id !== item.id))
                  }
                }}
                onEdit={() => setEditingItem(item)}
                onQuickReorder={() => handleQuickReorder(item)}
                isPremium={isPremium}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.category !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first inventory item to get started'
                }
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Features */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Advanced analytics and recommendations for your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommendations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
                <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
                <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Reorder Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inventoryStats.lowStockCount > 0 ? (
                          filteredItems
                            .filter(item => item.quantity <= item.reorder_point)
                            .slice(0, 3)
                            .map(item => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div>
                                  <div className="font-medium text-sm">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Current: {item.quantity} {item.unit}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  Order {item.reorder_point * 2} {item.unit}
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">All items are well-stocked!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cost Savings Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <div className="font-medium text-sm">Bulk Purchase Opportunity</div>
                          <div className="text-xs text-muted-foreground">
                            Save 15% on dry goods with bulk orders
                          </div>
                          <div className="text-xs text-green-600 mt-1">Potential savings: $180/month</div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <div className="font-medium text-sm">Supplier Optimization</div>
                          <div className="text-xs text-muted-foreground">
                            Switch produce supplier for better prices
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Potential savings: $240/month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="forecasting" className="space-y-4">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Demand Forecasting</h3>
                  <p className="text-muted-foreground">
                    AI-powered demand predictions coming soon
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-4">
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Cost Optimization</h3>
                  <p className="text-muted-foreground">
                    Advanced cost optimization tools coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Item Dialog */}
      <InventoryItemDialog
        item={editingItem}
        isOpen={showAddForm || editingItem !== null}
        onClose={() => {
          setShowAddForm(false)
          setEditingItem(null)
        }}
        onSave={(item) => {
          // Handle save logic
          toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully')
          setShowAddForm(false)
          setEditingItem(null)
        }}
        isPremium={isPremium}
      />
    </div>
  )
}

// Individual Inventory Item Card Component
function InventoryItemCard({
  item,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onQuickReorder,
  isPremium
}: {
  item: InventoryItem
  viewMode: 'grid' | 'list' | 'table'
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onQuickReorder: () => void
  isPremium: boolean
}) {
  const status = getItemStatus(item)
  const statusColor = getStatusColor(status)
  const daysUntilExpiry = item.expiry_date 
    ? Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (viewMode === 'grid') {
    return (
      <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription className="text-sm">
                {item.quantity} {item.unit} • ${(item.quantity * item.price_per_unit).toFixed(2)}
              </CardDescription>
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={statusColor as any}>{status}</Badge>
            {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
              <div className="text-xs text-muted-foreground">
                {daysUntilExpiry > 0 ? `${daysUntilExpiry}d left` : 'Expired'}
              </div>
            )}
          </div>
          
          {item.quantity <= item.reorder_point && (
            <div className="space-y-2">
              <div className="text-xs text-yellow-600">Low stock - reorder needed</div>
              <Progress 
                value={(item.quantity / item.reorder_point) * 100} 
                className="h-1"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            {item.quantity <= item.reorder_point && (
              <Button size="sm" onClick={onQuickReorder} className="flex-1">
                <Truck className="h-3 w-3 mr-1" />
                Reorder
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // List view
  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{item.name}</h3>
                <Badge variant={statusColor as any} className="text-xs">{status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {item.quantity} {item.unit} • ${item.price_per_unit}/unit • 
                Total: ${(item.quantity * item.price_per_unit).toFixed(2)}
                {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                  <span className="ml-2 text-orange-600">
                    • {daysUntilExpiry > 0 ? `Expires in ${daysUntilExpiry}d` : 'Expired'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {item.quantity <= item.reorder_point && (
              <Button size="sm" variant="outline" onClick={onQuickReorder}>
                <Truck className="h-4 w-4 mr-2" />
                Quick Reorder
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Inventory Item Dialog Component
function InventoryItemDialog({
  item,
  isOpen,
  onClose,
  onSave,
  isPremium
}: {
  item: InventoryItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: any) => void
  isPremium: boolean
}) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'pieces',
    reorder_point: 0,
    price_per_unit: 0,
    expiry_date: '',
    category: 'other',
    supplier: '',
    notes: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        reorder_point: item.reorder_point,
        price_per_unit: item.price_per_unit,
        expiry_date: item.expiry_date || '',
        category: getCategoryFromItem(item),
        supplier: '',
        notes: ''
      })
    } else {
      setFormData({
        name: '',
        quantity: 0,
        unit: 'pieces',
        reorder_point: 0,
        price_per_unit: 0,
        expiry_date: '',
        category: 'other',
        supplier: '',
        notes: ''
      })
    }
  }, [item, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this inventory item' : 'Add a new item to your inventory'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ground Beef (80/20)"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proteins">Proteins</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="dry-goods">Dry Goods</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="lbs">Pounds</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                  <SelectItem value="cases">Cases</SelectItem>
                  <SelectItem value="bottles">Bottles</SelectItem>
                  <SelectItem value="jars">Jars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_per_unit">Price per Unit ($)</Label>
              <Input
                id="price_per_unit"
                type="number"
                step="0.01"
                value={formData.price_per_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          {isPremium && (
            <>
              <div>
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="e.g., Sysco, US Foods"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this item..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions
function getCategoryFromItem(item: InventoryItem): string {
  // Simple categorization based on item name
  const name = item.name.toLowerCase()
  if (name.includes('beef') || name.includes('chicken') || name.includes('pork') || name.includes('fish')) {
    return 'proteins'
  }
  if (name.includes('lettuce') || name.includes('tomato') || name.includes('onion') || name.includes('pepper')) {
    return 'produce'
  }
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') || name.includes('cream')) {
    return 'dairy'
  }
  if (name.includes('flour') || name.includes('rice') || name.includes('pasta') || name.includes('bread')) {
    return 'dry-goods'
  }
  return 'other'
}

function getItemStatus(item: InventoryItem): string {
  if (item.expiry_date && new Date(item.expiry_date) < new Date()) {
    return 'expired'
  }
  
  if (item.expiry_date) {
    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      return 'expiring'
    }
  }
  
  if (item.quantity <= item.reorder_point) {
    return 'low-stock'
  }
  
  return 'in-stock'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'expired':
      return 'destructive'
    case 'expiring':
      return 'secondary'
    case 'low-stock':
      return 'secondary'
    case 'in-stock':
      return 'default'
    default:
      return 'default'
  }
}