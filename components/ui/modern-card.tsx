'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan'
  hover?: boolean
  glow?: boolean
}

const gradientClasses = {
  blue: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border-blue-200/50 dark:border-blue-800/50',
  green: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 border-green-200/50 dark:border-green-800/50',
  purple: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/50 dark:via-violet-950/50 dark:to-fuchsia-950/50 border-purple-200/50 dark:border-purple-800/50',
  orange: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/50 dark:via-amber-950/50 dark:to-yellow-950/50 border-orange-200/50 dark:border-orange-800/50',
  pink: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/50 dark:via-rose-950/50 dark:to-red-950/50 border-pink-200/50 dark:border-pink-800/50',
  cyan: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/50 dark:via-sky-950/50 dark:to-blue-950/50 border-cyan-200/50 dark:border-cyan-800/50'
}

export function ModernCard({ 
  children, 
  className, 
  gradient, 
  hover = true, 
  glow = false 
}: ModernCardProps) {
  return (
    <Card className={cn(
      // Toast-POS level base styling
      'glass-card backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden',
      'transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)',
      
      // Enhanced gradient backgrounds
      gradient && gradientClasses[gradient],
      
      // Buttery smooth hover effects
      hover && 'toast-hover cursor-pointer',
      hover && 'hover:shadow-2xl hover:border-primary/20',
      hover && 'hover:bg-gradient-to-br hover:from-background/80 hover:to-muted/40',
      
      // Premium glow effects
      glow && 'shadow-2xl shadow-primary/20 ring-1 ring-primary/10',
      glow && 'hover:shadow-primary/30 hover:ring-primary/20',
      
      // Responsive enhancements
      'transform-gpu will-change-transform',
      
      className
    )}>
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}

export { CardContent, CardDescription, CardHeader, CardTitle }