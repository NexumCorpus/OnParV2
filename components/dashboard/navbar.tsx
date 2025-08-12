'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { FeedbackButton } from '@/components/ui/feedback-button'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ChefHat, User, Settings, CreditCard, BarChart3, LogOut, Bell, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardNavbar() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { user: authUser } = await getCurrentUser()
      if (authUser) {
        setUser(authUser)
        
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-24 items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/dashboard" className="flex items-center space-x-4 hover-lift">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 flex items-center justify-center shadow-lg">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-sm border-2 border-background"></div>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-black bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">OnPar</span>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md px-3 py-1 text-xs font-bold">BETA</Badge>
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">Smart Inventory</div>
            </div>
          </Link>

          {/* Enhanced Navigation Links */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link href="/dashboard" className="nav-link active text-base font-semibold">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link href="/recipes" className="nav-link text-base font-semibold">
              <Star className="h-4 w-4 mr-2" />
              Recipes
            </Link>
            <Link href="/analytics" className="nav-link text-base font-semibold">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
            <Link href="/integrations" className="nav-link text-base font-semibold">
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </Link>
            <Link href="/pricing" className="nav-link text-base font-semibold">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </Link>
          </div>

          {/* Enhanced Right Side */}
          <div className="flex items-center space-x-6">
            {/* Premium Status */}
            {userProfile?.premium_subscription && (
              <Badge className="premium-badge hidden sm:flex px-4 py-2">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            
            <FeedbackButton />
            <ThemeToggle />
            
            {loading ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/50 animate-pulse shadow-sm" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full hover-lift">
                    <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary via-chart-2 to-chart-3 text-white font-bold text-lg">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    {userProfile?.premium_subscription && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm border border-background">
                        <Star className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-3 shadow-xl border-border/50" align="end" forceMount>
                  <div className="flex items-center justify-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30">
                    <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary via-chart-2 to-chart-3 text-white font-bold text-lg">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center space-x-3">
                        <p className="font-bold text-base">{userProfile?.restaurant_name || 'Restaurant'}</p>
                        {userProfile?.premium_subscription && (
                          <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 font-bold px-2 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="w-[220px] truncate text-sm text-muted-foreground font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-3" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-sm">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Billing & Plans</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/recipes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center">
                        <Star className="h-4 w-4 text-orange-600" />
                      </div>
                      <span>Recipes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/integrations" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                        <Plug className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Integrations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="btn-primary-enhanced">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}