/**
 * PCI DSS Compliant Encryption Service
 * 
 * Implements encryption and tokenization for payment data and sensitive information
 * in compliance with PCI DSS requirements.
 * 
 * Requirements: 9.4
 */

import crypto from 'crypto'
import { supabase } from './supabase'
import { logError, logUserAction } from './error-logging'
import { generateSecureToken } from './security'

export interface EncryptionResult {
  encryptedData: string
  keyId: string
  algorithm: string
}

export interface TokenizationResult {
  token: string
  tokenType: string
  lastFour?: string
}

export interface DecryptionResult {
  data: string
  success: boolean
}

/**
 * PCI DSS Compliant Encryption Service
 */
export class PCIEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 16 // 128 bits
  private static readonly TAG_LENGTH = 16 // 128 bits
  
  // Data classification levels
  public static readonly DATA_TYPES = {
    PAYMENT_TOKEN: 'payment_token',
    CARD_NUMBER: 'card_number',
    CVV: 'cvv',
    PII_DATA: 'pii_data',
    SENSITIVE_CONFIG: 'sensitive_config',
    MFA_SECRET: 'mfa_secret',
    BACKUP_CODE: 'backup_code'
  } as const
  
  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static async encryptData(
    data: string,
    dataType: string,
    tenantId: string
  ): Promise<EncryptionResult> {
    try {
      // Generate or retrieve encryption key
      const keyId = await this.getOrCreateEncryptionKey(tenantId, dataType)
      const encryptionKey = await this.getEncryptionKey(keyId)
      
      // Generate random IV
      const iv = crypto.randomBytes(this.IV_LENGTH)
      
      // Create cipher
      const cipher = crypto.createCipher(this.ALGORITHM, encryptionKey)
      cipher.setAAD(Buffer.from(dataType)) // Additional authenticated data
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      // Combine IV + encrypted data + tag
      const encryptedData = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'hex'),
        tag
      ]).toString('base64')
      
      // Store encrypted data reference
      await this.storeEncryptedDataReference(
        encryptedData,
        dataType,
        keyId,
        tenantId
      )
      
      logUserAction('data_encrypted', { dataType, keyId }, undefined, tenantId)
      
      return {
        encryptedData,
        keyId,
        algorithm: this.ALGORITHM
      }
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.encryptData', undefined, undefined, tenantId)
      throw new Error('Encryption failed')
    }
  }
  
  /**
   * Decrypt sensitive data
   */
  static async decryptData(
    encryptedData: string,
    keyId: string,
    dataType: string
  ): Promise<DecryptionResult> {
    try {
      // Get encryption key
      const encryptionKey = await this.getEncryptionKey(keyId)
      
      // Parse encrypted data
      const buffer = Buffer.from(encryptedData, 'base64')
      const iv = buffer.subarray(0, this.IV_LENGTH)
      const tag = buffer.subarray(-this.TAG_LENGTH)
      const encrypted = buffer.subarray(this.IV_LENGTH, -this.TAG_LENGTH)
      
      // Create decipher
      const decipher = crypto.createDecipher(this.ALGORITHM, encryptionKey)
      decipher.setAuthTag(tag)
      decipher.setAAD(Buffer.from(dataType))
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return {
        data: decrypted,
        success: true
      }
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.decryptData')
      return {
        data: '',
        success: false
      }
    }
  }
  
  /**
   * Tokenize payment card number (PCI DSS requirement)
   */
  static async tokenizeCardNumber(
    cardNumber: string,
    tenantId: string
  ): Promise<TokenizationResult> {
    try {
      // Validate card number format
      const cleanCardNumber = cardNumber.replace(/\D/g, '')
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        throw new Error('Invalid card number format')
      }
      
      // Generate secure token
      const token = `tok_${generateSecureToken(32)}`
      
      // Encrypt the actual card number
      const encryptionResult = await this.encryptData(
        cleanCardNumber,
        this.DATA_TYPES.CARD_NUMBER,
        tenantId
      )
      
      // Store token mapping
      await supabase
        .from('payment_tokens')
        .insert({
          token,
          encrypted_card_data: encryptionResult.encryptedData,
          key_id: encryptionResult.keyId,
          last_four: cleanCardNumber.slice(-4),
          card_type: this.detectCardType(cleanCardNumber),
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })
      
      logUserAction('card_tokenized', { 
        token, 
        lastFour: cleanCardNumber.slice(-4) 
      }, undefined, tenantId)
      
      return {
        token,
        tokenType: 'card_number',
        lastFour: cleanCardNumber.slice(-4)
      }
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.tokenizeCardNumber', undefined, undefined, tenantId)
      throw new Error('Tokenization failed')
    }
  }
  
  /**
   * Detokenize payment card number
   */
  static async detokenizeCardNumber(
    token: string,
    tenantId: string
  ): Promise<string | null> {
    try {
      // Get token data
      const { data: tokenData, error } = await supabase
        .from('payment_tokens')
        .select('encrypted_card_data, key_id')
        .eq('token', token)
        .eq('tenant_id', tenantId)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (error || !tokenData) {
        return null
      }
      
      // Decrypt card number
      const decryptionResult = await this.decryptData(
        tokenData.encrypted_card_data,
        tokenData.key_id,
        this.DATA_TYPES.CARD_NUMBER
      )
      
      if (!decryptionResult.success) {
        return null
      }
      
      logUserAction('card_detokenized', { token }, undefined, tenantId)
      
      return decryptionResult.data
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.detokenizeCardNumber', undefined, undefined, tenantId)
      return null
    }
  }
  
  /**
   * Encrypt CVV (should never be stored long-term per PCI DSS)
   */
  static async encryptCVV(
    cvv: string,
    tenantId: string
  ): Promise<EncryptionResult> {
    // CVV should only be encrypted temporarily for processing
    // and must be purged immediately after authorization
    return this.encryptData(cvv, this.DATA_TYPES.CVV, tenantId)
  }
  
  /**
   * Securely delete CVV data
   */
  static async purgeCVVData(encryptedCVV: string, tenantId: string): Promise<void> {
    try {
      // Remove from encrypted_data table
      await supabase
        .from('encrypted_data')
        .delete()
        .eq('encrypted_value', encryptedCVV)
        .eq('tenant_id', tenantId)
        .eq('data_type', this.DATA_TYPES.CVV)
      
      logUserAction('cvv_purged', {}, undefined, tenantId)
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.purgeCVVData', undefined, undefined, tenantId)
    }
  }
  
  /**
   * Encrypt PII data (names, addresses, etc.)
   */
  static async encryptPII(
    piiData: string,
    tenantId: string
  ): Promise<EncryptionResult> {
    return this.encryptData(piiData, this.DATA_TYPES.PII_DATA, tenantId)
  }
  
  /**
   * Key rotation for compliance
   */
  static async rotateEncryptionKeys(tenantId: string): Promise<void> {
    try {
      // Get all active keys for tenant
      const { data: keys, error } = await supabase
        .from('encryption_keys')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
      
      if (error) {
        throw error
      }
      
      for (const key of keys || []) {
        // Generate new key
        const newKeyId = await this.generateEncryptionKey(tenantId, key.data_type)
        
        // Re-encrypt all data with new key
        await this.reencryptDataWithNewKey(key.id, newKeyId, tenantId)
        
        // Deactivate old key
        await supabase
          .from('encryption_keys')
          .update({ 
            is_active: false,
            rotated_at: new Date().toISOString()
          })
          .eq('id', key.id)
      }
      
      logUserAction('keys_rotated', { tenantId }, undefined, tenantId)
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.rotateEncryptionKeys', undefined, undefined, tenantId)
      throw new Error('Key rotation failed')
    }
  }
  
  /**
   * Audit encryption usage
   */
  static async auditEncryptionUsage(tenantId: string): Promise<any> {
    try {
      const { data: auditData, error } = await supabase
        .from('encrypted_data')
        .select(`
          data_type,
          created_at,
          expires_at,
          encryption_keys!inner(algorithm, created_at)
        `)
        .eq('tenant_id', tenantId)
      
      if (error) {
        throw error
      }
      
      return {
        totalEncryptedItems: auditData?.length || 0,
        dataTypes: [...new Set(auditData?.map(item => item.data_type) || [])],
        oldestData: auditData?.reduce((oldest, item) => 
          new Date(item.created_at) < new Date(oldest.created_at) ? item : oldest
        ),
        expiringData: auditData?.filter(item => 
          item.expires_at && new Date(item.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        )
      }
      
    } catch (error) {
      logError(error as Error, 'PCIEncryption.auditEncryptionUsage', undefined, undefined, tenantId)
      return null
    }
  }
  
  // Private helper methods
  
  private static async getOrCreateEncryptionKey(
    tenantId: string,
    dataType: string
  ): Promise<string> {
    // Check for existing active key
    const { data: existingKey } = await supabase
      .from('encryption_keys')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('data_type', dataType)
      .eq('is_active', true)
      .single()
    
    if (existingKey) {
      return existingKey.id
    }
    
    // Generate new key
    return this.generateEncryptionKey(tenantId, dataType)
  }
  
  private static async generateEncryptionKey(
    tenantId: string,
    dataType: string
  ): Promise<string> {
    const keyId = crypto.randomUUID()
    const encryptionKey = crypto.randomBytes(this.KEY_LENGTH)
    
    // Store key securely (in production, use HSM or key management service)
    await supabase
      .from('encryption_keys')
      .insert({
        id: keyId,
        tenant_id: tenantId,
        data_type: dataType,
        key_material: encryptionKey.toString('base64'),
        algorithm: this.ALGORITHM,
        is_active: true,
        created_at: new Date().toISOString()
      })
    
    return keyId
  }
  
  private static async getEncryptionKey(keyId: string): Promise<Buffer> {
    const { data: keyData, error } = await supabase
      .from('encryption_keys')
      .select('key_material')
      .eq('id', keyId)
      .eq('is_active', true)
      .single()
    
    if (error || !keyData) {
      throw new Error('Encryption key not found')
    }
    
    return Buffer.from(keyData.key_material, 'base64')
  }
  
  private static async storeEncryptedDataReference(
    encryptedData: string,
    dataType: string,
    keyId: string,
    tenantId: string
  ): Promise<void> {
    await supabase
      .from('encrypted_data')
      .insert({
        data_type: dataType,
        encrypted_value: encryptedData,
        key_id: keyId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      })
  }
  
  private static async reencryptDataWithNewKey(
    oldKeyId: string,
    newKeyId: string,
    tenantId: string
  ): Promise<void> {
    // Get all data encrypted with old key
    const { data: encryptedItems } = await supabase
      .from('encrypted_data')
      .select('*')
      .eq('key_id', oldKeyId)
      .eq('tenant_id', tenantId)
    
    for (const item of encryptedItems || []) {
      // Decrypt with old key
      const decrypted = await this.decryptData(
        item.encrypted_value,
        oldKeyId,
        item.data_type
      )
      
      if (decrypted.success) {
        // Encrypt with new key
        const reencrypted = await this.encryptData(
          decrypted.data,
          item.data_type,
          tenantId
        )
        
        // Update database
        await supabase
          .from('encrypted_data')
          .update({
            encrypted_value: reencrypted.encryptedData,
            key_id: newKeyId
          })
          .eq('id', item.id)
      }
    }
  }
  
  private static detectCardType(cardNumber: string): string {
    const firstDigit = cardNumber[0]
    const firstTwoDigits = cardNumber.substring(0, 2)
    const firstFourDigits = cardNumber.substring(0, 4)
    
    if (firstDigit === '4') {
      return 'visa'
    } else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) || 
               (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)) {
      return 'mastercard'
    } else if (['34', '37'].includes(firstTwoDigits)) {
      return 'amex'
    } else if (firstFourDigits === '6011' || firstTwoDigits === '65') {
      return 'discover'
    } else {
      return 'unknown'
    }
  }
}