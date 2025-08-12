'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { getCurrentUser } from '@/lib/auth'
import { getInventoryItems } from '@/lib/inventory'
import { getMenuItems } from '@/lib/menu'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ChefHat, Zap } from 'lucide-react'
import Link from 'next/link'

// Dynamic imports for chart components to prevent SSR issues
const InventoryValueChart = dynamic(() => import('@/components/analytics/inventory-value-chart').then(mod => ({ default: mod.InventoryValueChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg"></div>
})

const WasteReductionChart = dynamic(() => import('@/components/analytics/waste-reduction-chart').then(mod => ({ default: mod.WasteReductionChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg"></div>
})

const MenuPerformanceChart = dynamic(() => import('@/components/analytics/menu-performance-chart').then(mod => ({ default: mod.MenuPerformanceChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg"></div>
})

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured - running in demo mode')
        setLoading(false)
        return
      }

      const { user: authUser } = await getCurrentUser()
      if (!authUser) {
        router.push('/auth')
        return
      }

      setUser(authUser)
      await loadUserData(authUser.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) {
        // Use demo data for analytics
        setInventoryItems([])
        setMenuItems([])
        return
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      setUserProfile(profile)

      // Load inventory and menu items
      const [inventoryResult, menuResult] = await Promise.all([
        getInventoryItems(userId),
        getMenuItems(userId)
      ])

      setInventoryItems(inventoryResult.data || [])
      setMenuItems(menuResult.data || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics data
  const totalInventoryValue = inventoryItems.reduce((sum: number, item: InventoryItem) => 
    sum + (item.quantity * item.price_per_unit), 0)
  
  const lowStockItems = inventoryItems.filter((item: InventoryItem) => 
    item.quantity < item.reorder_point)
  
  const avgWastePercentage = menuItems.length > 0 
    ? menuItems.reduce((sum: number, item: MenuItem) => sum + item.waste_percentage, 0) / menuItems.length
    : 0

  const topPerformingItems = menuItems
    .sort((a: MenuItem, b: MenuItem) => b.sales_percentage - a.sales_percentage)
    .slice(0, 5)

  const highWasteItems = menuItems
    .filter((item: MenuItem) => item.waste_percentage > avgWastePercentage)
    .sort((a: MenuItem, b: MenuItem) => b.waste_percentage - a.waste_percentage)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has premium access
  // Note: Analytics is available to all users during beta

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground leading-relaxed">
                Performance metrics and insights for {userProfile?.restaurant_name || 'your restaurant'}
              </p>
            </div>
            {userProfile?.premium_subscription && (
              <Badge variant="default" className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Current stock value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Need reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Waste</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{avgWastePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Across all menu items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems.length}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Being tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InventoryValueChart items={inventoryItems} />
          <WasteReductionChart menuItems={menuItems} />
        </div>

        {/* Menu Performance Chart */}
        <div className="mb-8">
          <MenuPerformanceChart menuItems={menuItems} />
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Top Performing Menu Items
              </CardTitle>
              <CardDescription>Highest sales percentage items</CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformingItems.length > 0 ? (
                <div className="space-y-3">
                  {topPerformingItems.map((item: MenuItem, index: number) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">#{index + 1} performer</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{item.sales_percentage}%</p>
                        <p className="text-xs text-muted-foreground">sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No menu items to analyze yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                High Waste Items
              </CardTitle>
              <CardDescription>Items with above-average waste</CardDescription>
            </CardHeader>
            <CardContent>
              {highWasteItems.length > 0 ? (
                <div className="space-y-3">
                  {highWasteItems.map((item: MenuItem, index: number) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Needs attention</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{item.waste_percentage}%</p>
                        <p className="text-xs text-muted-foreground">waste</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Great! No items with high waste detected.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Future Features Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm text-center leading-relaxed max-w-2xl mx-auto">
                Predictive ordering, supplier performance tracking, custom reports, 
                and advanced forecasting features are in development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}