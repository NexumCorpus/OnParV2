'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home, LayoutDashboard, Package, ChefHat, Settings, CreditCard, BarChart3 } from 'lucide-react'

const routeMap: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  '/dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  '/profile': { label: 'Account Settings', icon: Settings },
  '/pricing': { label: 'Billing & Plans', icon: CreditCard },
  '/analytics': { label: 'Analytics', icon: BarChart3 },
  '/help': { label: 'Help & Support' },
  '/onboarding': { label: 'Setup' },
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  
  // Don't show breadcrumbs on home page or auth pages
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Build breadcrumb items
  const breadcrumbItems = []
  let currentPath = ''

  // Always start with Dashboard for authenticated pages
  if (pathname !== '/dashboard') {
    breadcrumbItems.push({
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
    })
  }

  // Add path segments
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const routeInfo = routeMap[currentPath]
    
    if (routeInfo) {
      breadcrumbItems.push({
        href: currentPath,
        label: routeInfo.label,
        icon: routeInfo.icon,
        isLast: index === pathSegments.length - 1,
      })
    }
  })

  // Don't render if only one item (current page)
  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <div className="border-b bg-muted/30 px-4 py-3">
      <div className="container mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const Icon = item.icon
              const isLast = index === breadcrumbItems.length - 1

              return (
                <React.Fragment key={item.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="flex items-center space-x-1">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href} className="flex items-center space-x-1">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.label}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}