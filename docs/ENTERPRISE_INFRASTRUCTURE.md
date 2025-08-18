# OnPar Enterprise Infrastructure Documentation

## Overview

The OnPar Enterprise Infrastructure provides a comprehensive, scalable, and secure foundation for the restaurant management platform. This document outlines the architecture, components, and implementation details of the enterprise-grade database foundation.

## Architecture Components

### 1. Primary Database (PostgreSQL via Supabase)
- **Purpose**: Transactional data storage with ACID compliance
- **Features**: 
  - Multi-tenant data isolation with Row Level Security (RLS)
  - Real-time subscriptions and updates
  - Advanced indexing and query optimization
  - Automated backups and point-in-time recovery

### 2. Analytics Database (ClickHouse)
- **Purpose**: High-performance analytics and time-series data
- **Features**:
  - Columnar storage for fast aggregations
  - Real-time data streaming from PostgreSQL
  - Automatic data partitioning and retention
  - Advanced analytics queries and reporting

### 3. Cache Layer (Redis)
- **Purpose**: High-performance caching and session management
- **Features**:
  - Distributed caching for multi-instance deployments
  - Session storage and management
  - Rate limiting and API throttling
  - Real-time data synchronization

### 4. Migration System
- **Purpose**: Database schema version control and deployment
- **Features**:
  - Automated migration execution with rollback capabilities
  - Checksum validation and conflict detection
  - Backup creation before migrations
  - Comprehensive audit logging

## Multi-Tenant Architecture

### Tenant Isolation Strategy

The system implements a comprehensive multi-tenant architecture with the following components:

#### 1. Tenant Management
```sql
-- Tenants table structure
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'active',
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 2. Organization Hierarchy
```sql
-- Organizations for enterprise customers
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'restaurant',
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 3. Location Management
```sql
-- Locations for multi-location support
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address jsonb,
  timezone text DEFAULT 'UTC',
  settings jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)

All tables implement RLS policies to ensure tenant data isolation:

```sql
-- Example RLS policy for inventory items
CREATE POLICY "Users can read own tenant inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND user_id = auth.uid());
```

### Tenant Context Management

The system uses PostgreSQL's session variables to maintain tenant context:

```sql
-- Set tenant context for session
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Database Migration System

### Migration Structure

Migrations follow a structured format with version control:

```typescript
interface Migration {
  id: string
  version: string
  name: string
  description: string
  sql: string
  rollbackSql?: string
  checksum: string
  status: 'pending' | 'applied' | 'failed' | 'rolled_back'
}
```

### Migration Execution

1. **Validation**: Checksum verification and dependency checking
2. **Backup**: Automatic backup creation before execution
3. **Execution**: Transactional execution with error handling
4. **Verification**: Post-execution validation and logging
5. **Rollback**: Automatic rollback on failure

### Usage Example

```typescript
import { migrationSystem } from '@/lib/migration-system'

// Apply pending migrations
const migrations = await migrationSystem.getPendingMigrations(availableMigrations)
const results = await migrationSystem.applyMigrations(migrations)

// Rollback if needed
await migrationSystem.rollbackMigration('20250813120000', rollbackSql, 'Bug fix required')
```

## Caching Strategy

### Cache Layers

1. **Application Cache**: In-memory caching for frequently accessed data
2. **Redis Cache**: Distributed caching for session and API data
3. **Database Cache**: Query result caching at the database level
4. **CDN Cache**: Static asset caching for global distribution

### Cache Key Patterns

```typescript
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  inventory: (locationId: string) => `inventory:${locationId}`,
  menu: (locationId: string) => `menu:${locationId}`,
  analytics: (locationId: string, date: string) => `analytics:${locationId}:${date}`
}
```

### Cache Invalidation

The system implements intelligent cache invalidation:

```typescript
// Invalidate related caches when data changes
await cacheService.invalidateLocation(locationId)
```

## Analytics Database (ClickHouse)

### Table Structure

Analytics tables are optimized for time-series data:

```sql
-- Events table for user interactions
CREATE TABLE events (
  id String,
  tenant_id String,
  location_id String,
  user_id String,
  event_type String,
  event_name String,
  properties String,
  timestamp DateTime,
  date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (tenant_id, location_id, timestamp)
TTL date + INTERVAL 2 YEAR;
```

### Data Streaming

Real-time data streaming from PostgreSQL to ClickHouse:

```typescript
// Track analytics event
await analyticsService.trackInventoryEvent(
  tenantId,
  locationId,
  userId,
  'update',
  itemData
)
```

### Query Performance

Optimized queries for common analytics patterns:

```typescript
// Get inventory analytics
const analytics = await clickhouseAnalytics.getInventoryAnalytics(
  tenantId,
  locationId,
  { start: startDate, end: endDate }
)
```

## Security Implementation

### Authentication & Authorization

1. **JWT-based Authentication**: Secure token-based authentication
2. **Role-based Access Control**: Fine-grained permissions system
3. **Multi-factor Authentication**: Enhanced security for admin access
4. **Session Management**: Secure session handling with Redis

### Data Encryption

1. **Encryption at Rest**: Database-level encryption for sensitive data
2. **Encryption in Transit**: TLS/SSL for all data transmission
3. **Field-level Encryption**: Additional encryption for PII data
4. **Key Management**: Secure key rotation and management

### Audit Logging

Comprehensive audit logging for compliance:

```sql
-- Audit log table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
```

## Performance Optimization

### Database Optimization

1. **Indexing Strategy**: Optimized indexes for common query patterns
2. **Connection Pooling**: Efficient connection management
3. **Query Optimization**: Automated query plan analysis
4. **Read Replicas**: Separate read/write operations

### Caching Optimization

