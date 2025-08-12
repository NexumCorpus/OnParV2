'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { RecipeForm } from '@/components/dashboard/recipe-form'
import { RecipeList } from '@/components/dashboard/recipe-list'
import { getCurrentUser } from '@/lib/auth'
import { getRecipes } from '@/lib/recipes'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ChefHat, Plus, Search, Filter, TrendingUp, DollarSign, Clock, Target, Star, Award, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function RecipesPage() {
  const [user, setUser] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
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
      await loadRecipes(authUser.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }

  const loadRecipes = async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo data for recipes
        setRecipes([
          {
            id: '1',
            name: 'Margherita Pizza',
            category: 'Pizza',
            cost_per_serving: 4.50,
            selling_price: 16.00,
            profit_margin: 71.9,
            popularity_score: 85,
            waste_percentage: 3.2,
            serving_size: 1,
            difficulty_level: 'medium'
          },
          {
            id: '2',
            name: 'Caesar Salad',
            category: 'Salads',
            cost_per_serving: 3.20,
            selling_price: 12.00,
            profit_margin: 73.3,
            popularity_score: 65,
            waste_percentage: 8.5,
            serving_size: 1,
            difficulty_level: 'easy'
          }
        ])
        return
      }

      const { data, error } = await getRecipes(userId)
      if (error) {
        console.error('Error loading recipes:', error)
        toast.error('Failed to load recipes')
      } else {
        setRecipes(data || [])
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
      toast.error('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const refreshRecipes = () => {
    if (user) {
      loadRecipes(user.id)
    }
  }

  // Calculate analytics
  const totalRecipes = recipes.length
  const avgProfitMargin = recipes.length > 0 
    ? recipes.reduce((sum, recipe) => sum + recipe.profit_margin, 0) / recipes.length
    : 0
  const avgWaste = recipes.length > 0 
    ? recipes.reduce((sum, recipe) => sum + recipe.waste_percentage, 0) / recipes.length
    : 0
  const topPerformer = recipes.reduce((best, recipe) => 
    recipe.popularity_score > (best?.popularity_score || 0) ? recipe : best, null)

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(recipes.map(r => r.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <DashboardNavbar />
        <BreadcrumbNav />
        <div className="container mx-auto p-6">
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center shadow-xl">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Loading your recipes...</h2>
            <p className="text-muted-foreground text-lg">Analyzing cost and profitability data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="fade-in">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    Recipe Management
                  </h1>
                  <p className="text-2xl text-foreground/75 leading-relaxed font-medium mt-3">
                    Cost analysis • Profit optimization • Waste tracking
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 slide-up">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-primary-enhanced px-8 py-4 text-lg font-bold rounded-2xl shadow-xl">
                    <Plus className="h-6 w-6 mr-3" />
                    Add Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">Create New Recipe</DialogTitle>
                  </DialogHeader>
                  <RecipeForm onSuccess={refreshRecipes} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Recipe Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Recipes</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-5xl font-black text-blue-600 mb-3">{totalRecipes}</div>
              <p className="text-base text-muted-foreground font-semibold">Active recipes</p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Profit Margin</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-5xl font-black text-green-600 mb-3">{avgProfitMargin.toFixed(1)}%</div>
              <p className="text-base text-muted-foreground font-semibold">Across all recipes</p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recipe Waste</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-5xl font-black text-orange-600 mb-3">{avgWaste.toFixed(1)}%</div>
              <p className="text-base text-muted-foreground font-semibold">Average waste rate</p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Top Performer</CardTitle>
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-black text-purple-600 mb-1">{topPerformer?.name || 'None'}</div>
              <p className="text-base text-muted-foreground font-semibold">
                {topPerformer ? `${topPerformer.popularity_score}% popularity` : 'Add recipes to see'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 form-input h-12 text-base rounded-xl border-2"
            />
          </div>
          <div className="flex space-x-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={filterCategory === category ? 'default' : 'outline'}
                size="default"
                onClick={() => setFilterCategory(category)}
                className="hover-lift px-4 py-3 font-semibold rounded-xl capitalize"
              >
                {category === 'all' ? 'All' : category} 
                {category === 'all' && ` (${recipes.length})`}
              </Button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <RecipeList recipes={filteredRecipes} onUpdate={refreshRecipes} />

        {/* Recipe Insights */}
        {recipes.length > 0 && (
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800 shadow-xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold text-orange-800 dark:text-orange-200 mb-8">
                  Recipe Performance Insights
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-black text-green-600 mb-2">
                      {recipes.filter(r => r.profit_margin > 70).length}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">High-Profit Recipes</div>
                    <div className="text-xs text-green-600 dark:text-green-400">70%+ margin</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-black text-blue-600 mb-2">
                      {recipes.filter(r => r.popularity_score > 80).length}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Popular Items</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">80%+ popularity</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-black text-red-600 mb-2">
                      {recipes.filter(r => r.waste_percentage > 5).length}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">High-Waste Items</div>
                    <div className="text-xs text-red-600 dark:text-red-400">5%+ waste</div>
                  </div>
                </div>
                
                <p className="text-xl text-orange-700 dark:text-orange-300 leading-relaxed mb-8">
                  Recipe costing helps identify your most profitable dishes and optimization opportunities
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}