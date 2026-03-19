'use client'

import { useCallback, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileText } from 'lucide-react'
import { parseInventoryCSV, generateCSVTemplate, downloadCSV, type ParseResult } from '@/lib/utils/csv'
import { importFromCSV } from '@/lib/actions/inventory'
import { CSV_MAX_FILE_SIZE_BYTES } from '@/lib/config'
import { toast } from 'sonner'

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CSVImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((f: File) => {
    if (f.size > CSV_MAX_FILE_SIZE_BYTES) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvString = e.target?.result as string
      const result = parseInventoryCSV(csvString)
      setParseResult(result)
    }
    reader.readAsText(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFile(droppedFile)
    },
    [handleFile]
  )

  const handleImport = async () => {
    if (!file || !parseResult || parseResult.valid.length === 0) return

    setLoading(true)
    const formData = new FormData()
    formData.set('file', file)

    const result = await importFromCSV(formData)
    setLoading(false)

    if (!result.success) {
      if (result.error === 'PLAN_LIMIT_REACHED') {
        toast.error('Plan limit reached. Please upgrade to import more items.')
      } else {
        toast.error(result.error)
      }
      return
    }

    const importData = result.data as { imported: number; errors: Array<{ row: number; message: string }> }
    toast.success(`Successfully imported ${importData.imported} items`)
    setFile(null)
    setParseResult(null)
    onOpenChange(false)
    onSuccess()
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    downloadCSV(template, 'inventory-template.csv')
  }

  const resetState = () => {
    setFile(null)
    setParseResult(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Inventory from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop zone */}
          <div
            className={`
              flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8
              transition-colors cursor-pointer
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
            `}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv'
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                const selectedFile = target.files?.[0]
                if (selectedFile) handleFile(selectedFile)
              }
              input.click()
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Drop CSV file here or click to browse'}
            </p>
            {!file && (
              <p className="text-xs text-muted-foreground mt-1">
                Max 5MB, up to 500 rows
              </p>
            )}
          </div>

          {/* Expected format */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Expected format:</p>
            <p>Name, Category, Quantity, Unit, Expiry Date, Reorder Point, Price</p>
          </div>

          {/* Download template */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="min-h-[44px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          {/* Parse results */}
          {parseResult && (
            <div className="space-y-2 rounded-lg border p-3">
              {parseResult.valid.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <FileText className="h-4 w-4" />
                  {parseResult.valid.length} items ready to import
                </div>
              )}
              {parseResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {parseResult.errors.length} rows have errors:
                  </p>
                  <ul className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !parseResult || parseResult.valid.length === 0}
          >
            {loading
              ? 'Importing...'
              : `Import ${parseResult?.valid.length ?? 0} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
