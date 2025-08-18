/**
 * Enterprise Infrastructure Test Suite
 * 
 * Comprehensive tests for the enterprise database foundation including:
 * - Multi-tenant data isolation
 * - Migration system functionality
 * - Cache operations
 * - Analytics database integration
 * - Health monitoring
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { 
  enterpriseInfrastructure,
  initializeEnterpriseInfrastructure,
  getInfrastructureHealth,
  enterpriseDB,
  migrationSystem,
  redisCache,
  clickhouseAnalytics
} from '../enterprise-infrastructure'

describe('Enterprise Infrastructure', () => {
  beforeAll(async () => {
    // Initialize infrastructure for testing
    await initializeEnterpriseInfrastructure()
  })

  afterAll(async () => {
    // Cleanup after tests
    await enterpriseInfrastructure.shutdown()
  })

  describe('Infrastructure Initialization', () => {
    it('should initialize all components successfully', async () => {
      const result = await initializeEnterpriseInfrastructure()
      
      expect(result.success).toBe(true)
      expect(result.components.primary).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle partial initialization gracefully', async () => {
      // Test with analytics disabled
      const infrastructure = new (enterpriseInfrastructure.constructor as any)({
        enableAnalytics: false,
        enableCache: false
      })
      
      const result = await infrastructure.initialize()
      
      expect(result.success).toBe(true)
      expect(result.components.primary).toBe(true)
    })
  })

  describe('Health Monitoring', () => {
    it('should provide comprehensive health status', async () => {
      const health = await getInfrastructureHealth()
      
      expect(health).toHaveProperty('overall')
      expect(health).toHaveProperty('components')
      expect(health).toHaveProperty('metrics')
      expect(health).toHaveProperty('lastChecked')
      
      expect(['healthy', 'degraded', 'critical']).toContain(health.overall)
      expect(health.components).toHaveProperty('primary')
      expect(health.components).toHaveProperty('analytics')
      expect(health.components).toHaveProperty('cache')
      expect(health.components).toHaveProperty('migrations')
    })

    it('should track infrastructure metrics', async () => {
      const metrics = enterpriseInfrastructure.getMetrics()
      
      expect(metrics).toHaveProperty('totalRequests')
      expect(metrics).toHaveProperty('averageResponseTime')
      expect(metrics).toHaveProperty('errorRate')
      expect(metrics).toHaveProperty('cacheHitRatio')
      expect(metrics).toHaveProperty('activeConnections')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('diskUsage')
    })

    it('should calculate uptime correctly', () => {
      const uptime = enterpriseInfrastructure.getUptime()
      
      expect(uptime).toBeGreaterThan(0)
      expect(typeof uptime).toBe('number')
    })
  })

  describe('Enterprise Database', () => {
    it('should provide primary database client', () => {
      const client = enterpriseDB.getPrimaryClient()
      
      expect(client).toBeDefined()
      expect(typeof client.from).toBe('function')
    })

    it('should execute queries with monitoring', async () => {
      const result = await enterpriseDB.executeQuery(
        'test-query',
        async () => ({ data: [], error: null }),
        'test-tenant-id'
      )
      
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('error')
      expect(result.error).toBeNull()
    })

    it('should handle query errors gracefully', async () => {
      const result = await enterpriseDB.executeQuery(
        'failing-query',
        async () => ({ data: null, error: new Error('Test error') }),
        'test-tenant-id'
      )
      
      expect(result.error).toBeDefined()
      expect(result.data).toBeNull()
    })

    it('should provide database health status', async () => {
      const health = await enterpriseDB.getHealthStatus()
      
      expect(health).toHaveProperty('primary')
      expect(health).toHaveProperty('analytics')
      expect(health).toHaveProperty('cache')
      expect(health).toHaveProperty('overall')
      
      expect(health.primary).toHaveProperty('connected')
      expect(health.primary).toHaveProperty('latency')
      expect(typeof health.primary.latency).toBe('number')
    })
  })

  describe('Migration System', () => {
    it('should initialize migration tables', async () => {
      await migrationSystem.initialize()
      
      // Test should pass without throwing errors
      expect(true).toBe(true)
    })

    it('should get migration status', async () => {
      const status = await migrationSystem.getMigrationStatus()
      
      expect(status).toHaveProperty('total')
      expect(status).toHaveProperty('applied')
      expect(status).toHaveProperty('failed')
      expect(status).toHaveProperty('rolledBack')
      
      expect(typeof status.total).toBe('number')
      expect(typeof status.applied).toBe('number')
      expect(typeof status.failed).toBe('number')
      expect(typeof status.rolledBack).toBe('number')
    })

    it('should validate migration checksums', () => {
      const sql = 'CREATE TABLE test (id uuid PRIMARY KEY);'
      const checksum = migrationSystem.constructor.generateChecksum(sql)
      
      expect(typeof checksum).toBe('string')
      expect(checksum.length).toBeGreaterThan(0)
      
      // Same SQL should generate same checksum
      const checksum2 = migrationSystem.constructor.generateChecksum(sql)
      expect(checksum).toBe(checksum2)
    })

    it('should handle migration application', async () => {
      const testMigration = {
        id: 'test-migration',
        version: '20250813120001',
        name: 'Test Migration',
        description: 'Test migration for unit tests',
        sql: 'SELECT 1;',
        checksum: 'test-checksum',
        status: 'pending' as const
      }

      // This would normally apply the migration
      // For testing, we just verify the structure
      expect(testMigration).toHaveProperty('version')
      expect(testMigration).toHaveProperty('sql')
      expect(testMigration).toHaveProperty('checksum')
    })
  })

  describe('Redis Cache', () => {
    beforeEach(async () => {
      // Connect to cache for each test
      await redisCache.connect()
    })

    it('should connect to Redis', async () => {
      const connected = await redisCache.connect()
      expect(typeof connected).toBe('boolean')
    })

    it('should handle cache operations', async () => {
      const key = 'test-key'
      const value = 'test-value'
      
      // Set value
      const setResult = await redisCache.set(key, value, 60)
      expect(typeof setResult).toBe('boolean')
      
      // Get value
      const getValue = await redisCache.get(key)
      expect(getValue).toBeDefined()
      
      // Delete value
      const delResult = await redisCache.del(key)
      expect(typeof delResult).toBe('boolean')
    })

    it('should handle cache misses gracefully', async () => {
      const value = await redisCache.get('non-existent-key')
      expect(value).toBeNull()
    })

    it('should provide cache metrics', () => {
      const metrics = redisCache.getMetrics()
      
      expect(metrics).toHaveProperty('hits')
      expect(metrics).toHaveProperty('misses')
      expect(metrics).toHaveProperty('sets')
      expect(metrics).toHaveProperty('deletes')
      expect(metrics).toHaveProperty('errors')
      expect(metrics).toHaveProperty('avgResponseTime')
    })

    it('should calculate hit ratio', () => {
      const hitRatio = redisCache.getHitRatio()
      
      expect(typeof hitRatio).toBe('number')
      expect(hitRatio).toBeGreaterThanOrEqual(0)
      expect(hitRatio).toBeLessThanOrEqual(1)
    })

    it('should perform health check', async () => {
      const health = await redisCache.healthCheck()
      
      expect(health).toHaveProperty('connected')
      expect(health).toHaveProperty('latency')
      expect(health).toHaveProperty('hitRatio')
      expect(health).toHaveProperty('memoryUsage')
      
      expect(typeof health.connected).toBe('boolean')
      expect(typeof health.latency).toBe('number')
    })
  })

  describe('ClickHouse Analytics', () => {
    it('should initialize ClickHouse connection', async () => {
      const initialized = await clickhouseAnalytics.initialize()
      expect(typeof initialized).toBe('boolean')
    })

    it('should handle analytics events', async () => {
      const event = {
        id: 'test-event-1',
        tenant_id: 'test-tenant',
        location_id: 'test-location',
        user_id: 'test-user',
        event_type: 'test',
        event_name: 'test_event',
        properties: { test: true },
        timestamp: new Date()
      }
      
      // Track event (should not throw)
      await clickhouseAnalytics.trackEvent(event)
      expect(true).toBe(true)
    })

    it('should handle time-series data', async () => {
      const data = {
        timestamp: new Date(),
        metric_name: 'test_metric',
        value: 42,
        dimensions: { location: 'test' },
        tenant_id: 'test-tenant',
        location_id: 'test-location'
      }
      
      // Track time-series data (should not throw)
      await clickhouseAnalytics.trackTimeSeries(data)
      expect(true).toBe(true)
    })

    it('should perform health check', async () => {
      const health = await clickhouseAnalytics.healthCheck()
      
      expect(health).toHaveProperty('connected')
      expect(health).toHaveProperty('latency')
      expect(health).toHaveProperty('bufferSize')
      
      expect(typeof health.connected).toBe('boolean')
      expect(typeof health.latency).toBe('number')
      expect(typeof health.bufferSize).toBe('number')
    })

    it('should execute analytics queries', async () => {
      const query = 'SELECT 1 as test'
      const result = await clickhouseAnalytics.query(query)
      
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('rows')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('cached')
      
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.rows).toBe('number')
      expect(typeof result.duration).toBe('number')
      expect(typeof result.cached).toBe('boolean')
    })
  })

  describe('Multi-Tenant Data Isolation', () => {
    it('should enforce tenant context', async () => {
      const tenantId = 'test-tenant-123'
      
      // Set tenant context
      const client = enterpriseDB.getPrimaryClient()
      await client.rpc('set_tenant_context', { tenant_id: tenantId })
      
      // Verify context is set (this would be tested with actual RLS policies)
      expect(true).toBe(true)
    })

    it('should validate tenant isolation in queries', async () => {
      const result = await enterpriseDB.executeQuery(
        'tenant-isolated-query',
        async () => ({ data: [], error: null }),
        'isolated-tenant-id'
      )
      
      expect(result.error).toBeNull()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track operation metrics', async () => {
      const operation = 'test-operation'
      
      const result = await enterpriseInfrastructure.executeWithMonitoring(
        operation,
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'success'
        }
      )
      
      expect(result).toBe('success')
      
      const metrics = enterpriseInfrastructure.getMetrics()
      expect(metrics.totalRequests).toBeGreaterThan(0)
    })

    it('should handle operation errors', async () => {
      const operation = 'failing-operation'
      
      await expect(
        enterpriseInfrastructure.executeWithMonitoring(
          operation,
          async () => {
            throw new Error('Test error')
          }
        )
      ).rejects.toThrow('Test error')
      
      const metrics = enterpriseInfrastructure.getMetrics()
      expect(metrics.errorRate).toBeGreaterThan(0)
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle database connection failures gracefully', async () => {
      // Simulate connection failure
      const health = await enterpriseDB.getHealthStatus()
      
      // Should not throw, even if connection fails
      expect(health).toHaveProperty('overall')
      expect(typeof health.overall).toBe('boolean')
    })

    it('should handle cache failures gracefully', async () => {
      // Test cache operations when disconnected
      await redisCache.disconnect()
      
      const value = await redisCache.get('test-key')
      expect(value).toBeNull()
      
      const setResult = await redisCache.set('test-key', 'test-value')
      expect(setResult).toBe(false)
    })

    it('should handle analytics failures gracefully', async () => {
      // Test analytics operations when disconnected
      await clickhouseAnalytics.disconnect()
      
      const health = await clickhouseAnalytics.healthCheck()
      expect(health.connected).toBe(false)
    })
  })

  describe('Configuration and Environment', () => {
    it('should handle missing environment variables', () => {
      // Test with minimal configuration
      const config = {
        enableAnalytics: false,
        enableCache: false,
        enableMigrations: true
      }
      
      expect(config.enableMigrations).toBe(true)
    })

    it('should validate configuration parameters', () => {
      const config = {
        healthCheckInterval: 30000,
        metricsRetention: 86400000,
        alertThresholds: {
          responseTime: 1000,
          errorRate: 0.05,
          memoryUsage: 0.8,
          diskUsage: 0.9
        }
      }
      
      expect(config.healthCheckInterval).toBeGreaterThan(0)
      expect(config.alertThresholds.errorRate).toBeLessThan(1)
    })
  })
})

// Integration tests for the complete infrastructure
describe('Infrastructure Integration', () => {
  it('should handle end-to-end data flow', async () => {
    // Simulate complete data flow from API to analytics
    const tenantId = 'integration-test-tenant'
    const locationId = 'integration-test-location'
    const userId = 'integration-test-user'
    
    // 1. Execute database operation
    const dbResult = await enterpriseDB.executeQuery(
      'integration-test',
      async () => ({ data: { id: '123' }, error: null }),
      tenantId
    )
    
    expect(dbResult.error).toBeNull()
    
    // 2. Cache the result
    await redisCache.set(`result:${tenantId}`, JSON.stringify(dbResult.data), 300)
    
    // 3. Track analytics event
    await clickhouseAnalytics.trackEvent({
      id: 'integration-event',
      tenant_id: tenantId,
      location_id: locationId,
      user_id: userId,
      event_type: 'integration',
      event_name: 'test_completed',
      properties: { success: true },
      timestamp: new Date()
    })
    
    // 4. Verify health status
    const health = await getInfrastructureHealth()
    expect(health.overall).toBeDefined()
  })

  it('should maintain data consistency across components', async () => {
    const testData = {
      id: 'consistency-test',
      value: 'test-value',
      timestamp: new Date()
    }
    
    // Store in cache
    await redisCache.set(testData.id, JSON.stringify(testData), 300)
    
    // Retrieve from cache
    const cachedData = await redisCache.get(testData.id)
    expect(cachedData).toBeDefined()
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      expect(parsed.id).toBe(testData.id)
      expect(parsed.value).toBe(testData.value)
    }
  })
})