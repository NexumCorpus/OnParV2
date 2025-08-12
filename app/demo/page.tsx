'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { ChefHat, Play, Pause, RotateCcw, TrendingUp, DollarSign, Package, Target, Zap, Star, Award, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [metrics, setMetrics] = useState({
    inventoryValue: 12450,
    wasteReduction: 0,
    monthlySavings: 0,
    efficiency: 65
  })

  const demoSteps = [
    {
      title: "Restaurant Setup",
      description: "Mario's Italian Kitchen starts using OnPar",
      duration: 2000,
      action: () => {
        toast.success("Restaurant profile created!")
        setMetrics(prev => ({ ...prev, efficiency: 70 }))
      }
    },
    {
      title: "Inventory Import",
      description: "Importing 24 inventory items via CSV",
      duration: 3000,
      action: () => {
        toast.success("24 inventory items imported successfully!")
        setMetrics(prev => ({ ...prev, inventoryValue: 15680 }))
      }
    },
    {
      title: "Menu Performance Setup",
      description: "Adding menu items and tracking performance",
      duration: 2500,
      action: () => {
        toast.success("Menu performance tracking activated!")
        setMetrics(prev => ({ ...prev, efficiency: 78 }))
      }
    },
    {
      title: "AI Analysis",
      description: "AI analyzing patterns and generating insights",
      duration: 4000,
      action: () => {
        toast.success("AI insights generated - 3 optimization opportunities found!")
        setMetrics(prev => ({ ...prev, wasteReduction: 12.3, monthlySavings: 680 }))
      }
    },
    {
      title: "Smart Alerts",
      description: "Setting up intelligent alerts and notifications",
      duration: 2000,
      action: () => {
        toast.success("Smart alerts configured - preventing stockouts!")
        setMetrics(prev => ({ ...prev, efficiency: 85 }))
      }
    },
    {
      title: "Optimization Results",
      description: "Achieving measurable waste reduction and cost savings",
      duration: 3000,
      action: () => {
        toast.success("🎉 15% waste reduction achieved! $680 monthly savings!")
        setMetrics(prev => ({ ...prev, wasteReduction: 15.7, monthlySavings: 847, efficiency: 92 }))
      }
    }
  ]

  const startDemo = async () => {
    setIsPlaying(true)
    setDemoProgress(0)
    setCurrentStep(0)
    
    for (let i = 0; i < demoSteps.length; i++) {
      const step = demoSteps[i]
      setCurrentStep(i)
      
      // Animate progress for this step
      const stepDuration = step.duration
      const progressIncrement = 100 / demoSteps.length
      const startProgress = i * progressIncrement
      
      for (let progress = 0; progress <= 100; progress += 2) {
        if (!isPlaying) break
        setDemoProgress(startProgress + (progress * progressIncrement / 100))
        await new Promise(resolve => setTimeout(resolve, stepDuration / 50))
      }
      
      if (!isPlaying) break
      step.action()
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsPlaying(false)
    setDemoProgress(100)
  }

  const pauseDemo = () => {
    setIsPlaying(false)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setDemoProgress(0)
    setCurrentStep(0)
    setMetrics({
      inventoryValue: 12450,
      wasteReduction: 0,
      monthlySavings: 0,
      efficiency: 65
    })
    toast.success("Demo reset to beginning")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ChefHat className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            OnPar Live Demo
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
            Watch how OnPar transforms restaurant operations in real-time. 
            See actual waste reduction and cost savings in action.
          </p>
          
          {/* Demo Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button 
              onClick={startDemo} 
              disabled={isPlaying}
              size="lg"
              className="btn-primary-enhanced px-8 py-4 text-lg font-bold rounded-2xl shadow-xl"
            >
              <Play className="h-6 w-6 mr-3" />
              Start Demo
            </Button>
            <Button 
              onClick={pauseDemo} 
              disabled={!isPlaying}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-bold rounded-2xl"
            >
              <Pause className="h-6 w-6 mr-3" />
              Pause
            </Button>
            <Button 
              onClick={resetDemo}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-bold rounded-2xl"
            >
              <RotateCcw className="h-6 w-6 mr-3" />
              Reset
            </Button>
          </div>
        </div>

        {/* Demo Progress */}
        <Card className="mb-12 shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Demo Progress</h3>
                <Badge className="text-lg px-4 py-2 font-bold">
                  Step {currentStep + 1} of {demoSteps.length}
                </Badge>
              </div>
              
              <Progress value={demoProgress} className="h-4" />
              
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">{demoSteps[currentStep]?.title}</h4>
                <p className="text-muted-foreground text-lg">{demoSteps[currentStep]?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="metric-card group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Inventory Value</CardTitle>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-600 mb-2">
                ${metrics.inventoryValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Total inventory value
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Waste Reduction</CardTitle>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-600 mb-2">
                {metrics.wasteReduction.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Achieved this month
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Monthly Savings</CardTitle>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-purple-600 mb-2">
                ${metrics.monthlySavings}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Cost savings achieved
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Efficiency Score</CardTitle>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-orange-600 mb-2">
                {metrics.efficiency}%
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Overall efficiency
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Scenarios */}
        <Tabs defaultValue="scenario1" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 p-2 bg-muted/50 rounded-3xl h-16 shadow-lg">
            <TabsTrigger value="scenario1" className="flex items-center space-x-3 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-base py-3">
              <Package className="h-5 w-5" />
              <span>Inventory Crisis</span>
            </TabsTrigger>
            <TabsTrigger value="scenario2" className="flex items-center space-x-3 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-base py-3">
              <Target className="h-5 w-5" />
              <span>Waste Reduction</span>
            </TabsTrigger>
            <TabsTrigger value="scenario3" className="flex items-center space-x-3 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-base py-3">
              <Zap className="h-5 w-5" />
              <span>AI Optimization</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenario1" className="space-y-6">
            <Card className="card-premium shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-b">
                <CardTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center space-x-3">
                  <Package className="h-6 w-6" />
                  <span>Scenario: Preventing Stockout Crisis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">Without OnPar</h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Day 1: Mozzarella runs out</div>
                        <div className="text-sm text-red-700 dark:text-red-300">Can't make 15 pizza orders - $450 lost revenue</div>
                      </div>
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Day 2: Emergency supplier run</div>
                        <div className="text-sm text-red-700 dark:text-red-300">Pay 40% premium for same-day delivery</div>
                      </div>
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Total Impact</div>
                        <div className="text-sm text-red-700 dark:text-red-300">$680 lost + customer dissatisfaction</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">With OnPar</h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Day -3: Smart alert sent</div>
                        <div className="text-sm text-green-700 dark:text-green-300">"Mozzarella below reorder point - order now"</div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Day -2: Order placed</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Regular supplier pricing, normal delivery</div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Result</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Zero stockouts, happy customers, $680 saved</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario2" className="space-y-6">
            <Card className="card-premium shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b">
                <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200 flex items-center space-x-3">
                  <Target className="h-6 w-6" />
                  <span>Scenario: 15% Waste Reduction Achievement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl font-black text-green-600 mb-4">{metrics.wasteReduction.toFixed(1)}%</div>
                  <div className="text-xl text-green-700 dark:text-green-300 font-bold">Waste Reduction Achieved</div>
                  <div className="text-lg text-muted-foreground">Saving ${metrics.monthlySavings}/month</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">Menu Optimization</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Identified 3 high-waste items</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">Portion Control</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Optimized 5 menu portions</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">Smart Ordering</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Prevented $340 in waste</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario3" className="space-y-6">
            <Card className="card-premium shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
                <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200 flex items-center space-x-3">
                  <Zap className="h-6 w-6" />
                  <span>Scenario: AI Optimization in Action</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>AI Analysis</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                        <div className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Pattern Recognition</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Analyzed 30 days of sales data</div>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                        <div className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Predictive Modeling</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Forecasted demand for next 14 days</div>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                        <div className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Optimization Engine</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Generated 8 actionable recommendations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg flex items-center space-x-2">
                      <Star className="h-5 w-5 text-orange-600" />
                      <span>Results</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                        <div className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Cost Reduction</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">15% reduction in food costs</div>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                        <div className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Waste Prevention</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">Prevented $340 in food waste</div>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                        <div className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Time Savings</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">2.5 hours saved per week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 border-primary/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Star className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-6">Ready to Transform Your Restaurant?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Join 50+ Charleston restaurants already saving 10-20% on food costs with OnPar's intelligent inventory management.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6 rounded-2xl shadow-xl">
                <Zap className="h-6 w-6 mr-3" />
                Start Your Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-12 py-6 rounded-2xl border-2">
                <Clock className="h-6 w-6 mr-3" />
                Schedule Demo Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}