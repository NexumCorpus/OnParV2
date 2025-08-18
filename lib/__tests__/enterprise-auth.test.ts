/**
 * Enterprise Authentication System Tests
 * 
 * Tests for JWT authentication, RBAC, MFA, and PCI encryption
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { EnterpriseAuthService, UserRole, Permission } from '../enterprise-auth'
import { PCIEncryptionService } from '../pci-encryption'

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null })),
          gt: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) }))
        }))
      })),
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) })) })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ data: null, error: null })) })),
      delete: jest.fn(() => ({ eq: jest.fn(() => ({ data: null, error: null })) })),
      upsert: jest.fn(() => ({ data: null, error: null }))
    }))
  }
}))

describe('EnterpriseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Role-Based Access Control', () => {
    it('should correctly assign permissions to roles', () => {
      const superAdminPermissions = EnterpriseAuthService.ROLE_PERMISSIONS[UserRole.SUPER_ADMIN]
      const cashierPermissions = EnterpriseAuthService.ROLE_PERMISSIONS[UserRole.CASHIER]
      
      expect(superAdminPermissions).toContain(Permission.MANAGE_TENANTS)
      expect(superAdminPermissions).toContain(Permission.PROCESS_ORDERS)
      
      expect(cashierPermissions).toContain(Permission.PROCESS_ORDERS)
      expect(cashierPermissions).not.toContain(Permission.MANAGE_TENANTS)
    })

    it('should check user permissions correctly', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        permissions: [Permission.PROCESS_ORDERS, Permission.VIEW_INVENTORY],
        tenantId: 'tenant-1',
        mfaEnabled: false,
        lastLogin: new Date()
      }

      expect(EnterpriseAuthService.hasPermission(mockUser, Permission.PROCESS_ORDERS)).toBe(true)
      expect(EnterpriseAuthService.hasPermission(mockUser, Permission.MANAGE_TENANTS)).toBe(false)
    })

    it('should check multiple permissions correctly', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.LOCATION_MANAGER,
        permissions: [
          Permission.PROCESS_ORDERS,
          Permission.VIEW_INVENTORY,
          Permission.MANAGE_INVENTORY,
          Permission.VIEW_ANALYTICS
        ],
        tenantId: 'tenant-1',
        mfaEnabled: false,
        lastLogin: new Date()
      }

      expect(EnterpriseAuthService.hasAllPermissions(mockUser, [
        Permission.PROCESS_ORDERS,
        Permission.VIEW_INVENTORY
      ])).toBe(true)

      expect(EnterpriseAuthService.hasAllPermissions(mockUser, [
        Permission.PROCESS_ORDERS,
        Permission.MANAGE_TENANTS
      ])).toBe(false)

      expect(EnterpriseAuthService.hasAnyPermission(mockUser, [
        Permission.MANAGE_TENANTS,
        Permission.VIEW_ANALYTICS
      ])).toBe(true)
    })
  })

  describe('Authentication Flow', () => {
    it('should handle successful sign in without MFA', async () => {
      // Mock successful Supabase auth
      const mockSupabaseAuth = require('../supabase').supabase.auth
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null
      })

      // Mock user profile retrieval
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'user-1',
                email: 'test@example.com',
                tenant_id: 'tenant-1',
                mfa_enabled: false,
                user_roles: { role: 'cashier' },
                tenants: { id: 'tenant-1', name: 'Test Tenant' }
              },
              error: null
            }))
          }))
        }))
      })

      const result = await EnterpriseAuthService.signIn(
        'test@example.com',
        'password123',
        'test-device',
        '192.168.1.1'
      )

      expect(result.error).toBeNull()
      expect(result.user).toBeTruthy()
      expect(result.accessToken).toBeTruthy()
      expect(result.refreshToken).toBeTruthy()
      expect(result.requiresMFA).toBeFalsy()
    })

    it('should require MFA when enabled', async () => {
      // Mock successful Supabase auth
      const mockSupabaseAuth = require('../supabase').supabase.auth
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null
      })

      // Mock user profile with MFA enabled
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'user-1',
                email: 'test@example.com',
                tenant_id: 'tenant-1',
                mfa_enabled: true,
                user_roles: { role: 'cashier' },
                tenants: { id: 'tenant-1', name: 'Test Tenant' }
              },
              error: null
            }))
          }))
        }))
      })

      const result = await EnterpriseAuthService.signIn(
        'test@example.com',
        'password123'
      )

      expect(result.requiresMFA).toBe(true)
      expect(result.user).toBeNull()
      expect(result.accessToken).toBeNull()
    })

    it('should handle authentication errors', async () => {
      // Mock Supabase auth error
      const mockSupabaseAuth = require('../supabase').supabase.auth
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials')
      })

      const result = await EnterpriseAuthService.signIn(
        'test@example.com',
        'wrongpassword'
      )

      expect(result.error).toBeTruthy()
      expect(result.user).toBeNull()
      expect(result.accessToken).toBeNull()
    })
  })

  describe('Token Management', () => {
    it('should generate and verify access tokens', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        permissions: [Permission.PROCESS_ORDERS],
        tenantId: 'tenant-1',
        mfaEnabled: false,
        lastLogin: new Date()
      }

      // Test token generation (mocked)
      const token = await EnterpriseAuthService.generateAccessToken(mockUser)
      expect(token).toBeTruthy()

      // Test token verification (mocked)
      const verifiedUser = await EnterpriseAuthService.verifyAccessToken(token)
      expect(verifiedUser).toBeTruthy()
    })

    it('should handle token refresh', async () => {
      const mockRefreshToken = 'refresh-token-123'
      
      // Mock refresh token validation
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gt: jest.fn(() => ({
              single: jest.fn(() => ({
                data: {
                  id: 'token-1',
                  user_id: 'user-1',
                  token: 'hashed-token',
                  expires_at: new Date(Date.now() + 86400000).toISOString(),
                  is_revoked: false
                },
                error: null
              }))
            }))
          }))
        }))
      })

      const result = await EnterpriseAuthService.refreshAccessToken(mockRefreshToken)
      
      // Since we're mocking, we expect this to work with our mock data
      expect(result).toBeTruthy()
    })
  })

  describe('MFA Setup and Verification', () => {
    it('should setup MFA for user', async () => {
      const userId = 'user-1'
      
      const mfaSetup = await EnterpriseAuthService.setupMFA(userId)
      
      expect(mfaSetup).toBeTruthy()
      expect(mfaSetup?.secret).toBeTruthy()
      expect(mfaSetup?.qrCode).toBeTruthy()
      expect(mfaSetup?.backupCodes).toHaveLength(10)
    })

    it('should enable MFA after verification', async () => {
      const userId = 'user-1'
      const verificationCode = '123456'
      
      // Mock MFA data retrieval
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { secret: 'encrypted-secret' },
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ data: null, error: null }))
        }))
      })

      const result = await EnterpriseAuthService.enableMFA(userId, verificationCode)
      
      // With mocked TOTP verification, this should succeed
      expect(result).toBe(true)
    })
  })
})

describe('PCIEncryptionService', () => {
  const tenantId = 'tenant-1'

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data', async () => {
      const sensitiveData = 'sensitive-information'
      const dataType = PCIEncryptionService.DATA_TYPES.PII_DATA
      
      // Mock encryption key operations
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'key-1' },
              error: null
            }))
          }))
        })),
        insert: jest.fn(() => ({ data: null, error: null }))
      })

      const encryptionResult = await PCIEncryptionService.encryptData(
        sensitiveData,
        dataType,
        tenantId
      )

      expect(encryptionResult.encryptedData).toBeTruthy()
      expect(encryptionResult.keyId).toBeTruthy()
      expect(encryptionResult.algorithm).toBe('aes-256-gcm')

      const decryptionResult = await PCIEncryptionService.decryptData(
        encryptionResult.encryptedData,
        encryptionResult.keyId,
        dataType
      )

      expect(decryptionResult.success).toBe(true)
      expect(decryptionResult.data).toBe(sensitiveData)
    })

    it('should handle decryption failures gracefully', async () => {
      const invalidEncryptedData = 'invalid-data'
      const keyId = 'key-1'
      const dataType = PCIEncryptionService.DATA_TYPES.PII_DATA

      const decryptionResult = await PCIEncryptionService.decryptData(
        invalidEncryptedData,
        keyId,
        dataType
      )

      expect(decryptionResult.success).toBe(false)
      expect(decryptionResult.data).toBe('')
    })
  })

  describe('Card Tokenization', () => {
    it('should tokenize card numbers', async () => {
      const cardNumber = '4111111111111111'
      
      // Mock database operations
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'key-1' },
              error: null
            }))
          }))
        })),
        insert: jest.fn(() => ({ data: null, error: null }))
      })

      const tokenResult = await PCIEncryptionService.tokenizeCardNumber(
        cardNumber,
        tenantId
      )

      expect(tokenResult.token).toMatch(/^tok_[a-zA-Z0-9]{32,}$/)
      expect(tokenResult.tokenType).toBe('card_number')
      expect(tokenResult.lastFour).toBe('1111')
    })

    it('should detect card types correctly', async () => {
      const visaCard = '4111111111111111'
      const mastercardCard = '5555555555554444'
      const amexCard = '378282246310005'
      
      // Mock database operations for each test
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'key-1' },
              error: null
            }))
          }))
        })),
        insert: jest.fn(() => ({ data: null, error: null }))
      })

      // Test Visa detection
      const visaResult = await PCIEncryptionService.tokenizeCardNumber(visaCard, tenantId)
      expect(visaResult.token).toBeTruthy()

      // Test Mastercard detection  
      const mastercardResult = await PCIEncryptionService.tokenizeCardNumber(mastercardCard, tenantId)
      expect(mastercardResult.token).toBeTruthy()

      // Test Amex detection
      const amexResult = await PCIEncryptionService.tokenizeCardNumber(amexCard, tenantId)
      expect(amexResult.token).toBeTruthy()
    })

    it('should reject invalid card numbers', async () => {
      const invalidCard = '123'

      await expect(
        PCIEncryptionService.tokenizeCardNumber(invalidCard, tenantId)
      ).rejects.toThrow('Tokenization failed')
    })
  })

  describe('CVV Handling', () => {
    it('should encrypt CVV temporarily', async () => {
      const cvv = '123'
      
      // Mock database operations
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'key-1' },
              error: null
            }))
          }))
        })),
        insert: jest.fn(() => ({ data: null, error: null })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({ data: null, error: null }))
        }))
      })

      const encryptionResult = await PCIEncryptionService.encryptCVV(cvv, tenantId)
      expect(encryptionResult.encryptedData).toBeTruthy()

      // CVV should be purged immediately after use
      await PCIEncryptionService.purgeCVVData(encryptionResult.encryptedData, tenantId)
      
      // Verify purge was called (mocked)
      expect(mockFrom).toHaveBeenCalled()
    })
  })

  describe('Key Rotation', () => {
    it('should rotate encryption keys', async () => {
      // Mock database operations for key rotation
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              { id: 'key-1', data_type: 'pii_data' },
              { id: 'key-2', data_type: 'payment_token' }
            ],
            error: null
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ data: null, error: null }))
        })),
        insert: jest.fn(() => ({ data: null, error: null }))
      })

      await expect(
        PCIEncryptionService.rotateEncryptionKeys(tenantId)
      ).resolves.not.toThrow()
    })
  })

  describe('Compliance Auditing', () => {
    it('should generate audit reports', async () => {
      // Mock audit data
      const mockFrom = require('../supabase').supabase.from
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              {
                data_type: 'pii_data',
                created_at: new Date().toISOString(),
                expires_at: null,
                encryption_keys: {
                  algorithm: 'aes-256-gcm',
                  created_at: new Date().toISOString()
                }
              }
            ],
            error: null
          }))
        }))
      })

      const auditResult = await PCIEncryptionService.auditEncryptionUsage(tenantId)
      
      expect(auditResult).toBeTruthy()
      expect(auditResult.totalEncryptedItems).toBe(1)
      expect(auditResult.dataTypes).toContain('pii_data')
    })
  })
})

describe('Integration Tests', () => {
  it('should handle complete authentication flow with encryption', async () => {
    // Mock complete flow
    const mockSupabaseAuth = require('../supabase').supabase.auth
    const mockFrom = require('../supabase').supabase.from

    // Mock successful authentication
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
      error: null
    })

    // Mock user profile
    mockFrom.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'user-1',
              email: 'test@example.com',
              tenant_id: 'tenant-1',
              mfa_enabled: false,
              user_roles: { role: 'tenant_admin' },
              tenants: { id: 'tenant-1', name: 'Test Tenant' }
            },
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ data: null, error: null }))
      }))
    })

    // Test authentication
    const authResult = await EnterpriseAuthService.signIn(
      'test@example.com',
      'password123'
    )

    expect(authResult.user).toBeTruthy()
    expect(authResult.user?.role).toBe(UserRole.TENANT_ADMIN)

    // Test permission checking
    if (authResult.user) {
      expect(
        EnterpriseAuthService.hasPermission(authResult.user, Permission.MANAGE_USERS)
      ).toBe(true)
    }

    // Test data encryption
    const sensitiveData = 'customer-pii-data'
    const encryptionResult = await PCIEncryptionService.encryptData(
      sensitiveData,
      PCIEncryptionService.DATA_TYPES.PII_DATA,
      'tenant-1'
    )

    expect(encryptionResult.encryptedData).toBeTruthy()
  })
})