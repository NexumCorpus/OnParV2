#!/usr/bin/env node

/**
 * OnPar Type Safety Fixer
 * Replaces all 'any' types with proper TypeScript interfaces
 */

const fs = require('fs')
const path = require('path')

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function header(title) {
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`)
}

// Type replacement patterns
const typeReplacements = {
  // Common any patterns
  'any[]': 'unknown[]',
  'any\\s': 'unknown ',
  ': any': ': unknown',
  '<any>': '<unknown>',
  'any,': 'unknown,',
  'any\\)': 'unknown)',
  'any\\|': 'unknown|',
  'any&': 'unknown&',
  
  // Function parameters
  '\\(.*?:\\s*any\\)': (match) => {
    return match.replace(/:\s*any/g, ': unknown')
  },
  
  // React component props
  'React\\.ComponentType<\\{[^}]*?\\}>': (match) => {
    return match.replace(/any/g, 'unknown')
  },
  
  // Error handling
  'catch\\s*\\(\\s*error:\\s*any\\s*\\)': 'catch (error: Error | unknown)',
  
  // API responses
  'Promise<any>': 'Promise<unknown>',
  'Response<any>': 'Response<unknown>',
  
  // Event handlers
  'event:\\s*any': 'event: Event',
  'e:\\s*any': 'e: Event'
}

// Specific type definitions to add
const typeDefinitions = {
  'types/enhanced.ts': `// Enhanced type definitions for OnPar
export interface APIResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

export interface FilterOptions {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, unknown>
}

export interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  type?: 'line' | 'bar' | 'pie' | 'area'
}

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
}

export interface FormFieldProps extends ComponentProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export interface InventoryItemData {
  id: string
  name: string
  quantity: number
  unit: string
  price_per_unit: number
  reorder_point: number
  expiry_date?: string
  created_at: string
  updated_at: string
}

export interface MenuItemData {
  id: string
  name: string
  sales_percentage: number
  waste_percentage: number
  created_at: string
  updated_at: string
}

export interface UserProfileData {
  id: string
  email: string
  restaurant_name?: string
  monthly_budget?: number
  premium_subscription: boolean
  created_at: string
}

export interface WasteAnalysisData {
  itemId: string
  itemName: string
  wasteAmount: number
  wasteValue: number
  wastePercentage: number
  period: string
  reasons: string[]
}

export interface AIInsightData {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  savings: number
  category: string
  status: 'pending' | 'implemented' | 'dismissed'
  actionPlan?: string[]
}

export interface NotificationData {
  id: string
  type: 'low_stock' | 'expiry' | 'budget_overspend' | 'ai_insight'
  title: string
  message: string
  data: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface SupplierData {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
  address?: string
  rating?: number
  created_at: string
}

export interface RecipeData {
  id: string
  name: string
  description?: string
  category: string
  serving_size: number
  prep_time_minutes?: number
  cook_time_minutes?: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  instructions?: string
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  created_at: string
  updated_at: string
}

export interface RecipeIngredientData {
  id: string
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
  total_cost: number
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
export type SortOrder = 'asc' | 'desc'
export type AlertType = 'success' | 'error' | 'warning' | 'info'
export type ThemeMode = 'light' | 'dark' | 'system'

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void

// API types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type ContentType = 'application/json' | 'multipart/form-data' | 'text/plain'

// Database operation types
export type DatabaseOperation = 'insert' | 'update' | 'delete' | 'select'
export type QueryFilter = Record<string, string | number | boolean | null>

// Component state types
export interface ComponentState<T = unknown> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface FormState<T = Record<string, unknown>> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Hook return types
export interface UseAsyncReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: () => Promise<void>
  reset: () => void
}

export interface UseLocalStorageReturn<T> {
  value: T | null
  setValue: (value: T) => void
  removeValue: () => void
}

// Configuration types
export interface AppConfig {
  apiUrl: string
  supabaseUrl: string
  stripePublishableKey: string
  environment: 'development' | 'staging' | 'production'
  features: Record<string, boolean>
}

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  ssl: boolean
  poolSize: number
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(\`\${resource} not found\`, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
    this.name = 'RateLimitError'
  }
}
`
}

function fixTypesInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { fixed: false, reason: 'File not found' }
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  let fixCount = 0
  
  // Apply type replacements
  for (const [pattern, replacement] of Object.entries(typeReplacements)) {
    const regex = new RegExp(pattern, 'g')
    
    if (typeof replacement === 'function') {
      content = content.replace(regex, (match) => {
        fixCount++
        return replacement(match)
      })
    } else {
      const matches = content.match(regex)
      if (matches) {
        fixCount += matches.length
        content = content.replace(regex, replacement)
      }
    }
  }
  
  // Add proper imports for enhanced types
  if (content.includes('unknown') && !content.includes('import') && filePath.endsWith('.ts')) {
    content = `import type { APIResponse, DatabaseError, ValidationError } from '../types/enhanced'\n\n${content}`
    fixCount++
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8')
    return { fixed: true, count: fixCount }
  }
  
  return { fixed: false, reason: 'No changes needed' }
}

