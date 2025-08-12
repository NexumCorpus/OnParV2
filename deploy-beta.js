#!/usr/bin/env node

/**
 * OnPar Beta Deployment Script
 * 
 * Quick deployment to Netlify for beta testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 OnPar Beta Deployment\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function checkPrerequisites() {
  console.log('📋 Checking prerequisites...');
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local not found');
    console.log('Please create .env.local with your API keys before deploying');
    return false;
  }
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('❌ Dependencies not installed');
    console.log('Run: npm install');
    return false;
  }
  
  console.log('✅ Prerequisites met\n');
  return true;
}

function deployToBeta() {
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  console.log('🎯 Starting beta deployment process...\n');
  
  // Clean previous build
  if (!runCommand('npm run clean', 'Cleaning previous build')) {
    process.exit(1);
  }
  
  // Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    process.exit(1);
  }
  
  // Type check
  if (!runCommand('npm run type-check', 'Type checking')) {
    console.log('⚠️  Type check failed, but continuing with build...\n');
  }
  
  // Build for production
  if (!runCommand('npm run build', 'Building for production')) {
    process.exit(1);
  }
  
  console.log('🎉 Build completed successfully!');
  console.log('📁 Static files are in the "out" directory');
  console.log('');
  console.log('🌐 Next steps for Netlify deployment:');
  console.log('1. Go to https://netlify.com');
  console.log('2. Drag and drop the "out" folder');
  console.log('3. Or connect your GitHub repo for auto-deployment');
  console.log('4. Add environment variables in Netlify dashboard');
  console.log('5. Set custom domain (e.g., onpar-beta.netlify.app)');
  console.log('');
  console.log('📋 Don\'t forget to:');
  console.log('• Test the deployed app thoroughly');
  console.log('• Set up Stripe webhook with your live URL');
  console.log('• Update NEXT_PUBLIC_APP_URL in environment variables');
  console.log('• Create demo account with sample data');
}

// Run deployment
if (require.main === module) {
  deployToBeta();
}

module.exports = { deployToBeta };