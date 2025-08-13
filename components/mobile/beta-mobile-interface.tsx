'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Smartphone, 
  Plus, 
  Scan, 
  Package, 
  AlertTriangle, 
  Clock,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Search,
  Camera,
  Mic,
  Target,
  Zap,
  Star,
  ChefHat,
  Users,
  Bell,
  BarChart3
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: string
  frequency: 'high' | 'medium' | 'low'
}

interface MobileAlert {
  id: string
  title: string
  message: string
  type: 'urgent' | 'warning' | 'info'
  time: string
  actionable: boolean
}

export function BetaMobileInterface() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showVoiceInput, setShowVoiceInput] = useState(false)

  // Mobile-optimized quick actions for kitchen staff
  const quickActions: QuickAction[] = [
    {
      id: 'add-item',
      title: 'Add Item',
      description: 'Quick inventory entry',
      icon: <Plus className="h-6 w-6" />,
      color: 'bg-blue-500',
      action: 'add',
      frequency: 'high'
    },
    {
      id: 'scan-barcode',
      title: 'Scan Barcode',
      description: 'Instant item lookup',
      icon: <Scan className="h-6 w-6" />,
      color: 'bg-green-500',
      action: 'scan',
      frequency: 'high'
    },
    {
      id: 'update-stock',
      title: 'Update Stock',
      description: 'Quick quantity change',
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500',
      action: 'update',
      frequency: 'high'
    },
    {
      id: 'voice-entry',
      title: 'Voice Entry',
      description: 'Hands-free updates',
      icon: <Mic className="h-6 w-6" />,
      color: 'bg-orange-500',
      action: 'voice',
      frequency: 'medium'
    },
    {
      id: 'photo-count',
      title: 'Photo Count',
      description: 'Visual inventory check',
      icon: <Camera className="h-6 w-6" />,
      color: 'bg-pink-500',
      action: 'photo',
      frequency: 'medium'
    },
    {
      id: 'alerts',
      title: 'View Alerts',
      description: 'Check urgent items',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'bg-red-500',
      action: 'alerts',
      frequency: 'high'
    }
  ]

  // Mobile alerts optimized for kitchen environment
  const mobileAlerts: MobileAlert[] = [
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Roma tomatoes: 8 lbs left (reorder at 15 lbs)',
      type: 'warning',
      time: '5 min ago',
      actionable: true
    },
    {
      id: '2',
      title: 'Expiring Soon',
      message: 'Fresh basil expires tomorrow - use in specials',
      type: 'urgent',
      time: '15 min ago',
      actionable: true
    },
    {
      id: '3',
      title: 'Waste Reduction Win',
      message: 'Pizza waste down 15% this week! 🎉',
      type: 'info',
      time: '1 hour ago',
      actionable: false
    }
  ]

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50 dark:bg-red-950'
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-950'
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Mobile Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 dark:text-blue-100">
                Mobile Kitchen Interface
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Optimized for busy restaurant operations
              </p>
            </div>
            <Badge className="bg-blue-600 text-white">BETA</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats for Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-3">
            <div className="text-center">
              <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold text-green-900 dark:text-green-100">$1,250</p>
              <p className="text-xs text-green-700 dark:text-green-300">Monthly Savings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-3">
            <div className="text-center">
              <TrendingDown className="h-6 w-6 mx-auto text-blue-600 mb-1" />
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">18.5%</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Waste Reduced</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Quick Actions Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Tap for instant access to common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all"
                onClick={() => setSelectedAction(action.id)}
              >
                <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center text-white`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Alerts</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {mobileAlerts.filter(alert => alert.actionable).length} actionable
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mobileAlerts.map((alert) => (
              <Card key={alert.id} className={`border ${getAlertColor(alert.type)}`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                    {alert.actionable && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Act
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Input Demo */}
      {showVoiceInput && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4 text-center">
            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-3">
              <Mic className="h-8 w-8 text-orange-600 animate-pulse" />
            </div>
            <p className="font-medium text-orange-900 dark:text-orange-100 mb-2">
              Listening...
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
              Say something like "Add 20 pounds of tomatoes"
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVoiceInput(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mobile Features Showcase */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Mobile Features</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Designed for kitchen environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Touch-Friendly Interface</p>
                <p className="text-xs text-muted-foreground">Large buttons, easy navigation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Mic className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Voice Commands</p>
                <p className="text-xs text-muted-foreground">Hands-free inventory updates</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Photo Recognition</p>
                <p className="text-xs text-muted-foreground">Visual inventory counting</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Offline Mode</p>
                <p className="text-xs text-muted-foreground">Works without internet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Feedback for Mobile */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How's the mobile experience?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Help us perfect the kitchen interface
            </p>
            <div className="flex space-x-2 justify-center">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Rate Mobile App
              </Button>
              <Button variant="outline" size="sm">
                Suggest Feature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Actions */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setShowVoiceInput(true)}
        >
          <Mic className="h-4 w-4 mr-2" />
          Try Voice Input
        </Button>
        <Button variant="outline" className="flex-1">
          <Camera className="h-4 w-4 mr-2" />
          Photo Demo
        </Button>
      </div>
    </div>
  )
}