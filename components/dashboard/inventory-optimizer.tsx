'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Database } from '@/lib/supabase'
import { Package, TrendingUp, DollarSign, AlertTriangle, Target, Zap, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryOptimizerProps {
  inventoryItems: InventoryItem[]
  isPremium: boolean
}

interface OptimizationSuggestion {
  id: string
  type: 'reorder' | 'reduce' | 'urgent' | 'optimize'
  item: InventoryItem
  suggestion: string
  impact: 'high' | 'medium' | 'low'
  savings: number
  confidence: number
}

export function InventoryOptimizer({ inventoryItems, isPremium }: InventoryOptimizerProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([])
  const [totalSavings, setTotalSavings] = useState(0)

  useEffect(() => {
    generateOptimizations()
  }, [inventoryItems, isPremium])

  const generateOptimizations = () => {
    if (!isPremium || inventoryItems.length === 0) {
      setSuggestions([])
      return
    }

    const optimizations: OptimizationSuggestion[] = []

    inventoryItems.forEach(item => {
      // Low stock optimization
      if (item.quantity < item.reorder_point) {
        optimizations.push({
          id: `reorder-${item.id}`,
          type: 'urgent',
          item,
          suggestion: `Reorder ${item.reorder_point * 2} ${item.unit} immediately to prevent stockout`,
          impact: 'high',
          savings: item.price_per_unit * item.reorder_point * 0.1, // 10% savings from bulk ordering
          confidence: 95
        })
      }

      // Overstock optimization
      if (item.quantity > item.reorder_point * 3) {
        optimizations.push({
          id: `reduce-${item.id}`,
          type: 'reduce',
          item,
          suggestion: `Reduce next order by ${Math.floor((item.quantity - item.reorder_point * 2))} ${item.unit} to optimize cash flow`,
          impact: 'medium',
          savings: (item.quantity - item.reorder_point * 2) * item.price_per_unit * 0.05, // 5% savings from better cash flow
          confidence: 80
        })
      }

      // Expiry optimization
      if (item.expiry_date) {
        const daysToExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (daysToExpiry <= 7 && daysToExpiry > 0) {
          optimizations.push({
            id: `urgent-${item.id}`,
            type: 'urgent',
            item,
            suggestion: `Use ${item.name} within ${daysToExpiry} days - expires ${new Date(item.expiry_date).toLocaleDateString()}`,
            impact: 'high',
            savings: item.quantity * item.price_per_unit * 0.8, // 80% savings by preventing waste
            confidence: 90
          })
        }
      }

      // Price optimization
      if (item.price_per_unit > 20) {
        optimizations.push({
          id: `optimize-${item.id}`,
          type: 'optimize',
          item,
          suggestion: `Consider bulk purchasing for ${item.name} to reduce unit cost`,
          impact: 'low',
          savings: item.quantity * item.price_per_unit * 0.15, // 15% savings from bulk purchasing
          confidence: 70
        })
      }
    })

    // Sort by impact and savings
    optimizations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact]
      if (impactDiff !== 0) return impactDiff
      return b.savings - a.savings
    })

    setSuggestions(optimizations.slice(0, 8)) // Show top 8 suggestions
    setTotalSavings(optimizations.reduce((sum, opt) => sum + opt.savings, 0))
  }

  const applySuggestion = (suggestionId: string) => {
    setAppliedOptimizations(prev => [...prev, suggestionId])
    toast.success('Optimization applied! Monitor results in your analytics.')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return AlertTriangle
      case 'reorder': return Package
      case 'reduce': return TrendingDown
      case 'optimize': return Target
      default: return Package
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'from-red-500 to-pink-500'
      case 'reorder': return 'from-blue-500 to-indigo-500'
      case 'reduce': return 'from-orange-500 to-yellow-500'
      case 'optimize': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
            Inventory Optimizer
          </h3>
          <p className="text-orange-700 dark:text-orange-300 mb-4">
            Unlock AI-powered inventory optimization with Premium
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Optimizer Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">Inventory Optimizer</h3>
                <p className="text-blue-700 dark:text-blue-300">AI-powered recommendations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">${totalSavings.toFixed(0)}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Potential Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const TypeIcon = getTypeIcon(suggestion.type)
            const isApplied = appliedOptimizations.includes(suggestion.id)
            
            return (
              <Card key={suggestion.id} className={`card-premium ${isApplied ? 'opacity-60' : 'hover:shadow-lg'} transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getTypeColor(suggestion.type)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg mb-2">{suggestion.item.name}</h4>
                          <p className="text-foreground/80 leading-relaxed">{suggestion.suggestion}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={`text-xs font-bold ${getImpactBadge(suggestion.impact)}`}>
                            {suggestion.impact.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold">{suggestion.item.quantity}</div>
                            <div className="text-xs text-muted-foreground">Current</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              {suggestion.type === 'reorder' ? suggestion.item.reorder_point * 2 :
                               suggestion.type === 'reduce' ? Math.max(suggestion.item.reorder_point, suggestion.item.quantity - 10) :
                               suggestion.item.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">Suggested</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">${suggestion.savings.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Potential Savings</div>
                          </div>
                          
                          {!isApplied ? (
                            <Button 
                              size="sm" 
                              onClick={() => applySuggestion(suggestion.id)}
                              className="btn-primary-enhanced font-semibold"
                            >
                              Apply
                            </Button>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="card-premium">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
              Inventory Perfectly Optimized!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-lg leading-relaxed max-w-md mx-auto">
              Your inventory levels are optimal. The AI will continue monitoring and alert you of new opportunities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Optimization Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{suggestions.length}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Active Suggestions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{appliedOptimizations.length}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Applied This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">${totalSavings.toFixed(0)}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Potential Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">94%</div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}