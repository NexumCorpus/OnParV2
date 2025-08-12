# GitHub Repository Setup Guide

Since the Bolt.new GitHub integration isn't working, here's how to manually upload your OnPar project to GitHub:

## Method 1: GitHub Web Interface (Easiest)

### Step 1: Create Repository on GitHub
1. Go to [github.com](https://github.com)
2. Click the "+" icon in top right → "New repository"
3. Repository name: `onpar-restaurant-saas`
4. Description: `Smart inventory management for small restaurants - reduce waste by 10-20%`
5. Set to **Public** (recommended for portfolio/demo)
6. **DO NOT** check "Add a README file" (we already have one)
7. **DO NOT** check "Add .gitignore" (we already have one)
8. Click "Create repository"

### Step 2: Download Your Project
1. In Bolt.new, click the download button or use browser's download feature
2. Extract the ZIP file to your computer
3. Open terminal/command prompt in the extracted folder

### Step 3: Initialize Git and Push
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: OnPar restaurant inventory management SaaS"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/onpar-restaurant-saas.git

# Push to GitHub
git push -u origin main
```

## Method 2: GitHub CLI (If you have it installed)

```bash
# Create repository directly from command line
gh repo create onpar-restaurant-saas --public --description "Smart inventory management for small restaurants"

# Initialize and push
git init
git add .
git commit -m "Initial commit: OnPar restaurant inventory management SaaS"
git remote add origin https://github.com/YOUR_USERNAME/onpar-restaurant-saas.git
git push -u origin main
```

## Method 3: GitHub Desktop (GUI Option)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. File → "Add Local Repository" → Select your project folder
4. Click "Publish repository"
5. Name: `onpar-restaurant-saas`
6. Description: `Smart inventory management for small restaurants`
7. Keep "Public" checked
8. Click "Publish Repository"

## After Upload: Connect to Netlify

Once your repository is on GitHub:

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize if needed
4. Select your `onpar-restaurant-saas` repository
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. Add environment variables (see .env.example)
7. Click "Deploy site"

## Environment Variables for Netlify

Add these in Netlify dashboard → Site settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
RESEND_API_KEY=your_resend_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

**"Permission denied" error:**
- Make sure you're logged into GitHub
- Check if repository name already exists
- Try using personal access token instead of password

**"Repository not found":**
- Double-check the repository URL
- Ensure repository is public or you have access
- Verify your GitHub username in the URL

**Build fails on Netlify:**
- Check that all environment variables are set
- Verify build command is `npm run build`
- Check build logs for specific errors

## Next Steps

After successful upload:
1. ✅ Repository is on GitHub
2. ✅ Netlify deployment is working
3. ✅ Custom domain can be added (optional)
4. ✅ Share repository link with co-founder
5. ✅ Begin beta testing with real users

Your repository will be available at:
`https://github.com/YOUR_USERNAME/onpar-restaurant-saas`