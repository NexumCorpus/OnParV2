'use client'

import Link from 'next/link'
import {
  Plus,
  Trash2,
  BarChart3,
  Lightbulb,
  Upload,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/inventory/add">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Inventory Item
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/waste">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Log Waste
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
            View Analytics
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/insights">
            <Lightbulb className="mr-2 h-4 w-4" aria-hidden="true" />
            View Insights
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/inventory">
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Import CSV
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start min-h-[44px]" asChild>
          <Link href="/analytics">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export Report
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
