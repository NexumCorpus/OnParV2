'use client'

import React, { useState } from 'react'
import { ModernCard, CardContent } from '../ui/modern-card'
import { MetricCard } from '../ui/metric-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  DollarSign,
  TrendingDown
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  pricePerUnit: number
  supplier: string
  expiryDate: string
  reorderPoint: number
  status: 'good' | 'low' | 'expiring' | 'critical'
  wasteReduction?: number
}

export function BetaInventoryManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddItem, setShowAddItem] = useState(false)

  // Beta demo data showing clear value
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Roma Tomatoes',
      quantity: 25,
      unit: 'lbs',
      category: 'Produce',
      pricePerUnit: 3.50,
      supplier: 'Fresh Valley Farms',
      expiryDate: '2024-02-15',
      reorderPoint: 10,
      status: 'good',
      wasteReduction: 15
    },
    {
      id: '2',
      name: 'Mozzarella Cheese',
      quantity: 8,
      unit: 'lbs',
      category: 'Dairy',
      pricePerUnit: 12.00,
      supplier: 'Artisan Dairy Co',
      expiryDate: '2024-02-20',
      reorderPoint: 5,
      status: 'low',
      wasteReduction: 22
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
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'expiring': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
          gradient="purple"
        />
        <MetricCard
          title="Total Items"
          value={inventoryItems.length}
          subtitle="In inventory"
          icon={Package}
          gradient="blue"
        />
      </div>
    </div>
  )
}