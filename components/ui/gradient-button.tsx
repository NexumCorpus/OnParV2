'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  children: React.ReactNode
}

const gradientVariants = {
  primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
  success: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/25',
  warning: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/25',
  danger: 'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25',
  info: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 hover:from-cyan-600 hover:via-sky-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25',
  purple: 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 hover:from-purple-600 hover:via-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
}

const sizeVariants = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl'
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ variant = 'primary', size = 'md', glow = false, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'border-0 font-semibold transition-all duration-300 transform hover:scale-105',
          gradientVariants[variant],
          sizeVariants[size],
          glow && 'shadow-2xl',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

GradientButton.displayName = 'GradientButton'