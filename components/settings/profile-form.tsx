'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import { Camera, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile, updateAvatar, exportAllData } from '@/lib/actions/settings'

interface ProfileFormProps {
  email: string
  restaurantName: string
  monthlyBudget: number | null
  avatarUrl: string | null
}

export function ProfileForm({
  email,
  restaurantName: initialName,
  monthlyBudget: initialBudget,
  avatarUrl: initialAvatarUrl,
}: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(getUserFriendlyError(result.error))
      }
    })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('File must be JPEG, PNG, or WebP')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be under 2MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    updateAvatar(formData)
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data as { avatarUrl: string }
          setAvatarUrl(data.avatarUrl)
          toast.success('Avatar updated')
        } else if (!result.success) {
          toast.error(getUserFriendlyError(result.error))
        }
      })
      .catch(() => {
        toast.error('Failed to upload avatar')
      })
      .finally(() => {
        setIsUploading(false)
      })
  }

  function handleExport() {
    setIsExporting(true)
    exportAllData()
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data as { downloadUrl: string }
          window.open(data.downloadUrl, '_blank')
          toast.success('Data export ready for download')
        } else if (!result.success) {
          toast.error(getUserFriendlyError(result.error))
        }
      })
      .catch(() => {
        toast.error('Failed to export data')
      })
      .finally(() => {
        setIsExporting(false)
      })
  }

  const initials = email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your restaurant profile and account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-16">
                <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Camera className="size-3" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Change avatar</p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP. Max 2MB.
              </p>
            </div>
          </div>

          {/* Profile form */}
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant_name">Restaurant Name *</Label>
              <Input
                id="restaurant_name"
                name="restaurant_name"
                defaultValue={initialName}
                required
                maxLength={200}
                placeholder="Your restaurant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_budget">Monthly Budget ($)</Label>
              <Input
                id="monthly_budget"
                name="monthly_budget"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialBudget ?? ''}
                placeholder="5000.00"
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download all your data as CSV and JSON files bundled in a ZIP archive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing export...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Export My Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
