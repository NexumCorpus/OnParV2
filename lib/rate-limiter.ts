// Rate limiting utility for API endpoints
import { ExpiringStorage } from './performance'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private config: RateLimitConfig
  private prefix: string

  constructor(config: RateLimitConfig, prefix = 'rate_limit') {
    this.config = config
    this.prefix = prefix
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `${this.prefix}:${identifier}`

    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    // Get current request count from storage
    const stored = ExpiringStorage.get<{count: number, firstRequest: number}>(key)
    
    let count = 0
    let firstRequest = now

    if (stored && stored.firstRequest > windowStart) {
      // Within the current window
      count = stored.count
      firstRequest = stored.firstRequest
    }

    const allowed = count < this.config.maxRequests
    const newCount = allowed ? count + 1 : count

    if (allowed) {
      // Update the count
      const expirationMinutes = Math.ceil(this.config.windowMs / (1000 * 60))
      ExpiringStorage.set(key, {
        count: newCount,
        firstRequest
      }, expirationMinutes)
    }

    const resetTime = firstRequest + this.config.windowMs
    const remaining = Math.max(0, this.config.maxRequests - newCount)
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - now) / 1000)

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 auth attempts per 15 minutes
})

export const csvImportRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3 // 3 CSV imports per hour
})

export const webhookRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50 // 50 webhook calls per 5 minutes
})