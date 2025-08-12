'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ChefHat, TrendingDown, DollarSign, Smartphone, CheckCircle, Star, MapPin, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function BetaSignupPage() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    employeeCount: '',
    currentChallenges: '',
    monthlyFoodCost: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission (replace with actual API call)
    try {
      // Here you would send to your backend or a service like Airtable/Google Sheets
      console.log('Beta signup:', formData)
      
      // For now, just show success message
      toast.success('Thanks for your interest! We\'ll contact you within 24 hours to set up your beta access.')
      
      // Reset form
      setFormData({
        restaurantName: '',
        ownerName: '',
        email: '',
        phone: '',
        location: '',
        employeeCount: '',
        currentChallenges: '',
        monthlyFoodCost: ''
      })
    } catch (error) {
      toast.error('Something went wrong. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">OnPar</span>
            </Link>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              Beta Program
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
              <Star className="w-4 h-4 mr-2" />
              Limited Beta Access - Charleston, SC
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Join the OnPar Beta</span><br />
              <span className="text-foreground">Help Perfect Restaurant Inventory Management</span>
            </h1>
            
            <p className="text-xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're working with 50+ Charleston restaurants to build the perfect inventory system. 
              Join our beta program and get <strong>free access</strong> while helping us create 
              something amazing for small restaurants.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Free beta access</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Charleston, SC focused</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Built by restaurant insiders</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold mb-6">What You Get as a Beta User</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Reduce Food Waste by 10-20%</h3>
                    <p className="text-muted-foreground">Smart alerts for expiring items and AI-powered waste reduction insights.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Save $500+ Monthly</h3>
                    <p className="text-muted-foreground">Better inventory management and waste reduction typically saves restaurants $500-1000+ per month.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Mobile-First Design</h3>
                    <p className="text-muted-foreground">Update inventory from your phone. No app downloads, works in any browser.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">5-Minute Setup</h3>
                    <p className="text-muted-foreground">Get started immediately. We'll help you import your current inventory and set up alerts.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">Beta Program Benefits</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Free access during entire beta period</li>
                  <li>• Direct input on features and improvements</li>
                  <li>• Priority support and onboarding</li>
                  <li>• Discounted pricing when we launch publicly</li>
                </ul>
              </div>
            </div>

            {/* Signup Form */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>Join the Beta Program</CardTitle>
                <CardDescription>
                  Tell us about your restaurant and we'll get you set up within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="restaurantName">Restaurant Name *</Label>
                      <Input
                        id="restaurantName"
                        value={formData.restaurantName}
                        onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                        placeholder="Mario's Italian Kitchen"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Your Name *</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        placeholder="Mario Rossi"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="mario@italyskitchen.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
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
                    <div>
                      <Label htmlFor="location">Location in Charleston</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Downtown, West Ashley, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeCount">Number of Employees</Label>
                      <Input
                        id="employeeCount"
                        value={formData.employeeCount}
                        onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                        placeholder="5-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="monthlyFoodCost">Approximate Monthly Food Cost</Label>
                    <Input
                      id="monthlyFoodCost"
                      value={formData.monthlyFoodCost}
                      onChange={(e) => handleInputChange('monthlyFoodCost', e.target.value)}
                      placeholder="$8,000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentChallenges">Current Inventory Challenges</Label>
                    <Textarea
                      id="currentChallenges"
                      value={formData.currentChallenges}
                      onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                      placeholder="Tell us about your biggest inventory management pain points..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary-enhanced py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Join Beta Program'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    We'll contact you within 24 hours to set up your account and provide onboarding.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Questions about the beta program?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:beta@onpar.app" className="text-primary hover:underline font-medium">
                beta@onpar.app
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a href="tel:+18435550123" className="text-primary hover:underline font-medium">
                (843) 555-0123
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}