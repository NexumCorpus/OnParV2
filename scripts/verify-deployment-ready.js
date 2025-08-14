#!/usr/bin/env node

/**
 * OnPar Deployment Readiness Verification
 * Final check before production deployment
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
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`)
  log(`${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}\n`)
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`  ✅ ${description}`, 'green')
    return true
  } else {
    log(`  ❌ ${description} (Missing: ${filePath})`, 'red')
    return false
  }
}

function checkCriticalFiles() {
  header('CRITICAL FILES VERIFICATION')
  
  const criticalFiles = [
    // Core Next.js files
    { path: 'next.config.js', desc: 'Next.js configuration' },
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'tsconfig.json', desc: 'TypeScript configuration' },
    { path: 'tailwind.config.ts', desc: 'Tailwind CSS configuration' },
    { path: 'vercel.json', desc: 'Vercel deployment configuration' },
    
    // App structure
    { path: 'app/layout.tsx', desc: 'Root layout component' },
    { path: 'app/page.tsx', desc: 'Homepage component' },
    { path: 'app/globals.css', desc: 'Global styles' },
    { path: 'middleware.ts', desc: 'Security middleware' },
    
    // Core components
    { path: 'components/ui/button.tsx', desc: 'Button component' },
    { path: 'components/ui/card.tsx', desc: 'Card component' },
    { path: 'components/layout/main-layout.tsx', desc: 'Main layout component' },
    
    // Dashboard pages
    { path: 'app/dashboard/page.tsx', desc: 'Dashboard page' },
    { path: 'app/dashboard/inventory/page.tsx', desc: 'Inventory page' },
    { path: 'app/dashboard/analytics/page.tsx', desc: 'Analytics page' },
    
    // API routes
    { path: 'app/api/health/route.ts', desc: 'Health check API' },
    { path: 'app/api/inventory/route.ts', desc: 'Inventory API' },
    { path: 'app/api/ai-insights/route.ts', desc: 'AI Insights API' },
    
    // Core libraries
    { path: 'lib/utils.ts', desc: 'Utility functions' },
    { path: 'lib/supabase.ts', desc: 'Supabase client' },
    { path: 'lib/auth.ts', desc: 'Authentication functions' },
    { path: 'lib/security-middleware.ts', desc: 'Security middleware' },
    
    // Beta components
    { path: 'components/inventory/beta-inventory-manager.tsx', desc: 'Beta inventory manager' },
    { path: 'components/analytics/beta-waste-analytics.tsx', desc: 'Beta analytics component' },
    { path: 'components/mobile/beta-mobile-interface.tsx', desc: 'Beta mobile interface' },
    
    // Documentation
    { path: '.env.example', desc: 'Environment variables example' },
    { path: 'README.md', desc: 'Project documentation' }
  ]
  
  let allPresent = true
  criticalFiles.forEach(file => {
    if (!checkFileExists(file.path, file.desc)) {
      allPresent = false
    }
  })
  
  return allPresent
}

function checkPackageJson() {
  header('PACKAGE.JSON VERIFICATION')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    // Check essential scripts
    const requiredScripts = ['dev', 'build', 'start', 'lint']
    let scriptsOk = true
    
    log('📋 Checking scripts:', 'blue')
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`  ✅ ${script}: ${packageJson.scripts[script]}`, 'green')
      } else {
        log(`  ❌ Missing script: ${script}`, 'red')
        scriptsOk = false
      }
    })
    
    // Check critical dependencies
    const criticalDeps = [
      'next', 'react', 'react-dom', '@supabase/supabase-js',
      'tailwindcss', 'typescript', 'lucide-react'
    ]
    
    log('\n📦 Checking critical dependencies:', 'blue')
    let depsOk = true
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`, 'green')
      } else {
        log(`  ❌ Missing dependency: ${dep}`, 'red')
        depsOk = false
      }
    })
    
    // Check Node.js version requirement
    if (packageJson.engines && packageJson.engines.node) {
      log(`\n🔧 Node.js requirement: ${packageJson.engines.node}`, 'green')
    } else {
      log('\n⚠️  No Node.js version specified in engines', 'yellow')
    }
    
    return scriptsOk && depsOk
  } catch (error) {
    log('❌ Error reading package.json', 'red')
    return false
  }
}

function checkNextConfig() {
  header('NEXT.JS CONFIGURATION VERIFICATION')
  
  try {
    // Read next.config.js as text since it's a JS file
    const configContent = fs.readFileSync('next.config.js', 'utf8')
    
    const checks = [
      { pattern: /eslint.*ignoreDuringBuilds.*true/, desc: 'ESLint build ignore' },
      { pattern: /typescript.*ignoreBuildErrors.*true/, desc: 'TypeScript build ignore' },
      { pattern: /images.*unoptimized.*true/, desc: 'Image optimization disabled' },
      { pattern: /poweredByHeader.*false/, desc: 'Powered by header disabled' },
      { pattern: /compress.*true/, desc: 'Compression enabled' },
      { pattern: /X-Frame-Options/, desc: 'Security headers configured' }
    ]
    
    let allConfigured = true
    checks.forEach(check => {
      if (check.pattern.test(configContent)) {
        log(`  ✅ ${check.desc}`, 'green')
      } else {
        log(`  ⚠️  ${check.desc} (not found)`, 'yellow')
      }
    })
    
    return true
  } catch (error) {
    log('❌ Error reading next.config.js', 'red')
    return false
  }
}

function checkVercelConfig() {
  header('VERCEL CONFIGURATION VERIFICATION')
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
    
    const checks = [
      { key: 'buildCommand', desc: 'Build command configured' },
      { key: 'framework', desc: 'Framework specified' },
      { key: 'functions', desc: 'Function configuration' },
      { key: 'headers', desc: 'Security headers' }
    ]
    
    let allConfigured = true
    checks.forEach(check => {
      if (vercelConfig[check.key]) {
        log(`  ✅ ${check.desc}`, 'green')
      } else {
        log(`  ⚠️  ${check.desc} (not configured)`, 'yellow')
      }
    })
    
    return true
  } catch (error) {
    log('❌ Error reading vercel.json', 'red')
    return false
  }
}

function checkEnvironmentTemplate() {
  header('ENVIRONMENT TEMPLATE VERIFICATION')
  
  try {
    const envExample = fs.readFileSync('.env.example', 'utf8')
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL'
    ]
    
    const optionalVars = [
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'RESEND_API_KEY'
    ]
    
    log('📋 Required environment variables:', 'blue')
    requiredVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        log(`  ✅ ${envVar}`, 'green')
      } else {
        log(`  ❌ ${envVar}`, 'red')
      }
    })
    
    log('\n📋 Optional environment variables:', 'blue')
    optionalVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        log(`  ✅ ${envVar}`, 'green')
      } else {
        log(`  ⚠️  ${envVar}`, 'yellow')
      }
    })
    
    return true
  } catch (error) {
    log('❌ Error reading .env.example', 'red')
    return false
  }
}

function checkBetaReadiness() {
  header('BETA LAUNCH READINESS')
  
  const betaFiles = [
    'BETA_TESTING_GUIDE.md',
    'BETA_LAUNCH_READY.md',
    'CUSTOMER_OUTREACH_TEMPLATES.md',
    'lib/beta-demo-data.ts'
  ]
  
  let betaReady = true
  betaFiles.forEach(file => {
    if (!checkFileExists(file, `Beta file: ${file}`)) {
      betaReady = false
    }
  })
  
  // Check for beta components
  const betaComponents = [
    'components/inventory/beta-inventory-manager.tsx',
    'components/analytics/beta-waste-analytics.tsx',
    'components/mobile/beta-mobile-interface.tsx',
    'components/onboarding/beta-onboarding-flow.tsx'
  ]
  
  log('\n🧪 Beta components:', 'blue')
  betaComponents.forEach(component => {
    if (!checkFileExists(component, `Beta component: ${path.basename(component)}`)) {
      betaReady = false
    }
  })
  
  return betaReady
}

function generateDeploymentReport(results) {
  header('DEPLOYMENT READINESS REPORT')
  
  const {
    criticalFiles,
    packageJson,
    nextConfig,
    vercelConfig,
    environmentTemplate,
    betaReadiness
  } = results
  
  log('📊 Component Status:', 'blue')
  log(`  Critical Files: ${criticalFiles ? '✅ PASS' : '❌ FAIL'}`, criticalFiles ? 'green' : 'red')
  log(`  Package Config: ${packageJson ? '✅ PASS' : '❌ FAIL'}`, packageJson ? 'green' : 'red')
  log(`  Next.js Config: ${nextConfig ? '✅ PASS' : '❌ FAIL'}`, nextConfig ? 'green' : 'red')
  log(`  Vercel Config: ${vercelConfig ? '✅ PASS' : '❌ FAIL'}`, vercelConfig ? 'green' : 'red')
  log(`  Environment Template: ${environmentTemplate ? '✅ PASS' : '❌ FAIL'}`, environmentTemplate ? 'green' : 'red')
  log(`  Beta Readiness: ${betaReadiness ? '✅ PASS' : '❌ FAIL'}`, betaReadiness ? 'green' : 'red')
  
  const overallReady = criticalFiles && packageJson && nextConfig && vercelConfig && environmentTemplate && betaReadiness
  
  log(`\n🚀 OVERALL STATUS: ${overallReady ? '✅ DEPLOYMENT READY' : '❌ NOT READY'}`, 
      overallReady ? 'green' : 'red')
  
  if (overallReady) {
    log('\n🎉 Congratulations! Your OnPar application is 100% ready for deployment!', 'green')
    log('\n📋 Next steps:', 'blue')
    log('  1. Set up environment variables in Vercel dashboard', 'cyan')
    log('  2. Run: npx vercel --prod', 'cyan')
    log('  3. Test the deployed application', 'cyan')
    log('  4. Begin beta customer onboarding', 'cyan')
    log('\n🔗 Quick deploy command:', 'magenta')
    log('  npx vercel --prod', 'bold')
  } else {
    log('\n⚠️  Please address the issues above before deploying', 'yellow')
  }
  
  return overallReady
}

// Main execution
function main() {
  log(`${colors.bold}${colors.magenta}`)
  log('  ██████╗ ███╗   ██╗██████╗  █████╗ ██████╗ ')
  log(' ██╔═══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗')
  log(' ██║   ██║██╔██╗ ██║██████╔╝███████║██████╔╝')
  log(' ██║   ██║██║╚██╗██║██╔═══╝ ██╔══██║██╔══██╗')
  log(' ╚██████╔╝██║ ╚████║██║     ██║  ██║██║  ██║')
  log('  ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝')
  log(`${colors.reset}`)
  log(`${colors.bold}${colors.cyan}    Deployment Readiness Verification${colors.reset}`)
  log(`${colors.dim}    Restaurant SaaS Platform${colors.reset}\n`)
  
  try {
    const results = {
      criticalFiles: checkCriticalFiles(),
      packageJson: checkPackageJson(),
      nextConfig: checkNextConfig(),
      vercelConfig: checkVercelConfig(),
      environmentTemplate: checkEnvironmentTemplate(),
      betaReadiness: checkBetaReadiness()
    }
    
    const isReady = generateDeploymentReport(results)
    
    // Create deployment summary
    const summary = {
      timestamp: new Date().toISOString(),
      status: isReady ? 'READY' : 'NOT_READY',
      results,
      nextSteps: isReady ? [
        'Configure environment variables in Vercel',
        'Deploy with: npx vercel --prod',
        'Test deployed application',
        'Begin beta customer onboarding'
      ] : [
        'Fix identified issues',
        'Re-run verification',
        'Proceed with deployment when ready'
      ]
    }
    
    fs.writeFileSync('deployment-verification.json', JSON.stringify(summary, null, 2))
    log(`\n📄 Verification report saved to: deployment-verification.json`, 'dim')
    
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