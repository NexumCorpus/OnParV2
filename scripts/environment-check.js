#!/usr/bin/env node

/**
 * OnPar Environment Check Script
 * Comprehensive validation of development environment and configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 OnPar Environment Check - Phase 1\n');

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log('📋 Checking Node.js version...', 'blue');
  
  const nodeVersion = process.version;
  const requiredVersion = fs.readFileSync('.nvmrc', 'utf8').trim();
  
  log(`Current: ${nodeVersion}`, 'reset');
  log(`Required: v${requiredVersion}`, 'reset');
  
  if (nodeVersion !== `v${requiredVersion}`) {
    log('❌ Node.js version mismatch!', 'red');
    log(`Please use Node.js v${requiredVersion} as specified in .nvmrc`, 'yellow');
    log('Run: nvm use (if using nvm)', 'yellow');
    return false;
  }
  
  log('✅ Node.js version matches .nvmrc\n', 'green');
  return true;
}

function checkNpmVersion() {
  log('📋 Checking npm version...', 'blue');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    log(`Current: v${npmVersion}`, 'reset');
    
    if (majorVersion < 8) {
      log('❌ npm version too old!', 'red');
      log('Please update npm: npm install -g npm@latest', 'yellow');
      return false;
    }
    
    log('✅ npm version is compatible\n', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to check npm version', 'red');
    return false;
  }
}

function checkPackageJson() {
  log('📋 Checking package.json integrity...', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'scripts', 'dependencies'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);
    
    if (missingFields.length > 0) {
      log(`❌ Missing required fields: ${missingFields.join(', ')}`, 'red');
      return false;
    }
    
    // Check required scripts
    const requiredScripts = ['dev', 'build', 'start', 'lint'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      log(`❌ Missing required scripts: ${missingScripts.join(', ')}`, 'red');
      return false;
    }
    
    // Check critical dependencies
    const criticalDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    const missingDeps = criticalDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      log(`❌ Missing critical dependencies: ${missingDeps.join(', ')}`, 'red');
      return false;
    }
    
    log('✅ package.json is valid and complete\n', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to parse package.json', 'red');
    return false;
  }
}

function checkEnvironmentFiles() {
  log('📋 Checking environment configuration...', 'blue');
  
  const envExample = '.env.example';
  const envLocal = '.env.local';
  
  if (!fs.existsSync(envExample)) {
    log('❌ .env.example file missing', 'red');
    return false;
  }
  
  if (!fs.existsSync(envLocal)) {
    log('⚠️  .env.local file missing', 'yellow');
    log('Copy .env.example to .env.local and configure your API keys', 'yellow');
    return false;
  }
  
  try {
    const envExampleContent = fs.readFileSync(envExample, 'utf8');
    const envLocalContent = fs.readFileSync(envLocal, 'utf8');
    
    // Extract required variables from .env.example
    const requiredVars = envExampleContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=')[0].trim());
    
    // Check if all required variables are present in .env.local
    const missingVars = requiredVars.filter(varName => 
      !envLocalContent.includes(`${varName}=`)
    );
    
    if (missingVars.length > 0) {
      log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
      return false;
    }
    
    // Check for placeholder values
    const hasPlaceholders = envLocalContent.includes('your_') || 
                           envLocalContent.includes('placeholder') ||
                           envLocalContent.includes('your-') ||
                           envLocalContent.includes('change-me');
    
    if (hasPlaceholders) {
      log('⚠️  Environment file contains placeholder values', 'yellow');
      log('Please update .env.local with actual API keys', 'yellow');
      return false;
    }
    
    log('✅ Environment configuration is complete\n', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to validate environment files', 'red');
    return false;
  }
}

function checkDependencies() {
  log('📋 Checking installed dependencies...', 'blue');
  
  if (!fs.existsSync('node_modules')) {
    log('❌ node_modules directory missing', 'red');
    log('Run: npm install', 'yellow');
    return false;
  }
  
  try {
    // Check if package-lock.json exists and is recent
    if (!fs.existsSync('package-lock.json')) {
      log('⚠️  package-lock.json missing', 'yellow');
      log('Run: npm install to generate lock file', 'yellow');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const lockFile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    
    if (packageJson.name !== lockFile.name) {
      log('❌ package-lock.json is out of sync', 'red');
      log('Run: rm package-lock.json && npm install', 'yellow');
      return false;
    }
    
    log('✅ Dependencies are properly installed\n', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to validate dependencies', 'red');
    return false;
  }
}

function checkTypeScriptConfig() {
  log('📋 Checking TypeScript configuration...', 'blue');
  
  if (!fs.existsSync('tsconfig.json')) {
    log('❌ tsconfig.json missing', 'red');
    return false;
  }
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    // Check for strict mode
    if (!tsConfig.compilerOptions?.strict) {
      log('⚠️  TypeScript strict mode not enabled', 'yellow');
      log('Consider enabling strict mode for better type safety', 'yellow');
    }
    
    // Check for proper paths configuration
    if (!tsConfig.compilerOptions?.paths?.['@/*']) {
      log('⚠️  Path aliases not configured', 'yellow');
    }
    
    log('✅ TypeScript configuration is valid\n', 'green');
    return true;
  } catch (error) {
    log('❌ Invalid tsconfig.json', 'red');
    return false;
  }
}

function checkNextConfig() {
  log('📋 Checking Next.js configuration...', 'blue');
  
  if (!fs.existsSync('next.config.js')) {
    log('❌ next.config.js missing', 'red');
    return false;
  }
  
  try {
    // Basic validation - just check if file can be read
    const configContent = fs.readFileSync('next.config.js', 'utf8');
    
    if (!configContent.includes('output:') || !configContent.includes('export')) {
      log('⚠️  Static export configuration may be missing', 'yellow');
    }
    
    log('✅ Next.js configuration exists\n', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to read next.config.js', 'red');
    return false;
  }
}

function checkSupabaseConfiguration() {
  log('📋 Checking Supabase configuration...', 'blue');
  
  if (!fs.existsSync('supabase')) {
    log('❌ Supabase directory missing', 'red');
    return false;
  }
  
  const migrationsDir = 'supabase/migrations';
  if (!fs.existsSync(migrationsDir)) {
    log('❌ Supabase migrations directory missing', 'red');
    return false;
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));
  log(`Found ${migrationFiles.length} migration files`, 'reset');
  
  if (migrationFiles.length === 0) {
    log('⚠️  No migration files found', 'yellow');
    return false;
  }
  
  // Check for Edge Functions
  const functionsDir = 'supabase/functions';
  if (fs.existsSync(functionsDir)) {
    const functionDirs = fs.readdirSync(functionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    log(`Found ${functionDirs.length} Edge Functions: ${functionDirs.join(', ')}`, 'reset');
  }
  
  log('✅ Supabase configuration structure is valid\n', 'green');
  return true;
}

function checkBuildConfiguration() {
  log('📋 Checking build configuration...', 'blue');
  
  // Check for required config files
  const configFiles = [
    'tailwind.config.ts',
    'postcss.config.js',
    'components.json'
  ];
  
  const missingConfigs = configFiles.filter(file => !fs.existsSync(file));
  
  if (missingConfigs.length > 0) {
    log(`❌ Missing config files: ${missingConfigs.join(', ')}`, 'red');
    return false;
  }
  
  // Check deployment configs
  const deploymentConfigs = ['netlify.toml', 'vercel.json'];
  const existingDeploymentConfigs = deploymentConfigs.filter(file => fs.existsSync(file));
  
  if (existingDeploymentConfigs.length === 0) {
    log('⚠️  No deployment configuration found', 'yellow');
  } else {
    log(`Found deployment configs: ${existingDeploymentConfigs.join(', ')}`, 'reset');
  }
  
  log('✅ Build configuration is complete\n', 'green');
  return true;
}

function checkCodeQuality() {
  log('📋 Running code quality checks...', 'blue');
  
  try {
    // Check TypeScript compilation
    log('Checking TypeScript compilation...', 'reset');
    execSync('npm run type-check', { stdio: 'pipe' });
    log('✅ TypeScript compilation successful', 'green');
  } catch (error) {
    log('❌ TypeScript compilation failed', 'red');
    log('Run: npm run type-check for details', 'yellow');
    return false;
  }
  
  try {
    // Check ESLint
    log('Checking ESLint...', 'reset');
    execSync('npm run lint', { stdio: 'pipe' });
    log('✅ ESLint checks passed', 'green');
  } catch (error) {
    log('⚠️  ESLint found issues', 'yellow');
    log('Run: npm run lint for details', 'yellow');
  }
  
  log('');
  return true;
}

function checkBuildProcess() {
  log('📋 Testing build process...', 'blue');
  
  try {
    log('Running production build...', 'reset');
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Production build successful', 'green');
    
    // Check if build output exists
    if (fs.existsSync('out')) {
      const buildFiles = fs.readdirSync('out');
      log(`Build output contains ${buildFiles.length} files/directories`, 'reset');
    }
    
    log('');
    return true;
  } catch (error) {
    log('❌ Production build failed', 'red');
    log('Run: npm run build for details', 'yellow');
    log('');
    return false;
  }
}

function generateReport(results) {
  log('📊 ENVIRONMENT CHECK REPORT', 'bold');
  log('================================', 'bold');
  
  const checks = [
    { name: 'Node.js Version', passed: results.nodeVersion },
    { name: 'npm Version', passed: results.npmVersion },
    { name: 'package.json', passed: results.packageJson },
    { name: 'Environment Files', passed: results.environmentFiles },
    { name: 'Dependencies', passed: results.dependencies },
    { name: 'TypeScript Config', passed: results.typeScriptConfig },
    { name: 'Next.js Config', passed: results.nextConfig },
    { name: 'Supabase Config', passed: results.supabaseConfig },
    { name: 'Build Config', passed: results.buildConfig },
    { name: 'Code Quality', passed: results.codeQuality },
    { name: 'Build Process', passed: results.buildProcess }
  ];
  
  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    const color = check.passed ? 'green' : 'red';
    log(`${status} ${check.name}`, color);
  });
  
  log('', 'reset');
  log(`SUMMARY: ${passedChecks}/${totalChecks} checks passed`, 'bold');
  
  if (passedChecks === totalChecks) {
    log('🎉 Environment is ready for development!', 'green');
    log('You can proceed to Phase 2: Automated Testing Foundation', 'green');
  } else {
    log('⚠️  Please fix the issues above before proceeding', 'yellow');
    log('Some features may not work correctly with current configuration', 'yellow');
  }
  
  return passedChecks === totalChecks;
}

function main() {
  const results = {
    nodeVersion: checkNodeVersion(),
    npmVersion: checkNpmVersion(),
    packageJson: checkPackageJson(),
    environmentFiles: checkEnvironmentFiles(),
    dependencies: checkDependencies(),
    typeScriptConfig: checkTypeScriptConfig(),
    nextConfig: checkNextConfig(),
    supabaseConfig: checkSupabaseConfiguration(),
    buildConfig: checkBuildConfiguration(),
    codeQuality: checkCodeQuality(),
    buildProcess: checkBuildProcess()
  };
  
  const allPassed = generateReport(results);
  
  if (allPassed) {
    log('\n🚀 NEXT STEPS:', 'bold');
    log('1. Run: npm run dev (to start development server)', 'blue');
    log('2. Test core functionality manually', 'blue');
    log('3. Proceed to Phase 2: Automated Testing Foundation', 'blue');
  } else {
    log('\n🔧 RECOMMENDED ACTIONS:', 'bold');
    log('1. Fix environment issues listed above', 'yellow');
    log('2. Re-run this script: node scripts/environment-check.js', 'yellow');
    log('3. Contact support if issues persist', 'yellow');
  }
  
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { main };