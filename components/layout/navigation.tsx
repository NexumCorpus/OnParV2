'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Typography } from '../ui/typography'
import { Stack, Inline } from '../ui/spacing'
import { useTheme } from '../providers/theme-provider'
import {
  LayoutDashboard,
  Package,
  ChefHat,
  BarChart3,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Plus,
  User,
  LogOut,
} from 'lucide-react'

// Navigation items configuration
const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
    description: 'Overview and insights',
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    badge: { count: 8, variant: 'warning' as const, label: 'Low stock' },
    description: 'Manage your stock',
  },
  {
    title: 'Recipes',
    href: '/recipes',
    icon: ChefHat,
    badge: null,
    description: 'Menu and recipes',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: { count: 3, variant: 'info' as const, label: 'New insights' },
    description: 'Performance metrics',
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Users,
    badge: null,
    description: 'Vendor management',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
    description: 'App preferences',
  },
] as const

// Desktop Sidebar Navigation
export function DesktopNavigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border/50 transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <Typography variant="h6" weight="bold" className="text-foreground">
                OnPar
              </Typography>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-muted"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <Stack space={1} className="px-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badge.variant}
                            size="sm"
                            className="ml-2"
                          >
                            {item.badge.count}
                          </Badge>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 hidden group-hover:block z-50">
                        <div className="rounded-lg bg-popover px-3 py-2 text-sm shadow-lg border border-border">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </Stack>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4">
          {!collapsed ? (
            <Stack space={3}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full justify-start"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    Restaurant Owner
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Premium Plan
                  </div>
                </div>
              </div>
            </Stack>
          ) : (
            <Stack space={2}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </Stack>
          )}
        </div>
      </div>
    </aside>
  )
}

// Mobile Bottom Navigation
export function MobileNavigation() {
  const pathname = usePathname()

  const mobileItems = navigationItems.slice(0, 5) // Show first 5 items

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 lg:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge
                      variant={item.badge.variant}
                      size="sm"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
                    >
                      {item.badge.count}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium mt-1 truncate">
                  {item.title}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Mobile Header
export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-lg border-b border-border/50 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <Typography variant="h6" weight="bold">
              OnPar
            </Typography>
          </Link>

          <Inline space={2} align="center">
            <Button variant="ghost" size="icon-sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </Inline>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border/50 shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              <Typography variant="h6" weight="semibold">
                Menu
              </Typography>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <Stack space={1} className="px-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 rounded-lg p-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div>{item.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                        {item.badge && (
                          <Badge variant={item.badge.variant} size="sm">
                            {item.badge.count}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </Stack>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Desktop Header
export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-30 w-full bg-card/95 backdrop-blur-lg border-b border-border/50 hidden lg:block">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Typography variant="h5" weight="semibold" color="muted">
            Dashboard
          </Typography>
        </div>

        <Inline space={3} align="center">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
            >
              3
            </Badge>
          </Button>
          <Button variant="gradient" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </Inline>
      </div>
    </header>
  )
}