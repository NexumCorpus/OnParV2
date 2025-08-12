# Supabase Integration Setup Guide

## Quick Setup (Recommended)

Run the automated setup script:

```bash
node setup-supabase.js
```

This script will handle all the setup steps automatically.

## Manual Setup

If you prefer to set up Supabase manually, follow these steps:

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open your browser for authentication.

### 3. Link Your Project

```bash
supabase link --project-ref kfbtqojxwfeuzobiqydt
```

### 4. Apply Database Migrations

```bash
supabase db push
```

This will create your database schema with the following tables:
- `users` - Restaurant user profiles
- `inventory_items` - Inventory tracking
- `menu_items` - Menu performance data

### 5. Deploy Edge Functions

```bash
supabase functions deploy send-alerts
supabase functions deploy send-push-notification  
supabase functions deploy stripe-webhook
```

### 6. Generate TypeScript Types (Optional)

```bash
supabase gen types typescript --local > lib/database.types.ts
```

## Verification

After setup, verify your integration:

1. **Check Tables**: Go to your Supabase dashboard → Table Editor
2. **Test Auth**: Try signing up at `/auth`
3. **Test Database**: Add inventory items in the dashboard
4. **Check Functions**: View deployed functions in Supabase dashboard

## Troubleshooting

### Common Issues

**"Project not found"**
- Verify your project reference in the link command
- Ensure you're logged into the correct Supabase account

**"Permission denied"**
- Make sure you have owner/admin access to the Supabase project
- Try logging out and back in: `supabase logout && supabase login`

**"Migration failed"**
- Check if tables already exist in your database
- Review the SQL in `supabase/migrations/` for any conflicts

**"Function deployment failed"**
- Ensure your functions directory structure is correct
- Check for syntax errors in the Edge Function code

### Manual Migration (If Automated Fails)

If `supabase db push` fails, you can manually run the migrations:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/20250725193956_blue_snowflake.sql`
   - `supabase/migrations/20250725194213_scarlet_dune.sql` 
   - `supabase/migrations/20250727203947_flat_limit.sql`
4. Execute each migration

## Environment Variables

Ensure your `.env.local` contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://kfbtqojxwfeuzobiqydt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYnRxb2p4d2ZldXpvYmlxeWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzI0NTEsImV4cCI6MjA2OTA0ODQ1MX0.OogAoUHJiH_JtDExmLRzZymamHSj7nwaMdilCS2l2cA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYnRxb2p4d2ZldXpvYmlxeWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MjQ1MSwiZXhwIjoyMDY5MDQ4NDUxfQ.GPo63cycYpwk8ioMLB0aVsZFll8L50F4D3El-JkZLXM
```

## Next Steps

After successful Supabase setup:

1. **Test the Application**: Start your dev server and test user registration
2. **Set up Stripe**: Configure Stripe for payment processing
3. **Deploy**: Deploy your application to production
4. **Monitor**: Use Supabase dashboard to monitor usage and performance

## Support

If you encounter issues:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the project's README.md
- Contact support at support@onpar.app