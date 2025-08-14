'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Using absolute paths from app directory
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'

import { 
  ChefHat, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Users,
  DollarSign,
  Package,
  TrendingDown,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Utensils,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser, updateUserProfile } from '../lib/auth'
import { createInventoryItem } from '../lib/inventory'
import { createMenuItem } from '../lib/menu'

interface OnboardingData {
  restaurantName: string
  ownerName: string
  email: string
  phone: string
  address: string
  restaurantType: string
  seatingCapacity: string
  monthlyRevenue: string
  currentChallenges: string[]
  goals: string[]
  inventoryItems: Array<{
    name: string
    category: string
    quantity: number
    unit: string
    pricePerUnit: number
  }>
  menuItems: Array<{
    name: string
    category: string
    price: number
    popularity: number
  }>
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    restaurantType: '',
    seatingCapacity: '',
    monthlyRevenue: '',
    currentChallenges: [],
    goals: [],
    inventoryItems: [],
    menuItems: []
  })

  const steps = [
    { title: 'Restaurant Info', description: 'Tell us about your restaurant' },
    { title: 'Business Details', description: 'Help us understand your operations' },
    { title: 'Goals & Challenges', description: 'What do you want to achieve?' },
    { title: 'Sample Data', description: 'Add some initial inventory and menu items' },
    { title: 'Complete Setup', description: 'Finish your OnPar setup' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Simulate onboarding completion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Welcome to OnPar! Your account is ready.')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Setup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Welcome to OnPar</h1>
            </div>
            <p className="text-muted-foreground">Let's get your restaurant set up for success</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input
                      id="restaurantName"
                      value={data.restaurantName}
                      onChange={(e) => setData(prev => ({ ...prev, restaurantName: e.target.value }))}
                      placeholder="Your Restaurant Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                    <Input
                      id="ownerName"
                      value={data.ownerName}
                      onChange={(e) => setData(prev => ({ ...prev, ownerName: e.target.value }))}
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="owner@restaurant.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Restaurant Address</Label>
                    <Textarea
                      id="address"
                      value={data.address}
                      onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, Charleston, SC 29401"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
                    <p className="text-muted-foreground">
                      Your OnPar account is configured and ready to help you reduce waste and save money.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold">Reduce Waste</div>
                      <div className="text-sm text-muted-foreground">10-20% reduction expected</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold">Save Money</div>
                      <div className="text-sm text-muted-foreground">$500+ monthly savings</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-semibold">Optimize Operations</div>
                      <div className="text-sm text-muted-foreground">Smart insights & alerts</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}