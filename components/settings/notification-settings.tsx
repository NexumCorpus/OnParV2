'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateNotificationSettings } from '@/lib/actions/settings'
import type { UserSettings } from '@/types'

interface NotificationSettingsProps {
  settings: UserSettings
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateNotificationSettings(formData)
      if (result.success) {
        toast.success('Notification settings saved')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how and when you receive alerts about your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Email notifications toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for important events.
              </p>
            </div>
            <input
              type="hidden"
              name="email_notifications"
              id="email_notifications_hidden"
              defaultValue={settings.email_notifications ? 'true' : 'false'}
            />
            <Switch
              id="email_notifications"
              defaultChecked={settings.email_notifications}
              onCheckedChange={(checked) => {
                const hidden = document.getElementById(
                  'email_notifications_hidden'
                ) as HTMLInputElement | null
                if (hidden) hidden.value = checked ? 'true' : 'false'
              }}
            />
          </div>

          {/* Low stock threshold */}
          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">
              Low Stock Threshold
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                step="0.1"
                min="0"
                max="1"
                defaultValue={settings.low_stock_threshold}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                x reorder point
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Alert when stock falls below this fraction of the reorder point.
            </p>
          </div>

          {/* Expiry warning days */}
          <div className="space-y-2">
            <Label htmlFor="expiry_warning_days">
              Expiry Warning Days
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="expiry_warning_days"
                name="expiry_warning_days"
                type="number"
                min="1"
                max="90"
                defaultValue={settings.expiry_warning_days}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                days before expiry
              </span>
            </div>
          </div>

          {/* Budget warning threshold */}
          <div className="space-y-2">
            <Label htmlFor="budget_warning_threshold">
              Budget Warning At
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="budget_warning_threshold"
                name="budget_warning_threshold"
                type="number"
                min="1"
                max="100"
                defaultValue={settings.budget_warning_threshold}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                % of monthly budget
              </span>
            </div>
          </div>

          {/* Reorder multiplier */}
          <div className="space-y-2">
            <Label htmlFor="reorder_multiplier">
              Reorder Multiplier
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="reorder_multiplier"
                name="reorder_multiplier"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                defaultValue={settings.reorder_multiplier}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                x reorder point
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Suggested reorder quantity as a multiple of the reorder point.
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notification Settings'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
