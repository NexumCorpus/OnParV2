'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { generateAIInsights, AIInsight } from '@/lib/ai-insights'
import { Database } from '@/lib/supabase'
import { Brain, Lightbulb, TrendingUp, Target, Zap, Star, ArrowRight, DollarSign, AlertTriangle, CheckCircle, Sparkles, Award, Clock, Shield } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface SmartInsightsProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  monthlySpend: number
  monthlyBudget?: number | null
  isPremium: boolean
  restaurantName?: string
}

export function SmartInsights({ 
  inventoryItems, 
  menuItems, 
  monthlySpend, 
  monthlyBudget, 
  isPremium,
  restaurantName 
}: SmartInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    generateInsights()
  }, [inventoryItems, menuItems, monthlySpend, monthlyBudget, isPremium])

  const generateInsights = async () => {
    setLoading(true)
    try {
      if (isPremium && inventoryItems.length > 0) {
        const aiInsights = generateAIInsights(
          inventoryItems, 
          menuItems, 
          monthlySpend, 
          monthlyBudget, 
          restaurantName
        )
        setInsights(aiInsights)
      } else {
        setInsights([])
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'from-red-500 to-pink-500'
      case 'medium': return 'from-orange-500 to-yellow-500'
      case 'low': return 'from-blue-500 to-indigo-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isPremium) {
    return (
      <div className="space-y-8">
        <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-950 dark:via-yellow-950 dark:to-amber-950 border-2 border-orange-200 dark:border-orange-800 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-orange-800 dark:text-orange-200 mb-6">
              Unlock AI Sous-Chef Insights
            </h2>
            <p className="text-xl text-orange-700 dark:text-orange-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Get advanced AI-powered recommendations for waste reduction, cost optimization, 
              and predictive ordering that can save you 15-25% on food costs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-orange-200 dark:border-orange-800">
                <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">Smart Recommendations</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">AI analyzes patterns to suggest optimal ordering</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-orange-200 dark:border-orange-800">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">Waste Prediction</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">Predict and prevent waste before it happens</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-orange-200 dark:border-orange-800">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">Cost Optimization</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">Maximize profits with intelligent pricing</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-xl hover:shadow-2xl">
                <Zap className="h-6 w-6 mr-3" />
                Upgrade to AI Sous-Chef
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
              AI Analyzing Your Data...
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-lg">
              Processing {inventoryItems.length} inventory items and {menuItems.length} menu items
            </p>
            <Progress value={75} className="mt-6 h-3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-blue-800 dark:text-blue-200 mb-2">AI Sous-Chef Insights</h2>
                <p className="text-xl text-blue-700 dark:text-blue-300">Advanced analytics powered by machine learning</p>
              </div>
            </div>
            <Badge className="premium-badge text-lg px-6 py-3">
              <Star className="w-5 h-5 mr-2" />
              Premium Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1">{insights.length}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Active Insights</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1">
                ${insights.reduce((sum, insight) => sum + insight.estimatedSavings, 0).toFixed(0)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Potential Savings</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1">
                {insights.length > 0 ? Math.round(insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length) : 0}%
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {insights.map((insight) => (
            <Card key={insight.id} className="card-premium hover:shadow-2xl transition-all duration-300 group cursor-pointer" onClick={() => setSelectedInsight(insight)}>
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getImpactColor(insight.impact)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {insight.type === 'waste_reduction' && <Target className="h-6 w-6 text-white" />}
                      {insight.type === 'cost_optimization' && <DollarSign className="h-6 w-6 text-white" />}
                      {insight.type === 'inventory_optimization' && <Package className="h-6 w-6 text-white" />}
                      {insight.type === 'menu_optimization' && <ChefHat className="h-6 w-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {insight.title}
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        <Badge className={`text-xs font-bold px-3 py-1 ${getImpactBadgeColor(insight.impact)}`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant="outline" className="text-xs font-bold px-3 py-1">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-base text-foreground/85 leading-relaxed font-medium">
                  {insight.description}
                </p>
                
                {insight.estimatedSavings > 0 && (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-green-800 dark:text-green-200">Potential Savings</span>
                      </div>
                      <div className="text-2xl font-black text-green-600">
                        ${insight.estimatedSavings.toFixed(2)}/month
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Key Data Points</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {insight.dataPoints.slice(0, 3).map((point, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {insight.actionable && (
                  <Button className="w-full btn-primary-enhanced py-3 font-bold" onClick={() => setSelectedInsight(insight)}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    View Detailed Analysis
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-premium">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Brain className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold mb-4">AI Learning Your Patterns</h3>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Add more inventory and menu items to unlock powerful AI insights and recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold">{inventoryItems.length}</div>
                <div className="text-sm text-muted-foreground">Inventory Items</div>
                <div className="text-xs text-muted-foreground mt-1">Need 10+ for insights</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <ChefHat className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold">{menuItems.length}</div>
                <div className="text-sm text-muted-foreground">Menu Items</div>
                <div className="text-xs text-muted-foreground mt-1">Need 5+ for insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getImpactColor(selectedInsight.impact)} flex items-center justify-center shadow-lg`}>
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <span>{selectedInsight.title}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getImpactColor(selectedInsight.impact)} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{selectedInsight.impact.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">Impact Level</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">${selectedInsight.estimatedSavings.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Monthly Savings</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{selectedInsight.confidence}%</div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed">{selectedInsight.description}</p>
                  
                  {/* Enhanced Action Plan */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Recommended Action Plan</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedInsight.recommendedActions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-chart-2/5 border border-primary/20">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="font-medium text-foreground/90 leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related Items */}
                  {selectedInsight.relatedItems.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg flex items-center space-x-2">
                        <Target className="h-5 w-5 text-chart-2" />
                        <span>Items to Focus On</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedInsight.relatedItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-chart-2/20 flex items-center justify-center">
                                {item.type === 'inventory' && <Package className="h-4 w-4 text-chart-2" />}
                                {item.type === 'menu' && <ChefHat className="h-4 w-4 text-chart-2" />}
                                {item.type === 'recipe' && <Star className="h-4 w-4 text-chart-2" />}
                              </div>
                              <div>
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-sm text-muted-foreground capitalize">{item.type}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {item.currentValue.toFixed(1)} → {item.suggestedValue.toFixed(1)} {item.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">Current → Suggested</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Implementation Timeline */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">Timeframe</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">{selectedInsight.timeframe}</div>
                      </div>
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">Priority</div>
                        <Badge className={`
                          ${selectedInsight.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                          ${selectedInsight.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                          ${selectedInsight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                          ${selectedInsight.priority === 'low' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        `}>
                          {selectedInsight.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">Category</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">{selectedInsight.category}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-muted-foreground uppercase tracking-wide">Supporting Data</h4>
                    {selectedInsight.dataPoints.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="font-medium">{point}</span>
                      </div>
                    ))}
                  </div>

                  {selectedInsight.actionable && (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20">
                      <h4 className="font-bold text-primary mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>Review highlighted items in your inventory</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>Implement suggested portion adjustments</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>Monitor results over the next 2 weeks</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Performance Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">
              AI Performance This Month
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">94%</div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">$1,247</div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">AI-Driven Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">23</div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">18</div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Actions Taken</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}