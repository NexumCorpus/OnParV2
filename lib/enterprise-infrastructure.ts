/**
 * Enterprise Infrastructure Orchestration
 * 
 * Coordinates all enterprise database components:
 * - PostgreSQL primary database with multi-tenancy
 * - ClickHouse analytics database
 * - Redis caching layer
 * - Migration system
 * - Health monitoring and metrics
 */

import { enterpriseDB, analyticsDB, cacheDB, initializeEnterpriseDatabase } from './enterprise-database'
import { migrationSystem, initializeMigrationSystem } from './migration-system'
import { redisCache, cacheService, initializeRedisCache } from './redis-cache'
import { clickhouseAnalytics, analyticsService, initializeClickHouseAnalytics } from './clickhouse-analytics'

// Infrastructure health status
export interface InfrastructureHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  components: {
    primary: ComponentHealth
    analytics: ComponentHealth
    cache: ComponentHealth
    migrations: ComponentHealth
  }
  metrics: InfrastructureMetrics
  lastChecked: Date
}

// Individual component health
export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'offline'
  latency: number
  uptime: number
  errorRate: number
  lastError?: string
  details?: Record<string, any>
}

// Infrastructure metrics
export interface InfrastructureMetrics {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  cacheHitRatio: number
  activeConnections: number
  memoryUsage: number
  diskUsage: number
}

// Infrastructure configuration
export interface InfrastructureConfig {
  enableAnalytics: boolean
  enableCache: boolean
  enableMigrations: boolean
  healthCheckInterval: number
  metricsRetention: number
  alertThresholds: {
    responseTime: number
    errorRate: number
    memoryUsage: number
    diskUsage: number
  }
}

