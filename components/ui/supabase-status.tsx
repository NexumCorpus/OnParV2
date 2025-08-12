'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { isSupabaseConfigured, getSupabaseStatus } from '@/lib/supabase'
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

export function SupabaseStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const checkSupabaseStatus = async () => {
    try {
      const statusInfo = getSupabaseStatus()
      setStatus(statusInfo)
    } catch (error) {
      console.error('Error checking Supabase status:', error)
      setStatus({
        configured: false,
        url: false,
        key: false,
        message: 'Error checking Supabase configuration'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-4">
        <div className="animate-pulse h-16 bg-muted rounded-lg"></div>
      </div>
    )
  }

  if (status?.configured) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="flex items-center justify-between">
            <span className="font-medium">Supabase connected successfully</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Database className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Supabase not configured - Demo mode active</span>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              <WifiOff className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
          <p className="text-sm">
            Some features are limited. Connect to Supabase for full functionality.
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-orange-800 border-orange-300 hover:bg-orange-100"
            onClick={() => window.open('https://supabase.com', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Set up Supabase
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}