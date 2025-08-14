'use client'

import { DashboardLayout } from '../../../components/layout/main-layout'
import { BetaMobileInterface } from '../../../components/mobile/beta-mobile-interface'

export default function MobilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Mobile Interface
            </h1>
            <p className="text-muted-foreground mt-1">
              Kitchen-optimized mobile experience for busy restaurant operations
            </p>
          </div>
        </div>
        <BetaMobileInterface />
      </div>
    </DashboardLayout>
  )
}