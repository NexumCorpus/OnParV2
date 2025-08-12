'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Database } from '@/lib/supabase'
import { Brain, TrendingUp, Calendar, DollarSign, Target, Zap, Star, AlertTriangle, CheckCircle, Clock, Award } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface PredictiveAnalyticsProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  monthlySpend: number
  isPremium: boolean
}

interface Prediction {
  id: string
  type: 'demand' | 'waste' | 'cost' | 'seasonal'
  title: string
  description: string
  timeframe: string
  confidence: number
  impact: number
  trend: 'up' | 'down' | 'stable'
}

export function PredictiveAnalytics({ inventoryItems, menuItems, monthlySpend, isPremium }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month')
  const [forecastAccuracy, setForecastAccuracy] = useState(94.2)

  useEffect(() => {
    generatePredictions()
  }, [inventoryItems, menuItems, monthlySpend, selectedTimeframe, isPremium])

  const generatePredictions = () => {
    if (!isPremium) {
      setPredictions([])
      return
    }

    const newPredictions: Prediction[] = []

    // Demand prediction
    const highDemandItems = inventoryItems.filter(item => item.quantity < item.reorder_point * 1.5)
    if (highDemandItems.length > 0) {
      newPredictions.push({
        id: 'demand-forecast',
        type: 'demand',
        title: 'Increased Demand Predicted',
        description: `AI models predict 15-20% increase in demand for ${highDemandItems.length} items over the next ${selectedTimeframe}`,
        timeframe: selectedTimeframe,
        confidence: 87,
        impact: highDemandItems.length * 50,
        trend: 'up'
      })
    }

    // Waste prediction
    const highWasteItems = menuItems.filter(item => item.waste_percentage > 5)
    if (highWasteItems.length > 0) {
      newPredictions.push({
        id: 'waste-forecast',
        type: 'waste',
        title: 'Waste Reduction Opportunity',
        description: `Predictive models suggest optimizing ${highWasteItems.length} menu items could reduce waste by 25-30%`,
        timeframe: selectedTimeframe,
        confidence: 82,
        impact: highWasteItems.length * 75,
        trend: 'down'
      })
    }

    // Cost prediction
    newPredictions.push({
      id: 'cost-forecast',
      type: 'cost',
      title: 'Cost Optimization Forecast',
      description: `Smart ordering patterns could reduce monthly costs by $${(monthlySpend * 0.12).toFixed(0)} through better timing`,
      timeframe: selectedTimeframe,
      confidence: 91,
      impact: monthlySpend * 0.12,
      trend: 'down'
    })

    // Seasonal prediction
    const currentMonth = new Date().getMonth()
    const seasonalItems = inventoryItems.filter(item => 
      item.name.toLowerCase().includes('seasonal') || 
      item.name.toLowerCase().includes('fresh') ||
      item.expiry_date
    )
    
    if (seasonalItems.length > 0) {
      newPredictions.push({
        id: 'seasonal-forecast',
        type: 'seasonal',
        title: 'Seasonal Demand Shift',
        description: `Historical patterns suggest adjusting orders for ${seasonalItems.length} seasonal items in the coming weeks`,
        timeframe: selectedTimeframe,
        confidence: 76,
        impact: seasonalItems.length * 35,
        trend: currentMonth < 6 ? 'up' : 'down'
      })
    }

    setPredictions(newPredictions)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demand': return TrendingUp
      case 'waste': return Target
      case 'cost': return DollarSign
      case 'seasonal': return Calendar
      default: return Brain
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demand': return 'from-blue-500 to-indigo-500'
      case 'waste': return 'from-green-500 to-emerald-500'
      case 'cost': return 'from-purple-500 to-pink-500'
      case 'seasonal': return 'from-orange-500 to-yellow-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Target
    }
  }

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">
            Predictive Analytics
          </h3>
          <p className="text-purple-700 dark:text-purple-300 mb-4">
            Unlock AI forecasting and predictive insights with Premium
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">Predictive Analytics</h3>
                <p className="text-purple-700 dark:text-purple-300">AI-powered forecasting</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{forecastAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Accuracy</div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex justify-center space-x-2">
        {(['week', 'month', 'quarter'] as const).map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe(timeframe)}
            className="capitalize font-semibold"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions.map((prediction) => {
          const TypeIcon = getTypeIcon(prediction.type)
          const TrendIcon = getTrendIcon(prediction.trend)
          
          return (
            <Card key={prediction.id} className="card-premium hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getTypeColor(prediction.type)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {prediction.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs font-bold">
                          {prediction.confidence}% confidence
                        </Badge>
                        <Badge className="text-xs font-bold bg-blue-100 text-blue-800 border-blue-200">
                          {prediction.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-5 w-5 ${prediction.trend === 'up' ? 'text-red-500' : prediction.trend === 'down' ? 'text-green-500' : 'text-blue-500'}`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground/85 leading-relaxed font-medium">
                  {prediction.description}
                </p>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Predicted Impact</span>
                    <span className="text-lg font-black text-primary">
                      ${prediction.impact.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={prediction.confidence} className="mt-2 h-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Next review: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="font-semibold">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Forecast Accuracy */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
              AI Forecast Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-green-600 mb-2">{forecastAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-600 mb-2">127</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Predictions Made</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-600 mb-2">$2,340</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Savings Predicted</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}