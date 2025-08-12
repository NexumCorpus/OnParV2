# bolt.new Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: Preview Not Loading
**Symptoms:** bolt.new shows loading screen or blank page

**Solutions:**

#### A. Check package.json Scripts
Ensure your `package.json` has the correct scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"
  }
}
```

#### B. Fix Next.js Configuration
Your `next.config.js` might be causing issues. Try this simplified version:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
```

#### C. Check App Router Structure
Ensure you have these essential files:
```
app/
├── layout.tsx
├── page.tsx
└── globals.css
```

### Issue 2: Build Errors
**Check bolt.new terminal for these common errors:**

#### Missing Dependencies Error
```bash
npm install
```

#### TypeScript Errors
Add to `next.config.js`:
```javascript
typescript: {
  ignoreBuildErrors: true
}
```

#### Import Path Errors
Check that all imports use `@/` prefix:
```typescript
import { Button } from '@/components/ui/button'
```

### Issue 3: Environment Variables
bolt.new needs `.env.local` file with at least:
```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
```

## 🔧 Quick Fix Steps

### Step 1: Simplify Configuration
Replace your `next.config.js` with this minimal version that works in bolt.new

### Step 2: Check Essential Files
Ensure these files exist and are correct

### Step 3: Install Dependencies
Run `npm install` in bolt.new terminal

### Step 4: Start Development Server
Run `npm run dev` in bolt.new terminal

## 🎯 Most Likely Issues for OnPar Project

1. **Complex next.config.js** - bolt.new might not support all features
2. **Missing environment variables** - App crashes without Supabase config
3. **TypeScript strict mode** - Might prevent compilation
4. **Large bundle size** - bolt.new has memory limits

## 🚀 Immediate Action Plan

Try these fixes in order:

1. **Simplify next.config.js** (see below)
2. **Add basic .env.local** (see below)  
3. **Run npm install**
4. **Check terminal for errors**
5. **Try npm run dev**