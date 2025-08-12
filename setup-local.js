#!/usr/bin/env node

/**
 * Quick Setup Script for OnPar Local Development
 * 
 * This script helps new developers get the OnPar application running locally
 * by checking prerequisites and guiding through the setup process.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 OnPar Local Development Setup\n');

// Check if Node.js version is compatible
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📋 Checking Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18.0.0 or higher is required');
    console.log('Please update Node.js: https://nodejs.org/');
    process.exit(1);
  }
  
  console.log('✅ Node.js version is compatible\n');
}

// Check if package.json exists
function checkPackageJson() {
  console.log('📋 Checking package.json...');
  
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found');
    console.log('Make sure you are in the correct project directory');
    process.exit(1);
  }
  
  console.log('✅ package.json found\n');
}

// Check if .env.local exists
function checkEnvironmentFile() {
  console.log('📋 Checking environment configuration...');
  
  const envLocalExists = fs.existsSync('.env.local');
  const envExampleExists = fs.existsSync('.env.example');
  
  if (!envLocalExists) {
    if (envExampleExists) {
      console.log('⚠️  .env.local not found, but .env.example exists');
      console.log('📝 Please copy .env.example to .env.local and fill in your API keys:');
      console.log('   cp .env.example .env.local');
      console.log('   # Then edit .env.local with your actual API keys\n');
    } else {
      console.log('⚠️  No environment files found');
      console.log('📝 You will need to create .env.local with your API keys\n');
    }
    return false;
  }
  
  // Check if .env.local has placeholder values
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasPlaceholders = envContent.includes('your_') || envContent.includes('placeholder');
  
  if (hasPlaceholders) {
    console.log('⚠️  .env.local contains placeholder values');
    console.log('📝 Please update .env.local with your actual API keys\n');
    return false;
  }
  
  console.log('✅ Environment configuration looks good\n');
  return true;
}

// Display required environment variables
function displayRequiredEnvVars() {
  console.log('📝 Required Environment Variables:');
  console.log('');
  console.log('🔹 Supabase (required for core functionality):');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('🔹 Stripe (required for billing):');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('   STRIPE_SECRET_KEY=sk_test_...');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
  console.log('');
  console.log('🔹 Resend (required for email alerts):');
  console.log('   RESEND_API_KEY=re_...');
  console.log('');
  console.log('🔹 App Configuration:');
  console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000');
  console.log('');
}

// Check if node_modules exists
function checkDependencies() {
  console.log('📋 Checking dependencies...');
  
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Dependencies not installed');
    console.log('Run: npm install');
    return false;
  }
  
  console.log('✅ Dependencies are installed\n');
  return true;
}

// Display next steps
function displayNextSteps(envConfigured, depsInstalled) {
  console.log('🚀 Next Steps:\n');
  
  if (!depsInstalled) {
    console.log('1. Install dependencies:');
    console.log('   npm install\n');
  }
  
  if (!envConfigured) {
    console.log('2. Configure environment variables:');
    console.log('   cp .env.example .env.local');
    console.log('   # Edit .env.local with your actual API keys\n');
  }
  
  console.log('3. Set up Supabase database:');
  console.log('   # Apply migrations in your Supabase SQL Editor');
  console.log('   # See TESTING_GUIDE.md for detailed instructions\n');
  
  console.log('4. Start the development server:');
  console.log('   npm run dev\n');
  
  console.log('5. Open your browser:');
  console.log('   http://localhost:3000\n');
  
  console.log('6. Create a user account:');
  console.log('   Navigate to /auth and sign up\n');
  
  console.log('7. Add sample data:');
  console.log('   Use the SQL provided in TESTING_GUIDE.md\n');
  
  console.log('📚 For detailed instructions, see:');
  console.log('   - README.md');
  console.log('   - TESTING_GUIDE.md');
  console.log('   - docs/BETA_TESTING_GUIDE.md');
}

// Main setup function
function main() {
  try {
    checkNodeVersion();
    checkPackageJson();
    
    const envConfigured = checkEnvironmentFile();
    const depsInstalled = checkDependencies();
    
    if (!envConfigured) {
      displayRequiredEnvVars();
    }
    
    displayNextSteps(envConfigured, depsInstalled);
    
    if (envConfigured && depsInstalled) {
      console.log('🎉 Setup looks good! You should be ready to run the application.');
      console.log('Run "npm run dev" to start the development server.');
    } else {
      console.log('⚠️  Please complete the setup steps above before running the application.');
    }
    
  } catch (error) {
    console.error('\n❌ Setup check failed:', error.message);
    console.log('\nFor help, check the README.md file or contact support.');
  }
}

// Run the setup check
if (require.main === module) {
  main();
}

module.exports = { main };