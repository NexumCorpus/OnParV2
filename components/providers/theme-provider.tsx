'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

// Enhanced theme configuration for OnPar
const themeConfig = {
  themes: ['light', 'dark', 'system'],
  defaultTheme: 'system',
  enableSystem: true,
  disableTransitionOnChange: false,
  storageKey: 'onpar-theme',
  attribute: 'class',
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider 
      {...themeConfig} 
      {...props}
    >
      <ThemeEnhancer>
        {children}
      </ThemeEnhancer>
    </NextThemesProvider>
  )
}

// Enhanced theme provider with additional utilities
function ThemeEnhancer({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme()
  
  React.useEffect(() => {
    // Add theme-specific classes to body for enhanced styling
    const updateThemeClasses = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const body = document.body
      
      // Add theme-aware classes
      body.classList.toggle('theme-dark', isDark)
      body.classList.toggle('theme-light', !isDark)
      
      // Add enterprise styling classes
      body.classList.add('onpar-theme', 'enterprise-ui')
      
      // Update meta theme color for mobile browsers
      let metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.setAttribute('name', 'theme-color')
        document.head.appendChild(metaThemeColor)
      }
      metaThemeColor.setAttribute(
        'content', 
        isDark ? 'hsl(222 47% 11%)' : 'hsl(0 0% 100%)'
      )
    }
    
    // Initial update
    updateThemeClasses()
    
    // Watch for theme changes
    const observer = new MutationObserver(updateThemeClasses)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [resolvedTheme])
  
  return <>{children}</>
}

// Re-export useTheme from next-themes with enhanced typing
export function useTheme() {
  return useNextTheme()
}

// Utility function to get CSS custom property values
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

// Utility function to set CSS custom properties
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window === 'undefined') return
  document.documentElement.style.setProperty(variable, value)
}

// Theme-aware color utilities
export const themeColors = {
  primary: 'hsl(var(--primary))',
  primaryHover: 'hsl(var(--primary-hover))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryHover: 'hsl(var(--secondary-hover))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
} as const

// Animation utilities
export const animations = {
  fast: 'var(--duration-fast)',
  normal: 'var(--duration-normal)',
  slow: 'var(--duration-slow)',
} as const

// Shadow utilities
export const shadows = {
  sm: 'var(--shadow-sm)',
  default: 'var(--shadow)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
} as const

// Border radius utilities
export const borderRadius = {
  sm: 'var(--radius-sm)',
  default: 'var(--radius)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
} as const