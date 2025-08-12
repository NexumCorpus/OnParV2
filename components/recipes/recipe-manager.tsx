'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChefHat, 
  Plus, 
  Search, 
  Clock, 
  Users, 
  DollarSign,
  Calculator,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Lightbulb,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface Recipe {
  id: string
  name: string
  description: string
  category: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: RecipeIngredient[]
  instructions: string[]
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface RecipeIngredient {
  inventory_item_id: string
  name: string
  quantity: number
  unit: string
  cost: number
  notes?: string
}

interface RecipeManagerProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  isPremium: boolean
  userProfile: any
}

export function RecipeManager({ 
  inventoryItems, 
  menuItems, 
  isPremium,
  userProfile 
}: RecipeManagerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Load sample recipes on mount
  useEffect(() => {
    setRecipes(getSampleRecipes())
  }, [])

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'cost':
          return a.cost_per_serving - b.cost_per_serving
        case 'profit':
          return b.profit_margin - a.profit_margin
        case 'popularity':
          return b.popularity_score - a.popularity_score
        default:
          return 0
      }
    })

    return filtered
  }, [recipes, searchTerm, selectedCategory, sortBy])

  // Calculate recipe analytics
  const recipeAnalytics = useMemo(() => {
    const totalRecipes = recipes.length
    const avgCostPerServing = recipes.reduce((sum, r) => sum + r.cost_per_serving, 0) / totalRecipes || 0
    const avgProfitMargin = recipes.reduce((sum, r) => sum + r.profit_margin, 0) / totalRecipes || 0
    const highProfitRecipes = recipes.filter(r => r.profit_margin > 60).length
    const lowCostRecipes = recipes.filter(r => r.cost_per_serving < 5).length
    const popularRecipes = recipes.filter(r => r.popularity_score > 80).length

    return {
      totalRecipes,
      avgCostPerServing,
      avgProfitMargin,
      highProfitRecipes,
      lowCostRecipes,
      popularRecipes
    }
  }, [recipes])

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setShowAddRecipe(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowAddRecipe(true)
  }

  const handleSaveRecipe = (recipeData: any) => {
    if (editingRecipe) {
      setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? { ...r, ...recipeData } : r))
      toast.success('Recipe updated successfully')
    } else {
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        ...recipeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setRecipes(prev => [...prev, newRecipe])
      toast.success('Recipe added successfully')
    }
    setShowAddRecipe(false)
    setEditingRecipe(null)
  }

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId))
    toast.success('Recipe deleted successfully')
  }

  const calculateRecipeCost = (ingredients: RecipeIngredient[]): number => {
    return ingredients.reduce((total, ingredient) => total + ingredient.cost, 0)
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipes</p>
                <p className="text-2xl font-bold">{recipeAnalytics.totalRecipes}</p>
              </div>
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cost/Serving</p>
                <p className="text-2xl font-bold">${recipeAnalytics.avgCostPerServing.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">{recipeAnalytics.avgProfitMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Profit</p>
                <p className="text-2xl font-bold text-blue-600">{recipeAnalytics.highProfitRecipes}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Cost</p>
                <p className="text-2xl font-bold text-purple-600">{recipeAnalytics.lowCostRecipes}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Popular</p>
                <p className="text-2xl font-bold text-orange-600">{recipeAnalytics.popularRecipes}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Recipe Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Recipe Management</CardTitle>
              <CardDescription>
                Manage recipes, calculate costs, and optimize profitability
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {isPremium && (
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Recipes
                </Button>
              )}
              <Button onClick={handleAddRecipe}>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
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
                  placeholder="Search recipes..."
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
                <SelectItem value="appetizers">Appetizers</SelectItem>
                <SelectItem value="mains">Main Courses</SelectItem>
                <SelectItem value="sides">Sides</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="cost">Cost per Serving</SelectItem>
                <SelectItem value="profit">Profit Margin</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => handleEditRecipe(recipe)}
                onDelete={() => handleDeleteRecipe(recipe.id)}
                onView={() => setSelectedRecipe(recipe)}
                isPremium={isPremium}
              />
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first recipe to get started'
                }
              </p>
              <Button onClick={handleAddRecipe}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Recipe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Recipe Analytics */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recipe Analytics & Optimization
            </CardTitle>
            <CardDescription>
              Advanced insights to optimize your menu profitability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profitability" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profitability">Profitability Analysis</TabsTrigger>
                <TabsTrigger value="cost-optimization">Cost Optimization</TabsTrigger>
                <TabsTrigger value="menu-engineering">Menu Engineering</TabsTrigger>
              </TabsList>

              <TabsContent value="profitability" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Profit Makers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recipes
                          .sort((a, b) => b.profit_margin - a.profit_margin)
                          .slice(0, 5)
                          .map((recipe, index) => (
                            <div key={recipe.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{recipe.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ${recipe.cost_per_serving.toFixed(2)} cost
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {recipe.profit_margin.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cost Optimization Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recipes
                          .filter(r => r.profit_margin < 50)
                          .slice(0, 5)
                          .map((recipe) => (
                            <div key={recipe.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                              <div>
                                <div className="font-medium text-sm">{recipe.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {recipe.profit_margin.toFixed(1)}% margin
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-xs">
                                  Optimize
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cost-optimization" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ingredient Cost Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">High-Cost Ingredients</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Premium proteins account for 45% of recipe costs
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Suggestion: Consider portion optimization
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">Seasonal Opportunities</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Winter produce prices 20% higher than average
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Suggestion: Adjust menu for seasonal ingredients
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supplier Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">Bulk Purchase Opportunities</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Save 12% on dry goods with larger orders
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Potential savings: $180/month
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">Alternative Suppliers</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Local suppliers offer 8% better pricing on produce
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Potential savings: $120/month
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="menu-engineering" className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Menu Engineering Matrix</h3>
                  <p className="text-muted-foreground">
                    Advanced menu engineering tools coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recipe Dialog */}
      <RecipeDialog
        recipe={editingRecipe}
        isOpen={showAddRecipe}
        onClose={() => {
          setShowAddRecipe(false)
          setEditingRecipe(null)
        }}
        onSave={handleSaveRecipe}
        inventoryItems={inventoryItems}
        isPremium={isPremium}
      />

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog
        recipe={selectedRecipe}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        onEdit={() => {
          if (selectedRecipe) {
            handleEditRecipe(selectedRecipe)
            setSelectedRecipe(null)
          }
        }}
        isPremium={isPremium}
      />
    </div>
  )
}

// Recipe Card Component
function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onView,
  isPremium
}: {
  recipe: Recipe
  onEdit: () => void
  onDelete: () => void
  onView: () => void
  isPremium: boolean
}) {
  const profitColor = recipe.profit_margin > 60 ? 'text-green-600' : 
                     recipe.profit_margin > 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{recipe.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {recipe.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {recipe.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{recipe.prep_time + recipe.cook_time}min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cost per serving:</span>
            <span className="font-medium">${recipe.cost_per_serving.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Profit margin:</span>
            <span className={`font-medium ${profitColor}`}>
              {recipe.profit_margin.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs">{recipe.popularity_score}/100</span>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recipe Dialog Component
function RecipeDialog({
  recipe,
  isOpen,
  onClose,
  onSave,
  inventoryItems,
  isPremium
}: {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onSave: (recipe: any) => void
  inventoryItems: InventoryItem[]
  isPremium: boolean
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mains',
    servings: 4,
    prep_time: 15,
    cook_time: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    ingredients: [] as RecipeIngredient[],
    instructions: [''],
    selling_price: 0,
    tags: [] as string[]
  })

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        servings: recipe.servings,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        selling_price: recipe.selling_price,
        tags: recipe.tags
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'mains',
        servings: 4,
        prep_time: 15,
        cook_time: 30,
        difficulty: 'medium',
        ingredients: [],
        instructions: [''],
        selling_price: 0,
        tags: []
      })
    }
  }, [recipe, isOpen])

  const totalCost = formData.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
  const costPerServing = totalCost / formData.servings
  const profitMargin = formData.selling_price > 0 
    ? ((formData.selling_price - costPerServing) / formData.selling_price) * 100 
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const recipeData = {
      ...formData,
      cost_per_serving: costPerServing,
      profit_margin: profitMargin,
      popularity_score: 75, // Default score
      waste_percentage: 5, // Default waste
      updated_at: new Date().toISOString()
    }
    
    onSave(recipeData)
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        inventory_item_id: '',
        name: '',
        quantity: 0,
        unit: 'pieces',
        cost: 0
      }]
    }))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recipe ? 'Edit Recipe' : 'Add New Recipe'}
          </DialogTitle>
          <DialogDescription>
            {recipe ? 'Update the recipe details' : 'Create a new recipe with ingredients and instructions'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Classic Cheeseburger"
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
                  <SelectItem value="appetizers">Appetizers</SelectItem>
                  <SelectItem value="mains">Main Courses</SelectItem>
                  <SelectItem value="sides">Sides</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the recipe..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input
                id="prep_time"
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input
                id="cook_time"
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="selling_price">Selling Price ($)</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Cost</div>
                  <div className="text-lg font-semibold">${totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Cost per Serving</div>
                  <div className="text-lg font-semibold">${costPerServing.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Profit Margin</div>
                  <div className={`text-lg font-semibold ${
                    profitMargin > 60 ? 'text-green-600' : 
                    profitMargin > 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end">
                  <div>
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Select 
                      value={ingredient.unit} 
                      onValueChange={(value) => updateIngredient(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="oz">Ounces</SelectItem>
                        <SelectItem value="cups">Cups</SelectItem>
                        <SelectItem value="tbsp">Tablespoons</SelectItem>
                        <SelectItem value="tsp">Teaspoons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Cost"
                      value={ingredient.cost}
                      onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Notes"
                      value={ingredient.notes || ''}
                      onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Instructions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <Textarea
                    placeholder={`Step ${index + 1} instructions...`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {recipe ? 'Update Recipe' : 'Add Recipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Recipe Detail Dialog Component
function RecipeDetailDialog({
  recipe,
  isOpen,
  onClose,
  onEdit,
  isPremium
}: {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  isPremium: boolean
}) {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {recipe.description}
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recipe Info */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{recipe.prep_time + recipe.cook_time} min</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{recipe.servings}</div>
              <div className="text-xs text-muted-foreground">Servings</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">${recipe.cost_per_serving.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Cost/Serving</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-sm font-medium">{recipe.profit_margin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Profit Margin</div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${ingredient.cost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Sample recipes data
function getSampleRecipes(): Recipe[] {
  return [
    {
      id: '1',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
      category: 'mains',
      servings: 1,
      prep_time: 10,
      cook_time: 15,
      difficulty: 'easy',
      ingredients: [
        { inventory_item_id: '1', name: 'Ground Beef', quantity: 0.25, unit: 'lbs', cost: 1.25 },
        { inventory_item_id: '2', name: 'Cheese Slice', quantity: 1, unit: 'pieces', cost: 0.50 },
        { inventory_item_id: '3', name: 'Burger Bun', quantity: 1, unit: 'pieces', cost: 0.75 },
        { inventory_item_id: '4', name: 'Lettuce', quantity: 1, unit: 'oz', cost: 0.25 },
        { inventory_item_id: '5', name: 'Tomato', quantity: 2, unit: 'slices', cost: 0.30 }
      ],
      instructions: [
        'Season the ground beef with salt and pepper, form into patty',
        'Heat grill or pan to medium-high heat',
        'Cook patty for 4-5 minutes per side',
        'Add cheese in last minute of cooking',
        'Toast bun lightly',
        'Assemble burger with lettuce, tomato, patty, and sauce'
      ],
      cost_per_serving: 3.05,
      selling_price: 12.99,
      profit_margin: 76.5,
      popularity_score: 95,
      waste_percentage: 3.2,
      tags: ['popular', 'classic', 'beef'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing',
      category: 'appetizers',
      servings: 1,
      prep_time: 15,
      cook_time: 0,
      difficulty: 'easy',
      ingredients: [
        { inventory_item_id: '6', name: 'Romaine Lettuce', quantity: 4, unit: 'oz', cost: 1.20 },
        { inventory_item_id: '7', name: 'Parmesan Cheese', quantity: 1, unit: 'oz', cost: 1.50 },
        { inventory_item_id: '8', name: 'Croutons', quantity: 0.5, unit: 'cups', cost: 0.75 },
        { inventory_item_id: '9', name: 'Caesar Dressing', quantity: 2, unit: 'tbsp', cost: 0.40 }
      ],
      instructions: [
        'Wash and chop romaine lettuce',
        'Grate fresh parmesan cheese',
        'Toss lettuce with dressing',
        'Top with parmesan and croutons',
        'Serve immediately'
      ],
      cost_per_serving: 3.85,
      selling_price: 9.99,
      profit_margin: 61.5,
      popularity_score: 78,
      waste_percentage: 8.5,
      tags: ['vegetarian', 'salad', 'appetizer'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ]
}