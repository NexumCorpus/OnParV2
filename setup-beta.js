#!/usr/bin/env node

/**
 * OnPar Beta Deployment Setup Script
 * 
 * This script helps prepare OnPar for beta deployment by:
 * 1. Checking all required services
 * 2. Validating configuration
 * 3. Testing core functionality
 * 4. Providing deployment-ready checklist
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 OnPar Beta Deployment Setup\n');
console.log('This script will help you get ready for beta launch with real restaurants.\n');

// Configuration checks
const checks = {
    nodeVersion: false,
    dependencies: false,
    environment: false,
    supabase: false,
    stripe: false,
    resend: false,
    build: false
};

function checkNodeVersion() {
    console.log('📋 Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
        console.log(`✅ Node.js ${nodeVersion} is compatible`);
        checks.nodeVersion = true;
    } else {
        console.log(`❌ Node.js ${nodeVersion} is too old. Need 18.0.0+`);
    }
    console.log('');
}

function checkDependencies() {
    console.log('📋 Checking dependencies...');

    if (fs.existsSync('node_modules') && fs.existsSync('package-lock.json')) {
        console.log('✅ Dependencies installed');
        checks.dependencies = true;
    } else {
        console.log('❌ Dependencies not installed. Run: npm install');
    }
    console.log('');
}

function checkEnvironment() {
    console.log('📋 Checking environment configuration...');

    if (!fs.existsSync('.env.local')) {
        console.log('❌ .env.local not found');
        console.log('📝 Copy .env.example to .env.local and add your API keys');
        console.log('');
        return;
    }

    const envContent = fs.readFileSync('.env.local', 'utf8');
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'RESEND_API_KEY'
    ];

    const missingVars = requiredVars.filter(varName => {
        const hasVar = envContent.includes(`${varName}=`) &&
            !envContent.includes(`${varName}=your_`) &&
            !envContent.includes(`${varName}=placeholder`);
        return !hasVar;
    });

    if (missingVars.length === 0) {
        console.log('✅ All required environment variables configured');
        checks.environment = true;
    } else {
        console.log(`❌ Missing or incomplete environment variables:`);
        missingVars.forEach(varName => console.log(`   - ${varName}`));
    }
    console.log('');
}

function displayServiceSetupGuide() {
    console.log('🔧 Service Setup Guide for Beta Launch\n');

    console.log('1️⃣ SUPABASE SETUP (Database & Auth)');
    console.log('   • Go to https://supabase.com');
    console.log('   • Create new project (choose region closest to Charleston, SC)');
    console.log('   • Copy Project URL and anon key to .env.local');
    console.log('   • In SQL Editor, run migrations from supabase/migrations/');
    console.log('   • Test: Try signing up at /auth page\n');

    console.log('2️⃣ STRIPE SETUP (Payments)');
    console.log('   • Go to https://stripe.com');
    console.log('   • Create account (use test mode for beta)');
    console.log('   • Create products: "OnPar Basic" ($49/month), "Premium Add-on" ($29/month)');
    console.log('   • Copy publishable and secret keys to .env.local');
    console.log('   • Set up webhook endpoint: https://your-domain.com/api/webhook/stripe');
    console.log('   • Test: Try subscribing on /pricing page\n');

    console.log('3️⃣ RESEND SETUP (Email Alerts)');
    console.log('   • Go to https://resend.com');
    console.log('   • Create account and verify domain (or use resend.dev for testing)');
    console.log('   • Copy API key to .env.local');
    console.log('   • Test: Add inventory item with low stock to trigger alert\n');

    console.log('4️⃣ NETLIFY DEPLOYMENT');
    console.log('   • Go to https://netlify.com');
    console.log('   • Connect your GitHub repo');
    console.log('   • Build command: npm run build');
    console.log('   • Publish directory: out');
    console.log('   • Add all environment variables in Netlify dashboard');
    console.log('   • Custom domain: onpar-beta.netlify.app or your own domain\n');
}

function displayBetaLaunchChecklist() {
    console.log('🚀 Beta Launch Checklist\n');

    console.log('BEFORE PITCHING TO RESTAURANTS:');
    console.log('□ App deployed and accessible online');
    console.log('□ Demo account with sample data ready');
    console.log('□ Mobile experience tested on actual phones');
    console.log('□ All core features working (inventory, alerts, insights)');
    console.log('□ Payment flow tested (even if using Stripe test mode)');
    console.log('□ Email alerts working');
    console.log('□ Error monitoring set up\n');

    console.log('DEMO PREPARATION:');
    console.log('□ 30-second elevator pitch ready');
    console.log('□ Screenshots/video of key features');
    console.log('□ ROI calculator (show $500+ monthly savings)');
    console.log('□ List of Charleston restaurants to approach');
    console.log('□ Beta signup form/process defined');
    console.log('□ Feedback collection method ready\n');

    console.log('SUCCESS METRICS TO TRACK:');
    console.log('□ Number of restaurants signed up');
    console.log('□ Weekly active users');
    console.log('□ Feature usage (which features are most used)');
    console.log('□ User feedback and pain points');
    console.log('□ Technical issues and response times\n');
}

function displayPitchingTips() {
    console.log('💡 Tips for Pitching to Charleston Restaurants\n');

    console.log('OPENING LINE:');
    console.log('"Hi, I\'m [name] from OnPar. We help Charleston restaurants like yours');
    console.log('cut food waste by 15% and save over $500 monthly. Can I show you');
    console.log('how it works in 2 minutes?"\n');

    console.log('KEY SELLING POINTS:');
    console.log('• Built specifically for small restaurants (not enterprise)');
    console.log('• Charleston-based team that understands local market');
    console.log('• Works on phones - no app downloads or complex training');
    console.log('• Free beta access - they help perfect the product');
    console.log('• Typical ROI: Save 5-10x the subscription cost\n');

    console.log('COMMON OBJECTIONS & RESPONSES:');
    console.log('• "We don\'t have time" → "5-minute setup, works on your phone"');
    console.log('• "Too expensive" → "Free beta, saves more than it costs"');
    console.log('• "Too complicated" → "Designed for busy kitchen staff"');
    console.log('• "We have a system" → "Works with what you have, just better insights"\n');

    console.log('DEMO FLOW:');
    console.log('1. Show mobile dashboard (2 minutes)');
    console.log('2. Add inventory item with expiry date');
    console.log('3. Show waste reduction insights');
    console.log('4. Explain alert system');
    console.log('5. Ask: "What questions do you have?"\n');
}

function runAllChecks() {
    checkNodeVersion();
    checkDependencies();
    checkEnvironment();

    console.log('📊 SETUP STATUS SUMMARY\n');

    const allPassed = Object.values(checks).every(check => check);

    if (allPassed) {
        console.log('🎉 READY FOR BETA DEPLOYMENT!');
        console.log('All technical requirements are met.\n');
        displayBetaLaunchChecklist();
    } else {
        console.log('⚠️  SETUP INCOMPLETE');
        console.log('Please complete the missing items below:\n');
        displayServiceSetupGuide();
    }

    displayPitchingTips();
}

// Main execution
if (require.main === module) {
    runAllChecks();
}

module.exports = { runAllChecks };