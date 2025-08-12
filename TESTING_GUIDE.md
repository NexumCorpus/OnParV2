# OnPar Application Testing Guide

This guide will help you thoroughly test the OnPar application to ensure all functionality works correctly before sharing with your co-founder.

## Prerequisites

1. **Environment Setup**: Ensure `.env.local` is configured with valid Supabase, Stripe, and Resend keys
2. **Database Setup**: All migrations should be applied to your Supabase project
3. **Development Server**: Application should be running on `http://localhost:3000`

## Testing Checklist

### 🔐 Authentication & User Management

- [ ] **Sign Up Flow**
  - Navigate to `/auth`
  - Create new account with email/password
  - Verify user is created in Supabase Auth dashboard
  - Check that user profile is created in `public.users` table

- [ ] **Sign In Flow**
  - Sign out and sign back in with same credentials
  - Verify successful authentication and redirect to dashboard

- [ ] **User Profile Management**
  - Navigate to `/profile`
  - Update restaurant name, monthly budget, alert settings
  - Verify changes are saved and persist after page refresh

### 📦 Inventory Management

- [ ] **Add Inventory Items**
  - Use "Add Item" button in dashboard
  - Fill out all required fields (name, quantity, unit, reorder point, price)
  - Add optional expiry date
  - Verify item appears in inventory list

- [ ] **Edit Inventory Items**
  - Click edit button on existing item
  - Modify values and save
  - Verify changes are reflected immediately

- [ ] **Delete Inventory Items**
  - Click delete button on item
  - Verify item is removed from list

- [ ] **CSV Import**
  - Click "Import CSV" button
  - Test with sample data (use "Load Sample" button)
  - Verify items are imported correctly
  - Test error handling with invalid CSV data

### 🍽️ Menu Management

- [ ] **Add Menu Items**
  - Switch to "Menu Performance" tab
  - Add menu items with sales and waste percentages
  - Verify items appear in menu list

- [ ] **Edit Menu Items**
  - Edit existing menu items
  - Verify changes are saved

- [ ] **Delete Menu Items**
  - Remove menu items
  - Verify deletion works correctly

### 🚨 Alerts & Notifications

- [ ] **Low Stock Alerts**
  - Create inventory item with quantity below reorder point
  - Verify alert appears in alerts panel
  - Check estimated savings calculation

- [ ] **Expiry Alerts**
  - Create inventory item with expiry date within 7 days
  - Verify expiry alert appears

- [ ] **Budget Alerts**
  - Set monthly budget in profile
  - Add enough inventory to exceed 90% of budget
  - Verify budget alert appears

### 🤖 AI Insights (Premium Features)

- [ ] **Premium Toggle**
  - Toggle "Premium Features" switch in dashboard
  - Verify AI insights appear in alerts panel
  - Test different insight types based on data patterns

- [ ] **Insight Generation**
  - Add items with high waste percentages
  - Add overstocked items (quantity > 3x reorder point)
  - Verify relevant insights are generated

### 📊 Analytics Dashboard

- [ ] **Analytics Page**
  - Navigate to `/analytics`
  - Verify charts load with sample data
  - Check key metrics display correctly

- [ ] **Chart Functionality**
  - Inventory value chart shows trend
  - Waste reduction chart displays properly
  - Menu performance chart shows sales vs waste

### 💳 Billing & Subscriptions

- [ ] **Pricing Page**
  - Navigate to `/pricing`
  - Verify plan information displays correctly
  - Check subscription buttons (note: actual Stripe integration requires valid keys)

- [ ] **Billing Portal**
  - Test billing portal access (if Stripe is configured)
  - Verify customer portal functionality

### 📱 Mobile Responsiveness

- [ ] **Mobile Navigation**
  - Test on mobile device or browser dev tools
  - Verify bottom navigation appears on mobile
  - Test all navigation links work

- [ ] **Mobile Forms**
  - Test adding inventory/menu items on mobile
  - Verify forms are usable on small screens

### 🔧 Error Handling

- [ ] **Network Errors**
  - Test with poor internet connection
  - Verify appropriate error messages appear

- [ ] **Validation Errors**
  - Submit forms with invalid data
  - Verify validation messages appear

- [ ] **Authentication Errors**
  - Test with invalid login credentials
  - Verify error handling works correctly

### 🎨 UI/UX Testing

- [ ] **Theme Toggle**
  - Test light/dark mode switching
  - Verify all components render correctly in both themes

- [ ] **Accessibility**
  - Test accessibility toolbar functionality
  - Verify keyboard navigation works
  - Check screen reader compatibility

- [ ] **Feedback System**
  - Test "Send Feedback" button
  - Submit different types of feedback
  - Verify feedback is recorded (check Supabase dashboard)

## Sample Data for Testing

Use this sample data to populate your application for testing:

### Sample Inventory Items
- Tomato Sauce (24 cans, expires 2025-08-15, reorder at 10, $2.50/can)
- Mozzarella Cheese (5 kg, expires 2025-02-05, reorder at 8, $12.00/kg)
- Pasta Spaghetti (50 kg, no expiry, reorder at 20, $3.20/kg)
- Olive Oil (8 liters, expires 2025-12-01, reorder at 3, $15.00/liter)

### Sample Menu Items
- Spaghetti Carbonara (25.5% sales, 3.2% waste)
- Margherita Pizza (30.2% sales, 2.8% waste)
- Caesar Salad (12.8% sales, 8.5% waste) - should trigger high waste alert

## Expected Behavior

### Dashboard
- Shows welcome message with restaurant name
- Displays inventory and menu tabs
- Shows alerts panel with relevant notifications
- Quick actions work correctly

### Alerts
- Low stock items appear when quantity < reorder point
- Expiry alerts show for items expiring within 7 days
- Budget alerts appear when spending > 90% of monthly budget
- AI insights appear when premium features are enabled

### Performance
- Pages load quickly (< 2 seconds)
- Forms submit without delays
- Real-time updates work (if multiple tabs open)

## Common Issues & Solutions

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are properly configured

### Authentication Problems
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify email confirmation is disabled

### Data Not Appearing
- Check browser console for errors
- Verify user ID matches in database
- Ensure RLS policies allow data access

### Styling Issues
- Check if Tailwind CSS is loading properly
- Verify component imports are correct
- Test in different browsers

## Performance Benchmarks

- **Page Load Time**: < 2 seconds
- **Form Submission**: < 1 second
- **Data Refresh**: < 500ms
- **Chart Rendering**: < 1 second

## Browser Compatibility

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Final Checklist

Before sharing with your co-founder:

- [ ] All core features work without errors
- [ ] Sample data loads correctly
- [ ] Authentication flow is smooth
- [ ] Mobile experience is good
- [ ] No console errors in browser
- [ ] Environment variables are documented
- [ ] README.md is up to date
- [ ] All dependencies are in package.json

## Deployment Readiness

- [ ] Build process works (`npm run build`)
- [ ] No TypeScript errors
- [ ] All environment variables documented
- [ ] Database migrations are complete
- [ ] Edge functions are deployed (if using Supabase)

---

**Note**: This is a comprehensive testing guide. Focus on the core functionality first (auth, inventory, menu, alerts) before testing advanced features like AI insights and analytics.