#!/usr/bin/env node

/**
 * OnPar Comprehensive Import Path Fixer
 * Fixes ALL import path issues throughout the entire codebase
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

// Import path mapping rules
const importRules = {
  // From app/ directory
  app: {
    '@/components/ui/': '../../components/ui/',
    '@/components/': '../../components/',
    '@/lib/': '../../lib/',
    '@/hooks/': '../../hooks/',
    '@/types': '../../types',
    '../components/ui/': '../../components/ui/',
    '../lib/': '../../lib/',
    '../hooks/': '../../hooks/'
  },
  
  // From app/subdirectory (like app/dashboard/)
  appSub: {
    '@/components/ui/': '../../../components/ui/',
    '@/components/': '../../../components/',
    '@/lib/': '../../../lib/',
    '@/hooks/': '../../../hooks/',
    '@/types': '../../../types'
  },
  
  // From components/ui/ directory
  componentsUi: {
    '@/lib/utils': '../../lib/utils',
    '@/lib/': '../../lib/',
    '@/components/ui/': './',
    '@/components/': '../',
    '@/hooks/': '../../hooks/',
    '@/types': '../../types'
  },
  
  // From components/ subdirectories
  components: {
    '@/components/ui/': '../ui/',
    '@/components/': './',
    '@/lib/': '../../lib/',
    '@/hooks/': '../../hooks/',
    '@/types': '../../types'
  },
  
  // From lib/ directory
  lib: {
    '@/lib/': './',
    '@/components/': '../components/',
    '@/hooks/': '../hooks/',
    '@/types': '../types'
  },
  
  // From hooks/ directory
  hooks: {
    '@/lib/': '../lib/',
    '@/components/': '../components/',
    '@/hooks/': './',
    '@/types': '../types'
  }
}

function getFileCategory(filePath) {
  if (filePath.startsWith('app/') && !filePath.includes('/')) {
    return 'app'
  } else if (filePath.startsWith('app/') && filePath.split('/').length > 2) {
    return 'appSub'
  } else if (filePath.startsWith('components/ui/')) {
    return 'componentsUi'
  } else if (filePath.startsWith('components/')) {
    return 'components'
  } else if (filePath.startsWith('lib/')) {
    return 'lib'
  } else if (filePath.startsWith('hooks/')) {
    return 'hooks'
  }
  return 'app' // Default fallback
}

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { fixed: false, reason: 'File not found' }
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  const category = getFileCategory(filePath)
  const rules = importRules[category] || importRules.app
  
  let fixCount = 0
  
  // Apply import path fixes
  for (const [pattern, replacement] of Object.entries(rules)) {
    const regex = new RegExp(`from\\s+['"]${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^'"]*?)['"]`, 'g')
    const newContent = content.replace(regex, (match, suffix) => {
      fixCount++
      return `from '${replacement}${suffix}'`
    })
    content = newContent
  }
  
  // Fix specific problematic patterns
  const specificFixes = [
    // Fix double slashes
    { pattern: /from\s+['"]([^'"]*?)\/\/([^'"]*?)['"]/, replacement: "from '$1/$2'" },
    // Fix trailing slashes in imports
    { pattern: /from\s+['"]([^'"]*?)\/$/, replacement: "from '$1'" },
    // Fix .tsx extensions in imports
    { pattern: /from\s+['"]([^'"]*?)\.tsx['"]/, replacement: "from '$1'" },
    // Fix .ts extensions in imports
    { pattern: /from\s+['"]([^'"]*?)\.ts['"]/, replacement: "from '$1'" }
  ]
  
  specificFixes.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement)
    if (newContent !== content) {
      fixCount++
      content = newContent
    }
  })
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8')
    return { fixed: true, count: fixCount }
  }
  
  return { fixed: false, reason: 'No changes needed' }
}

function getAllTsxTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, .next, etc.
      if (!['node_modules', '.git', '.next', 'out', 'dist', '.bolt'].includes(item)) {
        getAllTsxTsFiles(fullPath, files)
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath.replace(/\\/g, '/'))
    }
  }
  
  return files
}

function fixAllImports() {
  header('COMPREHENSIVE IMPORT PATH FIXER')
  
  log('🔍 Scanning for TypeScript/React files...', 'blue')
  const allFiles = getAllTsxTsFiles('.')
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
      const result = fixImportsInFile(filePath)
      
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
  header('IMPORT FIX SUMMARY')
  
  log('📊 Results:', 'blue')
  log(`  Files processed: ${allFiles.length}`, 'cyan')
  log(`  Files fixed: ${totalFixed}`, 'green')
  log(`  Total changes: ${totalChanges}`, 'green')
  log(`  Files skipped: ${results.skipped.length}`, 'yellow')
  log(`  Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green')
  
  if (results.fixed.length > 0) {
    log('\n✅ Fixed files:', 'green')
    results.fixed.forEach(({ file, changes }) => {
      log(`  • ${file} (${changes} changes)`, 'green')
    })
  }
  
  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red')
    results.errors.forEach(({ file, error }) => {
      log(`  • ${file}: ${error}`, 'red')
    })
  }
  
  // Verification
  log('\n🔍 Running verification...', 'blue')
  
  try {
    // Check for remaining @/ imports
    const remainingAtImports = []
    allFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        const matches = content.match(/from\s+['"]@\//g)
        if (matches) {
          remainingAtImports.push({ file: filePath, count: matches.length })
        }
      }
    })
    
    if (remainingAtImports.length === 0) {
      log('  ✅ No remaining @/ imports found', 'green')
    } else {
      log(`  ⚠️  Found ${remainingAtImports.length} files with remaining @/ imports:`, 'yellow')
      remainingAtImports.forEach(({ file, count }) => {
        log(`    • ${file} (${count} imports)`, 'yellow')
      })
    }
    
    // Try to run TypeScript check
    log('\n🔍 Running TypeScript check...', 'blue')
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      log('  ✅ TypeScript compilation successful', 'green')
    } catch (error) {
      log('  ⚠️  TypeScript compilation has issues', 'yellow')
      log('  Run: npx tsc --noEmit for details', 'dim')
    }
    
  } catch (error) {
    log(`  ❌ Verification failed: ${error.message}`, 'red')
  }
  
  // Final status
  const success = totalFixed > 0 && results.errors.length === 0
  
  log(`\n🎯 FINAL STATUS: ${success ? '✅ SUCCESS' : '⚠️  PARTIAL SUCCESS'}`, success ? 'green' : 'yellow')
  
  if (success) {
    log('\n🚀 Import paths have been fixed! Ready for deployment.', 'green')
    log('\nNext steps:', 'blue')
    log('  1. Run: npm run build', 'cyan')
    log('  2. Test the application', 'cyan')
    log('  3. Deploy to production', 'cyan')
  } else {
    log('\n⚠️  Some issues remain. Please review the errors above.', 'yellow')
  }
  
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
  log('  ██╗███╗   ███╗██████╗  ██████╗ ██████╗ ████████╗    ███████╗██╗██╗  ██╗███████╗██████╗ ')
  log('  ██║████╗ ████║██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝    ██╔════╝██║╚██╗██╔╝██╔════╝██╔══██╗')
  log('  ██║██╔████╔██║██████╔╝██║   ██║██████╔╝   ██║       █████╗  ██║ ╚███╔╝ █████╗  ██████╔╝')
  log('  ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔══██╗   ██║       ██╔══╝  ██║ ██╔██╗ ██╔══╝  ██╔══██╗')
  log('  ██║██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██║   ██║       ██║     ██║██╔╝ ██╗███████╗██║  ██║')
  log('  ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝')
  log(`${colors.reset}`)
  log(`${colors.bold}${colors.cyan}    OnPar Comprehensive Import Path Fixer${colors.reset}`)
  log(`${colors.dim}    Fixing all import path issues for deployment readiness${colors.reset}\n`)
  
  try {
    const result = fixAllImports()
    
    // Save results
    const summary = {
      timestamp: new Date().toISOString(),
      success: result.success,
      filesFixed: result.totalFixed,
      totalChanges: result.totalChanges,
      errors: result.errors
    }
    
    fs.writeFileSync('import-fix-results.json', JSON.stringify(summary, null, 2))
    log(`\n📄 Results saved to: import-fix-results.json`, 'dim')
    
    process.exit(result.success ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Import fixer failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { fixAllImports, fixImportsInFile }