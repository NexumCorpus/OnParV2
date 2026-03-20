'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import { inviteTeamMember } from '@/lib/actions/team'

interface TeamMember {
  userId: string
  email: string
  role: string
  joinedAt: string
}

interface TeamSettingsProps {
  orgName: string
  currentUserRole: string
  members: TeamMember[]
}

export function TeamSettings({ orgName, currentUserRole, members }: TeamSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const canInvite = currentUserRole === 'owner' || currentUserRole === 'manager'

  async function handleInvite(formData: FormData) {
    setIsLoading(true)
    const result = await inviteTeamMember(formData)
    setIsLoading(false)

    if (!result.success) {
      toast.error(getUserFriendlyError(result.error))
      return
    }

    const message = (result.data as { message?: string })?.message ?? 'Invitation sent.'
    toast.success(message)
    
    // In a real app we'd refresh or invalidate the router cache here
    // e.g. using next/navigation's useRouter().refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization: {orgName}</CardTitle>
          <CardDescription>
            Manage your team members and their access levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Members</h3>
            <div className="rounded-md border">
              {members.map((member, i) => (
                <div 
                  key={member.userId} 
                  className={`flex items-center justify-between p-4 ${i !== members.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{member.email}</span>
                    <span className="text-xs text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <Badge variant={member.role === 'owner' ? 'default' : member.role === 'manager' ? 'secondary' : 'outline'}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
            <CardDescription>
              Invite a new staff member to join {orgName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleInvite} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="chef@restaurant.com" 
                  required 
                />
              </div>
              <div className="w-[180px] space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="staff">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Inviting...' : 'Send Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
