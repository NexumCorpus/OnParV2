/**
 * Enterprise Database Migration System
 * 
 * Provides version control and rollback capabilities for database migrations
 * with enterprise-grade safety features and monitoring.
 */

import { enterpriseDB } from './enterprise-database'
import { createClient } from '@supabase/supabase-js'

// Migration metadata interface
export interface Migration {
  id: string
  version: string
  name: string
  description: string
  sql: string
  rollbackSql?: string
  checksum: string
  appliedAt?: Date
  appliedBy?: string
  rollbackAt?: Date
  rollbackBy?: string
  status: 'pending' | 'applied' | 'failed' | 'rolled_back'
  executionTime?: number
  error?: string
}

// Migration execution result
export interface MigrationResult {
  success: boolean
  migration: Migration
  executionTime: number
  error?: string
  warnings?: string[]
}

// Migration system configuration
export interface MigrationConfig {
  autoApply: boolean
  backupBeforeMigration: boolean
  validateChecksums: boolean
  maxRetries: number
  timeoutMs: number
}

export class DatabaseMigrationSystem {
  private client = enterpriseDB.getPrimaryClient()
  private config: MigrationConfig

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      autoApply: false,
      backupBeforeMigration: true,
      validateChecksums: true,
      maxRetries: 3,
      timeoutMs: 300000, // 5 minutes
      ...config
    }
  }

  // Initialize migration system
  async initialize(): Promise<void> {
    await this.createMigrationTables()
  }

  // Create migration tracking tables
  private async createMigrationTables(): Promise<void> {
    const migrationTableSql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        version text UNIQUE NOT NULL,
        name text NOT NULL,
        description text,
        checksum text NOT NULL,
        applied_at timestamptz DEFAULT now(),
        applied_by uuid REFERENCES auth.users(id),
        execution_time_ms integer,
        status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'failed', 'rolled_back')),
        error_message text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS migration_rollbacks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_version text NOT NULL REFERENCES schema_migrations(version),
        rollback_sql text NOT NULL,
        rolled_back_at timestamptz DEFAULT now(),
        rolled_back_by uuid REFERENCES auth.users(id),
        reason text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS migration_backups (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_version text NOT NULL,
        backup_name text NOT NULL,
        backup_size bigint,
        backup_location text,
        created_at timestamptz DEFAULT now(),
        restored_at timestamptz,
        status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'restored', 'deleted'))
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON schema_migrations(status);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);
      CREATE INDEX IF NOT EXISTS idx_migration_rollbacks_version ON migration_rollbacks(migration_version);
      CREATE INDEX IF NOT EXISTS idx_migration_backups_version ON migration_backups(migration_version);
    `

    const { error } = await this.client.rpc('exec_sql', { sql: migrationTableSql })
    if (error) {
      throw new Error(`Failed to create migration tables: ${error.message}`)
    }
  }

  // Get all applied migrations
  async getAppliedMigrations(): Promise<Migration[]> {
    const { data, error } = await this.client
      .from('schema_migrations')
      .select('*')
      .order('applied_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get applied migrations: ${error.message}`)
    }

    return (data || []).map(this.mapToMigration)
  }

  // Get pending migrations
  async getPendingMigrations(availableMigrations: Migration[]): Promise<Migration[]> {
    const appliedMigrations = await this.getAppliedMigrations()
    const appliedVersions = new Set(appliedMigrations.map(m => m.version))
    
    return availableMigrations.filter(m => !appliedVersions.has(m.version))
  }

  // Apply a single migration
  async applyMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = Date.now()
    let backupId: string | null = null

    try {
      // Validate migration
      await this.validateMigration(migration)

      // Create backup if configured
      if (this.config.backupBeforeMigration) {
        backupId = await this.createBackup(migration.version)
      }

      // Execute migration in transaction
      const { error: migrationError } = await this.client.rpc('apply_migration', {
        migration_sql: migration.sql,
        migration_version: migration.version,
        migration_name: migration.name,
        migration_description: migration.description,
        migration_checksum: migration.checksum
      })

      if (migrationError) {
        throw new Error(migrationError.message)
      }

      const executionTime = Date.now() - startTime

      // Record successful migration
      await this.recordMigration(migration, 'applied', executionTime)

      return {
        success: true,
        migration: { ...migration, status: 'applied', executionTime },
        executionTime
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = (error as Error).message

      // Record failed migration
      await this.recordMigration(migration, 'failed', executionTime, errorMessage)

      // Restore backup if available
      if (backupId && this.config.backupBeforeMigration) {
        await this.restoreBackup(backupId)
      }

      return {
        success: false,
        migration: { ...migration, status: 'failed', executionTime, error: errorMessage },
        executionTime,
        error: errorMessage
      }
    }
  }

  // Apply multiple migrations
  async applyMigrations(migrations: Migration[]): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []

    for (const migration of migrations) {
      const result = await this.applyMigration(migration)
      results.push(result)

      // Stop on first failure unless configured otherwise
      if (!result.success && !this.config.autoApply) {
        break
      }
    }

    return results
  }

  // Rollback a migration
  async rollbackMigration(version: string, rollbackSql: string, reason?: string): Promise<MigrationResult> {
    const startTime = Date.now()

    try {
      // Get migration to rollback
      const { data: migrationData, error: getMigrationError } = await this.client
        .from('schema_migrations')
        .select('*')
        .eq('version', version)
        .single()

      if (getMigrationError || !migrationData) {
        throw new Error(`Migration ${version} not found`)
      }

      // Execute rollback in transaction
      const { error: rollbackError } = await this.client.rpc('rollback_migration', {
        migration_version: version,
        rollback_sql: rollbackSql,
        rollback_reason: reason || 'Manual rollback'
      })

      if (rollbackError) {
        throw new Error(rollbackError.message)
      }

      const executionTime = Date.now() - startTime
      const migration = this.mapToMigration(migrationData)

      return {
        success: true,
        migration: { ...migration, status: 'rolled_back', executionTime },
        executionTime
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = (error as Error).message

      return {
        success: false,
        migration: { version, status: 'failed', executionTime, error: errorMessage } as Migration,
        executionTime,
        error: errorMessage
      }
    }
  }

  // Validate migration before applying
  private async validateMigration(migration: Migration): Promise<void> {
    // Check if migration already applied
    const { data: existing } = await this.client
      .from('schema_migrations')
      .select('version, checksum')
      .eq('version', migration.version)
      .single()

    if (existing) {
      if (this.config.validateChecksums && existing.checksum !== migration.checksum) {
        throw new Error(`Migration ${migration.version} checksum mismatch`)
      }
      throw new Error(`Migration ${migration.version} already applied`)
    }

    // Validate SQL syntax (basic check)
    if (!migration.sql || migration.sql.trim().length === 0) {
      throw new Error(`Migration ${migration.version} has empty SQL`)
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP\s+DATABASE/i,
      /DROP\s+SCHEMA/i,
      /TRUNCATE\s+TABLE/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(migration.sql)) {
        throw new Error(`Migration ${migration.version} contains dangerous operation`)
      }
    }
  }

  // Create database backup
  private async createBackup(migrationVersion: string): Promise<string> {
    const backupName = `backup_${migrationVersion}_${Date.now()}`
    
    // In a real implementation, this would create an actual database backup
    // For now, we'll just record the backup metadata
    const { data, error } = await this.client
      .from('migration_backups')
      .insert({
        migration_version: migrationVersion,
        backup_name: backupName,
        backup_size: 0,
        backup_location: `backups/${backupName}.sql`,
        status: 'created'
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create backup: ${error.message}`)
    }

    return data.id
  }

  // Restore database backup
  private async restoreBackup(backupId: string): Promise<void> {
    // In a real implementation, this would restore from the actual backup
    // For now, we'll just update the backup status
    const { error } = await this.client
      .from('migration_backups')
      .update({ 
        status: 'restored',
        restored_at: new Date().toISOString()
      })
      .eq('id', backupId)

    if (error) {
      console.error(`Failed to restore backup ${backupId}: ${error.message}`)
    }
  }

  // Record migration execution
  private async recordMigration(
    migration: Migration,
    status: 'applied' | 'failed',
    executionTime: number,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.client
      .from('schema_migrations')
      .upsert({
        version: migration.version,
        name: migration.name,
        description: migration.description,
        checksum: migration.checksum,
        execution_time_ms: executionTime,
        status,
        error_message: errorMessage
      })

    if (error) {
      console.error(`Failed to record migration: ${error.message}`)
    }
  }

  // Map database row to Migration object
  private mapToMigration(row: any): Migration {
    return {
      id: row.id,
      version: row.version,
      name: row.name,
      description: row.description || '',
      sql: '', // SQL not stored in tracking table
      checksum: row.checksum,
      appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
      appliedBy: row.applied_by,
      status: row.status,
      executionTime: row.execution_time_ms,
      error: row.error_message
    }
  }

  // Generate migration checksum
  static generateChecksum(sql: string): string {
    // Simple checksum implementation - in production, use crypto.createHash
    let hash = 0
    for (let i = 0; i < sql.length; i++) {
      const char = sql.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // Load migration from file
  static async loadMigrationFromFile(filePath: string): Promise<Migration> {
    // This would read the migration file in a real implementation
    // For now, return a placeholder
    const version = filePath.split('/').pop()?.replace('.sql', '') || ''
    
    return {
      id: '',
      version,
      name: version,
      description: '',
      sql: '',
      checksum: '',
      status: 'pending'
    }
  }

  // Get migration status summary
  async getMigrationStatus(): Promise<{
    total: number
    applied: number
    failed: number
    rolledBack: number
    lastMigration?: Migration
  }> {
    const migrations = await this.getAppliedMigrations()
    
    return {
      total: migrations.length,
      applied: migrations.filter(m => m.status === 'applied').length,
      failed: migrations.filter(m => m.status === 'failed').length,
      rolledBack: migrations.filter(m => m.status === 'rolled_back').length,
      lastMigration: migrations[migrations.length - 1]
    }
  }
}

// Create database functions for migration operations
export const migrationSystemSql = `
-- Function to apply migration in transaction
CREATE OR REPLACE FUNCTION apply_migration(
  migration_sql text,
  migration_version text,
  migration_name text,
  migration_description text,
  migration_checksum text
) RETURNS void AS $$
BEGIN
  -- Execute the migration SQL
  EXECUTE migration_sql;
  
  -- Record the migration
  INSERT INTO schema_migrations (
    version, name, description, checksum, status
  ) VALUES (
    migration_version, migration_name, migration_description, migration_checksum, 'applied'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rollback migration in transaction
CREATE OR REPLACE FUNCTION rollback_migration(
  migration_version text,
  rollback_sql text,
  rollback_reason text
) RETURNS void AS $$
BEGIN
  -- Execute the rollback SQL
  EXECUTE rollback_sql;
  
  -- Update migration status
  UPDATE schema_migrations 
  SET status = 'rolled_back'
  WHERE version = migration_version;
  
  -- Record rollback
  INSERT INTO migration_rollbacks (
    migration_version, rollback_sql, reason
  ) VALUES (
    migration_version, rollback_sql, rollback_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute arbitrary SQL (for migration system)
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

// Singleton instance
export const migrationSystem = new DatabaseMigrationSystem()

// Initialize migration system
export async function initializeMigrationSystem(): Promise<void> {
  await migrationSystem.initialize()
}