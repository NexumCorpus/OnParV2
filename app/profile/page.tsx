'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Separator } from '../components/ui/separator'
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Download,
  Upload,
  Trash2,
  Save,
  ChefHat,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Star,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser, updateUserProfile } from '../lib/auth'
import { DashboardNavbar } from '../components/dashboard/navbar'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    restaurant_name: '',
    email: '',
    cuisine_type: '',
    restaurant_size: '',
    location: '',
    phone: '',
    monthly_budget: 0,
    employee_count: 0,
    premium_subscription: false
  })
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    sms_alerts: false,
    low_stock_alerts: true,
    expiry_alerts: true,
    budget_alerts: true,
    waste_alerts: true,
    ai_insights: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { user: authUser } = await getCurrentUser()
      if (!authUser) {
        router.push('/auth')
        return
      }

      setUser(authUser)
      
      // Load user profile data (in a real app, this would come from Supabase)
      setProfile({
        restaurant_name: 'Mario\'s Italian Kitchen',
        email: authUser.email || '',
        cuisine_type: 'italian',
        restaurant_size: 'medium',
        location: 'Charleston, SC',
        phone: '(843) 555-0123',
        monthly_budget: 8500,
        employee_count: 12,
        premium_subscription: true
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // In a real app, this would update Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      // In a real app, this would update notification preferences
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Notification preferences updated!')
    } catch (error) {
      toast.error('Failed to update notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile,
      notifications,
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onpar-profile-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Profile data exported successfully!')
  }

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog and handle account deletion
    toast.error('Account deletion requires contacting support')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <DashboardNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center shadow-xl">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Loading your profile...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <DashboardNavbar />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.restaurant_name}</h1>
              <p className="text-muted-foreground">Manage your restaurant profile and preferences</p>
            </div>
            {profile.premium_subscription && (
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white ml-auto">
                <Star className="w-4 h-4 mr-1" />
                Premium Member
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Restaurant Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing & Subscription</TabsTrigger>
            <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Restaurant Information
                </CardTitle>
                <CardDescription>
                  Update your restaurant details and business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="restaurant_name">Restaurant Name</Label>
                    <Input
                      id="restaurant_name"
                      value={profile.restaurant_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, restaurant_name: e.target.value }))}
                      placeholder="Your restaurant name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cuisine_type">Cuisine Type</Label>
                    <Select value={profile.cuisine_type} onValueChange={(value) => setProfile(prev => ({ ...prev, cuisine_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="seafood">Seafood</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="restaurant_size">Restaurant Size</Label>
                    <Select value={profile.restaurant_size} onValueChange={(value) => setProfile(prev => ({ ...prev, restaurant_size: value }))}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly_budget">Monthly Food Budget ($)</Label>
                    <Input
                      id="monthly_budget"
                      type="number"
                      value={profile.monthly_budget}
                      onChange={(e) => setProfile(prev => ({ ...prev, monthly_budget: parseInt(e.target.value) || 0 }))}
                      placeholder="8500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employee_count">Number of Employees</Label>
                    <Input
                      id="employee_count"
                      type="number"
                      value={profile.employee_count}
                      onChange={(e) => setProfile(prev => ({ ...prev, employee_count: parseInt(e.target.value) || 0 }))}
                      placeholder="12"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_alerts">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email_alerts"
                      checked={notifications.email_alerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_alerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms_alerts">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="sms_alerts"
                      checked={notifications.sms_alerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms_alerts: checked }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Alert Types</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">When inventory falls below reorder point</p>
                      </div>
                      <Switch
                        id="low_stock_alerts"
                        checked={notifications.low_stock_alerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, low_stock_alerts: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="expiry_alerts">Expiry Alerts</Label>
                        <p className="text-sm text-muted-foreground">When items are approaching expiry</p>
                      </div>
                      <Switch
                        id="expiry_alerts"
                        checked={notifications.expiry_alerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, expiry_alerts: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="budget_alerts">Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">When approaching budget limits</p>
                      </div>
                      <Switch
                        id="budget_alerts"
                        checked={notifications.budget_alerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, budget_alerts: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="waste_alerts">Waste Alerts</Label>
                        <p className="text-sm text-muted-foreground">When waste exceeds thresholds</p>
                      </div>
                      <Switch
                        id="waste_alerts"
                        checked={notifications.waste_alerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, waste_alerts: checked }))}
                      />
                    </div>
                    
                    {profile.premium_subscription && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ai_insights">AI Insights</Label>
                          <p className="text-sm text-muted-foreground">Smart recommendations and predictions</p>
                        </div>
                        <Switch
                          id="ai_insights"
                          checked={notifications.ai_insights}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, ai_insights: checked }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Button onClick={handleSaveNotifications} disabled={saving} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Current Plan</h4>
                      {profile.premium_subscription && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Plan</span>
                        <span>$49/month</span>
                      </div>
                      {profile.premium_subscription && (
                        <div className="flex justify-between">
                          <span>AI Premium Add-on</span>
                          <span>$29/month</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${profile.premium_subscription ? '78' : '49'}/month</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-4">Billing Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>Next billing date: February 15, 2025</div>
                      <div>Payment method: •••• 4242</div>
                      <div>Billing email: {profile.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoices
                  </Button>
                  {!profile.premium_subscription && (
                    <Button>
                      <Star className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your account security and data privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Account Security</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full md:w-auto">
                        <Mail className="h-4 w-4 mr-2" />
                        Change Email Address
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Shield className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Data Management</h4>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={handleExportData} className="w-full md:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="w-full md:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}