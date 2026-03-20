'use client'

import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
}

function getStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' }
  if (password.length < 8) return { level: 1, label: 'Too short' }

  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasUpper || !hasNumber) return { level: 2, label: 'Weak' }
  if (password.length < 12 || !hasSpecial) return { level: 3, label: 'Fair' }
  return { level: 4, label: 'Strong' }
}

const COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { level, label } = getStrength(password)

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              segment <= level ? COLORS[level] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs',
        level <= 2 ? 'text-red-500' : level === 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
      )}>
        {label}
      </p>
    </div>
  )
}
