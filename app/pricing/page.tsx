'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { SupabaseStatus } from '@/components/ui/supabase-status'
import { getCurrentUser } from '@/lib/auth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { stripeProducts } from '@/src/stripe-config'
import { Check, ChefHat, Zap, ArrowLeft, Loader2, Star, Shield, Clock, Award, Users, TrendingUp, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

// Dynamic imports for billing components to prevent SSR issues
const SubscriptionButton = dynamic(() => import('@/components/billing/subscription-button').then(mod => ({ default: mod.SubscriptionButton })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-64 rounded-xl"></div>
})

const BillingPortal = dynamic(() => import('@/components/billing/billing-portal').then(mod => ({ default: mod.BillingPortal })), {
  ssr: false,
  loading: () => <div className="loading-skeleton h-32 rounded-xl"></div>
})

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured - running in demo mode')
        return
      }

      const { user: authUser } = await getCurrentUser()
      if (authUser) {
        setUser(authUser)
        
        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle()
        
        if (!profileError && profile) {
          setSubscription(profile)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            <Link href="/" className="flex items-center space-x-4 hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-lg">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-black bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">OnPar</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md px-3 py-1 text-xs font-bold">BETA</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">Smart Inventory</div>
              </div>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="default" className="hover-lift px-4 py-2 font-semibold">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <ThemeToggle />
              {!user && (
                <Link href="/auth">
                  <Button className="btn-primary-enhanced px-6 py-3 font-semibold">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <BreadcrumbNav />

      <div className="container mx-auto px-4 py-16">
        <SupabaseStatus />
        
        {/* Enhanced Hero Section */}
        <div className="text-center mb-24">
          <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-primary/20 to-chart-2/20 border-primary/30 font-bold shadow-lg">
            <Star className="w-5 h-5 mr-2" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-12 leading-tight tracking-tight">
            <span className="text-gradient">Choose Your Plan</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto text-center leading-relaxed font-medium">
            Start reducing waste and saving money today. Most customers save 5-10x their subscription cost.
          </p>
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover-lift shadow-xl">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-green-800 dark:text-green-200 mb-4">
                  30-Day Money-Back Guarantee
                </h3>
                <p className="text-green-700 dark:text-green-300 text-xl leading-relaxed max-w-5xl mx-auto font-medium">
                  If your food costs don't drop by at least 2% within 30 days, we'll refund your entire subscription. 
                  One-time $299 installation fee includes personalized setup, barcode scanner training, and data migration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Loading pricing information...</h2>
            <p className="text-muted-foreground">Preparing your personalized pricing</p>
          </div>
        ) : (
          <>
            {/* Current Subscription Status */}
            {user && userProfile && (
              <div className="max-w-3xl mx-auto mb-12">
                <Card className="card-premium">
                  <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span>Current Subscription</span>
                    </CardTitle>
                    <CardDescription>
                      {subscription ? `Status: ${subscription.subscription_status}` : 'No active subscription'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {subscription ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Plan:</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {stripeProducts.find(p => p.priceId === subscription.price_id)?.name || 'Unknown Plan'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Status:</span>
                          <Badge className={subscription.subscription_status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                            {subscription.subscription_status}
                          </Badge>
                        </div>
                        {subscription.current_period_end && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Next billing:</span>
                            <span className="text-muted-foreground">{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No active subscription found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Pricing Cards */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 mb-20">
              {stripeProducts.map((product) => {
                const isCurrentPlan = subscription && subscription.price_id === product.priceId
                const isPopular = product.name === 'OnPar AI Premium'
                
                return (
                  <div key={product.id} className={`pricing-card shadow-xl ${isPopular ? 'featured' : ''}`}>
                    {isPopular && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <Badge className="premium-badge px-8 py-3 text-base shadow-lg">
                          <Star className="w-4 h-4 mr-2" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-10 p-10">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center mx-auto mb-8 shadow-lg">
                        {product.name === 'OnPar AI Premium' ? (
                          <Zap className="h-8 w-8 text-white" />
                        ) : (
                          <ChefHat className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <CardTitle className="text-4xl font-black mb-4">{product.name}</CardTitle>
                      <CardDescription className="text-xl leading-relaxed font-medium">
                        {product.description}
                      </CardDescription>
                      <div className="mt-8">
                        <span className="text-6xl font-black">${product.price}</span>
                        <span className="text-2xl text-muted-foreground font-semibold">/month</span>
                      </div>
                      {product.name === 'OnPar AI Premium' && (
                        <p className="text-base text-muted-foreground mt-3 font-medium">Requires Base Subscription</p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-10 p-10 pt-0">
                      <ul className="space-y-5">
                        {product.features.map((feature) => (
                          <li key={feature} className="flex items-start space-x-4">
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-foreground/85 leading-relaxed text-base font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <SubscriptionButton
                        priceId={product.priceId}
                        planName={product.name}
                        price={product.price}
                        description={product.description}
                        features={product.features}
                        popular={isPopular}
                        currentPlan={isCurrentPlan}
                      />
                      
                      <p className="text-sm text-center text-muted-foreground font-medium">
                        Cancel anytime. No long-term contracts.
                      </p>
                    </CardContent>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Enhanced Features Comparison */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="card-premium">
            <CardHeader className="text-center border-b bg-gradient-to-r from-card to-muted/20">
              <CardTitle className="text-3xl font-bold mb-4">Why Choose OnPar?</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Built specifically for small restaurants, cafes, and eateries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center feature-card">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Save 10-20% on Food Costs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Reduce waste and optimize inventory to significantly cut food expenses
                  </p>
                </div>
                
                <div className="text-center feature-card">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Mobile-First Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Manage your inventory on-the-go from any device, perfect for busy kitchens
                  </p>
                </div>
                
                <div className="text-center feature-card">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Quick Setup</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get started in minutes with our guided onboarding and CSV import
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">Real results from real restaurants</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Mario's Kitchen", savings: "$680/month", reduction: "18% waste reduction" },
              { name: "Café Bloom", savings: "$420/month", reduction: "15% waste reduction" },
              { name: "Taco Sol", savings: "$550/month", reduction: "22% waste reduction" }
            ].map((story, index) => (
              <Card key={index} className="card-premium text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{story.name}</h3>
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                      {story.savings}
                    </Badge>
                    <p className="text-muted-foreground">{story.reduction}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partner Program */}
        {!user && (
          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 hover-lift">
              <CardContent className="pt-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    Partner with OnPar
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 text-lg leading-relaxed max-w-3xl mx-auto">
                    Supplier reps: Earn $100 spiff for each successful referral. Partner with us to help restaurants reduce waste and save money.
                  </p>
                  <Button className="btn-primary-enhanced mt-4">
                    Learn About Partnership
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover-lift">
              <CardContent className="pt-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    Expanding Beyond Restaurants
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-lg leading-relaxed max-w-3xl mx-auto">
                    Coming soon: OnPar for bodegas, gyms, cafeterias, and other small businesses with inventory management needs.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Link href="/auth">
                <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6">
                  Get Started - Sign Up First
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">Questions?</h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            We're here to help you succeed. Contact us for a personalized demo or if you need help choosing the right plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild className="hover-lift">
              <a href="mailto:support@onpar.app">
                <Users className="h-5 w-5 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" size="lg" className="hover-lift">
              <Clock className="h-5 w-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}