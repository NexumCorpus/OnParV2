/**
 * Enterprise Authentication Service
 * 
 * Implements JWT-based authentication with refresh token rotation,
 * role-based access control (RBAC), and multi-factor authentication.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { supabase } from './supabase'
import { logError, logUserAction, logSecurityEvent } from './error-logging'
import { generateSecureToken, validateUUID } from './security'
import { JWTService, JWTPayload } from './jwt'
import { TOTPService } from './totp'
import crypto from 'crypto'

// User roles and permissions
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin', 
  LOCATION_MANAGER = 'location_manager',
  SHIFT_MANAGER = 'shift_manager',
  CASHIER = 'cashier',
  KITCHEN_STAFF = 'kitchen_staff',
  SERVER = 'server',
  VIEWER = 'viewer'
}

export enum Permission {
  // System administration
  MANAGE_TENANTS = 'manage_tenants',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  
  // Financial operations
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  MANAGE_PAYMENTS = 'manage_payments',
  PROCESS_REFUNDS = 'process_refunds',
  
  // POS operations
  PROCESS_ORDERS = 'process_orders',
  MODIFY_ORDERS = 'modify_orders',
  VOID_TRANSACTIONS = 'void_transactions',
  APPLY_DISCOUNTS = 'apply_discounts',
  
  // Inventory management
  VIEW_INVENTORY = 'view_inventory',
  MANAGE_INVENTORY = 'manage_inventory',
  APPROVE_ORDERS = 'approve_orders',
  
  // Staff management
  VIEW_SCHEDULES = 'view_schedules',
  MANAGE_SCHEDULES = 'manage_schedules',
  VIEW_TIMECLOCK = 'view_timeclock',
  MANAGE_TIMECLOCK = 'manage_timeclock',
  
  // Customer management
  VIEW_CUSTOMERS = 'view_customers',
  MANAGE_CUSTOMERS = 'manage_customers',
  MANAGE_LOYALTY = 'manage_loyalty',
  
  // Analytics and reporting
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  
  // System configuration
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_INTEGRATIONS = 'manage_integrations'
}

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.TENANT_ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.MANAGE_PAYMENTS,
    Permission.PROCESS_REFUNDS,
    Permission.PROCESS_ORDERS,
    Permission.MODIFY_ORDERS,
    Permission.VOID_TRANSACTIONS,
    Permission.APPLY_DISCOUNTS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.APPROVE_ORDERS,
    Permission.VIEW_SCHEDULES,
    Permission.MANAGE_SCHEDULES,
    Permission.VIEW_TIMECLOCK,
    Permission.MANAGE_TIMECLOCK,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMERS,
    Permission.MANAGE_LOYALTY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_INTEGRATIONS
  ],
  
  [UserRole.LOCATION_MANAGER]: [
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.PROCESS_ORDERS,
    Permission.MODIFY_ORDERS,
    Permission.VOID_TRANSACTIONS,
    Permission.APPLY_DISCOUNTS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.APPROVE_ORDERS,
    Permission.VIEW_SCHEDULES,
    Permission.MANAGE_SCHEDULES,
    Permission.VIEW_TIMECLOCK,
    Permission.MANAGE_TIMECLOCK,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMERS,
    Permission.MANAGE_LOYALTY,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.SHIFT_MANAGER]: [
    Permission.PROCESS_ORDERS,
    Permission.MODIFY_ORDERS,
    Permission.VOID_TRANSACTIONS,
    Permission.APPLY_DISCOUNTS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_SCHEDULES,
    Permission.VIEW_TIMECLOCK,
    Permission.MANAGE_TIMECLOCK,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMERS,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.CASHIER]: [
    Permission.PROCESS_ORDERS,
    Permission.MODIFY_ORDERS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMERS
  ],
  
  [UserRole.KITCHEN_STAFF]: [
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY
  ],
  
  [UserRole.SERVER]: [
    Permission.PROCESS_ORDERS,
    Permission.MODIFY_ORDERS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMERS
  ],
  
  [UserRole.VIEWER]: [
    Permission.VIEW_INVENTORY,
    Permission.VIEW_SCHEDULES,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_ANALYTICS
  ]
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  permissions: Permission[]
  tenantId: string
  organizationId?: string
  locationId?: string
  mfaEnabled: boolean
  lastLogin: Date
}

export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  isRevoked: boolean
  deviceInfo?: string
  ipAddress?: string
}

export interface MFASetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface AuthResult {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  error: Error | null
  requiresMFA?: boolean
}

/**
 * Enterprise Authentication Service
 */
