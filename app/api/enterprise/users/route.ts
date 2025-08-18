/**
 * Enterprise Users API Route
 * 
 * Demonstrates the enterprise authentication and RBAC system in action.
 * This route handles user management operations with proper permission checking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  withAuth, 
  requirePermissions, 
  withAuditLog,
  AuthContext 
} from '@/lib/auth-middleware'
import { Permission } from '@/lib/enterprise-auth'
import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/error-logging'

/**
 * GET /api/enterprise/users
 * List users in the tenant (requires manage_users permission)
 */
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    withAuditLog('list_users')(async (req: NextRequest, context: AuthContext) => {
      try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
        const offset = (page - 1) * limit

        // Query users in the same tenant
        const { data: users, error, count } = await supabase
          .from('users')
          .select(`
            id,
            email,
            created_at,
            last_login,
            mfa_enabled,
            user_roles!inner(role, is_active),
            organizations(name),
            locations(name)
          `, { count: 'exact' })
          .eq('tenant_id', context.tenantId)
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        return NextResponse.json({
          users: users || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        })

      } catch (error) {
        logError(error as Error, 'GET /api/enterprise/users', context.user.id, undefined, context.tenantId)
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }
    }),
    requirePermissions(Permission.MANAGE_USERS)
  )
}

/**
 * POST /api/enterprise/users
 * Create a new user (requires manage_users permission)
 */
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    withAuditLog('create_user')(async (req: NextRequest, context: AuthContext) => {
      try {
        const body = await req.json()
        
        // Validate required fields
        const { email, role, organizationId, locationId } = body
        if (!email || !role) {
          return NextResponse.json(
            { error: 'Email and role are required' },
            { status: 400 }
          )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          )
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single()

        if (existingUser) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          )
        }

        // Create user invitation (in a real system, this would send an invitation email)
        const { data: newUser, error: createError } = await supabase
          .from('user_invitations')
          .insert({
            email,
            tenant_id: context.tenantId,
            organization_id: organizationId,
            location_id: locationId,
            invited_by: context.user.id,
            role,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return NextResponse.json({
          message: 'User invitation created successfully',
          invitation: newUser
        }, { status: 201 })

      } catch (error) {
        logError(error as Error, 'POST /api/enterprise/users', context.user.id, undefined, context.tenantId)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
    }),
    requirePermissions(Permission.MANAGE_USERS)
  )
}

/**
 * PUT /api/enterprise/users/[id]
 * Update user role and permissions (requires manage_users permission)
 */
export async function PUT(request: NextRequest) {
  return withAuth(
    request,
    withAuditLog('update_user')(async (req: NextRequest, context: AuthContext) => {
      try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('id')
        
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }

        const body = await req.json()
        const { role, organizationId, locationId, isActive } = body

        // Verify user exists in the same tenant
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', userId)
          .eq('tenant_id', context.tenantId)
          .single()

        if (fetchError || !existingUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Prevent users from modifying their own role (unless super admin)
        if (userId === context.user.id && context.user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Cannot modify your own role' },
            { status: 403 }
          )
        }

        // Update user role
        if (role) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({
              role,
              is_active: isActive !== undefined ? isActive : true
            })
            .eq('user_id', userId)
            .eq('tenant_id', context.tenantId)

          if (roleError) {
            throw roleError
          }
        }

        // Update user organization/location
        const updateData: any = {}
        if (organizationId !== undefined) updateData.organization_id = organizationId
        if (locationId !== undefined) updateData.location_id = locationId

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)

          if (updateError) {
            throw updateError
          }
        }

        return NextResponse.json({
          message: 'User updated successfully'
        })

      } catch (error) {
        logError(error as Error, 'PUT /api/enterprise/users', context.user.id, undefined, context.tenantId)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
    }),
    requirePermissions(Permission.MANAGE_USERS)
  )
}

/**
 * DELETE /api/enterprise/users/[id]
 * Deactivate user (requires manage_users permission)
 */
export async function DELETE(request: NextRequest) {
  return withAuth(
    request,
    withAuditLog('deactivate_user')(async (req: NextRequest, context: AuthContext) => {
      try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('id')
        
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }

        // Verify user exists in the same tenant
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', userId)
          .eq('tenant_id', context.tenantId)
          .single()

        if (fetchError || !existingUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Prevent users from deactivating themselves
        if (userId === context.user.id) {
          return NextResponse.json(
            { error: 'Cannot deactivate your own account' },
            { status: 403 }
          )
        }

        // Deactivate user role instead of deleting
        const { error: deactivateError } = await supabase
          .from('user_roles')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('tenant_id', context.tenantId)

        if (deactivateError) {
          throw deactivateError
        }

        // Revoke all refresh tokens for the user
        await supabase
          .from('refresh_tokens')
          .update({ is_revoked: true, revoked_at: new Date().toISOString() })
          .eq('user_id', userId)

        return NextResponse.json({
          message: 'User deactivated successfully'
        })

      } catch (error) {
        logError(error as Error, 'DELETE /api/enterprise/users', context.user.id, undefined, context.tenantId)
        return NextResponse.json(
          { error: 'Failed to deactivate user' },
          { status: 500 }
        )
      }
    }),
    requirePermissions(Permission.MANAGE_USERS)
  )
}