'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChefHat, 
  Users, 
  DollarSign, 
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingDown,
  Package,
  Smartphone,
  Sparkles,
  Clock,
  Award,
  Zap
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface RestaurantProfile {
  name: string
  type: string
  employees: string
  monthlySpend: string
  currentWaste: string
  goals: string[]
}

export function BetaOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<RestaurantProfile>({
    name: '',
    type: '',
    employees: '',
    monthlySpend: '',
    currentWaste: '',
    goals: []
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to OnPar Beta!',
      description: 'Join 50+ Charleston restaurants reducing waste',
      icon: <Star className="h-6 w-6" />,
      completed: currentStep > 0
    },
    {
      id: 'restaurant',
      title: 'Tell us about your restaurant',
      description: 'Help us customize your experience',
      icon: <ChefHat className="h-6 w-6" />,
      completed: currentStep > 1
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'We\'ll focus on what matters most',
      icon: <Target className="h-6 w-6" />,
      completed: currentStep > 2
    },
    {
      id: 'demo-data',
      title: 'Add sample inventory',
      description: 'See OnPar in action with your data',
      icon: <Package className="h-6 w-6" />,
      completed: currentStep > 3
    },
    {
      id: 'mobile',
      title: 'Try the mobile interface',
      description: 'Perfect for busy kitchen environments',
      icon: <Smartphone className="h-6 w-6" />,
      completed: currentStep > 4
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Start reducing waste and saving money',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: currentStep > 5
    }
  ]

  const restaurantTypes = [
    'Pizza Restaurant', 'Cafe/Coffee Shop', 'Fine Dining', 'Fast Casual', 
    'Bar & Grill', 'Bakery', 'Food Truck', 'Other'
  ]

  const employeeRanges = ['1-5', '6-15', '16-30', '31-50', '50+']

  const spendRanges = [
    'Under $5,000', '$5,000-$15,000', '$15,000-$30,000', 
    '$30,000-$50,000', 'Over $50,000'
  ]

  const wasteRanges = [
    'Not sure', 'Under 5%', '5-10%', '10-15%', 'Over 15%'
  ]

  const goalOptions = [
    'Reduce food waste', 'Save money on inventory', 'Improve efficiency',
    'Better cost tracking', 'Automate reordering', 'Mobile access'
  ]

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculatePotentialSavings = () => {
    const monthlySpend = parseInt(profile.monthlySpend.replace(/[^0-9]/g, '')) || 15000
    const wastePercent = profile.currentWaste === 'Not sure' ? 8 : 
                        parseInt(profile.currentWaste.split('-')[0]) || 8
    return Math.round(monthlySpend * (wastePercent / 100) * 0.6) // 60% reduction potential
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  OnPar Beta Setup
                </h1>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Get started in 5 minutes
                </p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              BETA ACCESS
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-blue-700 dark:text-blue-300">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
              </span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {steps[currentStep].icon}
            </div>
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Welcome Step */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Welcome to the Future of Restaurant Inventory!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You're joining 50+ Charleston restaurants who are already reducing waste by 10-20% 
                  and saving $500+ monthly with OnPar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="font-semibold text-green-900 dark:text-green-100">Save Money</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Average $1,200/month</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <TrendingDown className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Reduce Waste</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">10-20% reduction</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="font-semibold text-purple-900 dark:text-purple-100">Save Time</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Mobile-first design</p>
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Info Step */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                  <Input
                    placeholder="e.g., Mario's Pizza"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Type</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={profile.type}
                    onChange={(e) => setProfile(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">Select type...</option>
                    {restaurantTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Employees</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={profile.employees}
                    onChange={(e) => setProfile(prev => ({ ...prev, employees: e.target.value }))}
                  >
                    <option value="">Select range...</option>
                    {employeeRanges.map(range => (
                      <option key={range} value={range}>{range} employees</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Food Spend</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={profile.monthlySpend}
                    onChange={(e) => setProfile(prev => ({ ...prev, monthlySpend: e.target.value }))}
                  >
                    <option value="">Select range...</option>
                    {spendRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Waste Percentage (estimate)</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={profile.currentWaste}
                  onChange={(e) => setProfile(prev => ({ ...prev, currentWaste: e.target.value }))}
                >
                  <option value="">Select range...</option>
                  {wasteRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {profile.monthlySpend && profile.currentWaste && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    💰 Your Potential Monthly Savings
                  </h3>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    ${calculatePotentialSavings().toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Based on typical 60% waste reduction with OnPar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Goals Step */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">What are your main goals? (Select all that apply)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goalOptions.map(goal => (
                    <Button
                      key={goal}
                      variant={profile.goals.includes(goal) ? "default" : "outline"}
                      className="justify-start h-auto p-4"
                      onClick={() => handleGoalToggle(goal)}
                    >
                      <div className="flex items-center space-x-3">
                        {profile.goals.includes(goal) ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                        )}
                        <span>{goal}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {profile.goals.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    🎯 Perfect! OnPar will help you:
                  </h3>
                  <ul className="space-y-1">
                    {profile.goals.map(goal => (
                      <li key={goal} className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Demo Data Step */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Package className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Let's add some sample inventory</h3>
                <p className="text-muted-foreground mb-6">
                  We'll populate your account with realistic restaurant inventory data so you can 
                  see exactly how OnPar works with your type of business.
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Sample data includes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Common ingredients for {profile.type || 'your restaurant'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Realistic pricing and quantities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sample waste reduction insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI-powered recommendations</span>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-5 w-5 mr-2" />
                Add Sample Data
              </Button>
            </div>
          )}

          {/* Mobile Step */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Try the mobile interface</h3>
                <p className="text-muted-foreground mb-6">
                  OnPar is designed mobile-first for busy kitchen environments. 
                  Large buttons, voice input, and barcode scanning make updates quick and easy.
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Mobile features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Touch-friendly interface</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Voice commands</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Barcode scanning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Offline mode</span>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Smartphone className="h-5 w-5 mr-2" />
                Open Mobile Demo
              </Button>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">🎉 You're all set!</h3>
                <p className="text-muted-foreground mb-6">
                  Welcome to OnPar! You're now part of an exclusive group of Charleston restaurants 
                  leading the way in waste reduction and cost savings.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Your beta benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Free access during beta period</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Direct line to our team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span>Priority feature requests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Founding customer recognition</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <ChefHat className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button size="lg" variant="outline">
                  <Clock className="h-5 w-5 mr-2" />
                  Schedule Training Call
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 2 ? 'Complete Setup' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}