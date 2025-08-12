'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { Star, Quote, TrendingUp, DollarSign, Target, Award, Users, MapPin, ChefHat, Zap } from 'lucide-react'
import Link from 'next/link'

interface Testimonial {
  id: string
  name: string
  title: string
  restaurant: string
  location: string
  type: string
  employees: string
  monthlyBudget: string
  quote: string
  results: {
    wasteReduction: number
    monthlySavings: number
    timesSaved: string
    favoriteFeature: string
  }
  rating: number
  beforeAfter: {
    before: string
    after: string
  }
  avatar: string
}

export default function TestimonialsPage() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(null)

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Mario Rossi',
      title: 'Owner & Head Chef',
      restaurant: "Mario's Italian Kitchen",
      location: 'Charleston, SC',
      type: 'Italian Fine Dining',
      employees: '12 employees',
      monthlyBudget: '$8,500',
      quote: "OnPar transformed how we manage inventory. The AI insights helped us reduce waste by 18% in just 2 months. The smart alerts are a game-changer - we haven't had a stockout since implementing the system.",
      results: {
        wasteReduction: 18.2,
        monthlySavings: 680,
        timesSaved: '3 hours/week',
        favoriteFeature: 'Smart reorder alerts'
      },
      rating: 5,
      beforeAfter: {
        before: 'Manual tracking, frequent stockouts, 12% food waste',
        after: 'Automated alerts, zero stockouts, 6.8% food waste'
      },
      avatar: 'MR'
    },
    {
      id: '2',
      name: 'Sophie Chen',
      title: 'Owner',
      restaurant: 'Café Bloom',
      location: 'Charleston, SC',
      type: 'Specialty Coffee & Pastries',
      employees: '8 employees',
      monthlyBudget: '$4,200',
      quote: "The mobile interface is perfect for our busy café. I can update inventory on my phone while walking through the kitchen. The waste tracking helped us identify that our muffins were our biggest waste source.",
      results: {
        wasteReduction: 15.7,
        monthlySavings: 420,
        timesSaved: '2.5 hours/week',
        favoriteFeature: 'Mobile inventory updates'
      },
      rating: 5,
      beforeAfter: {
        before: 'Excel spreadsheets, manual counting, 11% waste',
        after: 'Real-time mobile updates, smart insights, 7.2% waste'
      },
      avatar: 'SC'
    },
    {
      id: '3',
      name: 'Carlos Rodriguez',
      title: 'General Manager',
      restaurant: 'Taco Sol',
      location: 'Charleston, SC',
      type: 'Mexican Fast-Casual',
      employees: '15 employees',
      monthlyBudget: '$6,800',
      quote: "Setup was incredibly easy. The CSV import saved us hours of manual data entry. The budget alerts help us stay on track, and the AI suggestions for portion sizes have been spot-on.",
      results: {
        wasteReduction: 22.1,
        monthlySavings: 550,
        timesSaved: '4 hours/week',
        favoriteFeature: 'AI portion optimization'
      },
      rating: 5,
      beforeAfter: {
        before: 'POS inventory only, no waste tracking, budget overruns',
        after: 'Comprehensive tracking, waste insights, budget control'
      },
      avatar: 'CR'
    },
    {
      id: '4',
      name: 'Raj Patel',
      title: 'Owner',
      restaurant: 'Spice Route',
      location: 'Charleston, SC',
      type: 'Indian Cuisine',
      employees: '10 employees',
      monthlyBudget: '$5,500',
      quote: "The spice inventory was always challenging to track. OnPar's expiry alerts ensure we use ingredients at peak freshness. The cost savings have been remarkable - we're saving over $400 monthly.",
      results: {
        wasteReduction: 16.8,
        monthlySavings: 445,
        timesSaved: '2 hours/week',
        favoriteFeature: 'Expiry date tracking'
      },
      rating: 5,
      beforeAfter: {
        before: 'Memory-based tracking, expired spices, high waste',
        after: 'Systematic tracking, fresh ingredients, controlled waste'
      },
      avatar: 'RP'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      title: 'Operations Manager',
      restaurant: 'Harbor Grill',
      location: 'Charleston, SC',
      type: 'Seafood Restaurant',
      employees: '18 employees',
      monthlyBudget: '$12,000',
      quote: "Managing fresh seafood inventory is critical for us. OnPar's predictive analytics help us order the right quantities, and the waste tracking ensures we maintain quality while minimizing loss.",
      results: {
        wasteReduction: 19.5,
        monthlySavings: 780,
        timesSaved: '5 hours/week',
        favoriteFeature: 'Predictive ordering'
      },
      rating: 5,
      beforeAfter: {
        before: 'Daily manual counts, frequent waste, ordering guesswork',
        after: 'Predictive ordering, minimal waste, data-driven decisions'
      },
      avatar: 'LT'
    },
    {
      id: '6',
      name: 'David Kim',
      title: 'Chef & Owner',
      restaurant: 'Fusion Kitchen',
      location: 'Charleston, SC',
      type: 'Asian Fusion',
      employees: '14 employees',
      monthlyBudget: '$7,200',
      quote: "The AI insights are incredible. OnPar identified that our ramen portions were too large, leading to waste. After adjusting based on their recommendations, we cut waste by 25% without affecting customer satisfaction.",
      results: {
        wasteReduction: 24.3,
        monthlySavings: 625,
        timesSaved: '3.5 hours/week',
        favoriteFeature: 'AI portion recommendations'
      },
      rating: 5,
      beforeAfter: {
        before: 'Inconsistent portions, high waste, manual tracking',
        after: 'Optimized portions, controlled waste, automated insights'
      },
      avatar: 'DK'
    }
  ]

  const averageWasteReduction = testimonials.reduce((sum, t) => sum + t.results.wasteReduction, 0) / testimonials.length
  const averageSavings = testimonials.reduce((sum, t) => sum + t.results.monthlySavings, 0) / testimonials.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg font-bold">
            <Users className="w-5 h-5 mr-2" />
            Real Customer Stories
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Success Stories</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-8">
            See how Charleston restaurants are saving thousands with OnPar's intelligent inventory management
          </p>
          
          {/* Aggregate Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 shadow-lg">
              <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-green-600 mb-2">{averageWasteReduction.toFixed(1)}%</div>
              <div className="text-lg font-bold text-green-800 dark:text-green-200">Average Waste Reduction</div>
            </div>
            <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-blue-600 mb-2">${averageSavings.toFixed(0)}</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">Average Monthly Savings</div>
            </div>
            <div className="p-8 rounded-3xl bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <Award className="h-10 w-10 text-purple-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-purple-600 mb-2">50+</div>
              <div className="text-lg font-bold text-purple-800 dark:text-purple-200">Happy Restaurants</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="card-premium hover:shadow-2xl transition-all duration-300 group cursor-pointer" onClick={() => setSelectedTestimonial(testimonial.id)}>
              <CardHeader className="pb-6 p-8">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary via-chart-2 to-chart-3 text-white font-bold text-lg">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold">{testimonial.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-base text-muted-foreground font-medium">{testimonial.title}</p>
                    <p className="text-lg font-bold text-primary">{testimonial.restaurant}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline" className="text-xs font-medium">
                        <MapPin className="w-3 h-3 mr-1" />
                        {testimonial.location}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium">
                        {testimonial.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-8 pt-0">
                <div className="relative">
                  <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                  <blockquote className="text-lg italic text-foreground/90 leading-relaxed pl-6">
                    "{testimonial.quote}"
                  </blockquote>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600 mb-1">{testimonial.results.wasteReduction}%</div>
                    <div className="text-xs text-green-700 dark:text-green-300 font-medium">Waste Reduced</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600 mb-1">${testimonial.results.monthlySavings}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Monthly Savings</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Favorite Feature:</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                      {testimonial.results.favoriteFeature}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Before/After Comparison */}
        <div className="mb-16">
          <Card className="card-premium shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
              <CardTitle className="text-3xl font-bold text-center">Before vs After OnPar</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-red-600 text-center">Before OnPar</h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="font-bold text-red-800 dark:text-red-200 mb-2">Manual Tracking</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Pen, paper, and guesswork leading to errors</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="font-bold text-red-800 dark:text-red-200 mb-2">Frequent Stockouts</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Lost revenue from unavailable menu items</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="font-bold text-red-800 dark:text-red-200 mb-2">High Food Waste</div>
                      <div className="text-sm text-red-700 dark:text-red-300">10-15% average waste across restaurants</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="font-bold text-red-800 dark:text-red-200 mb-2">Time Consuming</div>
                      <div className="text-sm text-red-700 dark:text-red-300">5+ hours weekly on inventory management</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-green-600 text-center">After OnPar</h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="font-bold text-green-800 dark:text-green-200 mb-2">Smart Automation</div>
                      <div className="text-sm text-green-700 dark:text-green-300">AI-powered tracking with real-time insights</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="font-bold text-green-800 dark:text-green-200 mb-2">Zero Stockouts</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Proactive alerts prevent inventory shortages</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="font-bold text-green-800 dark:text-green-200 mb-2">Reduced Waste</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Average 18% reduction in food waste</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="font-bold text-green-800 dark:text-green-200 mb-2">Time Savings</div>
                      <div className="text-sm text-green-700 dark:text-green-300">3+ hours saved weekly on inventory tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Industry Recognition */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-blue-800 dark:text-blue-200 mb-8">
                Recognized by Industry Leaders
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
                  <Award className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">Charleston Restaurant Association</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">"Innovative solution for small restaurants"</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
                  <Star className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">SC Small Business Council</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">"Outstanding technology for local businesses"</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800">
                  <Target className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">Sustainability Award</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">"Significant impact on food waste reduction"</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 border-primary/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-black mb-6">Join These Successful Restaurants</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Start your journey to reduced waste and increased profits with OnPar
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/beta-signup">
                <Button size="lg" className="btn-primary-enhanced text-xl px-12 py-6 rounded-2xl shadow-xl">
                  <Star className="h-6 w-6 mr-3" />
                  Apply for Beta Access
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-xl px-12 py-6 rounded-2xl border-2">
                  <ChefHat className="h-6 w-6 mr-3" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}