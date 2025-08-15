'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  Calendar,
  BarChart3,
  Target,
  Award,
  Zap,
  Users,
  Building,
  CreditCard,
  ShoppingCart,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  category: string
  rating: number
  reliability_score: number
  avg_delivery_time: number
  payment_terms: string
  minimum_order: number
  delivery_fee: number
  notes: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  last_order_date?: string
  total_orders: number
  total_spent: number
}

interface SupplierOrder {
  id: string
  supplier_id: string
  order_date: string
  delivery_date?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  items: OrderItem[]
  notes?: string
}

interface OrderItem {
  inventory_item_id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

import { UserProfile, SupplierFormData, OrderItem } from '../../types'

interface SupplierManagerProps {
  isPremium: boolean
  userProfile: UserProfile
}

export function SupplierManager({ isPremium, userProfile }: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)

  // Load sample data on mount
  useEffect(() => {
    setSuppliers(getSampleSuppliers())
    setOrders(getSampleOrders())
  }, [])

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || supplier.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [suppliers, searchTerm, selectedCategory, selectedStatus])

  // Calculate supplier analytics
  const supplierAnalytics = useMemo(() => {
    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length
    const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers || 0
    const totalSpent = suppliers.reduce((sum, s) => sum + s.total_spent, 0)
    const avgDeliveryTime = suppliers.reduce((sum, s) => sum + s.avg_delivery_time, 0) / totalSuppliers || 0
    const topPerformers = suppliers.filter(s => s.rating >= 4.5 && s.reliability_score >= 90).length

    return {
      totalSuppliers,
      activeSuppliers,
      avgRating,
      totalSpent,
      avgDeliveryTime,
      topPerformers
    }
  }, [suppliers])

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setShowAddSupplier(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowAddSupplier(true)
  }

  const handleSaveSupplier = (supplierData: SupplierFormData) => {
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...supplierData } : s))
      toast.success('Supplier updated successfully')
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...supplierData,
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString()
      }
      setSuppliers(prev => [...prev, newSupplier])
      toast.success('Supplier added successfully')
    }
    setShowAddSupplier(false)
    setEditingSupplier(null)
  }

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId))
    toast.success('Supplier deleted successfully')
  }

  const handleCreateOrder = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowOrderDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{supplierAnalytics.totalSuppliers}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{supplierAnalytics.activeSuppliers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{supplierAnalytics.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${supplierAnalytics.totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Delivery</p>
                <p className="text-2xl font-bold">{supplierAnalytics.avgDeliveryTime.toFixed(1)}d</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold text-blue-600">{supplierAnalytics.topPerformers}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Supplier Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Manage your restaurant's suppliers and track performance
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {isPremium && (
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              )}
              <Button onClick={handleAddSupplier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
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
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="produce">Produce</SelectItem>
                <SelectItem value="proteins">Proteins</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="dry-goods">Dry Goods</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onEdit={() => handleEditSupplier(supplier)}
                onDelete={() => handleDeleteSupplier(supplier.id)}
                onCreateOrder={() => handleCreateOrder(supplier)}
                isPremium={isPremium}
              />
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first supplier to get started'
                }
              </p>
              <Button onClick={handleAddSupplier}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Supplier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Supplier Analytics */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Supplier Performance Analytics
            </CardTitle>
            <CardDescription>
              Advanced insights to optimize your supplier relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Performing Suppliers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {suppliers
                          .sort((a, b) => (b.rating * b.reliability_score) - (a.rating * a.reliability_score))
                          .slice(0, 5)
                          .map((supplier, index) => (
                            <div key={supplier.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{supplier.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {supplier.category}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {supplier.rating.toFixed(1)} ★
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {supplier.reliability_score}% reliable
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Delivery Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {suppliers.slice(0, 5).map((supplier) => (
                          <div key={supplier.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{supplier.name}</span>
                              <span>{supplier.avg_delivery_time}d avg</span>
                            </div>
                            <Progress 
                              value={Math.max(0, 100 - (supplier.avg_delivery_time * 10))} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cost-analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cost Breakdown by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['produce', 'proteins', 'dairy', 'dry-goods'].map((category) => {
                          const categorySuppliers = suppliers.filter(s => s.category === category)
                          const categorySpend = categorySuppliers.reduce((sum, s) => sum + s.total_spent, 0)
                          const percentage = (categorySpend / supplierAnalytics.totalSpent) * 100
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{category}</span>
                                <span>${categorySpend.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cost Optimization Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="font-medium text-sm">Bulk Purchase Savings</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Consolidate orders with top 3 suppliers for 8% savings
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Potential savings: $240/month</div>
                        </div>
                        <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                          <div className="font-medium text-sm">Payment Terms Optimization</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Negotiate better terms with high-volume suppliers
                          </div>
                          <div className="text-xs text-green-600 mt-1">Potential savings: $180/month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI-Powered Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                          <div className="flex items-start gap-3">
                            <Target className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                              <div className="font-medium text-sm">Supplier Diversification</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                You're 70% dependent on your top 2 suppliers. Consider adding backup suppliers for critical items.
                              </div>
                              <div className="text-xs text-blue-600 mt-2">Risk reduction: High priority</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                            <div>
                              <div className="font-medium text-sm">Performance Improvement</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Acme Foods has improved delivery times by 25% this quarter. Consider increasing order volume.
                              </div>
                              <div className="text-xs text-green-600 mt-2">Opportunity: Medium priority</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                            <div>
                              <div className="font-medium text-sm">Contract Review</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                3 supplier contracts expire next month. Schedule reviews to negotiate better terms.
                              </div>
                              <div className="text-xs text-yellow-600 mt-2">Action required: High priority</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Supplier Dialog */}
      <SupplierDialog
        supplier={editingSupplier}
        isOpen={showAddSupplier}
        onClose={() => {
          setShowAddSupplier(false)
          setEditingSupplier(null)
        }}
        onSave={handleSaveSupplier}
        isPremium={isPremium}
      />

      {/* Order Dialog */}
      <OrderDialog
        supplier={selectedSupplier}
        isOpen={showOrderDialog}
        onClose={() => {
          setShowOrderDialog(false)
          setSelectedSupplier(null)
        }}
        onSave={(orderData) => {
          // Handle order creation
          toast.success('Order created successfully')
          setShowOrderDialog(false)
          setSelectedSupplier(null)
        }}
        isPremium={isPremium}
      />
    </div>
  )
}

// Supplier Card Component
function SupplierCard({
  supplier,
  onEdit,
  onDelete,
  onCreateOrder,
  isPremium
}: {
  supplier: Supplier
  onEdit: () => void
  onDelete: () => void
  onCreateOrder: () => void
  isPremium: boolean
}) {
  const statusColor = supplier.status === 'active' ? 'default' : 
                     supplier.status === 'inactive' ? 'secondary' : 'destructive'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{supplier.name}</CardTitle>
            <CardDescription className="text-sm">
              {supplier.contact_person} • {supplier.category}
            </CardDescription>
          </div>
          <Badge variant={statusColor as any} className="text-xs">
            {supplier.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{supplier.city}, {supplier.state}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Rating</div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="font-medium">{supplier.rating.toFixed(1)}</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Reliability</div>
            <div className="font-medium">{supplier.reliability_score}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Orders</div>
            <div className="font-medium">{supplier.total_orders}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Spent</div>
            <div className="font-medium">${supplier.total_spent.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" onClick={onCreateOrder} className="flex-1">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Order
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Supplier Dialog Component
function SupplierDialog({
  supplier,
  isOpen,
  onClose,
  onSave,
  isPremium
}: {
  supplier: Supplier | null
  isOpen: boolean
  onClose: () => void
  onSave: (supplier: any) => void
  isPremium: boolean
}) {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    category: 'produce',
    rating: 5,
    reliability_score: 95,
    avg_delivery_time: 2,
    payment_terms: 'Net 30',
    minimum_order: 0,
    delivery_fee: 0,
    notes: '',
    status: 'active' as 'active' | 'inactive' | 'pending'
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zip: supplier.zip,
        category: supplier.category,
        rating: supplier.rating,
        reliability_score: supplier.reliability_score,
        avg_delivery_time: supplier.avg_delivery_time,
        payment_terms: supplier.payment_terms,
        minimum_order: supplier.minimum_order,
        delivery_fee: supplier.delivery_fee,
        notes: supplier.notes,
        status: supplier.status
      })
    } else {
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        category: 'produce',
        rating: 5,
        reliability_score: 95,
        avg_delivery_time: 2,
        payment_terms: 'Net 30',
        minimum_order: 0,
        delivery_fee: 0,
        notes: '',
        status: 'active'
      })
    }
  }, [supplier, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
          <DialogDescription>
            {supplier ? 'Update supplier information' : 'Add a new supplier to your network'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Acme Foods"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="e.g., John Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@acmefoods.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Charleston"
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="SC"
              />
            </div>
            
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                placeholder="29401"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="proteins">Proteins</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="dry-goods">Dry Goods</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select value={formData.payment_terms} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="COD">Cash on Delivery</SelectItem>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="avg_delivery_time">Avg Delivery Time (days)</Label>
              <Input
                id="avg_delivery_time"
                type="number"
                value={formData.avg_delivery_time}
                onChange={(e) => setFormData(prev => ({ ...prev, avg_delivery_time: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_order">Minimum Order ($)</Label>
              <Input
                id="minimum_order"
                type="number"
                step="0.01"
                value={formData.minimum_order}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_order: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                value={formData.delivery_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this supplier..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {supplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Order Dialog Component
function OrderDialog({
  supplier,
  isOpen,
  onClose,
  onSave,
  isPremium
}: {
  supplier: Supplier | null
  isOpen: boolean
  onClose: () => void
  onSave: (order: any) => void
  isPremium: boolean
}) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState('')

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0)

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, {
      inventory_item_id: '',
      name: '',
      quantity: 0,
      unit: 'pieces',
      unit_price: 0,
      total_price: 0
    }])
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_price = updated.quantity * updated.unit_price
        }
        return updated
      }
      return item
    }))
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const orderData = {
      supplier_id: supplier?.id,
      order_date: new Date().toISOString(),
      status: 'pending',
      total_amount: totalAmount,
      items: orderItems,
      notes
    }
    
    onSave(orderData)
  }

  if (!supplier) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order - {supplier.name}</DialogTitle>
          <DialogDescription>
            Create a new purchase order for {supplier.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end">
                  <div>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Select 
                      value={item.unit} 
                      onValueChange={(value) => updateOrderItem(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="cases">Cases</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Input
                      value={`$${item.total_price.toFixed(2)}`}
                      disabled
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Fee</div>
                  <div className="text-lg font-semibold">${supplier.delivery_fee.toFixed(2)}</div>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-xl font-bold">${(totalAmount + supplier.delivery_fee).toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions or notes for this order..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={orderItems.length === 0}>
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Sample data functions
function getSampleSuppliers(): Supplier[] {
  return [
    {
      id: '1',
      name: 'Acme Foods Distribution',
      contact_person: 'John Smith',
      email: 'john@acmefoods.com',
      phone: '(843) 555-0123',
      address: '123 Industrial Blvd',
      city: 'Charleston',
      state: 'SC',
      zip: '29401',
      category: 'produce',
      rating: 4.8,
      reliability_score: 95,
      avg_delivery_time: 1,
      payment_terms: 'Net 30',
      minimum_order: 250,
      delivery_fee: 25,
      notes: 'Excellent produce quality, always on time',
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      last_order_date: '2025-01-10T00:00:00Z',
      total_orders: 45,
      total_spent: 12500
    },
    {
      id: '2',
      name: 'Charleston Meat Co.',
      contact_person: 'Sarah Johnson',
      email: 'sarah@charlestonmeat.com',
      phone: '(843) 555-0456',
      address: '456 Market Street',
      city: 'Charleston',
      state: 'SC',
      zip: '29403',
      category: 'proteins',
      rating: 4.6,
      reliability_score: 88,
      avg_delivery_time: 2,
      payment_terms: 'Net 15',
      minimum_order: 500,
      delivery_fee: 35,
      notes: 'Premium quality meats, slightly higher prices',
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      last_order_date: '2025-01-08T00:00:00Z',
      total_orders: 32,
      total_spent: 18750
    },
    {
      id: '3',
      name: 'Lowcountry Dairy',
      contact_person: 'Mike Wilson',
      email: 'mike@lowcountrydairy.com',
      phone: '(843) 555-0789',
      address: '789 Farm Road',
      city: 'Mount Pleasant',
      state: 'SC',
      zip: '29464',
      category: 'dairy',
      rating: 4.9,
      reliability_score: 97,
      avg_delivery_time: 1,
      payment_terms: 'Net 30',
      minimum_order: 150,
      delivery_fee: 15,
      notes: 'Local dairy, excellent freshness',
      status: 'active',
      created_at: '2024-01-20T00:00:00Z',
      last_order_date: '2025-01-12T00:00:00Z',
      total_orders: 28,
      total_spent: 8900
    }
  ]
}

function getSampleOrders(): SupplierOrder[] {
  return [
    {
      id: '1',
      supplier_id: '1',
      order_date: '2025-01-10T00:00:00Z',
      delivery_date: '2025-01-11T00:00:00Z',
      status: 'delivered',
      total_amount: 485.50,
      items: [
        { inventory_item_id: '1', name: 'Roma Tomatoes', quantity: 20, unit: 'lbs', unit_price: 2.99, total_price: 59.80 },
        { inventory_item_id: '2', name: 'Lettuce Mix', quantity: 15, unit: 'lbs', unit_price: 1.89, total_price: 28.35 }
      ],
      notes: 'Regular weekly produce order'
    }
  ]
}