'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  TrendingDown,
  Smartphone,
  Scan,
  DollarSign,
  Target,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Truck,
  Star
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  reorderPoint: number
  pricePerUnit: number
  expiryDate?: string
  category: string
  supplier: string
  lastUpdated: string
  status: 'good' | 'low' | 'expiring' | 'critical'
  wasteReduction?: number
}

export function BetaInventoryManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddItem, setShowAddItem] = useState(false)

  // Beta demo data showing clear value
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Roma Tomatoes',
      quantity: 25,
      unit: 'lbs',
      reorderPoint: 30,
      pricePerUnit: 2.50,
      expiryDate: '2025-08-15',
      category: 'Produce',
      supplier: 'Fresh Farm Co',
      lastUpdated: '2 hours ago',
      status: 'low',
      wasteReduction: 15
    },
    {
      id: '2',
      name: 'Mozzarella Cheese',
      quantity: 8,
      unit: 'lbs',
      reorderPoint: 10,
      pricePerUnit: 4.25,
      expiryDate: '2025-08-16',
      category: 'Dairy',
      supplier: 'Dairy Direct',
      lastUpdated: '4 hours ago',
      status: 'expiring',
      wasteReduction: 22
    },
    {
      id: '3',
      name: 'Pizza Flour',
      quantity: 150,
      unit: 'lbs',
      reorderPoint: 50,
      pricePerUnit: 0.85,
      category: 'Dry Goods',
      supplier: 'Grain Supply Co',
      lastUpdated: '1 day ago',
      status: 'good'
    },
    {
      id: '4',
      name: 'Olive Oil',
      quantity: 3,
      unit: 'gallons',
      reorderPoint: 5,
      pricePerUnit: 12.00,
      category: 'Oils & Condiments',
      supplier: 'Mediterranean Imports',
      lastUpdated: '6 hours ago',
      status: 'critical',
      wasteReduction: 8
    },
    {
      id: '5',
      name: 'Fresh Basil',
      quantity: 12,
      unit: 'bunches',
      reorderPoint: 15,
      pricePerUnit: 1.75,
      expiryDate: '2025-08-14',
      category: 'Herbs',
      supplier: 'Local Herbs',
      lastUpdated: '3 hours ago',
      status: 'expiring',
      wasteReduction: 35
    }
  ])

  const categories = ['all', 'Produce', 'Dairy', 'Dry Goods', 'Oils & Condiments', 'Herbs', 'Meat', 'Seafood']

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200'
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'expiring': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'low': return <Package className="h-4 w-4" />
      case 'expiring': return <Clock className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0)
  const lowStockCount = inventoryItems.filter(item => item.status === 'low' || item.status === 'critical').length
  const expiringCount = inventoryItems.filter(item => item.status === 'expiring').length
  const totalWasteReduction = inventoryItems
    .filter(item => item.wasteReduction)
    .reduce((sum, item) => sum + (item.wasteReduction || 0), 0) / inventoryItems.filter(item => item.wasteReduction).length

  return (
    <div className="space-y-6">
      {/* Beta Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Value</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Need Attention</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {lowStockCount + expiringCount}
                </p>
                <p className="text-xs text-orange-600">
                  {lowStockCount} low, {expiringCount} expiring
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Avg Waste Reduction</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {totalWasteReduction.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600">Since using OnPar</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Items Tracked</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {inventoryItems.length}
                </p>
                <p className="text-xs text-purple-600">Across {categories.length - 1} categories</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Interface */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Smart Inventory Management</span>
                <Badge className="bg-blue-100 text-blue-800">BETA</Badge>
              </CardTitle>
              <CardDescription>
                AI-powered inventory tracking with waste reduction insights
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
              <Button size="sm" onClick={() => setShowAddItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === 'all' ? 'All Items' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Inventory Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Quantity and Reorder Point */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Stock Level</span>
                        <span className="text-sm font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(item.quantity / (item.reorderPoint * 2)) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Reorder at {item.reorderPoint} {item.unit}
                      </p>
                    </div>

                    {/* Value and Expiry */}
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Value</p>
                        <p className="font-medium">
                          ${(item.quantity * item.pricePerUnit).toFixed(2)}
                        </p>
                      </div>
                      {item.expiryDate && (
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Expires</p>
                          <p className="font-medium text-xs">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Waste Reduction Badge */}
                    {item.wasteReduction && (
                      <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-700 dark:text-green-300">
                            Waste Reduced
                          </span>
                          <span className="text-sm font-bold text-green-800 dark:text-green-200">
                            -{item.wasteReduction}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Update
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Reorder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile-Optimized Quick Actions */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Quick Actions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex flex-col items-center justify-center">
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Item</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex flex-col items-center justify-center">
                <Scan className="h-5 w-5 mb-1" />
                <span className="text-xs">Scan</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex flex-col items-center justify-center">
                <AlertTriangle className="h-5 w-5 mb-1" />
                <span className="text-xs">Alerts</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex flex-col items-center justify-center">
                <Truck className="h-5 w-5 mb-1" />
                <span className="text-xs">Reorder</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Feedback Section */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                How's your beta experience?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Your feedback helps us build the perfect inventory system for restaurants
              </p>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Share Feedback
                </Button>
                <Button variant="outline" size="sm">
                  Schedule Call
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}