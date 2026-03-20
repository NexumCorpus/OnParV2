'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['manager', 'staff']),
})

export async function getTeamMembers(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the user's organization
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('org_id, role, organizations(name)')
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      return { success: false, error: 'Organization not found' }
    }

    const orgId = orgMember.org_id
    const orgName = (orgMember.organizations as unknown as { name: string }).name
    const currentUserRole = orgMember.role

    // Get all members of the organization
    const { data: members, error: memError } = await supabase
      .from('org_members')
      .select(`
        role,
        joined_at,
        users:user_id ( id, email )
      `)
      .eq('org_id', orgId)

    if (memError) {
      return { success: false, error: 'Failed to fetch team members' }
    }

    return { 
      success: true, 
      data: { 
        orgId,
        orgName,
        currentUserRole,
        members: members.map((m: { role: string; joined_at: string; users: { id: string; email: string } | { id: string; email: string }[] }) => {
          const u = Array.isArray(m.users) ? m.users[0] : m.users
          return {
            userId: u?.id as string,
            email: u?.email as string,
            role: m.role,
            joinedAt: m.joined_at,
          }
        })
      } 
    }
  } catch (err) {
    logger.error({ err, action: 'getTeamMembers' }, 'Failed to fetch team members')
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function inviteTeamMember(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const email = formData.get('email') as string
    const role = formData.get('role') as string

    const parsed = inviteSchema.safeParse({ email, role })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    // Verify current user is owner or manager
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .single()

    if (!orgMember || (orgMember.role !== 'owner' && orgMember.role !== 'manager')) {
      return { success: false, error: 'You do not have permission to invite members.' }
    }

    // In a real app, we would send an invitation email via a service and create an `invitations` record.
    // Since this is a mock implementation without an email provider or complex invite flow, 
    // we will simulate the invitation by searching if the user exists, and if so adding them, or returning a simulated success.
    
    // Admin client to find user by email (only available to service role)
    // For this prototype, if they are already signed up we invite them directly
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      
    if (existingUsers && existingUsers.length > 0) {
      const targetUserId = existingUsers[0].id
      
      // Check if they are already in the org
      const { data: existingMember } = await supabase
        .from('org_members')
        .select('*')
        .eq('org_id', orgMember.org_id)
        .eq('user_id', targetUserId)
        .single()
        
      if (existingMember) {
        return { success: false, error: 'User is already a member of this organization.' }
      }
      
      // Add them
      await supabase
        .from('org_members')
        .insert({
          org_id: orgMember.org_id,
          user_id: targetUserId,
          role: parsed.data.role
        })
    } else {
      // Simulate sending email inviting them to create an account
      logger.info({ email, role: parsed.data.role, org_id: orgMember.org_id }, 'Simulated sending invite email')
    }

    return { 
      success: true, 
      data: { message: `Invitation sent to ${email}` } 
    }
  } catch (err) {
    logger.error({ err, action: 'inviteTeamMember' }, 'Failed to invite team member')
    return { success: false, error: 'Something went wrong.' }
  }
}
