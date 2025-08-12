'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  Home, 
  Package, 
  ChefHat, 
  Users, 
  BarChart3, 
  Bell, 
  FileText, 
  Settings,
  Star,
  Zap,
  CreditCard,
  LogOut
} from 'lucide-react'

interface MobileNavProps {
  userProfile?: any
  notificationCount?: number
}

export function MobileNav({ userProfile, notificationCount = 0 }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard?tab=inventory', label: 'Inventory', icon: Package },
    { href: '/dashboard?tab=menu', label: 'Menu', icon: ChefHat },
    { href: '/dashboard?tab=recipes', label: 'Recipes', icon: Star },
    { href: '/dashboard?tab=suppliers', label: 'Suppliers', icon: Users },
    { href: '/dashboard?tab=analytics', label: 'Analytics', icon: BarChart3 },
    { 
      href: '/dashboard?tab=notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: notificationCount > 0 ? notificationCount : undefined
    },
    { href: '/dashboard?tab=reports', label: 'Reports', icon: FileText },
  ]

  const bottomNavItems = [
    { href: '/pricing', label: 'Billing', icon: CreditCard },
    { href: '/profile', label: 'Settings', icon: Settings },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">OnPar</div>
                <div className="text-sm text-muted-foreground">
                  {userProfile?.restaurant_name || 'Restaurant'}
                </div>
              </div>
            </div>
            
            {userProfile?.premium_subscription && (
              <Badge className="mt-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                AI Premium
              </Badge>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href.includes('?tab=') && pathname === '/dashboard')
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t p-3 space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            <button
              onClick={() => {
                // Handle logout
                setIsOpen(false)
              }}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}