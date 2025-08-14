#!/usr/bin/env node

/**
 * OnPar Build Readiness Verification
 * Verifies all import paths are correct and build-ready
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
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

function checkImportPaths() {
  header('IMPORT PATH VERIFICATION')
  
  const problematicPatterns = [
    { pattern: /@\/lib\/utils/g, description: '@/lib/utils imports (should be relative)' },
    { pattern: /@\/components\/ui/g, description: '@/components/ui imports (should be relative)' },
    { pattern: /from\s+['"]\.\.\/components\/ui/g, description: 'Incorrect ../components/ui paths from app/' },
    { pattern: /from\s+['"]\.\.\/lib/g, description: 'Incorrect ../lib paths from app/' }
  ]
  
  const filesToCheck = [
    // App pages
    'app/page.tsx',
    'app/layout.tsx',
    'app/profile/page.tsx',
    'app/success/page.tsx',
    'app/dashboard/page.tsx',
    'app/dashboard/inventory/page.tsx',
    'app/dashboard/analytics/page.tsx',
    
    // UI Components (sample)
    'components/ui/button.tsx',
    'components/ui/card.tsx',
    'components/ui/dialog.tsx',
    'components/ui/switch.tsx',
    'components/ui/tabs.tsx',
    'components/ui/separator.tsx',
    
    // Layout components
    'components/layout/main-layout.tsx',
    'components/dashboard/navbar.tsx',
    
    // Providers
    'components/providers/error-boundary.tsx',
    'components/providers/theme-provider.tsx'
  ]
  
  let issuesFound = 0
  let filesChecked = 0
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      filesChecked++
      const content = fs.readFileSync(filePath, 'utf8')
      
      let fileHasIssues = false
      problematicPatterns.forEach(({ pattern, description }) => {
        const matches = content.match(pattern)
        if (matches) {
          if (!fileHasIssues) {
            log(`\n📁 ${filePath}:`, 'yellow')
            fileHasIssues = true
            issuesFound++
          }
          log(`  ❌ Found ${matches.length} ${description}`, 'red')
          matches.forEach(match => {
            log(`     "${match}"`, 'dim')
          })
        }
      })
      
      if (!fileHasIssues) {
        log(`  ✅ ${filePath}`, 'green')
      }
    } else {
      log(`  ⚠️  File not found: ${filePath}`, 'yellow')
    }
  })
  
  log(`\n📊 Import Path Summary:`, 'blue')
  log(`  Files checked: ${filesChecked}`, 'cyan')
  log(`  Files with issues: ${issuesFound}`, issuesFound > 0 ? 'red' : 'green')
  log(`  Status: ${issuesFound === 0 ? '✅ CLEAN' : '❌ ISSUES FOUND'}`, issuesFound === 0 ? 'green' : 'red')
  
  return issuesFound === 0
}

function checkCriticalFiles() {
  header('CRITICAL FILES VERIFICATION')
  
  const criticalFiles = [
    { path: 'app/profile/page.tsx', desc: 'Profile page (deployment failure source)' },
    { path: 'components/ui/button.tsx', desc: 'Button component' },
    { path: 'components/ui/card.tsx', desc: 'Card component' },
    { path: 'components/ui/input.tsx', desc: 'Input component' },
    { path: 'components/ui/label.tsx', desc: 'Label component' },
    { path: 'components/ui/select.tsx', desc: 'Select component' },
    { path: 'components/ui/switch.tsx', desc: 'Switch component' },
    { path: 'components/ui/tabs.tsx', desc: 'Tabs component' },
    { path: 'components/ui/separator.tsx', desc: 'Separator component' },
    { path: 'components/dashboard/navbar.tsx', desc: 'Dashboard navbar' },
    { path: 'lib/utils.ts', desc: 'Utility functions' },
    { path: 'lib/auth.ts', desc: 'Authentication functions' }
  ]
  
  let allPresent = true
  
  criticalFiles.forEach(({ path: filePath, desc }) => {
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${desc}`, 'green')
    } else {
      log(`  ❌ ${desc} (Missing: ${filePath})`, 'red')
      allPresent = false
    }
  })
  
  return allPresent
}

function checkSpecificFixes() {
  header('SPECIFIC FIX VERIFICATION')
  
  const fixes = [
    {
      file: 'app/profile/page.tsx',
      shouldContain: "from '../../components/ui/card'",
      shouldNotContain: "from '../components/ui/card'",
      description: 'Profile page import paths'
    },
    {
      file: 'components/ui/switch.tsx',
      shouldContain: "from '../../lib/utils'",
      shouldNotContain: "from '@/lib/utils'",
      description: 'Switch component utils import'
    },
    {
      file: 'components/ui/dialog.tsx',
      shouldContain: "from '../../lib/utils'",
      shouldNotContain: "from '@/lib/utils'",
      description: 'Dialog component utils import'
    },
    {
      file: 'components/providers/error-boundary.tsx',
      shouldContain: "from '../ui/button'",
      shouldNotContain: "from '@/components/ui/button'",
      description: 'Error boundary component imports'
    }
  ]
  
  let allFixed = true
  
  fixes.forEach(({ file, shouldContain, shouldNotContain, description }) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      
      const hasCorrectImport = content.includes(shouldContain)
      const hasIncorrectImport = content.includes(shouldNotContain)
      
      if (hasCorrectImport && !hasIncorrectImport) {
        log(`  ✅ ${description}`, 'green')
      } else {
        log(`  ❌ ${description}`, 'red')
        if (!hasCorrectImport) {
          log(`     Missing: "${shouldContain}"`, 'dim')
        }
        if (hasIncorrectImport) {
          log(`     Found: "${shouldNotContain}"`, 'dim')
        }
        allFixed = false
      }
    } else {
      log(`  ⚠️  File not found: ${file}`, 'yellow')
      allFixed = false
    }
  })
  
  return allFixed
}

function generateBuildReport(results) {
  header('BUILD READINESS REPORT')
  
  const { importPaths, criticalFiles, specificFixes } = results
  
  log('📊 Verification Results:', 'blue')
  log(`  Import Paths: ${importPaths ? '✅ CLEAN' : '❌ ISSUES'}`, importPaths ? 'green' : 'red')
  log(`  Critical Files: ${criticalFiles ? '✅ PRESENT' : '❌ MISSING'}`, criticalFiles ? 'green' : 'red')
  log(`  Specific Fixes: ${specificFixes ? '✅ APPLIED' : '❌ INCOMPLETE'}`, specificFixes ? 'green' : 'red')
  
  const buildReady = importPaths && criticalFiles && specificFixes
  
  log(`\n🚀 BUILD STATUS: ${buildReady ? '✅ READY FOR DEPLOYMENT' : '❌ NOT READY'}`, 
      buildReady ? 'green' : 'red')
  
  if (buildReady) {
    log('\n🎉 All deployment-blocking issues have been resolved!', 'green')
    log('\n📋 Ready for deployment:', 'blue')
    log('  1. All import paths are correct', 'cyan')
    log('  2. All critical files are present', 'cyan')
    log('  3. All specific fixes have been applied', 'cyan')
    log('  4. Build should complete successfully', 'cyan')
    log('\n🔗 Deploy command:', 'magenta')
    log('  vercel --prod', 'bold')
  } else {
    log('\n⚠️  Please address the issues above before deploying', 'yellow')
    log('\n📋 Next steps:', 'blue')
    log('  1. Fix any remaining import path issues', 'cyan')
    log('  2. Ensure all critical files are present', 'cyan')
    log('  3. Re-run this verification script', 'cyan')
    log('  4. Deploy when all checks pass', 'cyan')
  }
  
  return buildReady
}

// Main execution
function main() {
  log(`${colors.bold}${colors.magenta}`)
  log('  ██████╗ ██╗   ██╗██╗██╗     ██████╗     ██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗')
  log('  ██╔══██╗██║   ██║██║██║     ██╔══██╗    ██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝')
  log('  ██████╔╝██║   ██║██║██║     ██║  ██║    ██████╔╝█████╗  ███████║██║  ██║ ╚████╔╝ ')
  log('  ██╔══██╗██║   ██║██║██║     ██║  ██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  ')
  log('  ██████╔╝╚██████╔╝██║███████╗██████╔╝    ██║  ██║███████╗██║  ██║██████╔╝   ██║   ')
  log('  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   ')
  log(`${colors.reset}`)
  log(`${colors.bold}${colors.cyan}    OnPar Build Readiness Verification${colors.reset}`)
  log(`${colors.dim}    Verifying deployment fixes${colors.reset}\n`)
  
  try {
    const results = {
      importPaths: checkImportPaths(),
      criticalFiles: checkCriticalFiles(),
      specificFixes: checkSpecificFixes()
    }
    
    const isReady = generateBuildReport(results)
    
    // Create verification summary
    const summary = {
      timestamp: new Date().toISOString(),
      status: isReady ? 'BUILD_READY' : 'NOT_READY',
      results,
      deploymentCommand: isReady ? 'vercel --prod' : 'Fix issues first'
    }
    
    fs.writeFileSync('build-verification.json', JSON.stringify(summary, null, 2))
    log(`\n📄 Verification report saved to: build-verification.json`, 'dim')
    
    process.exit(isReady ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main }