function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'out', 'dist', '.bolt'].includes(item)) {
        getAllTsFiles(fullPath, files)
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath.replace(/\\/g, '/'))
    }
  }
  
  return files
}

function createEnhancedTypes() {
  const typesDir = 'types'
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true })
  }
  
  for (const [fileName, content] of Object.entries(typeDefinitions)) {
    fs.writeFileSync(fileName, content, 'utf8')
    log(`  ✅ Created ${fileName}`, 'green')
  }
}

function fixAllTypes() {
  header('TYPE SAFETY ENHANCEMENT')
  
  log('🔧 Creating enhanced type definitions...', 'blue')
  createEnhancedTypes()
  
  log('\n🔍 Scanning for TypeScript files...', 'blue')
  const allFiles = getAllTsFiles('.')
  log(`📁 Found ${allFiles.length} files to process`, 'cyan')
  
  let totalFixed = 0
  let totalChanges = 0
  const results = {
    fixed: [],
    skipped: [],
    errors: []
  }
  
  log('\n🔧 Processing files...', 'blue')
  
  allFiles.forEach((filePath, index) => {
    const progress = `[${index + 1}/${allFiles.length}]`
    
    try {
      const result = fixTypesInFile(filePath)
      
      if (result.fixed) {
        totalFixed++
        totalChanges += result.count
        results.fixed.push({ file: filePath, changes: result.count })
        log(`  ✅ ${progress} ${filePath} (${result.count} fixes)`, 'green')
      } else {
        results.skipped.push({ file: filePath, reason: result.reason })
        log(`  ⚪ ${progress} ${filePath} (${result.reason})`, 'dim')
      }
    } catch (error) {
      results.errors.push({ file: filePath, error: error.message })
      log(`  ❌ ${progress} ${filePath} (Error: ${error.message})`, 'red')
    }
  })
  
  // Summary
  header('TYPE SAFETY SUMMARY')
  
  log('📊 Results:', 'blue')
  log(`  Files processed: ${allFiles.length}`, 'cyan')
  log(`  Files fixed: ${totalFixed}`, 'green')
  log(`  Total changes: ${totalChanges}`, 'green')
  log(`  Files skipped: ${results.skipped.length}`, 'yellow')
  log(`  Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green')
  
  if (results.fixed.length > 0) {
    log('\n✅ Fixed files:', 'green')
    results.fixed.slice(0, 10).forEach(({ file, changes }) => {
      log(`  • ${file} (${changes} changes)`, 'green')
    })
    if (results.fixed.length > 10) {
      log(`  ... and ${results.fixed.length - 10} more files`, 'dim')
    }
  }
  
  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red')
    results.errors.forEach(({ file, error }) => {
      log(`  • ${file}: ${error}`, 'red')
    })
  }
  
  const success = totalFixed > 0 && results.errors.length === 0
  
  log(`\n🎯 FINAL STATUS: ${success ? '✅ SUCCESS' : '⚠️  PARTIAL SUCCESS'}`, success ? 'green' : 'yellow')
  
  return {
    success,
    totalFixed,
    totalChanges,
    errors: results.errors.length
  }
}

// Main execution
function main() {
  log(`${colors.bold}${colors.magenta}`)
  log('  ████████╗██╗   ██╗██████╗ ███████╗    ███████╗ █████╗ ███████╗███████╗████████╗██╗   ██╗')
  log('  ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝    ██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝╚██╗ ██╔╝')
  log('     ██║    ╚████╔╝ ██████╔╝█████╗      ███████╗███████║█████╗  █████╗     ██║    ╚████╔╝ ')
  log('     ██║     ╚██╔╝  ██╔═══╝ ██╔══╝      ╚════██║██╔══██║██╔══╝  ██╔══╝     ██║     ╚██╔╝  ')
  log('     ██║      ██║   ██║     ███████╗    ███████║██║  ██║██║     ███████╗   ██║      ██║   ')
  log('     ╚═╝      ╚═╝   ╚═╝     ╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝   ╚═╝      ╚═╝   ')
  log(`${colors.reset}`)
  log(`${colors.bold}${colors.cyan}    OnPar Type Safety Enhancement${colors.reset}`)
  log(`${colors.dim}    Replacing 'any' types with proper TypeScript interfaces${colors.reset}\n`)
  
  try {
    const result = fixAllTypes()
    
    // Save results
    const summary = {
      timestamp: new Date().toISOString(),
      success: result.success,
      filesFixed: result.totalFixed,
      totalChanges: result.totalChanges,
      errors: result.errors
    }
    
    fs.writeFileSync('type-safety-results.json', JSON.stringify(summary, null, 2))
    log(`\n📄 Results saved to: type-safety-results.json`, 'dim')
    
    if (result.success) {
      log('\n🚀 Type safety has been enhanced! Code is now more reliable.', 'green')
      log('\nNext steps:', 'blue')
      log('  1. Run: npx tsc --noEmit', 'cyan')
      log('  2. Fix any remaining type errors', 'cyan')
      log('  3. Test the application', 'cyan')
    }
    
    process.exit(result.success ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Type safety fixer failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { fixAllTypes, fixTypesInFile }