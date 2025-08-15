'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertTriangle, Calendar, DollarSign, Zap, TrendingUp, Star, ArrowRight, Target, Lightbulb } from 'lucide-react'
import { Database } from '../../lib/supabase'
import { getLowStockItems, getExpiringItems, calculateEstimatedSavings } from '../../lib/inventory'
import { generateAIInsights, AIInsight } from '../../lib/ai-insights'
import { useState, useEffect } from 'react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface AlertsPanelProps {
  items: InventoryItem[]
  menuItems: MenuItem[]
  monthlySpend: number
  monthlyBudget?: number | null
  isPremium: boolean
  userSettings?: {
    low_stock_threshold?: number
    expiry_warning_days?: number
    budget_warning_threshold?: number
  }
}

export function AlertsPanel({ 
  items, 
  menuItems, 
  monthlySpend, 
  monthlyBudget, 
  isPremium,
  userSettings = {}
}: AlertsPanelProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])

  const {
    low_stock_threshold = 0.8,
    expiry_warning_days = 7,
    budget_warning_threshold = 0.9
  } = userSettings

  // Enhanced alert logic with customizable thresholds
  const lowStockItems = items.filter(item => 
    item.quantity < (item.reorder_point * low_stock_threshold)
  )
  
  const expiringItems = items.filter(item => {
    if (!item.expiry_date) return false
    const daysFromNow = new Date()
    daysFromNow.setDate(daysFromNow.getDate() + expiry_warning_days)
    return new Date(item.expiry_date) <= daysFromNow
  })
  
  const estimatedSavings = calculateEstimatedSavings(items)
  const budgetOverspend = monthlyBudget && monthlyBudget > 0 && monthlySpend > (monthlyBudget * budget_warning_threshold)

  // Generate insights when data changes
  useEffect(() => {
    if (isPremium && items.length > 0) {
      const insights = generateAIInsights(items, menuItems, monthlySpend, monthlyBudget, 'Your Restaurant')
      setAiInsights(insights)
    } else {
      setAiInsights([])
    }
  }, [items, menuItems, monthlySpend, monthlyBudget, isPremium])

  return (
    <div className="space-y-8">
      {/* Enhanced Savings Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 hover-lift shadow-lg">
        <CardHeader className="pb-4 p-6">
          <CardTitle className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-green-800 dark:text-green-200 text-lg font-bold">Potential Savings</span>
              <div className="text-sm text-green-600 dark:text-green-400 font-semibold">This Month</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-4xl font-black text-green-600 mb-3">
            ${estimatedSavings.toFixed(2)}
          </div>
          <p className="text-base text-green-700 dark:text-green-300 leading-relaxed font-medium">
            From optimized inventory management and waste reduction
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Based on current alerts</span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Alerts */}
      <div className="space-y-6">
        {/* Budget Alert */}
        {budgetOverspend && (
          <Alert className="alert-error alert-slide-in border-l-4 border-l-red-500 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <div className="font-bold mb-2 text-base">Budget Alert</div>
                  <p className="text-base leading-relaxed">You've spent ${monthlySpend.toFixed(2)} of your ${monthlyBudget?.toFixed(2)} monthly budget (90% threshold reached).</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Alert className="alert-warning alert-slide-in border-l-4 border-l-orange-500 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <div className="font-bold mb-2 text-base">Low Stock Alert</div>
                  <p className="text-base mb-3 leading-relaxed">{lowStockItems.length} item(s) need reordering.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      Estimated savings: ${(lowStockItems.length * 25).toFixed(2)}
                    </span>
                    <Button size="sm" variant="outline" className="text-sm font-medium hover-scale">
                      View Items
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Expiry Alert */}
        {expiringItems.length > 0 && (
          <Alert className="alert-warning alert-slide-in border-l-4 border-l-yellow-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <div className="font-semibold mb-1">Expiry Alert</div>
                  <p className="text-sm mb-2">{expiringItems.length} item(s) expire within {expiry_warning_days} days.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Use soon to prevent waste
                    </span>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Items
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* AI Insights (Premium Only) */}
        {isPremium && aiInsights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">AI Insights</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Premium
              </Badge>
            </div>
            
            {aiInsights.slice(0, 2).map((insight) => (
              <Alert key={insight.id} className="alert-info border-l-4 border-l-blue-500">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <div className="font-semibold mb-1">{insight.title}</div>
                      <p className="text-sm mb-3 leading-relaxed">{insight.description}</p>
                      {insight.estimatedSavings > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium">
                              Potential: ${insight.estimatedSavings.toFixed(2)}/month
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* No Alerts State */}
        {lowStockItems.length === 0 && expiringItems.length === 0 && !budgetOverspend && (!isPremium || aiInsights.length === 0) && (
          <Alert className="alert-success border-l-4 border-l-green-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="font-semibold mb-1">All Good!</div>
                  <p className="text-sm">No urgent alerts. Your inventory is well-managed.</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="metric-card text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center mx-auto mb-4 shadow-md">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-black text-orange-600 mb-1">{lowStockItems.length}</div>
            <p className="text-sm text-muted-foreground font-medium">Low Stock</p>
          </CardContent>
        </Card>
        
        <Card className="metric-card text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-3xl font-black text-yellow-600 mb-1">{expiringItems.length}</div>
            <p className="text-sm text-muted-foreground font-medium">Expiring Soon</p>
          </CardContent>
        </Card>
        
        {isPremium && (
          <Card className="metric-card text-center col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-4xl font-black text-blue-600 mb-2">
                ${aiInsights.reduce((total, insight) => total + insight.estimatedSavings, 0).toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-3">AI Savings Potential</p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm font-bold px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                Premium Feature
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}