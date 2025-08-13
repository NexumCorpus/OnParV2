'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      'backdrop-blur-sm border-0 shadow-lg',
      gradient && gradientClasses[gradient],
      hover && 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
      glow && 'shadow-2xl shadow-primary/10',
      className
    )}>
      {children}
    </Card>
  )
}

export { CardContent, CardDescription, CardHeader, CardTitle }