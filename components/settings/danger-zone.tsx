'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteAccount } from '@/lib/actions/settings'

interface DangerZoneProps {
  email: string
}

export function DangerZone({ email }: DangerZoneProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmEmail, setConfirmEmail] = useState('')
  const [open, setOpen] = useState(false)

  const emailsMatch =
    confirmEmail.toLowerCase() === email.toLowerCase()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount(confirmEmail)
      if (result.success) {
        toast.success('Account deleted successfully')
        router.push('/')
      } else {
        toast.error(getUserFriendlyError(result.error))
      }
    })
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Delete your account and all associated data. This action is
          irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This will permanently delete your account and all associated
                data including inventory items, recipes, menu items, waste
                events, and any active subscription. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <Label htmlFor="confirm_email">
                Type <span className="font-mono font-semibold">{email}</span> to
                confirm
              </Label>
              <Input
                id="confirm_email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="off"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setConfirmEmail('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!emailsMatch || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
