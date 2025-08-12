'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChefHat, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Package,
  Bell,
  Zap,
  Target,
  Upload,
  Download,
  Lightbulb,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser, updateUserProfile } from '@/lib/auth'
import { createInventoryItem } from '@/lib/inventory'
import { createMenuItem } from '@/lib/menu'

interface OnboardingData {
  // Restaurant Info
  restaurant_name: string
  cuisine_type: string
  restaurant_size: string
  location: string
  years_in_business: string
  
  // Business Details
  monthly_budget: number
  employee_count: number
  avg_daily_customers: number
  operating_hours: string
  
  // Current Challenges
  biggest_challenges: string[]
  current_inventory_method: string
  waste_estimate: number
  
  // Goals
  primary_goals: string[]
  expected_savings: number
  
  // Preferences
  notification_preferences: string[]
  preferred_contact_method: string
  
  // Sample Data
  add_sample_data: boolean
  import_existing_data: boolean
}

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', description: 'Get started with OnPar' },
  { id: 'restaurant', title: 'Restaurant Info', description: 'Tell us about your restaurant' },
  { id: 'business', title: 'Business Details', description: 'Help us understand your operations' },
  { id: 'challenges', title: 'Current Challenges', description: 'What problems can we solve?' },
  { id: 'goals', title: 'Your Goals', description: 'What do you want to achieve?' },
  { id: 'preferences', title: 'Preferences', description: 'Customize your experience' },
  { id: 'data', title: 'Initial Setup', description: 'Add your inventory data' },
  { id: 'complete', title: 'All Set!', description: 'You\'re ready to start saving' }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    restaurant_name: '',
    cuisine_type: '',
    restaurant_size: '',
    location: '',
    years_in_business: '',
    monthly_budget: 0,
    employee_count: 0,
    avg_daily_customers: 0,
    operating_hours: '',
    biggest_challenges: [],
    current_inventory_method: '',
    waste_estimate: 0,
    primary_goals: [],
    expected_savings: 0,
    notification_preferences: [],
    preferred_contact_method: '',
    add_sample_data: true,
    import_existing_data: false
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { user: authUser } = await getCurrentUser()
      if (!authUser) {
        router.push('/auth')
        return
      }
      setUser(authUser)
    } catch (error) {
      router.push('/auth')
    }
  }

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Update user profile
      await updateUserProfile(user.id, {
        restaurant_name: data.restaurant_name,
        monthly_budget: data.monthly_budget,
        onboarding_completed: true,
        cuisine_type: data.cuisine_type,
        restaurant_size: data.restaurant_size,
        employee_count: data.employee_count
      })

      // Add sample data if requested
      if (data.add_sample_data) {
        await addSampleData(user.id)
      }

      toast.success('Welcome to OnPar! Your account is ready.')
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addSampleData = async (userId: string) => {
    // Sample inventory items
    const sampleInventory = [
      { name: 'Ground Beef (80/20)', quantity: 25, unit: 'lbs', reorder_point: 10, price_per_unit: 4.99, expiry_date: '2025-01-20' },
      { name: 'Chicken Breast', quantity: 15, unit: 'lbs', reorder_point: 8, price_per_unit: 6.49, expiry_date: '2025-01-18' },
      { name: 'Fresh Mozzarella', quantity: 8, unit: 'lbs', reorder_point: 5, price_per_unit: 7.99, expiry_date: '2025-01-22' },
      { name: 'Roma Tomatoes', quantity: 12, unit: 'lbs', reorder_point: 6, price_per_unit: 2.99, expiry_date: '2025-01-16' },
      { name: 'Lettuce (Iceberg)', quantity: 6, unit: 'heads', reorder_point: 3, price_per_unit: 1.49, expiry_date: '2025-01-15' }
    ]

    // Sample menu items
    const sampleMenu = [
      { name: 'Classic Cheeseburger', sales_percentage: 18.5, waste_percentage: 3.2 },
      { name: 'Caesar Salad', sales_percentage: 12.8, waste_percentage: 8.5 },
      { name: 'Chicken Sandwich', sales_percentage: 11.3, waste_percentage: 4.1 },
      { name: 'Fish & Chips', sales_percentage: 8.9, waste_percentage: 5.1 }
    ]

    try {
      // Add inventory items
      for (const item of sampleInventory) {
        await createInventoryItem({ ...item, user_id: userId })
      }

      // Add menu items
      for (const item of sampleMenu) {
        await createMenuItem({ ...item, user_id: userId })
      }
    } catch (error) {
      console.error('Error adding sample data:', error)
    }
  }

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }))
  }

  const renderStep = () => {
    switch (ONBOARDING_STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep />
      case 'restaurant':
        return <RestaurantInfoStep data={data} updateData={updateData} />
      case 'business':
        return <BusinessDetailsStep data={data} updateData={updateData} />
      case 'challenges':
        return <ChallengesStep data={data} updateData={updateData} toggleArrayItem={toggleArrayItem} />
      case 'goals':
        return <GoalsStep data={data} updateData={updateData} toggleArrayItem={toggleArrayItem} />
      case 'preferences':
        return <PreferencesStep data={data} updateData={updateData} toggleArrayItem={toggleArrayItem} />
      case 'data':
        return <DataSetupStep data={data} updateData={updateData} />
      case 'complete':
        return <CompleteStep data={data} onComplete={handleComplete} loading={loading} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (ONBOARDING_STEPS[currentStep].id) {
      case 'welcome':
        return true
      case 'restaurant':
        return data.restaurant_name && data.cuisine_type && data.restaurant_size
      case 'business':
        return data.monthly_budget > 0 && data.employee_count > 0
      case 'challenges':
        return data.biggest_challenges.length > 0
      case 'goals':
        return data.primary_goals.length > 0
      case 'preferences':
        return true
      case 'data':
        return true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">OnPar</span>
            </div>
            <Badge variant="outline">Setup Wizard</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{ONBOARDING_STEPS[currentStep].title}</h1>
                <p className="text-muted-foreground">{ONBOARDING_STEPS[currentStep].description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step.id} className={`flex items-center ${index <= currentStep ? 'text-primary' : ''}`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : index === currentStep ? (
                    <div className="w-3 h-3 rounded-full bg-primary mr-1" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-muted mr-1" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              {renderStep()}
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
            
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? 'Setting up...' : 'Complete Setup'}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
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

// Welcome Step Component
function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center">
        <ChefHat className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-4">Welcome to OnPar!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We're excited to help you reduce food waste, save money, and optimize your restaurant's inventory management. 
          This quick setup will take about 5 minutes and will customize OnPar specifically for your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Reduce Waste by 10-20%</h3>
          <p className="text-sm text-muted-foreground">Smart alerts and AI insights help minimize food waste</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Save $500+ Monthly</h3>
          <p className="text-sm text-muted-foreground">Better inventory control leads to significant cost savings</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">5-Minute Setup</h3>
          <p className="text-sm text-muted-foreground">Get started quickly with our guided setup process</p>
        </div>
      </div>
    </div>
  )
}

// Restaurant Info Step Component
function RestaurantInfoStep({ 
  data, 
  updateData 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Tell us about your restaurant</h2>
        <p className="text-muted-foreground">This helps us customize OnPar for your specific needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="restaurant_name">Restaurant Name *</Label>
          <Input
            id="restaurant_name"
            value={data.restaurant_name}
            onChange={(e) => updateData('restaurant_name', e.target.value)}
            placeholder="e.g., Mario's Italian Kitchen"
          />
        </div>

        <div>
          <Label htmlFor="cuisine_type">Cuisine Type *</Label>
          <Select value={data.cuisine_type} onValueChange={(value) => updateData('cuisine_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="american">American</SelectItem>
              <SelectItem value="italian">Italian</SelectItem>
              <SelectItem value="mexican">Mexican</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="mediterranean">Mediterranean</SelectItem>
              <SelectItem value="seafood">Seafood</SelectItem>
              <SelectItem value="steakhouse">Steakhouse</SelectItem>
              <SelectItem value="cafe">Cafe/Bistro</SelectItem>
              <SelectItem value="fast-casual">Fast Casual</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="restaurant_size">Restaurant Size *</Label>
          <Select value={data.restaurant_size} onValueChange={(value) => updateData('restaurant_size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (1-25 seats)</SelectItem>
              <SelectItem value="medium">Medium (26-75 seats)</SelectItem>
              <SelectItem value="large">Large (76-150 seats)</SelectItem>
              <SelectItem value="very-large">Very Large (150+ seats)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="years_in_business">Years in Business</Label>
          <Select value={data.years_in_business} onValueChange={(value) => updateData('years_in_business', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New (Less than 1 year)</SelectItem>
              <SelectItem value="1-2">1-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="location">Location (City, State)</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData('location', e.target.value)}
            placeholder="e.g., Charleston, SC"
          />
        </div>
      </div>
    </div>
  )
}

// Business Details Step Component
function BusinessDetailsStep({ 
  data, 
  updateData 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Business Details</h2>
        <p className="text-muted-foreground">Help us understand your operations to provide better insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="monthly_budget">Monthly Food Budget ($) *</Label>
          <Input
            id="monthly_budget"
            type="number"
            value={data.monthly_budget || ''}
            onChange={(e) => updateData('monthly_budget', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 8000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Approximate monthly spending on food and ingredients
          </p>
        </div>

        <div>
          <Label htmlFor="employee_count">Number of Employees *</Label>
          <Input
            id="employee_count"
            type="number"
            value={data.employee_count || ''}
            onChange={(e) => updateData('employee_count', parseInt(e.target.value) || 0)}
            placeholder="e.g., 12"
          />
        </div>

        <div>
          <Label htmlFor="avg_daily_customers">Average Daily Customers</Label>
          <Input
            id="avg_daily_customers"
            type="number"
            value={data.avg_daily_customers || ''}
            onChange={(e) => updateData('avg_daily_customers', parseInt(e.target.value) || 0)}
            placeholder="e.g., 150"
          />
        </div>

        <div>
          <Label htmlFor="operating_hours">Operating Hours</Label>
          <Select value={data.operating_hours} onValueChange={(value) => updateData('operating_hours', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast-lunch">Breakfast & Lunch</SelectItem>
              <SelectItem value="lunch-dinner">Lunch & Dinner</SelectItem>
              <SelectItem value="all-day">All Day</SelectItem>
              <SelectItem value="dinner-only">Dinner Only</SelectItem>
              <SelectItem value="24-hours">24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Why we ask for this information</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              These details help us calibrate our AI recommendations, set appropriate alert thresholds, 
              and provide industry benchmarks relevant to your restaurant size and type.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Challenges Step Component
function ChallengesStep({ 
  data, 
  updateData, 
  toggleArrayItem 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void
  toggleArrayItem: (field: keyof OnboardingData, item: string) => void
}) {
  const challenges = [
    { id: 'food-waste', label: 'Excessive food waste', icon: AlertTriangle },
    { id: 'inventory-tracking', label: 'Tracking inventory manually', icon: Package },
    { id: 'over-ordering', label: 'Over-ordering ingredients', icon: TrendingUp },
    { id: 'expiry-management', label: 'Managing expiry dates', icon: Clock },
    { id: 'cost-control', label: 'Controlling food costs', icon: DollarSign },
    { id: 'supplier-management', label: 'Managing multiple suppliers', icon: Users },
    { id: 'menu-optimization', label: 'Optimizing menu profitability', icon: Target },
    { id: 'staff-training', label: 'Training staff on inventory', icon: Users }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">What are your biggest challenges?</h2>
        <p className="text-muted-foreground">Select all that apply. This helps us prioritize the most relevant features for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge) => {
          const Icon = challenge.icon
          const isSelected = data.biggest_challenges.includes(challenge.id)
          
          return (
            <div
              key={challenge.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleArrayItem('biggest_challenges', challenge.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{challenge.label}</div>
                </div>
                {isSelected && <Check className="h-5 w-5 text-primary" />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="current_inventory_method">How do you currently track inventory?</Label>
          <Select value={data.current_inventory_method} onValueChange={(value) => updateData('current_inventory_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paper">Paper/Clipboard</SelectItem>
              <SelectItem value="spreadsheet">Excel/Google Sheets</SelectItem>
              <SelectItem value="pos-system">POS System</SelectItem>
              <SelectItem value="other-software">Other Software</SelectItem>
              <SelectItem value="memory">Memory/No System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="waste_estimate">Estimated Food Waste Percentage</Label>
          <Select value={data.waste_estimate.toString()} onValueChange={(value) => updateData('waste_estimate', parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select estimate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Less than 5%</SelectItem>
              <SelectItem value="5">5-10%</SelectItem>
              <SelectItem value="10">10-15%</SelectItem>
              <SelectItem value="15">15-20%</SelectItem>
              <SelectItem value="20">More than 20%</SelectItem>
              <SelectItem value="99">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// Goals Step Component
function GoalsStep({ 
  data, 
  updateData, 
  toggleArrayItem 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void
  toggleArrayItem: (field: keyof OnboardingData, item: string) => void
}) {
  const goals = [
    { id: 'reduce-waste', label: 'Reduce food waste by 10-20%', icon: TrendingUp },
    { id: 'save-money', label: 'Save $500+ monthly on food costs', icon: DollarSign },
    { id: 'automate-tracking', label: 'Automate inventory tracking', icon: Package },
    { id: 'improve-efficiency', label: 'Improve kitchen efficiency', icon: Clock },
    { id: 'better-ordering', label: 'Make smarter ordering decisions', icon: Target },
    { id: 'menu-optimization', label: 'Optimize menu profitability', icon: Star },
    { id: 'compliance', label: 'Improve food safety compliance', icon: CheckCircle },
    { id: 'insights', label: 'Get data-driven insights', icon: Lightbulb }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">What are your primary goals?</h2>
        <p className="text-muted-foreground">Select your top priorities. We'll focus on these areas first.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon
          const isSelected = data.primary_goals.includes(goal.id)
          
          return (
            <div
              key={goal.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleArrayItem('primary_goals', goal.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{goal.label}</div>
                </div>
                {isSelected && <Check className="h-5 w-5 text-primary" />}
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <Label htmlFor="expected_savings">What monthly savings would make OnPar worthwhile for you?</Label>
        <Select value={data.expected_savings.toString()} onValueChange={(value) => updateData('expected_savings', parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select expected savings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="200">$200-400</SelectItem>
            <SelectItem value="500">$500-750</SelectItem>
            <SelectItem value="750">$750-1000</SelectItem>
            <SelectItem value="1000">$1000+</SelectItem>
            <SelectItem value="0">Any amount helps</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Preferences Step Component
function PreferencesStep({ 
  data, 
  updateData, 
  toggleArrayItem 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void
  toggleArrayItem: (field: keyof OnboardingData, item: string) => void
}) {
  const notificationTypes = [
    { id: 'low-stock', label: 'Low stock alerts' },
    { id: 'expiring-items', label: 'Expiring item notifications' },
    { id: 'budget-warnings', label: 'Budget warnings' },
    { id: 'waste-alerts', label: 'High waste alerts' },
    { id: 'ai-insights', label: 'AI recommendations' },
    { id: 'weekly-reports', label: 'Weekly summary reports' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Customize your experience</h2>
        <p className="text-muted-foreground">Set up notifications and preferences to match your workflow.</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Notification Preferences</Label>
          <p className="text-sm text-muted-foreground mb-4">Choose which notifications you'd like to receive</p>
          
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={data.notification_preferences.includes(type.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      toggleArrayItem('notification_preferences', type.id)
                    } else {
                      toggleArrayItem('notification_preferences', type.id)
                    }
                  }}
                />
                <Label htmlFor={type.id} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
          <Select value={data.preferred_contact_method} onValueChange={(value) => updateData('preferred_contact_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS/Text</SelectItem>
              <SelectItem value="in-app">In-app notifications only</SelectItem>
              <SelectItem value="phone">Phone call (urgent only)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// Data Setup Step Component
function DataSetupStep({ 
  data, 
  updateData 
}: { 
  data: OnboardingData
  updateData: (field: keyof OnboardingData, value: any) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Initial Data Setup</h2>
        <p className="text-muted-foreground">Choose how you'd like to populate your initial inventory data.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox
              id="add_sample_data"
              checked={data.add_sample_data}
              onCheckedChange={(checked) => updateData('add_sample_data', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="add_sample_data" className="text-base font-medium">
                Add sample data (Recommended)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                We'll add realistic sample inventory and menu items so you can explore OnPar's features immediately. 
                You can modify or delete this data later.
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Includes: 15 inventory items, 8 menu items, sample alerts
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox
              id="import_existing_data"
              checked={data.import_existing_data}
              onCheckedChange={(checked) => updateData('import_existing_data', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="import_existing_data" className="text-base font-medium">
                Import existing data
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV file with your current inventory data. We support exports from most POS systems and spreadsheets.
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" disabled={!data.import_existing_data}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Don't worry about perfection</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You can always add, edit, or import more data later. The important thing is to get started 
                and begin seeing the benefits of better inventory management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Complete Step Component
function CompleteStep({ 
  data, 
  onComplete, 
  loading 
}: { 
  data: OnboardingData
  onComplete: () => void
  loading: boolean 
}) {
  const estimatedSavings = Math.max(500, data.monthly_budget * 0.08) // 8% of budget or $500 minimum

  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-4">You're all set, {data.restaurant_name}!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          OnPar is now configured specifically for your restaurant. Based on your setup, 
          we estimate you could save <strong>${estimatedSavings.toLocaleString()}</strong> monthly 
          through better inventory management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">Smart Alerts Ready</h3>
          <p className="text-sm text-muted-foreground">
            We've configured alerts based on your preferences and industry best practices
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">Goals Prioritized</h3>
          <p className="text-sm text-muted-foreground">
            Your dashboard will focus on the {data.primary_goals.length} goals you selected
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">AI Insights Active</h3>
          <p className="text-sm text-muted-foreground">
            Our AI will start learning your patterns and providing recommendations
          </p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Your dashboard will be populated with {data.add_sample_data ? 'sample data' : 'your imported data'}</p>
          <p>• You'll start receiving alerts based on your preferences</p>
          <p>• Our AI will begin analyzing your data for optimization opportunities</p>
          <p>• You can start adding real inventory data and see immediate benefits</p>
        </div>
      </div>

      <Button 
        onClick={onComplete} 
        disabled={loading}
        size="lg"
        className="px-8 py-3 text-lg"
      >
        {loading ? 'Setting up your account...' : 'Go to Dashboard'}
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  )
}