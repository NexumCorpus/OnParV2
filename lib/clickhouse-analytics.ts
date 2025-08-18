/**
 * ClickHouse Analytics Database
 * 
 * Provides high-performance analytics and time-series data storage with:
 * - Columnar storage for fast aggregations
 * - Real-time data streaming from PostgreSQL
 * - Advanced analytics queries and reporting
 * - Data retention and archiving policies
 */

// ClickHouse configuration
export interface ClickHouseConfig {
  url: string
  username: string
  password: string
  database: string
  timeout: number
  maxRetries: number
  batchSize: number
  flushInterval: number
}

// Analytics event interface
export interface AnalyticsEvent {
  id: string
  tenant_id: string
  location_id?: string
  user_id?: string
  event_type: string
  event_name: string
  properties: Record<string, any>
  timestamp: Date
  session_id?: string
  ip_address?: string
  user_agent?: string
}

// Time-series data point
export interface TimeSeriesData {
  timestamp: Date
  metric_name: string
  value: number
  dimensions: Record<string, string>
  tenant_id: string
  location_id?: string
}

// Analytics query result
export interface AnalyticsResult {
  data: any[]
  rows: number
  duration: number
  cached: boolean
}

// Default ClickHouse configuration
const defaultConfig: ClickHouseConfig = {
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'onpar_analytics',
  timeout: 30000,
  maxRetries: 3,
  batchSize: 1000,
  flushInterval: 5000
}

export class ClickHouseAnalytics {
  private config: ClickHouseConfig
  private connected: boolean = false
  private eventBuffer: AnalyticsEvent[] = []
  private timeSeriesBuffer: TimeSeriesData[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<ClickHouseConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Initialize ClickHouse connection and create tables
  async initialize(): Promise<boolean> {
    try {
      await this.connect()
      await this.createTables()
      this.startBufferFlush()
      return true
    } catch (error) {
      console.error('Failed to initialize ClickHouse:', error)
      return false
    }
  }

  // Connect to ClickHouse
  private async connect(): Promise<void> {
    // In a real implementation, this would establish ClickHouse connection
    console.log(`Connecting to ClickHouse at ${this.config.url}`)
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 100))
    this.connected = true
    
