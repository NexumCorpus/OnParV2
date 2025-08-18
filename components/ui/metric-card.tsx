'use client'

import React from 'react'
import { cn } from '../../lib/utils'
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
    <ModernCard 
      gradient={gradient} 
      className={cn('group toast-hover', className)}
      hover={true}
      glow={false}
    >
      <CardContent className="p-8 relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-chart-2 animate-pulse" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground/90 uppercase tracking-wider">
              {title}
            </p>
            
            {/* Enhanced value display with counter animation */}
            <div className="space-y-2">
              <p className="text-4xl font-black bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent leading-none">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              
              {subtitle && (
                <p className="text-sm text-muted-foreground/80 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Enhanced trend indicator */}
            {trend && (
              <div className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold',
                'backdrop-blur-sm border transition-all duration-300',
                trend.positive 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' 
                  : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
              )}>
                <trend.icon className="h-3 w-3 mr-1.5" />
                {trend.value}
              </div>
            )}
          </div>
          
          {/* Enhanced icon with Toast-POS level animations */}
          <div className="relative">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              'transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
              'shadow-xl group-hover:shadow-2xl',
              'backdrop-blur-sm border border-white/20',
              gradient === 'blue' && 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-blue-500/30 group-hover:shadow-blue-500/50',
              gradient === 'green' && 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 shadow-green-500/30 group-hover:shadow-green-500/50',
              gradient === 'purple' && 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 shadow-purple-500/30 group-hover:shadow-purple-500/50',
              gradient === 'orange' && 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-orange-500/30 group-hover:shadow-orange-500/50',
              gradient === 'pink' && 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 shadow-pink-500/30 group-hover:shadow-pink-500/50',
              gradient === 'cyan' && 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-sky-600 shadow-cyan-500/30 group-hover:shadow-cyan-500/50'
            )}>
              <Icon className="h-8 w-8 text-white drop-shadow-sm" />
              
              {/* Subtle pulse animation */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
            </div>
            
            {/* Floating indicator dot */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg border-2 border-background" />
          </div>
        </div>
        
        {/* Subtle animated border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-chart-2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
             style={{ padding: '1px', background: 'linear-gradient(45deg, transparent, rgba(var(--primary), 0.1), transparent)' }} />
      </CardContent>
    </ModernCard>
  )
}