/**
 * TOTP (Time-based One-Time Password) Implementation
 * 
 * Implements RFC 6238 TOTP algorithm for multi-factor authentication
 * without external dependencies.
 */

import crypto from 'crypto'

export interface TOTPConfig {
  secret: string
  window?: number // Time window in seconds (default: 30)
  digits?: number // Number of digits (default: 6)
  algorithm?: string // Hash algorithm (default: sha1)
}

/**
 * TOTP Service for multi-factor authentication
 */
export class TOTPService {
  private static readonly DEFAULT_WINDOW = 30 // 30 seconds
  private static readonly DEFAULT_DIGITS = 6
  private static readonly DEFAULT_ALGORITHM = 'sha1'
  
  /**
   * Generate TOTP code for current time
   */
  static generateTOTP(config: TOTPConfig): string {
    const {
      secret,
      window = this.DEFAULT_WINDOW,
      digits = this.DEFAULT_DIGITS,
      algorithm = this.DEFAULT_ALGORITHM
    } = config
    
    const timeStep = Math.floor(Date.now() / 1000 / window)
    return this.generateHOTP(secret, timeStep, digits, algorithm)
  }
  
  /**
   * Verify TOTP code
   */
  static verifyTOTP(
    code: string,
    config: TOTPConfig,
    tolerance: number = 1
  ): boolean {
    const {
      secret,
      window = this.DEFAULT_WINDOW,
      digits = this.DEFAULT_DIGITS,
      algorithm = this.DEFAULT_ALGORITHM
    } = config
    
    const currentTimeStep = Math.floor(Date.now() / 1000 / window)
    
    // Check current time step and tolerance window
    for (let i = -tolerance; i <= tolerance; i++) {
      const timeStep = currentTimeStep + i
      const expectedCode = this.generateHOTP(secret, timeStep, digits, algorithm)
      
      if (this.constantTimeCompare(code, expectedCode)) {
        return true
      }
    }
    
    return false
  }
  
  /**
   * Generate QR code URL for TOTP setup
   */
  static generateQRCodeURL(
    secret: string,
    accountName: string,
    issuer: string = 'OnPar',
    digits: number = this.DEFAULT_DIGITS,
    period: number = this.DEFAULT_WINDOW
  ): string {
    const params = new URLSearchParams({
      secret: secret,
      issuer: issuer,
      algorithm: 'SHA1',
      digits: digits.toString(),
      period: period.toString()
    })
    
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params.toString()}`
  }
  
  /**
   * Generate backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    
    for (let i = 0; i < count; i++) {
      // Generate 8-digit backup code
      const code = crypto.randomBytes(4).readUInt32BE(0).toString().padStart(8, '0').slice(0, 8)
      codes.push(code)
    }
    
    return codes
  }
  
  /**
   * Generate HOTP (HMAC-based One-Time Password)
   */
  private static generateHOTP(
    secret: string,
    counter: number,
    digits: number,
    algorithm: string
  ): string {
    // Convert secret from base32 to buffer
    const secretBuffer = this.base32Decode(secret)
    
    // Convert counter to 8-byte buffer (big-endian)
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
    counterBuffer.writeUInt32BE(counter & 0xffffffff, 4)
    
    // Generate HMAC
    const hmac = crypto.createHmac(algorithm, secretBuffer)
    hmac.update(counterBuffer)
    const hash = hmac.digest()
    
    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % Math.pow(10, digits)
    
    return code.toString().padStart(digits, '0')
  }
  
  /**
   * Base32 decode (simplified implementation)
   */
  private static base32Decode(encoded: string): Buffer {
    // Remove padding and convert to uppercase
    const cleanEncoded = encoded.replace(/=/g, '').toUpperCase()
    
    // Base32 alphabet
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    
    let bits = ''
    for (const char of cleanEncoded) {
      const index = alphabet.indexOf(char)
      if (index === -1) {
        throw new Error('Invalid base32 character')
      }
      bits += index.toString(2).padStart(5, '0')
    }
    
    // Convert bits to bytes
    const bytes: number[] = []
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8)
      if (byte.length === 8) {
        bytes.push(parseInt(byte, 2))
      }
    }
    
    return Buffer.from(bytes)
  }
  
  /**
   * Base32 encode
   */
  static base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    
    // Convert buffer to bits
    for (const byte of buffer) {
      bits += byte.toString(2).padStart(8, '0')
    }
    
    // Pad to multiple of 5
    while (bits.length % 5 !== 0) {
      bits += '0'
    }
    
    // Convert to base32
    let result = ''
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.slice(i, i + 5)
      result += alphabet[parseInt(chunk, 2)]
    }
    
    // Add padding
    while (result.length % 8 !== 0) {
      result += '='
    }
    
    return result
  }
  
  /**
   * Generate random secret for TOTP
   */
  static generateSecret(length: number = 32): string {
    const buffer = crypto.randomBytes(length)
    return this.base32Encode(buffer)
  }
  
  /**
   * Constant time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    
    return result === 0
  }
}