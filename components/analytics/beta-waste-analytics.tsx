'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingDown, 
  TrendingUp,
  DollarSign, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  Star,
  ChefHat,
  Package
} from 'lucide-react'

interface WasteInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  savings: number
  category: string
  actionable: boolean
  implemented?: boolean
}

interface WasteData {
  item: string
  category: string
  wastePercentage: number
  previousWaste: number
  monthlyCost: number
  reduction: number
  trend: 'improving' | 'stable' | 'worsening'
}

export function BetaWasteAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  // Beta demo data showing clear value
  const wasteData: WasteData[] = [
    {
      item: 'Margherita Pizza',
      category: 'Menu Items',
      wastePercentage: 6.2,
      previousWaste: 8.5,
      monthlyCost: 180,
      reduction: 27.1,
      trend: 'improving'
    },
    {
      item: 'Caesar Salad',
      category: 'Menu Items',
      wastePercentage: 4.1,
      previousWaste: 5.8,
      monthlyCost: 95,
      reduction: 29.3,
      trend: 'improving'
    },
    {
      item: 'Fresh Basil',
      category: 'Ingredients',
      wastePercentage: 12.3,
      previousWaste: 18.7,
      monthlyCost: 65,
      reduction: 34.2,
      trend: 'improving'
    },
    {
      item: 'Roma Tomatoes',
      category: 'Ingredients',
      wastePercentage: 8.9,
      previousWaste: 11.2,
      monthlyCost: 120,
      reduction: 20.5,
      trend: 'improving'
    },
    {
      item: 'Mozzarella',
      category: 'Ingredients',
      wastePercentage: 5.4,
      previousWaste: 5.1,
      monthlyCost: 45,
      reduction: -5.9,
      trend: 'worsening'
    }
  ]

  const insights: WasteInsight[] = [
    {
      id: '1',
      title: 'Reduce Pizza Waste by 35%',
      description: 'Your Margherita Pizza has 6.2% waste rate. Implementing portion control could save $180/month.',
      impact: 'high',
      savings: 180,
      category: 'Portion Control',
      actionable: true
    },
    {
      id: '2',
      title: 'Optimize Basil Usage',
      description: 'Fresh basil waste reduced 34% since beta start. Consider bulk purchasing for additional savings.',
      impact: 'medium',
      savings: 85,
      category: 'Procurement',
      actionable: true,
      implemented: true
    },
    {
      id: '3',
      title: 'Monitor Mozzarella Trend',
      description: 'Mozzarella waste increased 5.9% this week. Check storage temperature and rotation practices.',
      impact: 'medium',
      savings: 45,
      category: 'Storage',
      actionable: true
    }
  ]

  const totalWasteReduction = wasteData.reduce((sum, item) => sum + Math.max(0, item.reduction), 0) / wasteData.filter(item => item.reduction > 0).length
  const totalMonthlySavings = wasteData.reduce((sum, item) => sum + (item.monthlyCost * Math.max(0, item.reduction) / 100), 0)
  const totalWasteCost = wasteData.reduce((sum, item) => sum + item.monthlyCost, 0)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'stable': return <div className="h-4 w-4 bg-yellow-600 rounded-full" />
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Beta Success Banner */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  🎉 Amazing Progress: {totalWasteReduction.toFixed(1)}% Average Waste Reduction!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You've saved ${totalMonthlySavings.toFixed(0)} this month through smarter inventory management
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white px-4 py-2">
              BETA SUCCESS
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${totalMonthlySavings.toFixed(0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{totalWasteReduction.toFixed(1)}% improvement
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Waste Reduction</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {totalWasteReduction.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600">Average across all items</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Waste Cost</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${totalWasteCost.toFixed(0)}
                </p>
                <p className="text-xs text-purple-600">Before optimization</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">AI Insights</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {insights.length}
                </p>
                <p className="text-xs text-orange-600">Actionable recommendations</p>
              </div>
              <Sparkles className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waste by Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Waste by Item</span>
                </CardTitle>
                <CardDescription>
                  Current waste percentages and improvements since beta start
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wasteData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{item.item}</span>
                          {getTrendIcon(item.trend)}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{item.wastePercentage}%</span>
                          {item.reduction > 0 ? (
                            <span className="text-xs text-green-600 ml-2">
                              -{item.reduction.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 ml-2">
                              +{Math.abs(item.reduction).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Progress value={item.previousWaste * 5} className="h-2 opacity-50" />
                          <p className="text-xs text-muted-foreground mt-1">Before: {item.previousWaste}%</p>
                        </div>
                        <div className="flex-1">
                          <Progress value={item.wastePercentage * 5} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Now: {item.wastePercentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Cost Impact Analysis</span>
                </CardTitle>
                <CardDescription>
                  Monthly waste costs and potential savings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wasteData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.item}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${item.monthlyCost}</p>
                        {item.reduction > 0 ? (
                          <p className="text-xs text-green-600">
                            Save ${(item.monthlyCost * item.reduction / 100).toFixed(0)}/mo
                          </p>
                        ) : (
                          <p className="text-xs text-red-600">
                            +${(item.monthlyCost * Math.abs(item.reduction) / 100).toFixed(0)}/mo
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>AI-Powered Waste Reduction Insights</span>
                <Badge className="bg-blue-100 text-blue-800">BETA</Badge>
              </CardTitle>
              <CardDescription>
                Smart recommendations based on your restaurant's data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact.toUpperCase()}
                            </Badge>
                            {insight.implemented && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                IMPLEMENTED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center text-green-600">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${insight.savings}/month potential
                            </span>
                            <span className="text-muted-foreground">
                              Category: {insight.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!insight.implemented && (
                            <Button size="sm">
                              Implement
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Trend Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Detailed charts showing waste patterns, seasonal trends, and predictive analytics coming soon...
              </p>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Charts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Action Plan Generator</h3>
              <p className="text-muted-foreground mb-4">
                Step-by-step action plans to implement waste reduction strategies...
              </p>
              <Button>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Action Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Beta Feedback */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Love these waste insights?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Help us improve by sharing which insights are most valuable to your restaurant
              </p>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Rate Insights
                </Button>
                <Button variant="outline" size="sm">
                  Request Feature
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}