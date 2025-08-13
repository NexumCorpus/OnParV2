'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/spacing'
import { 
  DesktopNavigation, 
  MobileNavigation, 
  MobileHeader, 
  DesktopHeader 
} from './navigation'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export function MainLayout({ 
  children, 
  className,
  containerSize = '2xl',
  padding = 'md',
  fullWidth = false
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Desktop Navigation */}
      <DesktopNavigation />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <DesktopHeader />
        
        {/* Page Content */}
        <main className={cn('pb-20 lg:pb-6', className)}>
          {fullWidth ? (
            <div className="p-6">
              {children}
            </div>
          ) : (
            <Container size={containerSize} padding={padding}>
              {children}
            </Container>
          )}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  )
}

// Specialized layout for dashboard pages
export function DashboardLayout({ 
  children, 
  title,
  description,
  actions,
  className 
}: {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <MainLayout className={className}>
      {(title || description || actions) && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {(title || description) && (
              <div className="space-y-2">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-lg text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            )}
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </MainLayout>
  )
}

// Specialized layout for forms and settings
export function FormLayout({ 
  children, 
  title,
  description,
  maxWidth = 'lg',
  className 
}: {
  children: React.ReactNode
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  return (
    <MainLayout containerSize={maxWidth} className={className}>
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-8">
        {children}
      </div>
    </MainLayout>
  )
}

// Specialized layout for full-width content like analytics
export function FullWidthLayout({ 
  children, 
  className 
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MainLayout fullWidth className={className}>
      {children}
    </MainLayout>
  )
}