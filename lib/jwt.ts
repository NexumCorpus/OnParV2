/**
 * JWT Implementation for Enterprise Authentication
 * 
 * Implements JWT signing and verification using Web Crypto API
 * for enterprise-grade security without external dependencies.
 */

import crypto from 'crypto'

export interface JWTPayload {
  sub: string // Subject (user ID)
  email: string
  role: string
  permissions: string[]
  tenantId: string
  organizationId?: string
  locationId?: string
  iat: number // Issued at
  exp: number // Expires at
  iss?: string // Issuer
  aud?: string // Audience
}

export interface JWTHeader {
  alg: string
  typ: string
}

/**
 * JWT Service for enterprise authentication
 */
export class JWTService {
  private static readonly ALGORITHM = 'HS256'
  private static readonly SECRET_KEY = process.env.JWT_SECRET_KEY || 'onpar-enterprise-jwt-secret-key-change-in-production'
  
  /**
   * Sign a JWT token
   */
  static async signJWT(payload: Partial<JWTPayload>): Promise<string> {
    try {
      const header: JWTHeader = {
        alg: this.ALGORITHM,
        typ: 'JWT'
      }
      
      // Encode header
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
      
      // Encode payload
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload))
      
      // Create signature
      const data = `${encodedHeader}.${encodedPayload}`
      const signature = this.createSignature(data)
      
      return `${data}.${signature}`
      
    } catch (error) {
      throw new Error('Failed to sign JWT token')
    }
  }
  
  /**
   * Verify and decode a JWT token
   */
  static async verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }
      
      const [encodedHeader, encodedPayload, signature] = parts
      
      // Verify signature
      const data = `${encodedHeader}.${encodedPayload}`
      const expectedSignature = this.createSignature(data)
      
      if (signature !== expectedSignature) {
        return null
      }
      
      // Decode and validate payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTPayload
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }
      
      return payload
      
    } catch (error) {
      return null
    }
  }
  
  /**
   * Create a signature for JWT
   */
  private static createSignature(data: string): string {
    const hmac = crypto.createHmac('sha256', this.SECRET_KEY)
    hmac.update(data)
    return this.base64UrlEncode(hmac.digest('base64'))
  }
  
  /**
   * Base64 URL encode
   */
  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
  
  /**
   * Base64 URL decode
   */
  private static base64UrlDecode(str: string): string {
    // Add padding if needed
    const padding = '='.repeat((4 - (str.length % 4)) % 4)
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding
    
    return Buffer.from(base64, 'base64').toString('utf8')
  }
  
  /**
   * Extract payload without verification (for debugging)
   */
  static decodePayload(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }
      
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JWTPayload
      return payload
      
    } catch (error) {
      return null
    }
  }
  
  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodePayload(token)
    if (!payload || !payload.exp) {
      return true
    }
    
    return payload.exp < Math.floor(Date.now() / 1000)
  }
  
  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    const payload = this.decodePayload(token)
    if (!payload || !payload.exp) {
      return null
    }
    
    return new Date(payload.exp * 1000)
  }
}