'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { WasteAlert } from '@/lib/engines/waste-predictions'

interface WasteAlertsProps {
  alerts: WasteAlert[]
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    textColor: 'text-red-600 dark:text-red-400',
    iconColor: 'text-red-500',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    iconColor: 'text-orange-500',
  },
  medium: {
    icon: AlertCircle,
    label: 'Medium',
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    iconColor: 'text-yellow-500',
  },
  low: {
    icon: Info,
    label: 'Low',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    textColor: 'text-gray-600 dark:text-gray-400',
    iconColor: 'text-gray-400',
  },
}

export function WasteAlerts({ alerts }: WasteAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active alerts. Your inventory looks good!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group by severity
  const grouped = {
    critical: alerts.filter((a) => a.severity === 'critical'),
    high: alerts.filter((a) => a.severity === 'high'),
    medium: alerts.filter((a) => a.severity === 'medium'),
    low: alerts.filter((a) => a.severity === 'low'),
  }

  return (
    <div className="space-y-6">
      {(Object.entries(grouped) as Array<[keyof typeof severityConfig, WasteAlert[]]>)
        .filter(([, items]) => items.length > 0)
        .map(([severity, items]) => {
          const config = severityConfig[severity]
          const Icon = config.icon

          return (
            <div key={severity}>
              <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${config.textColor}`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
                {config.label} ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${config.borderColor} ${config.bgColor}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.description}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Suggested: </span>
                            {alert.suggestedAction}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button variant="ghost" size="sm">
                            Dismiss
                          </Button>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}
