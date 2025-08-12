'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { SmartInsights } from '@/components/dashboard/smart-insights'
import { WasteTracker } from '@/components/dashboard/waste-tracker'
import { InventoryOptimizer } from '@/components/dashboard/inventory-optimizer'
import { PredictiveAnalytics } from '@/components/dashboard/predictive-analytics'
import { getCurrentUser, updateUserProfile } from '@/lib/auth'
import { getInventoryItems } from '@/lib/inventory'
import { getMenuItems } from '@/lib/menu'
import { Database } from '@/lib/supabase'
import { SupabaseStatus } from '@/components/ui/supabase-status'
import { logError, logUserAction } from '@/lib/error-logging'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Plus, Package, ChefHat, AlertTriangle, Zap, CreditCard, Settings, TrendingUp, DollarSign, BarChart3, Star, Target, Brain, Lightbulb, Sparkles, Award, Shield, Clock, Users, Bell, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Dynamic imports for dashboard components to prevent SSR issues
const InventoryList = dynamic(() => import('@/components/dashboard/inventory-list').then(mod => ({ default: mod.InventoryList })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const InventoryForm = dynamic(() => import('@/components/dashboard/inventory-form').then(mod => ({ default: mod.InventoryForm })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-32 rounded-lg"></div>
})

const MenuList = dynamic(() => import('@/components/dashboard/menu-list').then(mod => ({ default: mod.MenuList })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const MenuForm = dynamic(() => import('@/components/dashboard/menu-form').then(mod => ({ default: mod.MenuForm })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-32 rounded-lg"></div>
})

const AlertsPanel = dynamic(() => import('@/components/dashboard/alerts-panel').then(mod => ({ default: mod.AlertsPanel })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-32 rounded-lg"></div>
})

const CSVImportDialog = dynamic(() => import('@/components/dashboard/csv-import-dialog').then(mod => ({ default: mod.CSVImportDialog })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-8 w-24 rounded"></div>
})

const RealtimeMetrics = dynamic(() => import('@/components/dashboard/realtime-metrics').then(mod => ({ default: mod.RealtimeMetrics })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-32 rounded-lg"></div>
})

const ComprehensiveAnalytics = dynamic(() => import('@/components/analytics/comprehensive-analytics').then(mod => ({ default: mod.ComprehensiveAnalytics })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const AdvancedInventoryManager = dynamic(() => import('@/components/inventory/advanced-inventory-manager').then(mod => ({ default: mod.AdvancedInventoryManager })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const RecipeManager = dynamic(() => import('@/components/recipes/recipe-manager').then(mod => ({ default: mod.RecipeManager })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const SupplierManager = dynamic(() => import('@/components/suppliers/supplier-manager').then(mod => ({ default: mod.SupplierManager })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const NotificationCenter = dynamic(() => import('@/components/notifications/notification-center').then(mod => ({ default: mod.NotificationCenter })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

const ReportGenerator = dynamic(() => import('@/components/reports/report-generator').then(mod => ({ default: mod.ReportGenerator })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-lg"></div>
})

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [inventoryItems, setInventoryItems] = useState<Database['public']['Tables']['inventory_items']['Row'][]>([])
  const [menuItems, setMenuItems] = useState<Database['public']['Tables']['menu_items']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [wasteGoal, setWasteGoal] = useState(5) // 5% waste reduction goal
  const [currentWasteReduction, setCurrentWasteReduction] = useState(12.3) // Current progress
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    // Cleanup subscriptions on unmount
    return () => {
      realtimeSubscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
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
        logError('User not authenticated', 'dashboard_access')
        router.push('/auth')
        return
      }

      logUserAction('dashboard_accessed', {}, authUser.id)
      setUser(authUser)
      await loadUserData(authUser.id)
    } catch (error) {
      logError(error as Error, 'dashboard_auth_check')
      router.push('/auth')
    }
  }

  // Log user actions for beta analytics
  useEffect(() => {
    if (user) {
      logUserAction('dashboard_page_view', {
        inventoryCount: inventoryItems.length,
        menuCount: menuItems.length,
        isPremium: userProfile?.premium_subscription || false,
        activeTab
      }, user.id)
    }
  }, [user, inventoryItems.length, menuItems.length, userProfile?.premium_subscription, activeTab])

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        // New user, redirect to onboarding
        router.push('/onboarding')
        return
      }

      setUserProfile(profile)

      // Load inventory and menu items
      const [inventoryResult, menuResult] = await Promise.all([
        getInventoryItems(userId),
        getMenuItems(userId)
      ])

      setInventoryItems(inventoryResult.data || [])
      setMenuItems(menuResult.data || [])
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions(userId)
    } catch (error) {
      logError(error as Error, 'dashboard_load_user_data', userId)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = (userId: string) => {
    // Subscribe to inventory changes
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Inventory change detected:', payload)
          refreshInventory()
        }
      )
      .subscribe()

    // Subscribe to menu changes
    const menuSubscription = supabase
      .channel('menu_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Menu change detected:', payload)
          refreshMenu()
        }
      )
      .subscribe()

    setRealtimeSubscriptions([inventorySubscription, menuSubscription])
  }

  const refreshInventory = () => {
    if (user) {
      getInventoryItems(user.id)
        .then(({ data }) => {
          setInventoryItems(data || [])
        })
        .catch((error) => {
          console.error('Error refreshing inventory:', error)
          toast.error('Failed to refresh inventory')
        })
    }
  }

  const refreshMenu = () => {
    if (user) {
      getMenuItems(user.id)
        .then(({ data }) => {
          setMenuItems(data || [])
        })
        .catch((error) => {
          console.error('Error refreshing menu:', error)
          toast.error('Failed to refresh menu')
        })
    }
  }

  const togglePremium = async () => {
    if (!user || !userProfile) {
      logError('User data not available for premium toggle', 'toggle_premium')
      toast.error('User data not available')
      return
    }

    try {
      logUserAction('premium_toggle_attempted', { 
        current_status: userProfile.premium_subscription 
      }, user.id)
      
      const newPremiumStatus = !userProfile.premium_subscription
      const { error } = await updateUserProfile(user.id, {
        premium_subscription: newPremiumStatus
      })

      if (error) {
        logError(error.message, 'toggle_premium', user.id)
        toast.error('Failed to update subscription')
      } else {
        setUserProfile({ ...userProfile, premium_subscription: newPremiumStatus })
        logUserAction('premium_toggled', { new_status: newPremiumStatus }, user.id)
        toast.success(newPremiumStatus ? 'Premium AI features unlocked! 🚀' : 'Switched to basic plan')
      }
    } catch (error) {
      logError(error as Error, 'toggle_premium', user.id)
      toast.error('Failed to update subscription')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <DashboardNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center shadow-xl">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Loading your restaurant dashboard...</h2>
            <p className="text-muted-foreground text-lg">Preparing your inventory insights and analytics</p>
            <div className="mt-8 max-w-md mx-auto">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Analyzing your data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate enhanced metrics
  const totalInventoryValue = inventoryItems.reduce((total: number, item: any) => 
    total + (item.quantity * item.price_per_unit), 0)
  const lowStockItems = inventoryItems.filter((item: any) => item.quantity < item.reorder_point)
  const monthlySpend = totalInventoryValue * 0.3
  const avgWaste = menuItems.length > 0 
    ? menuItems.reduce((sum: number, item: any) => sum + item.waste_percentage, 0) / menuItems.length
    : 0
  const potentialSavings = (totalInventoryValue * (avgWaste / 100) * 0.15) + (lowStockItems.length * 45)
  const wasteGoalProgress = Math.min(100, (currentWasteReduction / wasteGoal) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        <SupabaseStatus />
        
        {/* Enhanced Hero Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="fade-in">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-2xl">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-pulse shadow-lg border-4 border-background flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                    {userProfile?.restaurant_name || 'Your Restaurant'}
                  </h1>
                  <p className="text-2xl text-foreground/75 leading-relaxed font-medium mt-3">
                    Smart inventory management • Waste reduction • Cost optimization
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm font-bold">
                      <Target className="w-4 h-4 mr-2" />
                      {currentWasteReduction.toFixed(1)}% waste reduced
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-bold">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${potentialSavings.toFixed(0)} monthly savings
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 slide-up">
              <div className="flex items-center space-x-4 p-6 rounded-3xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-2 border-orange-200 dark:border-orange-800 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Label htmlFor="premium-toggle" className="font-bold text-lg text-orange-800 dark:text-orange-200">AI Sous-Chef</Label>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Advanced insights & predictions</p>
                </div>
                <Switch
                  id="premium-toggle"
                  checked={userProfile?.premium_subscription || false}
                  onCheckedChange={togglePremium}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-yellow-500 scale-125"
                />
              </div>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="hover-lift px-8 py-4 font-bold text-lg rounded-2xl border-2">
                  <CreditCard className="h-6 w-6 mr-3" />
                  Billing
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg" className="hover-lift px-8 py-4 font-bold text-lg rounded-2xl border-2">
                  <Settings className="h-6 w-6 mr-3" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Waste Reduction Goal Progress */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-2 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Waste Reduction Goal</h3>
                  <p className="text-green-700 dark:text-green-300 text-lg">Target: {wasteGoal}% reduction this quarter</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-green-600 mb-1">{currentWasteReduction.toFixed(1)}%</div>
                  <div className="text-sm text-green-600 font-bold">Current Progress</div>
                </div>
              </div>
              <Progress value={wasteGoalProgress} className="h-4 mb-4" />
              <div className="flex justify-between text-sm text-green-700 dark:text-green-300 font-medium">
                <span>Started: 0%</span>
                <span className="font-bold">Current: {currentWasteReduction.toFixed(1)}%</span>
                <span>Goal: {wasteGoal}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="metric-card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Inventory Value</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-5xl font-black text-green-600 mb-3">${totalInventoryValue.toFixed(2)}</div>
              <p className="text-base text-muted-foreground flex items-center font-semibold">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                +12.3% from last month
              </p>
              <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Optimized ordering saved $234 this month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Critical Alerts</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-5xl font-black text-orange-600 mb-3">{lowStockItems.length}</div>
              <p className="text-base text-muted-foreground font-semibold">Items need reordering</p>
              {lowStockItems.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                    Reorder now to prevent stockouts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="metric-card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Waste Efficiency</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-5xl font-black text-blue-600 mb-3">{(100 - avgWaste).toFixed(1)}%</div>
              <p className="text-base text-muted-foreground font-semibold">Efficiency score</p>
              <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {avgWaste.toFixed(1)}% average waste across menu
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">AI Savings Potential</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-5xl font-black text-purple-600 mb-3">${potentialSavings.toFixed(0)}</div>
              <p className="text-base text-muted-foreground font-semibold">Monthly potential</p>
              {userProfile?.premium_subscription && (
                <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                    AI optimization active
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 p-2 bg-muted/50 rounded-3xl h-16 shadow-lg backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden lg:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <Package className="h-4 w-4" />
                <span className="hidden lg:inline">Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <ChefHat className="h-4 w-4" />
                <span className="hidden lg:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <Star className="h-4 w-4" />
                <span className="hidden lg:inline">Recipes</span>
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <Users className="h-4 w-4" />
                <span className="hidden lg:inline">Suppliers</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden lg:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <Bell className="h-4 w-4" />
                <span className="hidden lg:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm py-3">
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 mt-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <RealtimeMetrics 
                    inventoryItems={inventoryItems}
                    menuItems={menuItems}
                    monthlySpend={monthlySpend}
                    isPremium={userProfile?.premium_subscription || false}
                  />
                  
                  <WasteTracker 
                    menuItems={menuItems}
                    currentReduction={currentWasteReduction}
                    goal={wasteGoal}
                    onGoalChange={setWasteGoal}
                  />
                </div>
                
                <div className="space-y-8">
                  <QuickActions
                    onInventoryAdded={refreshInventory}
                    onMenuAdded={refreshMenu}
                    isPremium={userProfile?.premium_subscription || false}
                  />
                  
                  <AlertsPanel
                    items={inventoryItems}
                    menuItems={menuItems}
                    monthlySpend={monthlySpend}
                    monthlyBudget={userProfile?.monthly_budget}
                    isPremium={userProfile?.premium_subscription || false}
                    userSettings={{
                      low_stock_threshold: userProfile?.low_stock_threshold,
                      expiry_warning_days: userProfile?.expiry_warning_days,
                      budget_warning_threshold: userProfile?.budget_warning_threshold,
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-8 mt-8">
              <AdvancedInventoryManager
                inventoryItems={inventoryItems}
                onItemsChange={setInventoryItems}
                isPremium={userProfile?.premium_subscription || false}
                userProfile={userProfile}
              />
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-8 mt-8">
              <Card className="card-premium shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl font-black flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center shadow-xl">
                        <ChefHat className="h-6 w-6 text-white" />
                      </div>
                      <span>Menu Performance Analytics</span>
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="btn-primary-enhanced px-8 py-4 text-lg font-bold rounded-2xl shadow-xl">
                          <Plus className="h-5 w-5 mr-3" />
                          Add Menu Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-3xl font-bold">Add Menu Item</DialogTitle>
                        </DialogHeader>
                        <MenuForm onSuccess={refreshMenu} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <MenuList items={menuItems} onUpdate={refreshMenu} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recipes Tab */}
            <TabsContent value="recipes" className="space-y-8 mt-8">
              <RecipeManager
                inventoryItems={inventoryItems}
                menuItems={menuItems}
                isPremium={userProfile?.premium_subscription || false}
                userProfile={userProfile}
              />
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="space-y-8 mt-8">
              <SupplierManager
                isPremium={userProfile?.premium_subscription || false}
                userProfile={userProfile}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8 mt-8">
              <ComprehensiveAnalytics
                inventoryItems={inventoryItems}
                menuItems={menuItems}
                userProfile={userProfile}
                isPremium={userProfile?.premium_subscription || false}
              />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-8 mt-8">
              <NotificationCenter
                inventoryItems={inventoryItems}
                menuItems={menuItems}
                userProfile={userProfile}
                isPremium={userProfile?.premium_subscription || false}
              />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-8 mt-8">
              <ReportGenerator
                inventoryItems={inventoryItems}
                menuItems={menuItems}
                userProfile={userProfile}
                isPremium={userProfile?.premium_subscription || false}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Success Metrics Footer */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Your Success This Month</h3>
                <p className="text-xl text-muted-foreground">OnPar is helping you achieve measurable results</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-green-600 mb-2">${potentialSavings.toFixed(0)}</div>
                  <div className="text-sm font-bold text-muted-foreground">Monthly Savings</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-blue-600 mb-2">{currentWasteReduction.toFixed(1)}%</div>
                  <div className="text-sm font-bold text-muted-foreground">Waste Reduced</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-purple-600 mb-2">2.5h</div>
                  <div className="text-sm font-bold text-muted-foreground">Time Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-orange-600 mb-2">A+</div>
                  <div className="text-sm font-bold text-muted-foreground">Efficiency Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}