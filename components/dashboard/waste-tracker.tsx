'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/supabase'
import { Target, TrendingDown, Award, Calendar, DollarSign, Zap, Star, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface WasteTrackerProps {
  menuItems: MenuItem[]
  currentReduction: number
  goal: number
  onGoalChange: (goal: number) => void
}

export function WasteTracker({ menuItems, currentReduction, goal, onGoalChange }: WasteTrackerProps) {
  const [newGoal, setNewGoal] = useState(goal.toString())
  const [showGoalEditor, setShowGoalEditor] = useState(false)

  const progress = Math.min(100, (currentReduction / goal) * 100)
  const isGoalMet = currentReduction >= goal
  const avgWaste = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
    : 0

  const handleUpdateGoal = () => {
    const goalValue = parseFloat(newGoal)
    if (goalValue > 0 && goalValue <= 50) {
      onGoalChange(goalValue)
      setShowGoalEditor(false)
      toast.success(`Waste reduction goal updated to ${goalValue}%`)
    } else {
      toast.error('Goal must be between 1% and 50%')
    }
  }

  const getWasteLevel = (waste: number) => {
    if (waste <= 3) return { level: 'Excellent', color: 'green', icon: CheckCircle }
    if (waste <= 6) return { level: 'Good', color: 'blue', icon: Target }
    if (waste <= 10) return { level: 'Fair', color: 'yellow', icon: AlertTriangle }
    return { level: 'Needs Work', color: 'red', icon: AlertTriangle }
  }

  const wasteLevel = getWasteLevel(avgWaste)
  const WasteLevelIcon = wasteLevel.icon

  return (
    <div className="space-y-6">
      {/* Main Waste Tracker Card */}
      <Card className={`card-premium shadow-xl ${isGoalMet ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800' : ''}`}>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${isGoalMet ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-red-500'} flex items-center justify-center shadow-lg`}>
                <Target className="h-6 w-6 text-white" />
              </div>
              <span>Waste Reduction Tracker</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              {isGoalMet && (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 font-bold">
                  <Award className="w-4 h-4 mr-2" />
                  Goal Achieved!
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowGoalEditor(!showGoalEditor)}
                className="font-semibold"
              >
                Edit Goal
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Goal Editor */}
          {showGoalEditor && (
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
              <Label htmlFor="waste-goal">Monthly Waste Reduction Goal (%)</Label>
              <div className="flex space-x-3">
                <Input
                  id="waste-goal"
                  type="number"
                  min="1"
                  max="50"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUpdateGoal} className="px-6">
                  Update
                </Button>
                <Button variant="outline" onClick={() => setShowGoalEditor(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Progress Display */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Current Progress</h3>
                <p className="text-muted-foreground">Target: {goal}% waste reduction this month</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-black ${isGoalMet ? 'text-green-600' : 'text-orange-600'} mb-1`}>
                  {currentReduction.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground font-medium">Achieved</div>
              </div>
            </div>
            
            <Progress value={progress} className="h-4" />
            
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Started: 0%</span>
              <span className={isGoalMet ? 'text-green-600 font-bold' : 'text-orange-600'}>
                Current: {currentReduction.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">Goal: {goal}%</span>
            </div>
          </div>

          {/* Waste Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
              <div className="flex items-center space-x-3 mb-4">
                <WasteLevelIcon className={`h-6 w-6 text-${wasteLevel.color}-600`} />
                <h4 className="font-bold text-lg">Current Waste Level</h4>
              </div>
              <div className="text-3xl font-black mb-2" style={{ color: `hsl(var(--chart-${wasteLevel.color === 'green' ? '1' : wasteLevel.color === 'blue' ? '2' : wasteLevel.color === 'yellow' ? '4' : '5'}))` }}>
                {avgWaste.toFixed(1)}%
              </div>
              <Badge className={`bg-${wasteLevel.color}-100 text-${wasteLevel.color}-800 border-${wasteLevel.color}-200 font-bold`}>
                {wasteLevel.level}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Average across {menuItems.length} menu items
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Monthly Impact</h4>
              </div>
              <div className="text-3xl font-black text-green-600 mb-2">
                ${(currentReduction * 50).toFixed(0)}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                Estimated savings from waste reduction
              </div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Weekly Breakdown</h4>
            <div className="grid grid-cols-4 gap-4">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, index) => {
                const weekProgress = Math.min(100, ((index + 1) / 4) * progress)
                const weekReduction = (currentReduction / 4) * (index + 1)
                
                return (
                  <div key={week} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="text-lg font-bold mb-2">{weekReduction.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground mb-3">{week}</div>
                    <Progress value={weekProgress} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Achievement Badges */}
          {isGoalMet && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-xl">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  🎉 Congratulations!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-lg">
                  You've achieved your {goal}% waste reduction goal! 
                  Consider setting a new challenge to continue improving.
                </p>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-3"
                  onClick={() => setShowGoalEditor(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}