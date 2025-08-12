'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RecipeForm } from './recipe-form'
import { Edit, Trash2, Clock, DollarSign, Target, ChefHat, Star, TrendingUp, Award } from 'lucide-react'
import { toast } from 'sonner'
import { deleteRecipe } from '@/lib/recipes'

interface RecipeListProps {
  recipes: any[]
  onUpdate: () => void
}

export function RecipeList({ recipes, onUpdate }: RecipeListProps) {
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null)

  const handleDelete = async (id: string) => {
    const { error } = await deleteRecipe(id)
    if (error) {
      toast.error('Failed to delete recipe')
    } else {
      toast.success('Recipe deleted successfully')
      onUpdate()
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProfitabilityLevel = (margin: number) => {
    if (margin >= 70) return { level: 'Excellent', color: 'green' }
    if (margin >= 50) return { level: 'Good', color: 'blue' }
    if (margin >= 30) return { level: 'Fair', color: 'yellow' }
    return { level: 'Poor', color: 'red' }
  }

  if (recipes.length === 0) {
    return (
      <Card className="card-premium border-dashed border-2">
        <CardContent className="py-20 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold mb-4">No recipes yet</h3>
          <p className="text-xl text-foreground/75 leading-relaxed max-w-lg mx-auto mb-8">
            Add your first recipe to start tracking costs, profitability, and waste.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary-enhanced px-8 py-4 text-lg font-semibold">
                <ChefHat className="h-4 w-4 mr-2" />
                Add Your First Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Recipe</DialogTitle>
              </DialogHeader>
              <RecipeForm onSuccess={onUpdate} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="dashboard-grid">
      {recipes.map((recipe) => {
        const profitability = getProfitabilityLevel(recipe.profit_margin)
        const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
        
        return (
          <Card key={recipe.id} className="card-interactive relative overflow-hidden">
            <CardHeader className="pb-6 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold mb-3 flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <span>{recipe.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                      {recipe.category}
                    </Badge>
                    <Badge className={`text-sm font-medium px-3 py-1 ${getDifficultyColor(recipe.difficulty_level)}`}>
                      {recipe.difficulty_level}
                    </Badge>
                    <Badge 
                      className={`text-sm font-medium px-3 py-1
                        ${profitability.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${profitability.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        ${profitability.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                        ${profitability.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                      `}
                    >
                      {profitability.level} Profit
                    </Badge>
                  </div>
                  {recipe.description && (
                    <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingRecipe(recipe)} className="hover-lift w-10 h-10 rounded-xl">
                        <Edit className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-bold">Edit Recipe</DialogTitle>
                      </DialogHeader>
                      <RecipeForm
                        recipe={editingRecipe}
                        onSuccess={() => {
                          setEditingRecipe(null)
                          onUpdate()
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(recipe.id)}
                    className="hover-lift hover:bg-red-50 hover:text-red-600 w-10 h-10 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6 pt-0">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-3xl font-black text-green-600">{recipe.profit_margin.toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Profit Margin</div>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center mb-3">
                    <Star className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-3xl font-black text-blue-600">{recipe.popularity_score}%</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Popularity</div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-600">${recipe.cost_per_serving.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground font-medium">Cost</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">${recipe.selling_price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground font-medium">Price</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">${(recipe.selling_price - recipe.cost_per_serving).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground font-medium">Profit</div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-6">
                {totalTime > 0 && (
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-blue-600">{totalTime} min</div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
                  <Target className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-bold text-orange-600">{recipe.waste_percentage}%</div>
                    <div className="text-xs text-muted-foreground">Waste Rate</div>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              {recipe.profit_margin < 50 && (
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Low profit margin - consider price adjustment</span>
                  </div>
                </div>
              )}
              
              {recipe.waste_percentage > 8 && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">High waste detected - review portion sizes</span>
                  </div>
                </div>
              )}

              {recipe.popularity_score > 80 && recipe.profit_margin > 60 && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">Star performer - consider featuring prominently</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}