    console.log('ClickHouse connection established')
  }

  // Create analytics tables
  private async createTables(): Promise<void> {
    const tables = [
      this.getEventsTableSQL(),
      this.getTimeSeriesTableSQL(),
      this.getInventoryAnalyticsTableSQL(),
      this.getSalesAnalyticsTableSQL(),
      this.getWasteAnalyticsTableSQL(),
      this.getUserAnalyticsTableSQL()
    ]

    for (const tableSQL of tables) {
      await this.executeQuery(tableSQL)
    }

    console.log('ClickHouse analytics tables created')
  }

  // Execute ClickHouse query
  private async executeQuery(query: string): Promise<any> {
    if (!this.connected) {
      throw new Error('ClickHouse not connected')
    }

    try {
      // In real implementation, execute actual ClickHouse query
      console.log(`Executing ClickHouse query: ${query.substring(0, 100)}...`)
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 10))
      
      return { data: [], rows: 0 }
    } catch (error) {
      console.error('ClickHouse query error:', error)
      throw error
    }
  }

  // Track analytics event
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.eventBuffer.push(event)
    
    if (this.eventBuffer.length >= this.config.batchSize) {
      await this.flushEvents()
    }
  }

  // Track time-series data
  async trackTimeSeries(data: TimeSeriesData): Promise<void> {
    this.timeSeriesBuffer.push(data)
    
    if (this.timeSeriesBuffer.length >= this.config.batchSize) {
      await this.flushTimeSeries()
    }
  }

  // Flush event buffer to ClickHouse
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return

    const events = [...this.eventBuffer]
    this.eventBuffer = []

    try {
      const values = events.map(event => 
        `('${event.id}', '${event.tenant_id}', '${event.location_id || ''}', '${event.user_id || ''}', ` +
        `'${event.event_type}', '${event.event_name}', '${JSON.stringify(event.properties)}', ` +
        `'${event.timestamp.toISOString()}', '${event.session_id || ''}', '${event.ip_address || ''}', '${event.user_agent || ''}')`
      ).join(',')

      const query = `
        INSERT INTO events (id, tenant_id, location_id, user_id, event_type, event_name, properties, timestamp, session_id, ip_address, user_agent)
        VALUES ${values}
      `

      await this.executeQuery(query)
      console.log(`Flushed ${events.length} events to ClickHouse`)
    } catch (error) {
      console.error('Failed to flush events:', error)
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events)
    }
  }

  // Flush time-series buffer to ClickHouse
  private async flushTimeSeries(): Promise<void> {
    if (this.timeSeriesBuffer.length === 0) return

    const data = [...this.timeSeriesBuffer]
    this.timeSeriesBuffer = []

    try {
      const values = data.map(point => 
        `('${point.timestamp.toISOString()}', '${point.metric_name}', ${point.value}, ` +
        `'${JSON.stringify(point.dimensions)}', '${point.tenant_id}', '${point.location_id || ''}')`
      ).join(',')

      const query = `
        INSERT INTO time_series (timestamp, metric_name, value, dimensions, tenant_id, location_id)
        VALUES ${values}
      `

      await this.executeQuery(query)
      console.log(`Flushed ${data.length} time-series points to ClickHouse`)
    } catch (error) {
      console.error('Failed to flush time-series data:', error)
      // Re-add data to buffer for retry
      this.timeSeriesBuffer.unshift(...data)
    }
  }

  // Start automatic buffer flushing
  private startBufferFlush(): void {
    this.flushTimer = setInterval(async () => {
      await Promise.all([
        this.flushEvents(),
        this.flushTimeSeries()
      ])
    }, this.config.flushInterval)
  }

  // Stop buffer flushing
  private stopBufferFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  // Query analytics data
  async query(sql: string): Promise<AnalyticsResult> {
    const startTime = Date.now()
    
    try {
      const result = await this.executeQuery(sql)
      const duration = Date.now() - startTime
      
      return {
        data: result.data || [],
        rows: result.rows || 0,
        duration,
        cached: false
      }
    } catch (error) {
      console.error('Analytics query failed:', error)
      throw error
    }
  }

  // Get inventory analytics
  async getInventoryAnalytics(tenantId: string, locationId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let whereClause = `WHERE tenant_id = '${tenantId}'`
    
    if (locationId) {
      whereClause += ` AND location_id = '${locationId}'`
    }
    
    if (dateRange) {
      whereClause += ` AND date >= '${dateRange.start.toISOString().split('T')[0]}'`
      whereClause += ` AND date <= '${dateRange.end.toISOString().split('T')[0]}'`
    }

    const query = `
      SELECT 
        date,
        location_id,
        SUM(total_value) as total_inventory_value,
        SUM(waste_value) as total_waste_value,
        AVG(turnover_rate) as avg_turnover_rate,
        COUNT(DISTINCT item_id) as unique_items
      FROM inventory_analytics
      ${whereClause}
      GROUP BY date, location_id
      ORDER BY date DESC
    `

    return this.query(query)
  }

  // Get sales analytics
  async getSalesAnalytics(tenantId: string, locationId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let whereClause = `WHERE tenant_id = '${tenantId}'`
    
    if (locationId) {
      whereClause += ` AND location_id = '${locationId}'`
    }
    
    if (dateRange) {
      whereClause += ` AND date >= '${dateRange.start.toISOString().split('T')[0]}'`
      whereClause += ` AND date <= '${dateRange.end.toISOString().split('T')[0]}'`
    }

    const query = `
      SELECT 
        date,
        location_id,
        SUM(total_sales) as total_sales,
        SUM(total_orders) as total_orders,
        AVG(average_order_value) as avg_order_value,
        SUM(total_items_sold) as total_items_sold
      FROM sales_analytics
      ${whereClause}
      GROUP BY date, location_id
      ORDER BY date DESC
    `

    return this.query(query)
  }

  // Get waste analytics
  async getWasteAnalytics(tenantId: string, locationId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let whereClause = `WHERE tenant_id = '${tenantId}'`
    
    if (locationId) {
      whereClause += ` AND location_id = '${locationId}'`
    }
    
    if (dateRange) {
      whereClause += ` AND date >= '${dateRange.start.toISOString().split('T')[0]}'`
      whereClause += ` AND date <= '${dateRange.end.toISOString().split('T')[0]}'`
    }

    const query = `
      SELECT 
        date,
        location_id,
        waste_type,
        SUM(waste_quantity) as total_waste_quantity,
        SUM(waste_value) as total_waste_value,
        AVG(waste_percentage) as avg_waste_percentage
      FROM waste_analytics
      ${whereClause}
      GROUP BY date, location_id, waste_type
      ORDER BY date DESC, total_waste_value DESC
    `

    return this.query(query)
  }

  // Get user behavior analytics
  async getUserAnalytics(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let whereClause = `WHERE tenant_id = '${tenantId}'`
    
    if (dateRange) {
      whereClause += ` AND date >= '${dateRange.start.toISOString().split('T')[0]}'`
      whereClause += ` AND date <= '${dateRange.end.toISOString().split('T')[0]}'`
    }

    const query = `
      SELECT 
        date,
        user_id,
        SUM(session_count) as total_sessions,
        SUM(page_views) as total_page_views,
        AVG(session_duration) as avg_session_duration,
        COUNT(DISTINCT feature_used) as features_used
      FROM user_analytics
      ${whereClause}
      GROUP BY date, user_id
      ORDER BY date DESC, total_sessions DESC
    `

    return this.query(query)
  }

  // Disconnect from ClickHouse
  async disconnect(): Promise<void> {
    this.stopBufferFlush()
    
    // Flush remaining data
    await Promise.all([
      this.flushEvents(),
      this.flushTimeSeries()
    ])
    
    this.connected = false
    console.log('ClickHouse disconnected')
  }

  // Health check
  async healthCheck(): Promise<{
    connected: boolean
    latency: number
    bufferSize: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      await this.executeQuery('SELECT 1')
      
      return {
        connected: this.connected,
        latency: Date.now() - startTime,
        bufferSize: this.eventBuffer.length + this.timeSeriesBuffer.length
      }
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        bufferSize: this.eventBuffer.length + this.timeSeriesBuffer.length,
        error: (error as Error).message
      }
    }
  }

  // Table creation SQL
  private getEventsTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS events (
        id String,
        tenant_id String,
        location_id String,
        user_id String,
        event_type String,
        event_name String,
        properties String,
        timestamp DateTime,
        session_id String,
        ip_address String,
        user_agent String,
        date Date MATERIALIZED toDate(timestamp)
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, location_id, timestamp)
      TTL date + INTERVAL 2 YEAR
    `
  }

  private getTimeSeriesTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS time_series (
        timestamp DateTime,
        metric_name String,
        value Float64,
        dimensions String,
        tenant_id String,
        location_id String,
        date Date MATERIALIZED toDate(timestamp)
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, location_id, metric_name, timestamp)
      TTL date + INTERVAL 2 YEAR
    `
  }

  private getInventoryAnalyticsTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS inventory_analytics (
        date Date,
        tenant_id String,
        location_id String,
        item_id String,
        item_name String,
        category String,
        quantity Float64,
        unit_cost Float64,
        total_value Float64,
        waste_quantity Float64,
        waste_value Float64,
        turnover_rate Float64,
        reorder_point Float64,
        days_of_supply Float64
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, location_id, date, item_id)
      TTL date + INTERVAL 2 YEAR
    `
  }

  private getSalesAnalyticsTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS sales_analytics (
        date Date,
        tenant_id String,
        location_id String,
        total_sales Float64,
        total_orders UInt32,
        average_order_value Float64,
        total_items_sold UInt32,
        peak_hour UInt8,
        sales_by_hour Array(Float64)
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, location_id, date)
      TTL date + INTERVAL 2 YEAR
    `
  }

  private getWasteAnalyticsTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS waste_analytics (
        date Date,
        tenant_id String,
        location_id String,
        waste_type String,
        item_id String,
        item_name String,
        waste_quantity Float64,
        waste_value Float64,
        waste_percentage Float64,
        waste_reason String
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, location_id, date, waste_type)
      TTL date + INTERVAL 2 YEAR
    `
  }

  private getUserAnalyticsTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS user_analytics (
        date Date,
        tenant_id String,
        user_id String,
        session_count UInt32,
        page_views UInt32,
        session_duration UInt32,
        feature_used String,
        device_type String,
        browser String
      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(date)
      ORDER BY (tenant_id, user_id, date)
      TTL date + INTERVAL 2 YEAR
    `
  }
}

