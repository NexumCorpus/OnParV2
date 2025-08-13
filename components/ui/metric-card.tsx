'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ModernCard, CardContent } from './modern-card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
    icon: LucideIcon
  }
  gradient: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan'
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient, 
  className 
}: MetricCardProps) {
  return (
    <ModernCard gradient={gradient} className={cn('group', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground/80 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center mt-2 text-xs font-medium',
                trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                <trend.icon className="h-3 w-3 mr-1" />
                {trend.value}
              </div>
            )}
          </div>
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110',
            gradient === 'blue' && 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25',
            gradient === 'green' && 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25',
            gradient === 'purple' && 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25',
            gradient === 'orange' && 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25',
            gradient === 'pink' && 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/25',
            gradient === 'cyan' && 'bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg shadow-cyan-500/25'
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </ModernCard>
  )
}