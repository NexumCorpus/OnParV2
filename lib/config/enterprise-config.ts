/**
 * Enterprise Configuration Management
 * 
 * Centralized configuration for all enterprise infrastructure components
 * with environment-specific settings and validation.
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test'

// Database configuration
export interface DatabaseConfig {
  primary: {
    url: string
    key: string
    serviceRoleKey?: string
    maxConnections: number
    connectionTimeout: number
    queryTimeout: number
    enableRLS: boolean
    enableAuditLogging: boolean
  }
  analytics: {
    enabled: boolean
    url?: string
    username?: string
    password?: string
    database: string
    batchSize: number
    flushInterval: number
    retentionDays: number
  }
  cache: {
    enabled: boolean
    url?: string
    password?: string
    database: number
    maxConnections: number
    maxRetries: number
    retryDelay: number
    keyPrefix: string
    defaultTTL: number
  }
}

// Security configuration
export interface SecurityConfig {
  encryption: {
    algorithm: string
    keyRotationDays: number
    enableFieldEncryption: boolean
  }
  authentication: {
    jwtSecret?: string
    jwtExpirationHours: number
    refreshTokenExpirationDays: number
    enableMFA: boolean
    sessionTimeoutMinutes: number
  }
  rateLimit: {
    enabled: boolean
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
  }
  cors: {
    enabled: boolean
    origins: string[]
    credentials: boolean
  }
}

// Monitoring configuration
export interface MonitoringConfig {
  healthCheck: {
    enabled: boolean
    intervalMs: number
    timeoutMs: number
  }
  metrics: {
    enabled: boolean
    retentionHours: number
    aggregationIntervalMs: number
  }
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug'
    enableStructuredLogging: boolean
    enablePerformanceLogging: boolean
    maxLogSizeMB: number
  }
  alerts: {
    enabled: boolean
    thresholds: {
      responseTimeMs: number
      errorRatePercent: number
      memoryUsagePercent: number
      diskUsagePercent: number
      cacheHitRatePercent: number
    }
    webhookUrl?: string
    emailRecipients: string[]
  }
}

// Feature flags configuration
export interface FeatureConfig {
  multiTenant: boolean
  analytics: boolean
  caching: boolean
  auditLogging: boolean
  performanceMonitoring: boolean
  advancedSecurity: boolean
  apiVersioning: boolean
  backgroundJobs: boolean
}

// Complete enterprise configuration
export interface EnterpriseConfig {
  environment: Environment
  database: DatabaseConfig
  security: SecurityConfig
  monitoring: MonitoringConfig
  features: FeatureConfig
  deployment: {
    region: string
    availabilityZone?: string
    instanceType: string
    autoScaling: boolean
    minInstances: number
    maxInstances: number
  }
}

// Default configurations by environment
const defaultConfigs: Record<Environment, Partial<EnterpriseConfig>> = {
  development: {
    database: {
      primary: {
        maxConnections: 10,
        connectionTimeout: 5000,
        queryTimeout: 30000,
        enableRLS: true,
        enableAuditLogging: false
      },
      analytics: {
        enabled: false,
        batchSize: 100,
        flushInterval: 10000,
        retentionDays: 30
      },
      cache: {
        enabled: true,
        database: 0,
        maxConnections: 5,
        maxRetries: 3,
        retryDelay: 1000,
        keyPrefix: 'onpar:dev:',
        defaultTTL: 300
      }
    },
    security: {
      authentication: {
        jwtExpirationHours: 24,
        refreshTokenExpirationDays: 30,
        enableMFA: false,
        sessionTimeoutMinutes: 120
      },
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        maxRequests: 1000,
        skipSuccessfulRequests: true
      }
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 5000
      },
      logging: {
        level: 'debug',
        enableStructuredLogging: true,
        enablePerformanceLogging: true,
        maxLogSizeMB: 100
      },
      alerts: {
        enabled: false,
        thresholds: {
          responseTimeMs: 2000,
          errorRatePercent: 10,
          memoryUsagePercent: 90,
          diskUsagePercent: 95,
          cacheHitRatePercent: 50
        },
        emailRecipients: []
      }
    },
    features: {
      multiTenant: true,
      analytics: false,
      caching: true,
      auditLogging: false,
      performanceMonitoring: true,
      advancedSecurity: false,
      apiVersioning: false,
      backgroundJobs: false
    }
  },

  staging: {
    database: {
      primary: {
        maxConnections: 25,
        connectionTimeout: 10000,
        queryTimeout: 60000,
        enableRLS: true,
        enableAuditLogging: true
      },
      analytics: {
        enabled: true,
        batchSize: 500,
        flushInterval: 5000,
        retentionDays: 90
      },
      cache: {
        enabled: true,
        database: 0,
        maxConnections: 10,
        maxRetries: 3,
        retryDelay: 1000,
        keyPrefix: 'onpar:staging:',
        defaultTTL: 600
      }
    },
    security: {
      authentication: {
        jwtExpirationHours: 8,
        refreshTokenExpirationDays: 7,
        enableMFA: true,
        sessionTimeoutMinutes: 60
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxRequests: 500,
        skipSuccessfulRequests: true
      }
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        intervalMs: 15000,
        timeoutMs: 3000
      },
      logging: {
        level: 'info',
        enableStructuredLogging: true,
        enablePerformanceLogging: true,
        maxLogSizeMB: 500
      },
      alerts: {
        enabled: true,
        thresholds: {
          responseTimeMs: 1500,
          errorRatePercent: 5,
          memoryUsagePercent: 85,
          diskUsagePercent: 90,
          cacheHitRatePercent: 70
        },
        emailRecipients: ['dev-team@onpar.com']
      }
    },
    features: {
      multiTenant: true,
      analytics: true,
      caching: true,
      auditLogging: true,
      performanceMonitoring: true,
      advancedSecurity: true,
      apiVersioning: true,
      backgroundJobs: true
    }
  },

  production: {
    database: {
      primary: {
        maxConnections: 100,
        connectionTimeout: 15000,
        queryTimeout: 120000,
        enableRLS: true,
        enableAuditLogging: true
      },
      analytics: {
        enabled: true,
        batchSize: 1000,
        flushInterval: 2000,
        retentionDays: 365
      },
      cache: {
        enabled: true,
        database: 0,
        maxConnections: 50,
        maxRetries: 5,
        retryDelay: 2000,
        keyPrefix: 'onpar:prod:',
        defaultTTL: 1800
      }
    },
    security: {
      authentication: {
        jwtExpirationHours: 2,
        refreshTokenExpirationDays: 1,
        enableMFA: true,
        sessionTimeoutMinutes: 30
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxRequests: 100,
        skipSuccessfulRequests: false
      }
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        intervalMs: 10000,
        timeoutMs: 2000
      },
      logging: {
        level: 'warn',
        enableStructuredLogging: true,
        enablePerformanceLogging: true,
        maxLogSizeMB: 1000
      },
      alerts: {
        enabled: true,
        thresholds: {
          responseTimeMs: 1000,
          errorRatePercent: 1,
          memoryUsagePercent: 80,
          diskUsagePercent: 85,
          cacheHitRatePercent: 85
        },
        emailRecipients: ['ops-team@onpar.com', 'dev-team@onpar.com']
      }
    },
    features: {
      multiTenant: true,
      analytics: true,
      caching: true,
      auditLogging: true,
      performanceMonitoring: true,
      advancedSecurity: true,
      apiVersioning: true,
      backgroundJobs: true
    }
  },

  test: {
    database: {
      primary: {
        maxConnections: 5,
        connectionTimeout: 3000,
        queryTimeout: 10000,
        enableRLS: false,
        enableAuditLogging: false
      },
      analytics: {
        enabled: false,
        batchSize: 10,
        flushInterval: 1000,
        retentionDays: 1
      },
      cache: {
        enabled: false,
        database: 1,
        maxConnections: 2,
        maxRetries: 1,
        retryDelay: 100,
        keyPrefix: 'onpar:test:',
        defaultTTL: 60
      }
    },
    security: {
      authentication: {
        jwtExpirationHours: 1,
        refreshTokenExpirationDays: 1,
        enableMFA: false,
        sessionTimeoutMinutes: 30
      },
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        maxRequests: 10000,
        skipSuccessfulRequests: true
      }
    },
    monitoring: {
      healthCheck: {
        enabled: false,
        intervalMs: 60000,
        timeoutMs: 1000
      },
      logging: {
        level: 'error',
        enableStructuredLogging: false,
        enablePerformanceLogging: false,
        maxLogSizeMB: 10
      },
      alerts: {
        enabled: false,
        thresholds: {
          responseTimeMs: 5000,
          errorRatePercent: 50,
          memoryUsagePercent: 95,
          diskUsagePercent: 98,
          cacheHitRatePercent: 10
        },
        emailRecipients: []
      }
    },
    features: {
      multiTenant: false,
      analytics: false,
      caching: false,
      auditLogging: false,
      performanceMonitoring: false,
      advancedSecurity: false,
      apiVersioning: false,
      backgroundJobs: false
    }
  }
}

// Configuration manager class
export class EnterpriseConfigManager {
  private config: EnterpriseConfig
  private environment: Environment

  constructor(environment?: Environment) {
    this.environment = environment || this.detectEnvironment()
    this.config = this.loadConfiguration()
  }

  // Detect environment from NODE_ENV or other indicators
  private detectEnvironment(): Environment {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase()
    
    switch (nodeEnv) {
      case 'production':
      case 'prod':
        return 'production'
      case 'staging':
      case 'stage':
        return 'staging'
      case 'test':
      case 'testing':
        return 'test'
      default:
        return 'development'
    }
  }

  // Load configuration for current environment
  private loadConfiguration(): EnterpriseConfig {
    const baseConfig = defaultConfigs[this.environment]
    const envOverrides = this.loadEnvironmentOverrides()
    
    return this.mergeConfigurations(baseConfig, envOverrides)
  }

  // Load configuration overrides from environment variables
  private loadEnvironmentOverrides(): Partial<EnterpriseConfig> {
    return {
      database: {
        primary: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '0') || undefined,
          connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '0') || undefined,
          queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '0') || undefined,
          enableRLS: process.env.DB_ENABLE_RLS !== 'false',
          enableAuditLogging: process.env.DB_ENABLE_AUDIT_LOGGING === 'true'
        },
        analytics: {
          enabled: process.env.ENABLE_ANALYTICS !== 'false',
          url: process.env.CLICKHOUSE_URL,
          username: process.env.CLICKHOUSE_USERNAME,
          password: process.env.CLICKHOUSE_PASSWORD,
          database: process.env.CLICKHOUSE_DATABASE || 'onpar_analytics',
          batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '0') || undefined,
          flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || '0') || undefined,
          retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '0') || undefined
        },
        cache: {
          enabled: process.env.ENABLE_CACHE !== 'false',
          url: process.env.REDIS_URL,
          password: process.env.REDIS_PASSWORD,
          database: parseInt(process.env.REDIS_DATABASE || '0'),
          maxConnections: parseInt(process.env.REDIS_MAX_CONNECTIONS || '0') || undefined,
          keyPrefix: process.env.REDIS_KEY_PREFIX,
          defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '0') || undefined
        }
      },
      security: {
        authentication: {
          jwtSecret: process.env.JWT_SECRET,
          jwtExpirationHours: parseInt(process.env.JWT_EXPIRATION_HOURS || '0') || undefined,
          enableMFA: process.env.ENABLE_MFA === 'true'
        },
        rateLimit: {
          enabled: process.env.ENABLE_RATE_LIMIT !== 'false',
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '0') || undefined
        }
      },
      monitoring: {
        alerts: {
          enabled: process.env.ENABLE_ALERTS === 'true',
          webhookUrl: process.env.ALERT_WEBHOOK_URL,
          emailRecipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || []
        }
      },
      deployment: {
        region: process.env.DEPLOYMENT_REGION || 'us-east-1',
        availabilityZone: process.env.DEPLOYMENT_AZ,
        instanceType: process.env.INSTANCE_TYPE || 't3.medium',
        autoScaling: process.env.ENABLE_AUTO_SCALING === 'true',
        minInstances: parseInt(process.env.MIN_INSTANCES || '1'),
        maxInstances: parseInt(process.env.MAX_INSTANCES || '10')
      }
    }
  }

  // Deep merge configurations
  private mergeConfigurations(
    base: Partial<EnterpriseConfig>,
    override: Partial<EnterpriseConfig>
  ): EnterpriseConfig {
    const merged = { ...base } as EnterpriseConfig
    
    // Set required defaults
    merged.environment = this.environment
    
    // Deep merge each section
    if (override.database) {
      merged.database = { ...merged.database, ...override.database }
      if (override.database.primary) {
        merged.database.primary = { ...merged.database.primary, ...override.database.primary }
      }
      if (override.database.analytics) {
        merged.database.analytics = { ...merged.database.analytics, ...override.database.analytics }
      }
      if (override.database.cache) {
        merged.database.cache = { ...merged.database.cache, ...override.database.cache }
      }
    }
    
    if (override.security) {
      merged.security = { ...merged.security, ...override.security }
      if (override.security.authentication) {
        merged.security.authentication = { ...merged.security.authentication, ...override.security.authentication }
      }
      if (override.security.rateLimit) {
        merged.security.rateLimit = { ...merged.security.rateLimit, ...override.security.rateLimit }
      }
    }
    
    if (override.monitoring) {
      merged.monitoring = { ...merged.monitoring, ...override.monitoring }
      if (override.monitoring.alerts) {
        merged.monitoring.alerts = { ...merged.monitoring.alerts, ...override.monitoring.alerts }
      }
    }
    
    if (override.features) {
      merged.features = { ...merged.features, ...override.features }
    }
    
    if (override.deployment) {
      merged.deployment = { ...merged.deployment, ...override.deployment }
    }
    
    return merged
  }

  // Get complete configuration
  getConfig(): EnterpriseConfig {
    return { ...this.config }
  }

  // Get specific configuration section
  getDatabaseConfig(): DatabaseConfig {
    return { ...this.config.database }
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config.security }
  }

  getMonitoringConfig(): MonitoringConfig {
    return { ...this.config.monitoring }
  }

  getFeatureConfig(): FeatureConfig {
    return { ...this.config.features }
  }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof FeatureConfig): boolean {
    return this.config.features[feature]
  }

  // Get environment
  getEnvironment(): Environment {
    return this.environment
  }

  // Validate configuration
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Validate required database settings
    if (!this.config.database.primary.url) {
      errors.push('Database URL is required')
    }
    
    if (!this.config.database.primary.key) {
      errors.push('Database key is required')
    }
    
    // Validate analytics settings if enabled
    if (this.config.database.analytics.enabled) {
      if (!this.config.database.analytics.url) {
        errors.push('Analytics database URL is required when analytics is enabled')
      }
    }
    
    // Validate cache settings if enabled
    if (this.config.database.cache.enabled) {
      if (!this.config.database.cache.url && this.environment === 'production') {
        errors.push('Cache URL is required in production when caching is enabled')
      }
    }
    
    // Validate security settings
    if (this.config.security.authentication.enableMFA && this.environment === 'production') {
      if (!this.config.security.authentication.jwtSecret) {
        errors.push('JWT secret is required when MFA is enabled in production')
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Singleton configuration manager
export const enterpriseConfig = new EnterpriseConfigManager()

// Export configuration for easy access
export const config = enterpriseConfig.getConfig()
export const dbConfig = enterpriseConfig.getDatabaseConfig()
export const securityConfig = enterpriseConfig.getSecurityConfig()
export const monitoringConfig = enterpriseConfig.getMonitoringConfig()
export const featureConfig = enterpriseConfig.getFeatureConfig()

// Validate configuration on import
const validation = enterpriseConfig.validate()
if (!validation.valid) {
  console.warn('Configuration validation warnings:', validation.errors)
}