export class EnterpriseAuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000 // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
  private static readonly MFA_CODE_EXPIRY = 5 * 60 * 1000 // 5 minutes
  
  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string, 
    password: string, 
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<AuthResult> {
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        logError(error.message, 'EnterpriseAuth.signIn', undefined, email)
        return { user: null, accessToken: null, refreshToken: null, error }
      }
      
      if (!data.user) {
        return { 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          error: new Error('Authentication failed') 
        }
      }
      
      // Get user profile with role and permissions
      const userProfile = await this.getUserProfile(data.user.id)
      if (!userProfile) {
        return { 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          error: new Error('User profile not found') 
        }
      }
      
      // Check if MFA is required
      if (userProfile.mfaEnabled) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
          requiresMFA: true
        }
      }
      
      // Generate JWT tokens
      const accessToken = await this.generateAccessToken(userProfile)
      const refreshToken = await this.generateRefreshToken(
        userProfile.id, 
        deviceInfo, 
        ipAddress
      )
      
      // Update last login
      await this.updateLastLogin(userProfile.id)
      
      logUserAction('user_signed_in', { email, deviceInfo }, userProfile.id)
      
      return {
        user: userProfile,
        accessToken,
        refreshToken,
        error: null
      }
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.signIn', undefined, email)
      return { 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        error: error as Error 
      }
    }
  }
  
  /**
   * Complete MFA authentication
   */
  static async completeMFAAuth(
    email: string,
    mfaCode: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<AuthResult> {
    try {
      // Verify MFA code
      const isValidCode = await this.verifyMFACode(email, mfaCode)
      if (!isValidCode) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: new Error('Invalid MFA code')
        }
      }
      
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (userError || !userData) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: new Error('User not found')
        }
      }
      
      const userProfile = await this.getUserProfile(userData.id)
      if (!userProfile) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: new Error('User profile not found')
        }
      }
      
      // Generate JWT tokens
      const accessToken = await this.generateAccessToken(userProfile)
      const refreshToken = await this.generateRefreshToken(
        userProfile.id,
        deviceInfo,
        ipAddress
      )
      
      // Update last login
      await this.updateLastLogin(userProfile.id)
      
      logUserAction('mfa_auth_completed', { email, deviceInfo }, userProfile.id)
      
      return {
        user: userProfile,
        accessToken,
        refreshToken,
        error: null
      }
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.completeMFAAuth', undefined, email)
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: error as Error
      }
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Validate and get refresh token
      const tokenData = await this.validateRefreshToken(refreshToken)
      if (!tokenData) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: new Error('Invalid refresh token')
        }
      }
      
      // Get user profile
      const userProfile = await this.getUserProfile(tokenData.userId)
      if (!userProfile) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: new Error('User not found')
        }
      }
      
      // Generate new access token
      const newAccessToken = await this.generateAccessToken(userProfile)
      
      // Rotate refresh token for security
      const newRefreshToken = await this.rotateRefreshToken(tokenData.id)
      
      return {
        user: userProfile,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        error: null
      }
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.refreshAccessToken')
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: error as Error
      }
    }
  }
  
  /**
   * Verify access token and get user
   */
  static async verifyAccessToken(token: string): Promise<AuthUser | null> {
    try {
      // Decode and verify JWT token
      const payload = await JWTService.verifyJWT(token)
      if (!payload) {
        return null
      }
      
      // Get fresh user profile
      const userProfile = await this.getUserProfile(payload.sub)
      return userProfile
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.verifyAccessToken')
      return null
    }
  }
  
  /**
   * Check if user has specific permission
   */
  static hasPermission(user: AuthUser, permission: Permission): boolean {
    return user.permissions.includes(permission)
  }
  
  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission))
  }
  
  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission))
  }
  
  /**
   * Setup MFA for user
   */
  static async setupMFA(userId: string): Promise<MFASetup | null> {
    try {
      // Generate TOTP secret
      const secret = TOTPService.generateSecret()
      
      // Get user email for QR code
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()
      
      const userEmail = userData?.email || userId
      
      // Generate QR code URL
      const qrCode = TOTPService.generateQRCodeURL(secret, userEmail, 'OnPar')
      
      // Generate backup codes
      const backupCodes = TOTPService.generateBackupCodes(10)
      
      // Store MFA setup in database (encrypted)
      const encryptedSecret = await this.encryptData(secret)
      const encryptedBackupCodes = await Promise.all(
        backupCodes.map(code => this.encryptData(code))
      )
      
      await supabase
        .from('user_mfa')
        .upsert({
          user_id: userId,
          secret_encrypted: encryptedSecret,
          backup_codes_encrypted: encryptedBackupCodes,
          enabled: false,
          created_at: new Date().toISOString()
        })
      
      logSecurityEvent('mfa_setup_initiated', { userId }, userId)
      
      return {
        secret,
        qrCode,
        backupCodes
      }
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.setupMFA', userId)
      return null
    }
  }
  
  /**
   * Enable MFA for user
   */
  static async enableMFA(userId: string, verificationCode: string): Promise<boolean> {
    try {
      // Verify the code before enabling
      const { data: mfaData } = await supabase
        .from('user_mfa')
        .select('secret_encrypted')
        .eq('user_id', userId)
        .single()
      
      if (!mfaData) {
        logSecurityEvent('mfa_enable_failed', { reason: 'no_mfa_data', userId }, userId)
        return false
      }
      
      const secret = await this.decryptData(mfaData.secret_encrypted)
      const isValid = TOTPService.verifyTOTP(verificationCode, { secret })
      
      if (!isValid) {
        logSecurityEvent('mfa_enable_failed', { reason: 'invalid_code', userId }, userId)
        return false
      }
      
      // Enable MFA
      await supabase
        .from('user_mfa')
        .update({ enabled: true })
        .eq('user_id', userId)
      
      // Update user profile
      await supabase
        .from('users')
        .update({ mfa_enabled: true })
        .eq('id', userId)
      
      logSecurityEvent('mfa_enabled', { userId }, userId, undefined, 'medium')
      return true
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.enableMFA', userId)
      return false
    }
  }
  
  /**
   * Sign out user and revoke tokens
   */
  static async signOut(userId: string, refreshToken?: string): Promise<void> {
    try {
      // Revoke refresh token if provided
      if (refreshToken) {
        await this.revokeRefreshToken(refreshToken)
      }
      
      // Revoke all refresh tokens for user (optional - for security)
      await supabase
        .from('refresh_tokens')
        .update({ is_revoked: true })
        .eq('user_id', userId)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      logUserAction('user_signed_out', {}, userId)
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.signOut', userId)
    }
  }
  
  // Private helper methods
  
  private static async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles!inner(role),
          tenants!inner(id, name)
        `)
        .eq('id', userId)
        .single()
      
      if (error || !data) {
        return null
      }
      
      const role = data.user_roles?.role as UserRole || UserRole.VIEWER
      const permissions = ROLE_PERMISSIONS[role] || []
      
      return {
        id: data.id,
        email: data.email,
        role,
        permissions,
        tenantId: data.tenant_id,
        organizationId: data.organization_id,
        locationId: data.location_id,
        mfaEnabled: data.mfa_enabled || false,
        lastLogin: new Date(data.last_login || data.created_at)
      }
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.getUserProfile', userId)
      return null
    }
  }
  
  private static async generateAccessToken(user: AuthUser): Promise<string> {
    const payload: Partial<JWTPayload> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      locationId: user.locationId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.ACCESS_TOKEN_EXPIRY) / 1000),
      iss: 'onpar-enterprise',
      aud: 'onpar-api'
    }
    
    return JWTService.signJWT(payload)
  }
  
  private static async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<string> {
    const token = generateSecureToken(64)
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY)
    
    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token: await this.hashToken(token),
        expires_at: expiresAt.toISOString(),
        device_info: deviceInfo,
        ip_address: ipAddress,
        is_revoked: false
      })
    
    return token
  }
  
  private static async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const hashedToken = await this.hashToken(token)
      
      const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*')
        .eq('token', hashedToken)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !data) {
        return null
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        token: data.token,
        expiresAt: new Date(data.expires_at),
        isRevoked: data.is_revoked,
        deviceInfo: data.device_info,
        ipAddress: data.ip_address
      }
      
    } catch (error) {
      return null
    }
  }
  
  private static async rotateRefreshToken(tokenId: string): Promise<string> {
    // Revoke old token
    await supabase
      .from('refresh_tokens')
      .update({ is_revoked: true })
      .eq('id', tokenId)
    
    // Get token data for new token generation
    const { data } = await supabase
      .from('refresh_tokens')
      .select('user_id, device_info, ip_address')
      .eq('id', tokenId)
      .single()
    
    if (!data) {
      throw new Error('Token not found')
    }
    
    // Generate new token
    return this.generateRefreshToken(
      data.user_id,
      data.device_info,
      data.ip_address
    )
  }
  
  private static async revokeRefreshToken(token: string): Promise<void> {
    const hashedToken = await this.hashToken(token)
    
    await supabase
      .from('refresh_tokens')
      .update({ is_revoked: true })
      .eq('token', hashedToken)
  }
  
  private static async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  }
  
  private static async verifyMFACode(email: string, code: string): Promise<boolean> {
    try {
      // Get user MFA data
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      
      if (!userData) {
        logSecurityEvent('mfa_verification_failed', { reason: 'user_not_found', email }, undefined)
        return false
      }
      
      const { data: mfaData } = await supabase
        .from('user_mfa')
        .select('secret_encrypted, backup_codes_encrypted')
        .eq('user_id', userData.id)
        .eq('enabled', true)
        .single()
      
      if (!mfaData) {
        logSecurityEvent('mfa_verification_failed', { reason: 'mfa_not_enabled', userId: userData.id }, userData.id)
        return false
      }
      
      // Verify TOTP code
      const secret = await this.decryptData(mfaData.secret_encrypted)
      const isValidTOTP = TOTPService.verifyTOTP(code, { secret })
      
      if (isValidTOTP) {
        logSecurityEvent('mfa_verification_success', { method: 'totp', userId: userData.id }, userData.id)
        return true
      }
      
      // Check backup codes
      const backupCodes = await Promise.all(
        mfaData.backup_codes_encrypted.map((encryptedCode: string) => this.decryptData(encryptedCode))
      )
      
      const isValidBackupCode = backupCodes.includes(code)
      
      if (isValidBackupCode) {
        logSecurityEvent('mfa_verification_success', { method: 'backup_code', userId: userData.id }, userData.id)
        
        // Remove used backup code
        const remainingCodes = backupCodes.filter(c => c !== code)
        const encryptedRemainingCodes = await Promise.all(
          remainingCodes.map(c => this.encryptData(c))
        )
        
        await supabase
          .from('user_mfa')
          .update({ backup_codes_encrypted: encryptedRemainingCodes })
          .eq('user_id', userData.id)
        
        return true
      }
      
      logSecurityEvent('mfa_verification_failed', { reason: 'invalid_code', userId: userData.id }, userData.id)
      return false
      
    } catch (error) {
      logError(error as Error, 'EnterpriseAuth.verifyMFACode')
      return false
    }
  }
  

  
  private static async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
  
  private static async encryptData(data: string): Promise<string> {
    // Implementation would use proper encryption
    // For now, return base64 encoded data
    return Buffer.from(data).toString('base64')
  }
  
  private static async decryptData(encryptedData: string): Promise<string> {
    // Implementation would use proper decryption
    // For now, decode base64
    return Buffer.from(encryptedData, 'base64').toString()
  }
}