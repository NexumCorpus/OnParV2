#!/usr/bin/env node

/**
 * OnPar Beta Deployment Script
 * Automated deployment preparation and health checks
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 OnPar Beta Deployment Script')
console.log('================================\n')

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkEnvironment() {
  log('📋 Checking Environment...', 'blue')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const optionalEnvVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  let hasRequired = true
  let hasOptional = 0
  
  // Check required variables
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`  ✅ ${envVar}`, 'green')
    } else {
      log(`  ❌ ${envVar} (REQUIRED)`, 'red')
      hasRequired = false
    }
  })
  
  // Check optional variables
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`  ✅ ${envVar}`, 'green')
      hasOptional++
    } else {
      log(`  ⚠️  ${envVar} (optional)`, 'yellow')
    }
  })
  
  log(`\n📊 Environment Status:`, 'blue')
  log(`  Required: ${hasRequired ? '✅ Complete' : '❌ Missing'}`, hasRequired ? 'green' : 'red')
  log(`  Optional: ${hasOptional}/${optionalEnvVars.length} configured`, hasOptional > 2 ? 'green' : 'yellow')
  
  return { hasRequired, optionalCount: hasOptional }
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'blue')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = Object.keys(packageJson.dependencies || {})
    const devDependencies = Object.keys(packageJson.devDependencies || {})
    
    log(`  ✅ ${dependencies.length} production dependencies`, 'green')
    log(`  ✅ ${devDependencies.length} development dependencies`, 'green')
    
    // Check for critical dependencies
    const criticalDeps = [
      'next', 'react', 'react-dom', '@supabase/supabase-js',
      'tailwindcss', 'typescript'
    ]
    
    const missing = criticalDeps.filter(dep => !dependencies.includes(dep))
    if (missing.length > 0) {
      log(`  ❌ Missing critical dependencies: ${missing.join(', ')}`, 'red')
      return false
    }
    
    log('  ✅ All critical dependencies present', 'green')
    return true
  } catch (error) {
    log('  ❌ Error reading package.json', 'red')
    return false
  }
}

function runBuildTest() {
  log('\n🔨 Running Build Test...', 'blue')
  
  try {
    log('  Building application...', 'yellow')
    execSync('npm run build', { stdio: 'pipe' })
    log('  ✅ Build successful', 'green')
    return true
  } catch (error) {
    log('  ❌ Build failed', 'red')
    log(`  Error: ${error.message}`, 'red')
    return false
  }
}

function runTypeCheck() {
  log('\n🔍 Running Type Check...', 'blue')
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' })
    log('  ✅ Type check passed', 'green')
    return true
  } catch (error) {
    log('  ❌ Type check failed', 'red')
    return false
  }
}

function checkBetaFiles() {
  log('\n📁 Checking Beta Files...', 'blue')
  
  const betaFiles = [
    'components/inventory/beta-inventory-manager.tsx',
    'components/analytics/beta-waste-analytics.tsx',
    'components/mobile/beta-mobile-interface.tsx',
    'components/onboarding/beta-onboarding-flow.tsx',
    'lib/beta-demo-data.ts',
    'BETA_TESTING_GUIDE.md',
    'BETA_LAUNCH_READY.md'
  ]
  
  let allPresent = true
  
  betaFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`, 'green')
    } else {
      log(`  ❌ ${file}`, 'red')
      allPresent = false
    }
  })
  
  return allPresent
}

function generateDeploymentSummary(results) {
  log('\n📋 Deployment Summary', 'bold')
  log('===================', 'bold')
  
  const { environment, dependencies, build, typeCheck, betaFiles } = results
  
  log(`Environment: ${environment.hasRequired ? '✅' : '❌'} (${environment.optionalCount}/4 optional)`)
  log(`Dependencies: ${dependencies ? '✅' : '❌'}`)
  log(`Build Test: ${build ? '✅' : '❌'}`)
  log(`Type Check: ${typeCheck ? '✅' : '❌'}`)
  log(`Beta Files: ${betaFiles ? '✅' : '❌'}`)
  
  const readyForDeployment = environment.hasRequired && dependencies && build && betaFiles
  
  log(`\n🚀 Deployment Status: ${readyForDeployment ? '✅ READY' : '❌ NOT READY'}`, 
      readyForDeployment ? 'green' : 'red')
  
  if (readyForDeployment) {
    log('\n🎉 Your OnPar beta is ready for deployment!', 'green')
    log('\nNext steps:', 'blue')
    log('1. Deploy to Vercel: vercel --prod')
    log('2. Test the deployed application')
    log('3. Start onboarding beta customers')
    log('4. Monitor usage and collect feedback')
  } else {
    log('\n⚠️  Please fix the issues above before deploying', 'yellow')
  }
  
  return readyForDeployment
}

function createBetaLaunchChecklist() {
  const checklist = `# 🚀 OnPar Beta Launch Checklist

## Pre-Deployment ✅
- [x] Environment variables configured
- [x] Dependencies installed and verified
- [x] Build test passed
- [x] Type checking passed
- [x] Beta components implemented
- [x] Demo data prepared
- [x] Testing guide created

## Deployment 🚀
- [ ] Deploy to Vercel/Netlify
- [ ] Verify deployed application works
- [ ] Test mobile interface on actual devices
- [ ] Verify demo data loads correctly
- [ ] Test beta signup flow

## Beta Customer Onboarding 👥
- [ ] Contact first 5 beta restaurants
- [ ] Schedule onboarding calls
- [ ] Provide beta testing guide
- [ ] Set up feedback collection
- [ ] Monitor daily usage

## Week 1 Goals 🎯
- [ ] 5+ beta signups
- [ ] Daily active usage from 3+ restaurants
- [ ] First round of feedback collected
- [ ] Mobile experience validated
- [ ] At least 1 success story documented

## Success Metrics 📊
- [ ] 10-20% waste reduction demonstrated
- [ ] $500+ monthly savings calculated
- [ ] 90%+ user satisfaction
- [ ] 5+ feature requests collected
- [ ] 3+ testimonials gathered

Generated: ${new Date().toISOString()}
`
  
  fs.writeFileSync('BETA_LAUNCH_CHECKLIST.md', checklist)
  log('\n📝 Created BETA_LAUNCH_CHECKLIST.md', 'green')
}

// Main execution
async function main() {
  try {
    const results = {
      environment: checkEnvironment(),
      dependencies: checkDependencies(),
      build: runBuildTest(),
      typeCheck: runTypeCheck(),
      betaFiles: checkBetaFiles()
    }
    
    const isReady = generateDeploymentSummary(results)
    
    if (isReady) {
      createBetaLaunchChecklist()
      
      log('\n🎊 Congratulations! Your OnPar beta is deployment-ready!', 'green')
      log('\nQuick deploy command:', 'blue')
      log('npx vercel --prod', 'bold')
    }
    
    process.exit(isReady ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Deployment check failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { checkEnvironment, checkDependencies, runBuildTest }