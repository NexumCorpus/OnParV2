'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Lightbulb,
  Target,
  RefreshCw,
  X
} from 'lucide-react'
import { useAIInsights } from '@/hooks/use-ai-insights'
import { AIInsight } from '@/types'

interface AIInsightsDashboardProps {
  isPremium: boolean
}

export function AIInsightsDashboard({ isPremium }: AIInsightsDashboardProps) {
  const { insights, loading, error, generateInsights, updateInsightStatus, deleteInsight } = useAIInsights()
  const [updatingInsight, setUpdatingInsight] = useState<string | null>(null)

  const handleStatusUpdate = async (
    insightId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
    actualSavings?: number
  ) => {
    setUpdatingInsight(insightId)
    await updateInsightStatus(insightId, status, actualSavings)
    setUpdatingInsight(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'dismissed':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const totalSavings = insights.reduce((sum, insight) => sum + insight.estimated_savings, 0)
  const completedSavings = insights
    .filter(insight => insight.status === 'completed')
    .reduce((sum, insight) => sum + (insight.actual_savings || insight.estimated_savings), 0)

  const insightsByType = insights.reduce((acc, insight) => {
    acc[insight.type] = (acc[insight.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Unlock advanced AI insights to reduce waste and optimize your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-4">
              Get AI-powered recommendations to reduce waste by 10-20% and save $500+ monthly
            </p>
            <Button>
              Upgrade to Premium - $29/month
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold">${totalSavings.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Realized Savings</p>
                <p className="text-2xl font-bold">${completedSavings.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {insights.length > 0 
                    ? Math.round((insights.filter(i => i.status === 'completed').length / insights.length) * 100)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights Dashboard
              </CardTitle>
              <CardDescription>
                Smart recommendations to optimize your restaurant operations
              </CardDescription>
            </div>
            <Button 
              onClick={() => generateInsights(true)} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Regenerate Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && insights.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p>Analyzing your data to generate insights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={() => generateInsights()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No insights available yet.</p>
              <Button onClick={() => generateInsights()} className="mt-4">
                Generate Insights
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({insights.length})</TabsTrigger>
                <TabsTrigger value="waste_reduction">
                  Waste ({insightsByType.waste_reduction || 0})
                </TabsTrigger>
                <TabsTrigger value="cost_optimization">
                  Cost ({insightsByType.cost_optimization || 0})
                </TabsTrigger>
                <TabsTrigger value="inventory_optimization">
                  Inventory ({insightsByType.inventory_optimization || 0})
                </TabsTrigger>
                <TabsTrigger value="menu_optimization">
                  Menu ({insightsByType.menu_optimization || 0})
                </TabsTrigger>
              </TabsList>
              
              {['all', 'waste_reduction', 'cost_optimization', 'inventory_optimization', 'menu_optimization'].map(type => (
                <TabsContent key={type} value={type} className="space-y-4">
                  {insights
                    .filter(insight => type === 'all' || insight.type === type)
                    .map(insight => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={deleteInsight}
                        isUpdating={updatingInsight === insight.id}
                        getStatusIcon={getStatusIcon}
                        getImpactColor={getImpactColor}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface InsightCardProps {
  insight: AIInsight
  onStatusUpdate: (id: string, status: any, savings?: number) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  getStatusIcon: (status: string) => JSX.Element
  getImpactColor: (impact: string) => string
  getPriorityColor: (priority: string) => string
}

function InsightCard({ 
  insight, 
  onStatusUpdate, 
  onDelete, 
  isUpdating,
  getStatusIcon,
  getImpactColor,
  getPriorityColor
}: InsightCardProps) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: getPriorityColor(insight.priority).replace('bg-', '#') }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(insight.status)}
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <Badge className={getImpactColor(insight.impact)}>
                {insight.impact} impact
              </Badge>
            </div>
            <CardDescription>{insight.description}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              ${insight.estimated_savings.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500">potential savings</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Confidence Score */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Confidence Score</span>
              <span>{insight.confidence.toFixed(0)}%</span>
            </div>
            <Progress value={insight.confidence} className="h-2" />
          </div>

          {/* Data Points */}
          <div>
            <h4 className="font-semibold mb-2">Key Data Points</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {insight.data_points.map((point, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div>
            <h4 className="font-semibold mb-2">Recommended Actions</h4>
            <ul className="text-sm space-y-1">
              {insight.recommended_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">{index + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {insight.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(insight.id, 'in_progress')}
                disabled={isUpdating}
              >
                Start Implementation
              </Button>
            )}
            {insight.status === 'in_progress' && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(insight.id, 'completed')}
                disabled={isUpdating}
              >
                Mark Complete
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate(insight.id, 'dismissed')}
              disabled={isUpdating}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(insight.id)}
              disabled={isUpdating}
            >
              Delete
            </Button>
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Category: {insight.category}</span>
              <span>Timeframe: {insight.timeframe}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}