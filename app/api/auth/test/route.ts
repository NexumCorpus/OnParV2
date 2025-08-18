/**
 * Test route for enterprise authentication system
 */

import { NextRequest, NextResponse } from 'next/server'
import { EnterpriseAuthService, UserRole, Permission } from '../../../../lib/enterprise-auth'
import { createProtectedRoute, requirePermissions } from '../../../../lib/auth-middleware'

// Test basic authentication
export async function GET(request: NextRequest) {
  try {
    // Test role and permission definitions
    const roles = Object.values(UserRole)
    const permissions = Object.values(Permission)
    
    return NextResponse.json({
      success: true,
      message: 'Enterprise authentication system is working',
      data: {
        availableRoles: roles,
        totalPermissions: permissions.length,
        samplePermissions: permissions.slice(0, 5)
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Authentication system test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Test protected route with permissions
export const POST = createProtectedRoute(
  async (request: NextRequest, context) => {
    return NextResponse.json({
      success: true,
      message: 'Protected route accessed successfully',
      user: {
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
        tenantId: context.tenantId
      }
    })
  },
  requirePermissions(Permission.VIEW_ANALYTICS)
)