#!/usr/bin/env node

/**
 * Supabase Setup Script for OnPar Restaurant SaaS
 * 
 * This script automates the Supabase integration process:
 * 1. Installs Supabase CLI
 * 2. Links to your Supabase project
 * 3. Applies database migrations
 * 4. Deploys Edge Functions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Supabase Setup for OnPar...\n');

// Check if .env.local exists and has required variables
function checkEnvironmentVariables() {
  console.log('📋 Checking environment variables...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('Please ensure your .env.local file exists with Supabase credentials.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName) || envContent.includes(`${varName}=your_`)
  );

  if (missingVars.length > 0) {
    console.error('❌ Missing or incomplete environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\nPlease update your .env.local file with actual Supabase credentials.');
    process.exit(1);
  }

  console.log('✅ Environment variables configured\n');
}

// Extract project reference from Supabase URL
function getProjectRef() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) {
    console.error('❌ Could not extract project reference from SUPABASE_URL');
    process.exit(1);
  }
  
  return urlMatch[1];
}

// Execute shell command with error handling
function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  console.log('🔍 Checking Supabase CLI installation...');
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI is already installed\n');
    return true;
  } catch (error) {
    console.log('📦 Supabase CLI not found, installing...\n');
    return false;
  }
}

// Install Supabase CLI
function installSupabaseCLI() {
  runCommand('npm install supabase --save-dev', 'Installing Supabase CLI locally');
}

// Login to Supabase
function loginToSupabase() {
  console.log('🔐 Logging into Supabase...');
  console.log('This will open your browser for authentication.');
  console.log('If you\'re already logged in, this step will be skipped.\n');
  
  try {
    execSync('npx supabase login', { stdio: 'inherit' });
    console.log('✅ Supabase login completed\n');
  } catch (error) {
    console.error('❌ Supabase login failed. Please try running "npx supabase login" manually.');
    process.exit(1);
  }
}

// Link to Supabase project
function linkProject(projectRef) {
  runCommand(
    `npx supabase link --project-ref ${projectRef}`, 
    `Linking to Supabase project (${projectRef})`
  );
}

// Apply database migrations
function applyMigrations() {
  console.log('📊 Applying database migrations...');
  console.log('This will create your database schema (users, inventory_items, menu_items tables)');
  console.log('and set up Row Level Security policies.\n');
  
  runCommand('npx supabase db push', 'Applying database migrations');
}

// Deploy Edge Functions
function deployEdgeFunctions() {
  console.log('⚡ Deploying Supabase Edge Functions...');
  console.log('This will deploy functions for alerts and Stripe webhooks.\n');
  
  const functions = ['send-alerts', 'send-push-notification', 'stripe-webhook'];
  const functions = ['send-alerts'];
  
  functions.forEach(functionName => {
    const functionPath = path.join(process.cwd(), 'supabase', 'functions', functionName);
    if (fs.existsSync(functionPath)) {
      runCommand(
        `npx supabase functions deploy ${functionName}`, 
        `Deploying ${functionName} function`
      );
    } else {
      console.log(`⚠️  Function ${functionName} not found, skipping...`);
    }
  });
}

// Generate types (optional but recommended)
function generateTypes() {
  console.log('🔧 Generating TypeScript types from database schema...');
  try {
    runCommand(
      'npx supabase gen types typescript --local > lib/database.types.ts',
      'Generating TypeScript types'
    );
  } catch (error) {
    console.log('⚠️  Type generation failed, but this is optional. Continuing...\n');
  }
}

// Main setup function
async function main() {
  try {
    console.log('🎯 OnPar Supabase Setup\n');
    console.log('This script will set up your Supabase integration:\n');
    console.log('1. ✅ Install Supabase CLI (if needed)');
    console.log('2. ✅ Login to Supabase');
    console.log('3. ✅ Link your project');
    console.log('4. ✅ Apply database migrations');
    console.log('5. ✅ Deploy Edge Functions');
    console.log('6. ✅ Generate TypeScript types\n');

    // Step 1: Check environment variables
    checkEnvironmentVariables();

    // Step 2: Install Supabase CLI if needed
    if (!checkSupabaseCLI()) {
      installSupabaseCLI();
    }

    // Step 3: Login to Supabase
    loginToSupabase();

    // Step 4: Link project
    const projectRef = getProjectRef();
    linkProject(projectRef);

    // Step 5: Apply migrations
    applyMigrations();

    // Step 6: Deploy Edge Functions
    deployEdgeFunctions();

    // Step 7: Generate types
    generateTypes();

    console.log('🎉 Supabase setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. 🚀 Start your development server: npm run dev');
    console.log('2. 🔗 Visit http://localhost:3000 to test your app');
    console.log('3. 📝 Create a test account and add some inventory items');
    console.log('4. 💳 Set up Stripe integration for payments\n');
    console.log('Your OnPar app is now connected to Supabase! 🎯');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nFor manual setup, please refer to the README.md file.');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { main };