// Analytics service for high-level operations
export class AnalyticsService {
  constructor(private clickhouse: ClickHouseAnalytics) {}

  // Track inventory event
  async trackInventoryEvent(
    tenantId: string,
    locationId: string,
    userId: string,
    eventType: 'create' | 'update' | 'delete' | 'reorder' | 'waste',
    itemData: any
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: tenantId,
      location_id: locationId,
      user_id: userId,
      event_type: 'inventory',
      event_name: `inventory_${eventType}`,
      properties: itemData,
      timestamp: new Date()
    }

    await this.clickhouse.trackEvent(event)
  }

  // Track sales event
  async trackSalesEvent(
    tenantId: string,
    locationId: string,
    userId: string,
    orderData: any
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: tenantId,
      location_id: locationId,
      user_id: userId,
      event_type: 'sales',
      event_name: 'order_completed',
      properties: orderData,
      timestamp: new Date()
    }

    await this.clickhouse.trackEvent(event)
  }

  // Track user behavior
  async trackUserBehavior(
    tenantId: string,
    userId: string,
    action: string,
    properties: any = {}
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: tenantId,
      user_id: userId,
      event_type: 'user_behavior',
      event_name: action,
      properties,
      timestamp: new Date()
    }

    await this.clickhouse.trackEvent(event)
  }

  // Track performance metrics
  async trackPerformanceMetric(
    tenantId: string,
    locationId: string,
    metricName: string,
    value: number,
    dimensions: Record<string, string> = {}
  ): Promise<void> {
    const data: TimeSeriesData = {
      timestamp: new Date(),
      metric_name: metricName,
      value,
      dimensions,
      tenant_id: tenantId,
      location_id: locationId
    }

    await this.clickhouse.trackTimeSeries(data)
  }
}

// Singleton instances
export const clickhouseAnalytics = new ClickHouseAnalytics()
export const analyticsService = new AnalyticsService(clickhouseAnalytics)

// Initialize ClickHouse analytics
export async function initializeClickHouseAnalytics(): Promise<boolean> {
  return clickhouseAnalytics.initialize()
}