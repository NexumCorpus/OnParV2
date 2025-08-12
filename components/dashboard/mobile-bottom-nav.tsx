'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Package, 
  ChefHat, 
  Bell, 
  User,
  Plus
} from 'lucide-react'

interface BottomNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: BottomNavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard?tab=inventory',
    label: 'Inventory',
    icon: Package,
  },
  {
    href: '/dashboard?tab=menu',
    label: 'Menu',
    icon: ChefHat,
  },
  {
    href: '/notifications',
    label: 'Alerts',
    icon: Bell,
    badge: 3, // This would be dynamic in real app
  },
  {
    href: '/profile',
    label: 'Account',
    icon: User,
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  // Only show on dashboard-related pages
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/profile')) {
    return null
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1 relative
                ${isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Floating Action Button */}
      <div className="absolute -top-6 right-4">
        <Link href="/dashboard">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </div>
  )
}