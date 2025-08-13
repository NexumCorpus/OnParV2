'use client'

import { useState, useEffect } from 'react'
import { ModernCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/modern-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { MetricCard } from '@/components/ui/metric-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  const wasteReductionItems = inventoryItems.filter(item => item.wasteReduction)
  const totalWasteReduction = wasteReductionItems.length > 0 
    ? wasteReductionItems.reduce((sum, item) => sum + (item.wasteReduction || 0), 0) / wasteReductionItems.length
    : 0

  return (
    <div className="space-y-8">
      {/* Modern Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          subtitle="Current stock value"
          icon={DollarSign}
          gradient="green"
        />

        <MetricCard
          title="Items Need Attention"
          value={lowStockCount + expiringCount}
          subtitle={`${lowStockCount} low stock, ${expiringCount} expiring`}
          icon={AlertTriangle}
          gradient="orange"
        />

        <MetricCard
          title="Avg Waste Reduction"
          value={`${totalWasteReduction.toFixed(1)}%`}
          subtitle="Since using OnPar"
          icon={TrendingDown}
          gradient="blue"
        />

        <MetricCard
          title="Items Tracked"
          value={inventoryItems.length}
          subtitle={`Across ${categories.length - 1} categories`}
          icon={Package}
          gradient="purple"
        />
          gradient="blue"
        />

        <MetricCard
          title="Items Tracked"
          value={inventoryItems.length}
          subtitle={`Across ${categories.length - 1} categories`}
          icon={Package}
          gradient="purple"
        />
      </div>

      {/* Modern Inventory Interface */}
      <ModernCard gradient="blue" glow>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Smart Inventory Hub
                </span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1">
                  AI-POWERED
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Intelligent inventory tracking with real-time waste reduction insights
              </CardDescription>
            </div>
            <div className="flex space-x-3">
              <GradientButton variant="info" size="md">
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </GradientButton>
              <GradientButton variant="primary" size="md" onClick={() => setShowAddItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </GradientButton>
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

          {/* Modern Inventory Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ModernCard 
                key={item.id} 
                gradient={
                  item.status === 'good' ? 'green' : 
                  item.status === 'low' ? 'orange' : 
                  item.status === 'expiring' ? 'pink' : 'cyan'
                }
                className="group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{item.category}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`text-xs font-semibold ${getStatusColor(item.status)} shadow-sm`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                    </div>
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