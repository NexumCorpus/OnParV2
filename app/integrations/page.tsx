'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { 
  Plug, CreditCard, Truck, BarChart3, Smartphone, Globe, 
  CheckCircle, Clock, Star, Zap, ArrowRight, Settings,
  Package, Users, Calendar, Shield, Award
} from 'lucide-react'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  category: 'pos' | 'supplier' | 'payment' | 'analytics' | 'communication'
  description: string
  benefits: string[]
  status: 'available' | 'coming_soon' | 'in_development' | 'planned'
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgGradient: string
  borderColor: string
  estimatedSavings?: string
  setupTime?: string
  popularity?: number
}

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const integrations: Integration[] = [
    {
      id: 'square',
      name: 'Square POS',
      category: 'pos',
      description: 'Seamlessly sync sales data with inventory to track real-time usage and automatically update stock levels.',
      benefits: [
        'Automatic inventory deduction on sales',
        'Real-time stock level updates',
        'Sales-based reorder suggestions',
        'Integrated payment processing',
        'Customer analytics integration'
      ],
      status: 'coming_soon',
      icon: CreditCard,
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      estimatedSavings: '$200-400/month',
      setupTime: '15 minutes',
      popularity: 95
    },
    {
      id: 'toast',
      name: 'Toast POS',
      category: 'pos',
      description: 'Connect with Toast POS for comprehensive restaurant management including inventory, sales, and staff scheduling.',
      benefits: [
        'Complete restaurant ecosystem',
        'Advanced analytics dashboard',
        'Staff scheduling integration',
        'Customer loyalty programs',
        'Multi-location support'
      ],
      status: 'in_development',
      icon: Smartphone,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      borderColor: 'border-green-200 dark:border-green-800',
      estimatedSavings: '$300-600/month',
      setupTime: '30 minutes',
      popularity: 88
    },
    {
      id: 'sysco',
      name: 'Sysco Supplier Portal',
      category: 'supplier',
      description: 'Direct ordering from Sysco with automated reorder suggestions based on your inventory levels and usage patterns.',
      benefits: [
        'One-click reordering',
        'Bulk pricing optimization',
        'Delivery scheduling',
        'Invoice automation',
        'Product catalog integration'
      ],
      status: 'planned',
      icon: Truck,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
      borderColor: 'border-orange-200 dark:border-orange-800',
      estimatedSavings: '$150-300/month',
      setupTime: '45 minutes',
      popularity: 82
    },
    {
      id: 'us-foods',
      name: 'US Foods Connect',
      category: 'supplier',
      description: 'Streamlined ordering and delivery management with US Foods, including special pricing for OnPar users.',
      benefits: [
        'Preferred pricing tiers',
        'Priority delivery slots',
        'Product recommendations',
        'Sustainability tracking',
        'Quality assurance reports'
      ],
      status: 'planned',
      icon: Package,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
      estimatedSavings: '$100-250/month',
      setupTime: '30 minutes',
      popularity: 75
    },
    {
      id: 'stripe',
      name: 'Stripe Billing',
      category: 'payment',
      description: 'Secure payment processing for subscription management and customer billing.',
      benefits: [
        'Secure payment processing',
        'Subscription management',
        'Automated invoicing',
        'Multiple payment methods',
        'Fraud protection'
      ],
      status: 'available',
      icon: CreditCard,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      setupTime: '10 minutes',
      popularity: 98
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Integration',
      category: 'analytics',
      description: 'Sync inventory costs and sales data with QuickBooks for comprehensive financial reporting.',
      benefits: [
        'Automated expense tracking',
        'Financial reporting',
        'Tax preparation support',
        'Cash flow analysis',
        'Profit & loss integration'
      ],
      status: 'coming_soon',
      icon: BarChart3,
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950',
      borderColor: 'border-teal-200 dark:border-teal-800',
      estimatedSavings: '$100-200/month',
      setupTime: '20 minutes',
      popularity: 85
    },
    {
      id: 'slack',
      name: 'Slack Notifications',
      category: 'communication',
      description: 'Receive inventory alerts and insights directly in your team Slack channels.',
      benefits: [
        'Team-wide notifications',
        'Custom alert channels',
        'Daily summary reports',
        'Integration with workflows',
        'Mobile notifications'
      ],
      status: 'available',
      icon: Users,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950',
      borderColor: 'border-pink-200 dark:border-pink-800',
      setupTime: '5 minutes',
      popularity: 78
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'communication',
      description: 'Schedule delivery reminders, inventory counts, and menu planning directly in your calendar.',
      benefits: [
        'Automated scheduling',
        'Delivery reminders',
        'Inventory count alerts',
        'Menu planning integration',
        'Team calendar sync'
      ],
      status: 'in_development',
      icon: Calendar,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      setupTime: '10 minutes',
      popularity: 72
    }
  ]

  const categories = [
    { id: 'all', label: 'All Integrations', icon: Globe },
    { id: 'pos', label: 'POS Systems', icon: CreditCard },
    { id: 'supplier', label: 'Suppliers', icon: Truck },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'communication', label: 'Communication', icon: Users }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_development':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now'
      case 'coming_soon': return 'Coming Soon'
      case 'in_development': return 'In Development'
      case 'planned': return 'Planned'
      default: return 'Unknown'
    }
  }

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg font-bold">
            <Plug className="w-5 h-5 mr-2" />
            Powerful Integrations
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Connect Everything</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Seamlessly integrate OnPar with your existing tools and workflows for maximum efficiency
          </p>
        </div>

        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Card className="metric-card text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Plug className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-600 mb-1">{integrations.length}</div>
              <p className="text-sm text-muted-foreground font-medium">Total Integrations</p>
            </CardContent>
          </Card>
          
          <Card className="metric-card text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-black text-green-600 mb-1">
                {integrations.filter(i => i.status === 'available').length}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Available Now</p>
            </CardContent>
          </Card>
          
          <Card className="metric-card text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-orange-600 mb-1">
                {integrations.filter(i => i.status === 'coming_soon').length}
              </div>
              <p className="text-sm text-muted-foreground font-medium">Coming Soon</p>
            </CardContent>
          </Card>
          
          <Card className="metric-card text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-600 mb-1">
                {Math.round(integrations.reduce((sum, i) => sum + (i.popularity || 0), 0) / integrations.length)}%
              </div>
              <p className="text-sm text-muted-foreground font-medium">Avg Popularity</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            const count = category.id === 'all' 
              ? integrations.length 
              : integrations.filter(i => i.category === category.id).length
            
            return (
              <Button
                key={category.id}
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  isActive ? 'shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.label}</span>
                <Badge variant="secondary" className="ml-2 font-bold">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon
            
            return (
              <Card key={integration.id} className="card-premium hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="pb-6 p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {integration.name}
                        </CardTitle>
                        <div className="flex items-center space-x-3">
                          <Badge className={`text-sm font-bold px-3 py-1 ${getStatusBadge(integration.status)}`}>
                            {getStatusLabel(integration.status)}
                          </Badge>
                          {integration.popularity && (
                            <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                              {integration.popularity}% popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 p-8 pt-0">
                  <p className="text-base text-foreground/85 leading-relaxed font-medium">
                    {integration.description}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Key Benefits</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {integration.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Integration Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {integration.estimatedSavings && (
                      <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div className="text-lg font-bold text-green-600 mb-1">{integration.estimatedSavings}</div>
                        <div className="text-xs text-green-700 dark:text-green-300 font-medium">Est. Savings</div>
                      </div>
                    )}
                    {integration.setupTime && (
                      <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <div className="text-lg font-bold text-blue-600 mb-1">{integration.setupTime}</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Setup Time</div>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full btn-primary-enhanced py-3 font-bold rounded-xl"
                    disabled={integration.status !== 'available'}
                  >
                    {integration.status === 'available' ? (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Integration
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        {getStatusLabel(integration.status)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Integration Roadmap */}
        <Card className="card-premium shadow-xl mb-16">
          <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
            <CardTitle className="text-3xl font-bold text-center">Integration Roadmap</CardTitle>
            <p className="text-center text-muted-foreground text-lg mt-2">
              Our planned integrations for the next 12 months
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
                  <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">Q1 2025</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Square POS Integration</li>
                    <li>• QuickBooks Sync</li>
                    <li>• Enhanced Mobile App</li>
                  </ul>
                </div>
                <div className="text-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Clock className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Q2 2025</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Toast POS Integration</li>
                    <li>• Supplier Portal (Sysco)</li>
                    <li>• Advanced Analytics</li>
                  </ul>
                </div>
                <div className="text-center p-6 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <Star className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">Q3 2025</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Multi-location Support</li>
                    <li>• API for Custom Integrations</li>
                    <li>• Enterprise Features</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Program */}
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Award className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-6">Become an Integration Partner</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Are you a POS provider, supplier, or software company? Partner with OnPar to reach thousands of small restaurants.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6 rounded-2xl shadow-xl">
                  <Users className="h-6 w-6 mr-3" />
                  Partner with Us
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-xl px-12 py-6 rounded-2xl border-2">
                <Shield className="h-6 w-6 mr-3" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}