'use client'

import { DashboardLayout } from '@/components/layout/main-layout'
import { BetaWasteAnalytics } from '@/components/analytics/beta-waste-analytics'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Waste Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered insights to reduce waste and increase profits
            </p>
          </div>
        </div>
        <BetaWasteAnalytics />
      </div>
    </DashboardLayout>
  )
}