export class EnterpriseInfrastructure {
  private config: InfrastructureConfig
  private healthCheckTimer: NodeJS.Timeout | null = null
  private startTime: Date = new Date()
  private metrics: InfrastructureMetrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRatio: 0,
    activeConnections: 0,
    memoryUsage: 0,
    diskUsage: 0
  }

  constructor(config: Partial<InfrastructureConfig> = {}) {
    this.config = {
      enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
      enableCache: process.env.ENABLE_CACHE !== 'false',
      enableMigrations: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsRetention: 86400000, // 24 hours
      alertThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        diskUsage: 0.9 // 90%
      },
      ...config
    }
  }

  // Initialize all infrastructure components
  async initialize(): Promise<{
    success: boolean
    components: Record<string, boolean>
    errors: string[]
  }> {
    console.log('Initializing enterprise infrastructure...')
    
    const results: Record<string, boolean> = {}
    const errors: string[] = []

    try {
      // Initialize primary database (always required)
      console.log('Initializing primary database...')
      const primaryResult = await initializeEnterpriseDatabase()
      results.primary = primaryResult.primary
      
      if (!primaryResult.primary) {
        errors.push('Failed to initialize primary database')
      }

      // Initialize migration system
      if (this.config.enableMigrations) {
        console.log('Initializing migration system...')
        try {
          await initializeMigrationSystem()
          results.migrations = true
        } catch (error) {
          results.migrations = false
          errors.push(`Migration system initialization failed: ${(error as Error).message}`)
        }
      }

      // Initialize cache (optional)
      if (this.config.enableCache) {
        console.log('Initializing Redis cache...')
        try {
          results.cache = await initializeRedisCache()
          if (!results.cache) {
            errors.push('Redis cache initialization failed')
          }
        } catch (error) {
          results.cache = false
          errors.push(`Cache initialization failed: ${(error as Error).message}`)
        }
      }

      // Initialize analytics (optional)
      if (this.config.enableAnalytics) {
        console.log('Initializing ClickHouse analytics...')
        try {
          results.analytics = await initializeClickHouseAnalytics()
          if (!results.analytics) {
            errors.push('ClickHouse analytics initialization failed')
          }
        } catch (error) {
          results.analytics = false
          errors.push(`Analytics initialization failed: ${(error as Error).message}`)
        }
      }

      // Start health monitoring
      this.startHealthMonitoring()

      const success = results.primary && (this.config.enableMigrations ? results.migrations : true)
      
      console.log(`Infrastructure initialization ${success ? 'completed' : 'failed'}`)
      console.log('Component status:', results)
      
      if (errors.length > 0) {
        console.warn('Initialization warnings:', errors)
      }

      return { success, components: results, errors }

    } catch (error) {
      const errorMessage = `Infrastructure initialization failed: ${(error as Error).message}`
      console.error(errorMessage)
      errors.push(errorMessage)
      
      return { success: false, components: results, errors }
    }
  }

  // Get comprehensive health status
  async getHealthStatus(): Promise<InfrastructureHealth> {
    const [primaryHealth, analyticsHealth, cacheHealth] = await Promise.allSettled([
      this.checkPrimaryHealth(),
      this.checkAnalyticsHealth(),
      this.checkCacheHealth()
    ])

    const components = {
      primary: primaryHealth.status === 'fulfilled' ? primaryHealth.value : this.getErrorHealth('Primary database check failed'),
      analytics: analyticsHealth.status === 'fulfilled' ? analyticsHealth.value : this.getErrorHealth('Analytics check failed'),
      cache: cacheHealth.status === 'fulfilled' ? cacheHealth.value : this.getErrorHealth('Cache check failed'),
      migrations: await this.checkMigrationsHealth()
    }

    // Determine overall health
    const componentStatuses = Object.values(components).map(c => c.status)
    let overall: 'healthy' | 'degraded' | 'critical'
    
    if (componentStatuses.includes('critical') || componentStatuses.includes('offline')) {
      overall = 'critical'
    } else if (componentStatuses.includes('degraded')) {
      overall = 'degraded'
    } else {
      overall = 'healthy'
    }

    return {
      overall,
      components,
      metrics: this.metrics,
      lastChecked: new Date()
    }
  }

  // Check primary database health
  private async checkPrimaryHealth(): Promise<ComponentHealth> {
    try {
      const health = await enterpriseDB.getHealthStatus()
      
      return {
        status: health.overall ? 'healthy' : 'critical',
        latency: health.primary.latency,
        uptime: Date.now() - this.startTime.getTime(),
        errorRate: 0,
        lastError: health.primary.error,
        details: {
          connected: health.primary.connected,
          primaryLatency: health.primary.latency
        }
      }
    } catch (error) {
      return this.getErrorHealth(`Primary database error: ${(error as Error).message}`)
    }
  }

  // Check analytics database health
  private async checkAnalyticsHealth(): Promise<ComponentHealth> {
    if (!this.config.enableAnalytics) {
      return {
        status: 'healthy',
        latency: 0,
        uptime: 0,
        errorRate: 0,
        details: { enabled: false }
      }
    }

    try {
      const health = await clickhouseAnalytics.healthCheck()
      
      return {
        status: health.connected ? 'healthy' : 'critical',
        latency: health.latency,
        uptime: Date.now() - this.startTime.getTime(),
        errorRate: 0,
        lastError: health.error,
        details: {
          connected: health.connected,
          bufferSize: health.bufferSize
        }
      }
    } catch (error) {
      return this.getErrorHealth(`Analytics database error: ${(error as Error).message}`)
    }
  }

  // Check cache health
  private async checkCacheHealth(): Promise<ComponentHealth> {
    if (!this.config.enableCache) {
      return {
        status: 'healthy',
        latency: 0,
        uptime: 0,
        errorRate: 0,
        details: { enabled: false }
      }
    }

    try {
      const health = await redisCache.healthCheck()
      
      return {
        status: health.connected ? 'healthy' : 'degraded',
        latency: health.latency,
        uptime: Date.now() - this.startTime.getTime(),
        errorRate: 0,
        lastError: health.error,
        details: {
          connected: health.connected,
          hitRatio: health.hitRatio,
          memoryUsage: health.memoryUsage
        }
      }
    } catch (error) {
      return this.getErrorHealth(`Cache error: ${(error as Error).message}`)
    }
  }

  // Check migrations health
  private async checkMigrationsHealth(): Promise<ComponentHealth> {
    if (!this.config.enableMigrations) {
      return {
        status: 'healthy',
        latency: 0,
        uptime: 0,
        errorRate: 0,
        details: { enabled: false }
      }
    }

    try {
      const status = await migrationSystem.getMigrationStatus()
      
      return {
        status: status.failed > 0 ? 'degraded' : 'healthy',
        latency: 0,
        uptime: Date.now() - this.startTime.getTime(),
        errorRate: status.total > 0 ? status.failed / status.total : 0,
        details: {
          total: status.total,
          applied: status.applied,
          failed: status.failed,
          rolledBack: status.rolledBack,
          lastMigration: status.lastMigration?.version
        }
      }
    } catch (error) {
      return this.getErrorHealth(`Migration system error: ${(error as Error).message}`)
    }
  }

  // Create error health status
  private getErrorHealth(error: string): ComponentHealth {
    return {
      status: 'critical',
      latency: 0,
      uptime: 0,
      errorRate: 1,
      lastError: error
    }
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.getHealthStatus()
        
        // Update metrics
        this.updateMetrics(health)
        
        // Check alert thresholds
        this.checkAlertThresholds(health)
        
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }, this.config.healthCheckInterval)
  }

  // Stop health monitoring
  private stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }
  }

  // Update infrastructure metrics
  private updateMetrics(health: InfrastructureHealth): void {
    this.metrics = health.metrics
    
    // Log metrics periodically
    if (Date.now() % 300000 < this.config.healthCheckInterval) { // Every 5 minutes
      console.log('Infrastructure metrics:', this.metrics)
    }
  }

  // Check alert thresholds
  private checkAlertThresholds(health: InfrastructureHealth): void {
    const { alertThresholds } = this.config
    
    if (health.metrics.averageResponseTime > alertThresholds.responseTime) {
      console.warn(`High response time: ${health.metrics.averageResponseTime}ms`)
    }
    
    if (health.metrics.errorRate > alertThresholds.errorRate) {
      console.warn(`High error rate: ${(health.metrics.errorRate * 100).toFixed(2)}%`)
    }
    
    if (health.metrics.memoryUsage > alertThresholds.memoryUsage) {
      console.warn(`High memory usage: ${(health.metrics.memoryUsage * 100).toFixed(2)}%`)
    }
    
    if (health.overall === 'critical') {
      console.error('Infrastructure in critical state:', health.components)
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down enterprise infrastructure...')
    
    this.stopHealthMonitoring()
    
    // Disconnect from databases
    await Promise.allSettled([
      analyticsDB.connect().then(() => clickhouseAnalytics.disconnect()),
      cacheDB.connect().then(() => redisCache.disconnect())
    ])
    
    console.log('Infrastructure shutdown complete')
  }

  // Get infrastructure metrics
  getMetrics(): InfrastructureMetrics {
    return { ...this.metrics }
  }

  // Get uptime
  getUptime(): number {
    return Date.now() - this.startTime.getTime()
  }

  // Execute database operation with monitoring
  async executeWithMonitoring<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    this.metrics.totalRequests++
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      // Update response time metrics
      this.updateResponseTimeMetrics(duration)
      
      return result
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests
      
      console.error(`Operation ${operation} failed:`, error)
      throw error
    }
  }

  // Update response time metrics
  private updateResponseTimeMetrics(duration: number): void {
    const totalRequests = this.metrics.totalRequests
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + duration) / totalRequests
  }
}

// Singleton instance
export const enterpriseInfrastructure = new EnterpriseInfrastructure()

// Initialize enterprise infrastructure
export async function initializeEnterpriseInfrastructure(): Promise<{
  success: boolean
  components: Record<string, boolean>
  errors: string[]
}> {
  return enterpriseInfrastructure.initialize()
}

// Get infrastructure health
export async function getInfrastructureHealth(): Promise<InfrastructureHealth> {
  return enterpriseInfrastructure.getHealthStatus()
}

// Shutdown infrastructure
export async function shutdownInfrastructure(): Promise<void> {
  return enterpriseInfrastructure.shutdown()
}

// Export all services for easy access
export {
  enterpriseDB,
  migrationSystem,
  redisCache,
  cacheService,
  clickhouseAnalytics,
  analyticsService
}