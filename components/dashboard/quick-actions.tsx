'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InventoryForm } from './inventory-form'
import { MenuForm } from './menu-form'
import { Plus, Package, ChefHat, Upload, Zap, TrendingUp, BarChart3, Star, ArrowRight } from 'lucide-react'

interface QuickActionsProps {
  onInventoryAdded: () => void
  onMenuAdded: () => void
  isPremium: boolean
}

export function QuickActions({ onInventoryAdded, onMenuAdded, isPremium }: QuickActionsProps) {
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false)
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)

  const quickActions = [
    {
      title: 'Add Inventory',
      description: 'Quickly add a new item',
      icon: Package,
      action: () => setInventoryDialogOpen(true),
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Add Menu Item',
      description: 'Track performance',
      icon: ChefHat,
      action: () => setMenuDialogOpen(true),
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Bulk Import',
      description: 'Upload CSV file',
      icon: Upload,
      action: () => {
        console.log('Bulk import clicked')
      },
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'AI Insights',
      description: 'Smart recommendations',
      icon: Zap,
      action: () => {
        console.log('AI insights clicked')
      },
      gradient: 'from-orange-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950',
      borderColor: 'border-orange-200 dark:border-orange-800',
      premium: true,
    },
  ]

  return (
    <>
      <Card className="card-premium shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-6">
          <CardTitle className="flex items-center space-x-4 text-xl font-bold">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              const isDisabled = action.premium && !isPremium
              
              return (
                <Button
                  key={action.title}
                  variant="ghost"
                  className={`h-auto p-6 flex items-center justify-between text-left hover-lift rounded-2xl bg-gradient-to-r ${action.bgGradient} border-2 ${action.borderColor} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'}`}
                  onClick={isDisabled ? undefined : action.action}
                  disabled={isDisabled}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-base flex items-center space-x-2">
                        <span>{action.title}</span>
                        {action.premium && (
                          <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 font-bold px-2 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium mt-1">{action.description}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Quick Link */}
      <Card className="card-premium bg-gradient-to-br from-primary/8 to-chart-2/8 border-primary/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold mb-3 text-lg">View Analytics</h3>
          <p className="text-base text-muted-foreground mb-6 font-medium">
            Detailed insights and performance metrics
          </p>
          <Button variant="outline" size="default" className="w-full hover-lift px-6 py-3 font-semibold rounded-xl">
            Open Analytics
            <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryForm 
            onSuccess={() => {
              setInventoryDialogOpen(false)
              onInventoryAdded()
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Menu Item</DialogTitle>
          </DialogHeader>
          <MenuForm 
            onSuccess={() => {
              setMenuDialogOpen(false)
              onMenuAdded()
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}