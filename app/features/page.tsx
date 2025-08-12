'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { 
  ChefHat, Package, Brain, TrendingDown, DollarSign, Smartphone, 
  BarChart3, Bell, Shield, Zap, Star, Target, Clock, Award,
  CheckCircle, ArrowRight, Play, Users, Globe, Camera
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState('inventory')

  const coreFeatures = [
    {
      id: 'inventory',
      title: 'Smart Inventory Tracking',
      description: 'Track quantities, expiry dates, and reorder points with intelligent alerts',
      icon: Package,
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
      benefits: [
        'Real-time quantity tracking',
        'Expiry date monitoring',
        'Smart reorder alerts',
        'Barcode scanning support',
        'CSV bulk import',
        'Mobile-optimized interface'
      ],
      demo: 'Watch how smart alerts prevent stockouts and reduce waste'
    },
    {
      id: 'recipes',
      title: 'Recipe Cost Management',
      description: 'Track ingredient costs, calculate profit margins, and optimize menu profitability',
      icon: ChefHat,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
      benefits: [
        'Real-time cost calculation',
        'Profit margin analysis',
        'Ingredient cost tracking',
        'Menu optimization insights',
        'Popularity scoring',
        'Waste percentage monitoring'
      ],
      demo: 'See how recipe costing identifies your most profitable dishes'
    },
    {
      id: 'ai-insights',
      title: 'AI Waste Reduction',
      description: 'Machine learning algorithms identify waste patterns and suggest optimizations',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
      benefits: [
        'Predictive waste analytics',
        'Menu optimization suggestions',
        'Demand forecasting',
        'Cost reduction insights',
        'Seasonal adjustments',
        'Actionable step-by-step plans',
        'Priority-based recommendations'
      ],
      demo: 'See AI identify $680/month in potential savings',
      premium: true
    },
    {
      id: 'alerts',
      title: 'Intelligent Alerts',
      description: 'Customizable notifications for low stock, expiry, and budget management',
      icon: Bell,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
      benefits: [
        'Low stock notifications',
        'Expiry warnings',
        'Budget overspend alerts',
        'Email and push notifications',
        'Customizable thresholds',
        'Real-time updates'
      ],
      demo: 'Experience proactive alerts that save money'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Comprehensive dashboards and reports for data-driven decisions',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      benefits: [
        'Waste reduction tracking',
        'Cost analysis reports',
        'Menu performance metrics',
        'Trend visualization',
        'ROI calculations',
        'Recipe profitability analysis',
        'Integration with POS systems'
      ],
      demo: 'Explore detailed analytics and insights'
    }
  ]

  const advancedFeatures = [
    {
      title: 'Barcode Scanner Integration',
      description: 'Quickly add inventory items using your device camera',
      icon: Camera,
      status: 'Available'
    },
    {
      title: 'Recipe Cost Analysis',
      description: 'Track ingredient costs and optimize menu profitability',
      icon: ChefHat,
      status: 'Available'
    },
    {
      title: 'Supplier Integration',
      description: 'Direct ordering from preferred suppliers',
      icon: Globe,
      status: 'Coming Soon'
    },
    {
      title: 'Team Collaboration',
      description: 'Multi-user access with role-based permissions',
      icon: Users,
      status: 'In Development'
    },
  ]

  const selectedFeature = coreFeatures.find(f => f.id === activeFeature)
  const FeatureIcon = selectedFeature?.icon || Package

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-primary/20 to-chart-2/20 border-primary/30 font-bold shadow-lg">
            <Star className="w-5 h-5 mr-2" />
            Comprehensive Feature Set
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Powerful Features</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Everything you need to reduce waste, optimize costs, and streamline your restaurant operations
          </p>
        </div>

        {/* Interactive Feature Explorer */}
        <div className="mb-16">
          <Card className="card-premium shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
              <CardTitle className="text-3xl font-bold text-center">Interactive Feature Explorer</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feature Navigation */}
                <div className="space-y-4">
                  {coreFeatures.map((feature) => {
                    const Icon = feature.icon
                    const isActive = activeFeature === feature.id
                    
                    return (
                      <Button
                        key={feature.id}
                        variant={isActive ? 'default' : 'outline'}
                        className={`w-full h-auto p-6 text-left justify-start rounded-2xl transition-all duration-300 ${
                          isActive ? 'shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'
                        }`}
                        onClick={() => setActiveFeature(feature.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-base flex items-center space-x-2">
                              <span>{feature.title}</span>
                              {feature.premium && (
                                <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 font-bold">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>

                {/* Feature Details */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedFeature && (
                    <>
                      <div className={`p-8 rounded-3xl bg-gradient-to-br ${selectedFeature.bgGradient} border-2 border-opacity-50`}>
                        <div className="flex items-center space-x-4 mb-6">
                          <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center shadow-xl`}>
                            <FeatureIcon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold mb-2">{selectedFeature.title}</h3>
                            <p className="text-lg text-muted-foreground">{selectedFeature.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedFeature.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/50">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span className="font-medium">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 rounded-xl bg-white/70 dark:bg-black/30 border border-white/70">
                          <div className="flex items-center space-x-3">
                            <Play className="h-5 w-5 text-primary" />
                            <span className="font-semibold">{selectedFeature.demo}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-xl text-muted-foreground">Cutting-edge capabilities for modern restaurants</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <Card key={index} className="card-premium hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">{feature.title}</h3>
                          <Badge 
                            className={`
                              font-bold text-xs px-3 py-1
                              ${feature.status === 'Available' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              ${feature.status === 'Premium' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                              ${feature.status === 'Coming Soon' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                              ${feature.status === 'In Development' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                            `}
                          >
                            {feature.status}
                          </Badge>
                        </div>
                        <p className="text-foreground/80 leading-relaxed mb-4">{feature.description}</p>
                        <Button variant="outline" size="sm" className="font-semibold">
                          Learn More
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <Card className="card-premium shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
              <CardTitle className="text-3xl font-bold text-center">OnPar vs Traditional Methods</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-6 text-red-600">Manual Tracking</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-700 dark:text-red-300">❌ Time-consuming</div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-700 dark:text-red-300">❌ Error-prone</div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-700 dark:text-red-300">❌ No insights</div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-700 dark:text-red-300">❌ Reactive only</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-xl font-bold mb-6 text-yellow-600">Basic Software</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ Limited features</div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ No AI insights</div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ Generic alerts</div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ Poor mobile experience</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-xl font-bold mb-6 text-green-600">OnPar</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-300">✅ AI-powered insights</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-300">✅ Predictive analytics</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-300">✅ Smart automation</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-300">✅ Mobile-first design</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-8">
                Calculate Your Potential Savings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600 mb-2">10-20%</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Waste Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600 mb-2">$500+</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Monthly Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600 mb-2">2.5h</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Time Saved/Week</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600 mb-2">5x</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">ROI on Subscription</div>
                </div>
              </div>
              
              <p className="text-xl text-green-700 dark:text-green-300 leading-relaxed mb-8">
                Based on average results from 50+ Charleston restaurants
              </p>
              
              <Link href="/beta-signup">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-xl">
                  <Star className="h-6 w-6 mr-3" />
                  Join Beta Program
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Security & Compliance */}
        <div className="mb-16">
          <Card className="card-premium shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
              <CardTitle className="text-3xl font-bold text-center flex items-center justify-center space-x-3">
                <Shield className="h-8 w-8 text-primary" />
                <span>Security & Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">Data Encryption</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">End-to-end encryption for all data</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="font-bold text-green-800 dark:text-green-200 mb-2">GDPR Compliant</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Full privacy protection</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="font-bold text-purple-800 dark:text-purple-200 mb-2">SOC 2 Ready</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Enterprise security standards</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <div className="font-bold text-orange-800 dark:text-orange-200 mb-2">99.9% Uptime</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Reliable cloud infrastructure</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 border-primary/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-black mb-6">Ready to Experience OnPar?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Join the beta program and start reducing waste while increasing profits
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/demo">
                <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6 rounded-2xl shadow-xl">
                  <Play className="h-6 w-6 mr-3" />
                  Watch Live Demo
                </Button>
              </Link>
              <Link href="/beta-signup">
                <Button size="lg" variant="outline" className="text-xl px-12 py-6 rounded-2xl border-2">
                  <Star className="h-6 w-6 mr-3" />
                  Apply for Beta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}