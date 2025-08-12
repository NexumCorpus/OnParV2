'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, TrendingDown, DollarSign, Smartphone, BarChart3, Shield, Zap, Star, ArrowRight, CheckCircle, Users, Clock, Award, Plug } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-lg">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-sm border-2 border-background"></div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-black bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">OnPar</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md px-3 py-1 text-xs font-bold">
                    BETA
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">Smart Inventory Management</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <nav className="hidden lg:flex items-center space-x-8">
                <Link href="/pricing" className="nav-link text-base font-medium">
                  Pricing
                </Link>
                <Link href="#features" className="nav-link text-base font-medium">
                  Features
                </Link>
                <Link href="#testimonials" className="nav-link text-base font-medium">
                  Reviews
                </Link>
              </nav>
              <Link href="/auth">
                <Button className="btn-primary-enhanced px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-60"></div>
        <div className="container mx-auto px-4 py-32 lg:py-40 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 hover:shadow-lg transition-all duration-300 text-sm font-semibold" variant="secondary">
                <Star className="w-5 h-5 mr-2" />
                🧪 Now in Beta - Join 50+ Charleston Restaurants
              </Badge>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tight">
                <span className="block text-gradient">Cut Food Waste</span>
                <span className="block text-foreground">by 10-20%.</span>
                <span className="block text-muted-foreground text-3xl md:text-5xl lg:text-6xl font-bold mt-6">
                  Save $500+ Monthly.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground/85 mb-16 max-w-5xl mx-auto leading-[1.4] font-normal">
                The only inventory system built specifically for small restaurants. 
                <span className="font-bold text-primary">Cut the 4-10% inventory waste</span> that costs the US industry 
                <span className="font-black text-chart-2">$162 billion annually</span> with intelligent alerts, smart insights, and automated reorder suggestions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
                <Link href="/auth">
                  <Button size="lg" className="btn-primary-enhanced text-xl px-16 py-8 min-h-[5rem] shadow-xl hover:shadow-2xl font-bold tracking-wide">
                    <Zap className="mr-3 h-6 w-6" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-xl px-16 py-8 min-h-[5rem] border-2 hover:bg-muted/30 hover:border-primary/60 hover:shadow-xl font-semibold">
                    <BarChart3 className="mr-3 h-6 w-6" />
                    View Pricing
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center space-x-3 text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Free 14-day trial</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="text-center mb-20">
              <p className="text-xl text-muted-foreground mb-12 font-medium">Trusted by restaurants across Charleston, SC</p>
              <div className="flex justify-center items-center space-x-12 opacity-70">
                <div className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors">Mario's</div>
                <div className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors">Dragon Wok</div>
                <div className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors">Café Bloom</div>
                <div className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors">Taco Sol</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-section bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <Badge className="mb-8 px-6 py-3 text-base font-semibold" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Built for Small Restaurants
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-12 leading-tight tracking-tight">
                <span className="text-gradient">Powerful Features</span><br />
                <span className="text-foreground">Simple Pricing</span>
              </h2>
              <p className="text-xl md:text-2xl text-foreground/85 max-w-4xl mx-auto leading-relaxed font-medium">
                Affordable, intuitive tools designed for restaurants with 1-50 employees
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              <div className="feature-card group">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <TrendingDown className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">AI Waste Reduction</h3>
                </div>
                <p className="text-foreground/75 leading-relaxed mb-6 text-base">
                  Advanced AI analyzes your data to provide step-by-step action plans for waste reduction. 
                  Get specific recommendations with priority levels and implementation timelines.
                </p>
                <div className="flex items-center text-sm text-primary font-bold group-hover:translate-x-1 transition-transform duration-200">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Recipe Cost Analysis</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Track ingredient costs, calculate profit margins, and optimize your menu for maximum profitability. 
                  Identify your most and least profitable dishes.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>Explore recipes</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Affordable for Small Business</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Starting at just $49/month - pays for itself in the first week. 
                  No complex enterprise features you don't need.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>See pricing</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Menu Optimization</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Identify which dishes create the most waste and get suggestions 
                  for portion sizes, ingredients, and pricing adjustments.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>Explore features</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Mobile-First Design</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Update inventory from your phone, tablet, or computer. 
                  No app downloads required - works perfectly in any browser.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>Try demo</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Smart Reorder Suggestions</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Never run out of ingredients again. Smart algorithms analyze your usage patterns 
                  and suggest optimal reorder quantities and timing.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>See how it works</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="feature-card group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plug className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">POS & Supplier Integrations</h3>
                </div>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Connect with Square, Toast, Sysco, and other popular restaurant tools. 
                  Seamless data sync and automated workflows.
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>View integrations</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-chart-2/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="stats-grid">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">10-20%</div>
                <div className="text-lg font-semibold text-foreground/80">Waste Reduction</div>
                <div className="text-sm text-muted-foreground">Average customer savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-chart-2 mb-2">$500+</div>
                <div className="text-lg font-semibold text-foreground/80">Monthly Savings</div>
                <div className="text-sm text-muted-foreground">Typical restaurant</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-chart-4 mb-2">5 min</div>
                <div className="text-lg font-semibold text-foreground/80">Setup Time</div>
                <div className="text-sm text-muted-foreground">From signup to savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-chart-5 mb-2">50+</div>
                <div className="text-lg font-semibold text-foreground/80">Beta Users</div>
                <div className="text-sm text-muted-foreground">Charleston restaurants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                <span className="text-gradient">Pricing That Makes Sense</span><br />
                <span className="text-foreground">for Small Restaurants</span>
              </h2>
              <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                Most customers save 5-10x their subscription cost in reduced waste
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="pricing-card">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Base Subscription</h3>
                  <p className="text-muted-foreground mb-6">Perfect for restaurants with 1-15 employees</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-black">$49</span>
                    <span className="text-xl text-muted-foreground ml-2">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">+ $299 one-time setup</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Smart inventory tracking',
                    'Customizable alerts',
                    'Waste reduction insights',
                    'Budget monitoring',
                    'Mobile access',
                    'Email support'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full btn-primary-enhanced py-3">
                  Start with Base Plan
                </Button>
              </div>

              <div className="pricing-card featured">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="premium-badge px-4 py-2">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">AI Premium Add-on</h3>
                  <p className="text-muted-foreground mb-6">Advanced features and analytics</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-black">$29</span>
                    <span className="text-xl text-muted-foreground ml-2">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Requires Base Subscription</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Dynamic waste reduction predictions',
                    'Future ordering optimization',
                    'Advanced AI insights',
                    '15% potential cost savings',
                    'Predictive analytics',
                    'Priority customer support'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Add AI Premium
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-6 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <div className="font-bold text-green-800 dark:text-green-200">30-Day Money-Back Guarantee</div>
                  <div className="text-sm text-green-700 dark:text-green-300">If food costs don't drop 2%, full refund</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What Restaurant Owners Say
              </h2>
              <p className="text-xl text-muted-foreground">Real results from real restaurants</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Mario Rossi",
                  restaurant: "Mario's Italian Kitchen",
                  quote: "OnPar helped us reduce food waste by 18% in just 2 months. The smart alerts are a game-changer.",
                  savings: "$680/month"
                },
                {
                  name: "Sophie Chen",
                  restaurant: "Café Bloom",
                  quote: "The mobile interface is perfect for our busy kitchen. We can update inventory on the go.",
                  savings: "$420/month"
                },
                {
                  name: "Carlos Rodriguez",
                  restaurant: "Taco Sol",
                  quote: "Setup was incredibly easy. The CSV import saved us hours of manual data entry.",
                  savings: "$550/month"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="card-premium p-6 text-center">
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-lg italic text-foreground/80 mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{testimonial.restaurant}</div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Saves {testimonial.savings}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-chart-2/10 to-chart-4/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <Badge className="mb-6 px-6 py-3 text-lg bg-gradient-to-r from-primary/20 to-chart-2/20 border-primary/30">
                <Zap className="w-5 h-5 mr-2" />
                Limited Beta Access
              </Badge>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                <span className="text-gradient">Join the Beta</span><br />
                <span className="text-foreground">Help Us Perfect OnPar</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed">
                We're in beta with 50+ Charleston restaurants. Join early access to help us build 
                the perfect tool for small restaurant inventory management.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6 min-h-[4rem] shadow-xl hover:shadow-2xl">
                  <Star className="mr-3 h-6 w-6" />
                  Join Beta - Early Access
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-xl px-12 py-6 min-h-[4rem] border-2 hover:bg-primary/5 hover:border-primary/50">
                  <BarChart3 className="mr-3 h-6 w-6" />
                  View Full Pricing
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Free beta access</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Built by kitchen insiders</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Charleston, SC based</span>
              </div>
            </div>
            
            <p className="text-base text-muted-foreground mt-8 leading-relaxed">
              Questions? <a href="mailto:support@onpar.app" className="text-primary hover:underline font-semibold">Contact our team</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <ChefHat className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-gradient">OnPar</span>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Smart inventory management for small restaurants. Reduce waste, save money, 
                  and optimize your operations with AI-powered insights.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="/auth" className="hover:text-primary transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="mailto:support@onpar.app" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Beta Program</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="font-semibold">OnPar</span>
                </div>
                <span className="text-sm text-muted-foreground">© 2025 All rights reserved</span>
              </div>
              
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                <a href="mailto:support@onpar.app" className="hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}