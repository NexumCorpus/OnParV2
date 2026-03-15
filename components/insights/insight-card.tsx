'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AIInsight } from '@/types'

interface InsightCardProps {
  insight: AIInsight
  onStart: (id: string) => void
  onDismiss: (id: string) => void
}

const priorityConfig: Record<
  string,
  { label: string; borderColor: string; badgeVariant: 'destructive' | 'default' | 'secondary' | 'outline' }
> = {
  urgent: {
    label: 'URGENT',
    borderColor: 'border-l-red-500',
    badgeVariant: 'destructive',
  },
  high: {
    label: 'HIGH',
    borderColor: 'border-l-orange-500',
    badgeVariant: 'default',
  },
  medium: {
    label: 'MEDIUM',
    borderColor: 'border-l-yellow-500',
    badgeVariant: 'secondary',
  },
  low: {
    label: 'LOW',
    borderColor: 'border-l-gray-400',
    badgeVariant: 'outline',
  },
}

const typeLabels: Record<string, string> = {
  waste_reduction: 'Waste Reduction',
  cost_optimization: 'Cost Optimization',
  inventory_optimization: 'Inventory Optimization',
  menu_optimization: 'Menu Optimization',
}

export function InsightCard({ insight, onStart, onDismiss }: InsightCardProps) {
  const config = priorityConfig[insight.priority] ?? priorityConfig.low

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <CardContent className="py-5">
        <div className="flex items-start gap-3 mb-3">
          <Badge variant={config.badgeVariant} className="shrink-0">
            {config.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {typeLabels[insight.type] ?? insight.type}
          </span>
          {insight.status !== 'pending' && (
            <Badge variant="outline" className="ml-auto">
              {insight.status === 'in_progress' ? 'In Progress' :
               insight.status === 'completed' ? 'Completed' :
               insight.status === 'dismissed' ? 'Dismissed' : insight.status}
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>

        {/* Confidence bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Confidence: {insight.confidence.toFixed(1)}%</span>
            <span>Est. savings: ${insight.estimated_savings.toFixed(0)}/month</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, insight.confidence)}%` }}
            />
          </div>
        </div>

        {insight.timeframe && (
          <p className="text-sm text-muted-foreground mb-3">
            Timeframe: {insight.timeframe}
          </p>
        )}

        {/* Recommended actions */}
        {insight.recommended_actions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Recommended actions:</p>
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-0.5">
              {insight.recommended_actions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        {insight.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onStart(insight.id)}>
              Start Implementation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(insight.id)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
