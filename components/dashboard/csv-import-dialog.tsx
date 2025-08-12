'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { parseInventoryCSV, generateSampleCSV } from '@/lib/csv'
import { createInventoryItem } from '@/lib/inventory'
import { getCurrentUser } from '@/lib/auth'
import { Upload, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CSVImportDialogProps {
  onSuccess: () => void
}

export function CSVImportDialog({ onSuccess }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    failed: number
  } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvData(content)
        setErrors([])
        setImportResults(null)
        toast.success('CSV file loaded successfully')
      }
      reader.onerror = () => {
        toast.error('Failed to read CSV file')
      }
      reader.readAsText(file)
    }
  }

  const handleLoadSample = () => {
    setCsvData(generateSampleCSV())
    setErrors([])
    setImportResults(null)
    toast.success('Sample CSV data loaded')
  }

  const handleDownloadTemplate = () => {
    const template = `name,quantity,unit,expiry_date,reorder_point,price_per_unit
Tomato Sauce,24,cans,2025-08-15,10,2.50
Mozzarella Cheese,5,kg,2025-02-05,8,12.00
Pasta Spaghetti,50,kg,,20,3.20`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'onpar-inventory-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter or upload CSV data first')
      return
    }

    setProcessing(true)
    setProgress(0)
    setErrors([])
    setImportResults(null)

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to import data')
        return
      }

      // Parse CSV data
      const parseResult = parseInventoryCSV(csvData, user.id)
      
      if (!parseResult.success) {
        setErrors(parseResult.errors)
        toast.error(`CSV parsing failed: ${parseResult.errors[0]}`)
        return
      }

      if (parseResult.errors.length > 0) {
        setErrors(parseResult.errors)
        toast.error(`Found ${parseResult.errors.length} errors in CSV`)
        return
      }

      // Import items with progress tracking
      let successCount = 0
      let errorCount = 0
      const totalItems = parseResult.data.length

      for (let i = 0; i < parseResult.data.length; i++) {
        const item = parseResult.data[i]
        
        try {
          const { error } = await createInventoryItem(item)
          if (error) {
            errorCount++
            console.error('Error creating item:', error)
          } else {
            successCount++
          }
        } catch (error) {
          errorCount++
          console.error('Error creating item:', error)
        }

        // Update progress
        setProgress(((i + 1) / totalItems) * 100)
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setImportResults({
        total: totalItems,
        success: successCount,
        failed: errorCount
      })

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} items!`)
        onSuccess()
        
        if (errorCount === 0) {
          // Auto-close dialog on complete success
          setTimeout(() => {
            setOpen(false)
            setCsvData('')
            setProgress(0)
            setImportResults(null)
          }, 2000)
        }
      } else {
        toast.error('No items were imported successfully')
      }

    } catch (error) {
      console.error('CSV processing error:', error)
      toast.error('Failed to process CSV data')
      setErrors(['Unexpected error during import'])
    } finally {
      setProcessing(false)
    }
  }

  const resetDialog = () => {
    setCsvData('')
    setErrors([])
    setImportResults(null)
    setProgress(0)
    setProcessing(false)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetDialog()
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Import CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Inventory from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file or paste data to bulk import inventory items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <Label htmlFor="csv-file" className="cursor-pointer">
                <span className="text-sm font-medium">Upload CSV</span>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Label>
            </div>
            
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadSample}
                className="text-sm"
              >
                Load Sample
              </Button>
            </div>

            <div className="border-2 border-dashed border-green-200 rounded-lg p-4 text-center">
              <Download className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate}
                className="text-sm"
              >
                Download Template
              </Button>
            </div>
          </div>

          {/* CSV Data Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              placeholder="name,quantity,unit,expiry_date,reorder_point,price_per_unit&#10;Tomato Sauce,24,cans,2025-08-15,10,2.50&#10;Mozzarella Cheese,5,kg,2025-02-05,8,12.00"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Required columns: name, quantity, unit, reorder_point, price_per_unit. Optional: expiry_date
            </p>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing items...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <Alert className={importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Import Complete</p>
                  <p>✅ {importResults.success} items imported successfully</p>
                  {importResults.failed > 0 && (
                    <p>❌ {importResults.failed} items failed to import</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Import Errors ({errors.length}):</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm">• {error}</p>
                    ))}
                    {errors.length > 10 && (
                      <p className="text-sm text-muted-foreground">
                        ... and {errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={processing || !csvData.trim()}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Items
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}