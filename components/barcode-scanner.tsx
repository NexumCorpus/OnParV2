'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, X, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface BarcodeScannerProps {
  onScan: (barcode: string, itemName?: string, productData?: {
    unit?: string
    suggestedPrice?: number
    suggestedReorderPoint?: number
    category?: string
  }) => void
  onClose?: () => void
}

function BarcodeScannerComponent({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeReader, setCodeReader] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Dynamically import ZXing library only on client side
    const initializeScanner = async () => {
      try {
        if (typeof window === 'undefined') {
          setError('Scanner not available on server side')
          return
        }

        // Disable barcode scanner for now to prevent build issues
        setError('Barcode scanner temporarily disabled for deployment')
      } catch (err) {
        console.error('Failed to initialize barcode scanner:', err)
        setError('Barcode scanner not available in this environment')
      }
    }

    initializeScanner()

    return () => {
      if (codeReader) {
        try {
          codeReader.reset()
        } catch (e) {
          console.error('Error cleaning up scanner:', e)
        }
      }
    }
  }, [])

  const startScanning = async () => {
    if (!codeReader) {
      setError('Scanner not initialized')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found')
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId

      // Start decoding from video device
      const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current)
      
      if (result) {
        const barcode = result.getText()
        
        // Look up product in database
        try {
          const response = await fetch(`/api/products/lookup?barcode=${barcode}`)
          const data = await response.json()
          
          if (data.success && data.product) {
            const product = data.product
            const itemName = product.brand ? `${product.brand} ${product.name}` : product.name
            
            onScan(barcode, itemName, {
              unit: product.unit,
              suggestedPrice: product.suggestedPrice,
              suggestedReorderPoint: product.suggestedReorderPoint,
              category: product.category
            })
            
            toast.success(`Found: ${itemName}`)
          } else {
            // Product not found, but still allow manual entry
            const itemName = `Unknown Product (${barcode.slice(-4)})`
            onScan(barcode, itemName)
            toast.error(`Product not found. You can add details manually.`)
          }
        } catch (error) {
          console.error('Product lookup failed:', error)
          const itemName = `Product ${barcode.slice(-4)}`
          onScan(barcode, itemName)
          toast.error('Product lookup failed. You can add details manually.')
        }
        
        stopScanning()
      }
    } catch (err: any) {
      console.error('Scanning error:', err)
      setError(err.message || 'Failed to scan barcode')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReader) {
      try {
        codeReader.reset()
      } catch (e) {
        console.error('Error stopping scanner:', e)
      }
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    if (onClose) {
      onClose()
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Barcode Scanner
            </span>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {error}. You can still add items manually using the form below.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Barcode Scanner
          </span>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Position a barcode in front of your camera to scan
              </p>
              <Button onClick={startScanning} disabled={!codeReader}>
                <Zap className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure to allow camera access when prompted
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-primary bg-primary/10 rounded-lg">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={stopScanning}>
                Stop Scanning
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Position the barcode within the highlighted area
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const BarcodeScanner = BarcodeScannerComponent