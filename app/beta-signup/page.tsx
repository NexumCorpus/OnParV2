'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChefHat, TrendingDown, DollarSign, Smartphone, CheckCircle, Star, MapPin, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'

// Direct component imports to avoid path resolution issues
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'

export default function BetaSignupPage() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    monthlySpend: '',
    currentChallenges: '',
    goals: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success('Beta signup submitted! We\'ll contact you within 24 hours.')
    setIsSubmitting(false)
    
    // Reset form
    setFormData({
      restaurantName: '',
      ownerName: '',
      email: '',
      phone: '',
      location: '',
      monthlySpend: '',
      currentChallenges: '',
      goals: ''
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                OnPar
              </span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Limited Beta Access
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Join the OnPar Beta
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be among the first Charleston restaurants to reduce food waste by 10-20% and save $500+ monthly with smart inventory management.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits */}
            <div className="space-y-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                    Proven Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">15-20%</div>
                      <div className="text-sm text-muted-foreground">Waste Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">$500+</div>
                      <div className="text-sm text-muted-foreground">Monthly Savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">What You Get:</h3>
                <div className="space-y-3">
                  {[
                    'Smart inventory tracking with expiry alerts',
                    'AI-powered waste reduction insights',
                    'Mobile-first design for on-the-go management',
                    'Dedicated onboarding and support',
                    'Free setup and data migration ($299 value)',
                    'Priority access to new features'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Apply for Beta Access</CardTitle>
                <CardDescription>
                  Tell us about your restaurant and we'll get you set up within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name *</Label>
                      <Input
                        id="restaurantName"
                        value={formData.restaurantName}
                        onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                        placeholder="Your Restaurant"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="owner@restaurant.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(843) 555-0123"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Charleston, SC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlySpend">Monthly Food Spend</Label>
                      <Input
                        id="monthlySpend"
                        value={formData.monthlySpend}
                        onChange={(e) => handleInputChange('monthlySpend', e.target.value)}
                        placeholder="$5,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentChallenges">Current Inventory Challenges</Label>
                    <Textarea
                      id="currentChallenges"
                      value={formData.currentChallenges}
                      onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                      placeholder="Tell us about your biggest inventory management challenges..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals with OnPar</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      placeholder="What would you like to achieve with better inventory management?"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting Application...
                      </>
                    ) : (
                      'Apply for Beta Access'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}