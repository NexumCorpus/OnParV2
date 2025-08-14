'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accessibility, Plus, Minus, Eye, EyeOff, Contrast, Type } from 'lucide-react'

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const increaseFontSize = () => {
    const newSize = Math.min(150, fontSize + 10)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}%`
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(75, fontSize - 10)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}%`
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    document.documentElement.classList.toggle('high-contrast', !highContrast)
  }

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
    document.documentElement.classList.toggle('reduce-motion', !reducedMotion)
  }

  const resetSettings = () => {
    setFontSize(100)
    setHighContrast(false)
    setReducedMotion(false)
    document.documentElement.style.fontSize = '100%'
    document.documentElement.classList.remove('high-contrast', 'reduce-motion')
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen && (
        <Card className="mb-4 w-64 shadow-xl border-2">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <Accessibility className="h-4 w-4 mr-2" />
                Accessibility
              </h3>
              <Badge variant="outline" className="text-xs">
                {fontSize}%
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={decreaseFontSize}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm flex-1 text-center">{fontSize}%</span>
                  <Button size="sm" variant="outline" onClick={increaseFontSize}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant={highContrast ? "default" : "outline"}
                  onClick={toggleHighContrast}
                  className="w-full justify-start"
                >
                  <Contrast className="h-3 w-3 mr-2" />
                  High Contrast
                </Button>
                
                <Button
                  size="sm"
                  variant={reducedMotion ? "default" : "outline"}
                  onClick={toggleReducedMotion}
                  className="w-full justify-start"
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Reduce Motion
                </Button>
              </div>
              
              <Button size="sm" variant="ghost" onClick={resetSettings} className="w-full">
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button
        size="icon"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg bg-background border-2"
        aria-label="Accessibility options"
      >
        <Accessibility className="h-4 w-4" />
      </Button>
    </div>
  )
}