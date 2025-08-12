'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createRecipe, updateRecipe, getRecipeCategories, getDifficultyLevels, calculateProfitMargin } from '@/lib/recipes'
import { getCurrentUser } from '@/lib/auth'
import { ChefHat, Clock, DollarSign, Target, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface RecipeFormProps {
  recipe?: any | null
  onSuccess: () => void
}

export function RecipeForm({ recipe, onSuccess }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    serving_size: '1',
    prep_time_minutes: '',
    cook_time_minutes: '',
    difficulty_level: 'medium',
    instructions: '',
    cost_per_serving: '',
    selling_price: '',
    popularity_score: '50',
    waste_percentage: '5'
  })
  const [loading, setLoading] = useState(false)
  const [calculatedMargin, setCalculatedMargin] = useState(0)

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        category: recipe.category || 'Main Course',
        serving_size: recipe.serving_size?.toString() || '1',
        prep_time_minutes: recipe.prep_time_minutes?.toString() || '',
        cook_time_minutes: recipe.cook_time_minutes?.toString() || '',
        difficulty_level: recipe.difficulty_level || 'medium',
        instructions: recipe.instructions || '',
        cost_per_serving: recipe.cost_per_serving?.toString() || '',
        selling_price: recipe.selling_price?.toString() || '',
        popularity_score: recipe.popularity_score?.toString() || '50',
        waste_percentage: recipe.waste_percentage?.toString() || '5'
      })
    }
  }, [recipe])

  // Calculate profit margin in real-time
  useEffect(() => {
    const cost = parseFloat(formData.cost_per_serving) || 0
    const price = parseFloat(formData.selling_price) || 0
    const margin = calculateProfitMargin(cost, price)
    setCalculatedMargin(margin)
  }, [formData.cost_per_serving, formData.selling_price])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Recipe name is required')
      return
    }
    
    if (!formData.cost_per_serving || parseFloat(formData.cost_per_serving) < 0) {
      toast.error('Cost per serving must be a positive number')
      return
    }
    
    if (!formData.selling_price || parseFloat(formData.selling_price) < 0) {
      toast.error('Selling price must be a positive number')
      return
    }

    if (parseFloat(formData.selling_price) <= parseFloat(formData.cost_per_serving)) {
      toast.error('Selling price must be higher than cost per serving')
      return
    }

    setLoading(true)

    try {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        serving_size: parseInt(formData.serving_size),
        prep_time_minutes: formData.prep_time_minutes ? parseInt(formData.prep_time_minutes) : undefined,
        cook_time_minutes: formData.cook_time_minutes ? parseInt(formData.cook_time_minutes) : undefined,
        difficulty_level: formData.difficulty_level as 'easy' | 'medium' | 'hard',
        instructions: formData.instructions.trim() || undefined,
        cost_per_serving: parseFloat(formData.cost_per_serving),
        selling_price: parseFloat(formData.selling_price),
        profit_margin: calculatedMargin,
        popularity_score: parseFloat(formData.popularity_score),
        waste_percentage: parseFloat(formData.waste_percentage),
        user_id: user.id,
      }

      let error
      if (recipe) {
        ({ error } = await updateRecipe(recipe.id, data))
      } else {
        ({ error } = await createRecipe(data))
      }

      if (error) throw error

      toast.success(recipe ? 'Recipe updated successfully' : 'Recipe added successfully')
      onSuccess()
      
      if (!recipe) {
        setFormData({
          name: '',
          description: '',
          category: 'Main Course',
          serving_size: '1',
          prep_time_minutes: '',
          cook_time_minutes: '',
          difficulty_level: 'medium',
          instructions: '',
          cost_per_serving: '',
          selling_price: '',
          popularity_score: '50',
          waste_percentage: '5'
        })
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast.error('Failed to save recipe')
    } finally {
      setLoading(false)
    }
  }

  const categories = getRecipeCategories()
  const difficultyLevels = getDifficultyLevels()

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Margherita Pizza"
                required
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the dish..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="serving_size">Serving Size *</Label>
              <Input
                id="serving_size"
                type="number"
                min="1"
                max="20"
                value={formData.serving_size}
                onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="prep_time">Prep Time (minutes)</Label>
              <Input
                id="prep_time"
                type="number"
                min="0"
                max="480"
                value={formData.prep_time_minutes}
                onChange={(e) => setFormData({ ...formData, prep_time_minutes: e.target.value })}
                placeholder="15"
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="cook_time">Cook Time (minutes)</Label>
              <Input
                id="cook_time"
                type="number"
                min="0"
                max="480"
                value={formData.cook_time_minutes}
                onChange={(e) => setFormData({ ...formData, cook_time_minutes: e.target.value })}
                placeholder="20"
                className="h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cost & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Cost & Pricing Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cost_per_serving">Cost per Serving ($) *</Label>
              <Input
                id="cost_per_serving"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_serving}
                onChange={(e) => setFormData({ ...formData, cost_per_serving: e.target.value })}
                placeholder="4.50"
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total ingredient cost per serving
              </p>
            </div>
            <div>
              <Label htmlFor="selling_price">Selling Price ($) *</Label>
              <Input
                id="selling_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="16.00"
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Menu price charged to customers
              </p>
            </div>
          </div>

          {/* Profit Margin Display */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-200 mb-1">Calculated Profit Margin</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Profit: ${(parseFloat(formData.selling_price) - parseFloat(formData.cost_per_serving) || 0).toFixed(2)} per serving
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-green-600">{calculatedMargin.toFixed(1)}%</div>
                <Badge className={`
                  ${calculatedMargin >= 70 ? 'bg-green-100 text-green-800 border-green-200' : ''}
                  ${calculatedMargin >= 50 && calculatedMargin < 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                  ${calculatedMargin < 50 ? 'bg-red-100 text-red-800 border-red-200' : ''}
                `}>
                  {calculatedMargin >= 70 ? 'Excellent' : calculatedMargin >= 50 ? 'Good' : 'Low'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="popularity_score">Popularity Score (%) *</Label>
              <Input
                id="popularity_score"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.popularity_score}
                onChange={(e) => setFormData({ ...formData, popularity_score: e.target.value })}
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How popular is this dish with customers (0-100%)
              </p>
            </div>
            <div>
              <Label htmlFor="waste_percentage">Waste Percentage (%) *</Label>
              <Input
                id="waste_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.waste_percentage}
                onChange={(e) => setFormData({ ...formData, waste_percentage: e.target.value })}
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of this recipe that typically goes to waste
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Preparation Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="instructions">Cooking Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step-by-step cooking instructions..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Add detailed preparation steps
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full btn-primary-enhanced py-4 text-lg font-bold rounded-2xl">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent mr-3"></div>
            Saving Recipe...
          </>
        ) : (
          <>
            <Plus className="h-5 w-5 mr-3" />
            {recipe ? 'Update Recipe' : 'Create Recipe'}
          </>
        )}
      </Button>
    </form>
  )
}