# OnPar → bolt.new Deployment Steps

## 🚀 Method 1: GitHub → bolt.new (RECOMMENDED)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `onpar-restaurant-saas`
3. Description: "Smart inventory management SaaS for small restaurants"
4. Set to **Public** (for bolt.new import)
5. **Don't** initialize with README
6. Click "Create repository"

### Step 2: Upload Files to GitHub
You have two options:

#### Option A: Upload via GitHub Web Interface
1. On your new repo page, click "uploading an existing file"
2. Drag and drop ALL these folders/files:
   ```
   📁 app/
   📁 components/
   📁 lib/
   📁 hooks/
   📁 types/
   📁 supabase/
   📁 public/
   📁 .kiro/
   📄 package.json
   📄 next.config.js
   📄 tailwind.config.ts
   📄 tsconfig.json
   📄 .env.example
   📄 README.md
   📄 DEPLOYMENT_GUIDE.md
   📄 OPTIMIZATION_SUMMARY.md
   📄 All other .md files
   ```
3. Commit message: "Initial commit - Optimized OnPar Restaurant SaaS"
4. Click "Commit changes"

#### Option B: Git Command Line (if you have git installed)
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - Optimized OnPar Restaurant SaaS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/onpar-restaurant-saas.git
git push -u origin main
```

### Step 3: Import to bolt.new
1. Go to https://bolt.new
2. Click "Import from GitHub" or use the import option
3. Enter your repo URL: `https://github.com/YOUR_USERNAME/onpar-restaurant-saas`
4. bolt.new will automatically clone and set up the project

### Step 4: Configure Environment in bolt.new
1. In bolt.new, create `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration  
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Email Service (Resend)
   RESEND_API_KEY=re_...

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://your-bolt-app.bolt.new
   NODE_ENV=production
   ```

### Step 5: Install Dependencies & Build
In bolt.new terminal:
```bash
npm install
npm run build
```

---

## 🔄 Method 2: Direct File Copy (Alternative)

If GitHub seems too complex, you can copy files directly:

### Step 1: Create New bolt.new Project
1. Go to https://bolt.new
2. Create a new Next.js project
3. Delete the default files

### Step 2: Copy Files Manually
Copy these essential files from your current project:

#### Core Application Files:
```
📁 app/
├── dashboard/page.tsx
├── onboarding/page.tsx
├── profile/page.tsx
├── beta-signup/page.tsx
├── api/
│   ├── inventory/route.ts
│   ├── menu/route.ts
│   ├── notifications/route.ts
│   ├── reports/route.ts
│   └── webhook/stripe/route.ts
├── layout.tsx
├── page.tsx
└── globals.css
```

#### Component Library:
```
📁 components/
├── ui/ (all UI components)
├── dashboard/
├── inventory/
├── analytics/
├── notifications/
├── recipes/
├── suppliers/
├── reports/
└── providers/
```

#### Business Logic:
```
📁 lib/
├── supabase.ts
├── stripe.ts
├── auth.ts
├── database.ts
├── api-client.ts
├── validation.ts
├── config.ts
├── utils.ts
└── performance-monitor.ts
```

#### Custom Hooks:
```
📁 hooks/
├── use-inventory.ts
├── use-notifications.ts
├── use-async.ts
├── use-debounce.ts
├── use-local-storage.ts
└── use-toast.ts
```

#### Configuration Files:
```
📄 package.json
📄 next.config.js
📄 tailwind.config.ts
📄 tsconfig.json
📄 .env.example
```

### Step 3: Install Dependencies
```bash
npm install
```

---

## 🔧 Required External Services Setup

### 1. Supabase Setup
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → API to get your keys
4. Run database migrations:
   ```sql
   -- Copy the SQL from supabase/migrations/
   ```

### 2. Stripe Setup
1. Go to https://stripe.com
2. Get your API keys from Dashboard → Developers → API keys
3. Set up webhook endpoint: `https://your-app.bolt.new/api/webhook/stripe`

### 3. Resend Setup (Email)
1. Go to https://resend.com
2. Get API key from Dashboard
3. Verify your domain for email sending

---

## ✅ Deployment Verification Checklist

After deployment, verify these work:

### Basic Functionality:
- [ ] App loads without errors
- [ ] Authentication flow works
- [ ] Dashboard displays correctly
- [ ] Inventory management functional
- [ ] Menu management works
- [ ] Reports generate successfully

### API Endpoints:
- [ ] `/api/inventory` - CRUD operations
- [ ] `/api/menu` - Menu management
- [ ] `/api/notifications` - Alert system
- [ ] `/api/reports` - Report generation
- [ ] `/api/webhook/stripe` - Payment processing

### Database Operations:
- [ ] User registration/login
- [ ] Data persistence
- [ ] Real-time updates
- [ ] Bulk operations

### Performance:
- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] No console errors

---

## 🚨 Troubleshooting Common Issues

### Build Errors:
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variable Issues:
- Ensure all variables are set in `.env.local`
- Check variable names match exactly (case-sensitive)
- Verify Supabase and Stripe keys are correct

### Database Connection Issues:
- Verify Supabase URL and keys
- Check if database migrations are applied
- Ensure RLS policies are set up correctly

---

## 🎯 Success Metrics

Once deployed successfully, you should see:
- ✅ Zero build errors
- ✅ App loads in < 2 seconds
- ✅ All features functional
- ✅ Lighthouse score 90+
- ✅ Mobile responsive design
- ✅ Real-time notifications working

## 📞 Next Steps After Deployment

1. **Test all features** thoroughly
2. **Set up monitoring** (built-in performance monitoring is included)
3. **Configure alerts** for system health
4. **Invite beta users** from Charleston restaurants
5. **Monitor performance** and user feedback

The optimized OnPar application is ready for production use!