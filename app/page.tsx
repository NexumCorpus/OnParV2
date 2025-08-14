'use client'

import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ChefHat, TrendingDown, DollarSign, Smartphone, BarChart3, Shield, Zap, Star, ArrowRight, CheckCircle, Users, Clock, Award } from 'lucide-react'

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
                <Link href="/pricing" className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="#features" className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Reviews
                </Link>
              </nav>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-4/5 opacity-60"></div>
        <div className="container mx-auto px-4 py-32 lg:py-40 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <Badge className="mb-8 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 hover:shadow-lg transition-all duration-300 text-sm font-semibold" variant="secondary">
                <Star className="w-5 h-5 mr-2" />
                🧪 Now in Beta - Join 50+ Charleston Restaurants
              </Badge>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tight">
                <span className="block bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Cut Food Waste</span>
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
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white text-xl px-16 py-8 min-h-[5rem] shadow-xl hover:shadow-2xl font-bold tracking-wide transition-all duration-300">
                    <Zap className="mr-3 h-6 w-6" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-xl px-16 py-8 min-h-[5rem] border-2 hover:bg-muted/30 hover:border-primary/60 hover:shadow-xl font-semibold transition-all duration-300">
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
      <section id="features" className="py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <Badge className="mb-8 px-6 py-3 text-base font-semibold" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Built for Small Restaurants
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-12 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Powerful Features</span><br />
                <span className="text-foreground">Simple Pricing</span>
              </h2>
              <p className="text-xl md:text-2xl text-foreground/85 max-w-4xl mx-auto leading-relaxed font-medium">
                Affordable, intuitive tools designed for restaurants with 1-50 employees
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">AI Waste Reduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/75 leading-relaxed mb-6">
                    Advanced AI analyzes your data to provide step-by-step action plans for waste reduction. 
                    Get specific recommendations with priority levels and implementation timelines.
                  </p>
                  <div className="flex items-center text-sm text-primary font-bold group-hover:translate-x-1 transition-transform duration-200">
                    <span>Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Mobile-First Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/75 leading-relaxed mb-6">
                    Update inventory from your phone, tablet, or computer. 
                    No app downloads required - works perfectly in any browser.
                  </p>
                  <div className="flex items-center text-sm text-primary font-bold group-hover:translate-x-1 transition-transform duration-200">
                    <span>Try demo</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Affordable Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/75 leading-relaxed mb-6">
                    Starting at just $49/month - pays for itself in the first week. 
                    No complex enterprise features you don't need.
                  </p>
                  <div className="flex items-center text-sm text-primary font-bold group-hover:translate-x-1 transition-transform duration-200">
                    <span>See pricing</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
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
                <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Join the Beta</span><br />
                <span className="text-foreground">Help Us Perfect OnPar</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed">
                We're in beta with 50+ Charleston restaurants. Join early access to help us build 
                the perfect tool for small restaurant inventory management.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-white text-xl px-12 py-6 min-h-[4rem] shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Star className="mr-3 h-6 w-6" />
                  Join Beta - Early Access
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-xl px-12 py-6 min-h-[4rem] border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
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
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">OnPar</span>
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
                  <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/beta-signup" className="hover:text-primary transition-colors">Beta Signup</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2025 OnPar Inc. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm mt-4 md:mt-0">
                Made with ❤️ in Charleston, SC
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}