1. **Multi-level Caching**: Application, Redis, and CDN caching
2. **Cache Warming**: Proactive cache population
3. **Intelligent Invalidation**: Smart cache invalidation strategies
4. **Compression**: Data compression for cache efficiency

### Monitoring & Metrics

Real-time performance monitoring:

```typescript
// Performance metrics tracking
const metrics = enterpriseInfrastructure.getMetrics()
console.log('Average response time:', metrics.averageResponseTime)
console.log('Cache hit ratio:', metrics.cacheHitRatio)
```

## Health Monitoring

### Health Check System

Comprehensive health monitoring across all components:

```typescript
// Get infrastructure health
const health = await getInfrastructureHealth()
console.log('Overall status:', health.overall)
console.log('Component status:', health.components)
```

### Alert Thresholds

Configurable alert thresholds for proactive monitoring:

```typescript
const alertThresholds = {
  responseTime: 1000,     // 1 second
  errorRate: 0.05,        // 5%
  memoryUsage: 0.8,       // 80%
  diskUsage: 0.9,         // 90%
  cacheHitRate: 0.7       // 70%
}
```

## Configuration Management

### Environment-specific Configuration

The system supports multiple environments with specific configurations:

```typescript
// Environment detection and configuration
const config = enterpriseConfig.getConfig()
const isProduction = config.environment === 'production'
```

### Feature Flags

Dynamic feature enabling/disabling:

```typescript
// Check if feature is enabled
if (enterpriseConfig.isFeatureEnabled('analytics')) {
  await trackAnalyticsEvent(event)
}
```

## Deployment Architecture

### Container Orchestration

- **Kubernetes**: Container orchestration and scaling
- **Docker**: Consistent deployment environments
- **Helm Charts**: Application deployment and configuration
- **Auto-scaling**: Automatic scaling based on resource utilization

### Infrastructure as Code

- **Terraform**: Infrastructure provisioning
- **GitOps**: Deployment automation workflow
- **Environment Configs**: Environment-specific configurations
- **Disaster Recovery**: Automated backup and recovery procedures

## Usage Examples

### Basic Setup

```typescript
import { initializeEnterpriseInfrastructure } from '@/lib/enterprise-infrastructure'

// Initialize infrastructure
const result = await initializeEnterpriseInfrastructure()
if (result.success) {
  console.log('Infrastructure initialized successfully')
} else {
  console.error('Initialization failed:', result.errors)
}
```

### Database Operations

```typescript
import { enterpriseDB } from '@/lib/enterprise-infrastructure'

// Execute query with tenant context
const result = await enterpriseDB.executeQuery(
  'get-inventory',
  async () => {
    return supabase
      .from('inventory_items')
      .select('*')
      .eq('location_id', locationId)
  },
  tenantId
)
```

### Cache Operations

```typescript
import { cacheService } from '@/lib/enterprise-infrastructure'

// Cache inventory data
await cacheService.cacheInventory(locationId, inventoryData, 1800)

// Get cached data
const cachedInventory = await cacheService.getInventory(locationId)
```

### Analytics Tracking

```typescript
import { analyticsService } from '@/lib/enterprise-infrastructure'

// Track user behavior
await analyticsService.trackUserBehavior(
  tenantId,
  userId,
  'inventory_updated',
  { itemId, quantity }
)
```

## Testing

### Test Suite

Comprehensive test coverage for all components:

```bash
# Run infrastructure tests
npm test lib/__tests__/enterprise-infrastructure.test.ts
```

### Integration Testing

End-to-end testing of complete data flow:

```typescript
// Integration test example
it('should handle end-to-end data flow', async () => {
  // 1. Database operation
  const dbResult = await enterpriseDB.executeQuery(...)
  
  // 2. Cache result
  await redisCache.set(key, value)
  
  // 3. Track analytics
  await clickhouseAnalytics.trackEvent(event)
  
  // 4. Verify health
  const health = await getInfrastructureHealth()
  expect(health.overall).toBeDefined()
})
```

## Troubleshooting

### Common Issues

1. **Connection Failures**: Check environment variables and network connectivity
2. **Migration Errors**: Verify migration syntax and dependencies
3. **Cache Misses**: Check Redis connection and key patterns
4. **Performance Issues**: Monitor metrics and optimize queries

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug'
```

### Health Checks

Use health endpoints for monitoring:

```typescript
// Check component health
const health = await enterpriseInfrastructure.getHealthStatus()
console.log('Health status:', health)
```

## Best Practices

### Security

1. Always use parameterized queries to prevent SQL injection
2. Implement proper authentication and authorization
3. Enable audit logging for compliance requirements
4. Use encryption for sensitive data

### Performance

1. Implement appropriate caching strategies
2. Use database indexes for frequently queried columns
3. Monitor and optimize slow queries
4. Implement connection pooling

### Monitoring

1. Set up comprehensive health checks
2. Monitor key performance metrics
3. Implement alerting for critical issues
4. Use structured logging for better debugging

### Scalability

1. Design for horizontal scaling from the start
2. Use read replicas for read-heavy workloads
3. Implement proper caching layers
4. Plan for data partitioning and sharding

## Support and Maintenance

### Regular Maintenance

1. **Database Maintenance**: Regular VACUUM and ANALYZE operations
2. **Cache Cleanup**: Periodic cache cleanup and optimization
3. **Log Rotation**: Automated log rotation and archival
4. **Security Updates**: Regular security patches and updates

### Monitoring and Alerts

1. **Performance Monitoring**: Continuous performance tracking
2. **Error Monitoring**: Real-time error detection and alerting
3. **Capacity Planning**: Proactive capacity monitoring and planning
4. **Security Monitoring**: Continuous security monitoring and threat detection

For additional support, please refer to the OnPar technical documentation or contact the development team.