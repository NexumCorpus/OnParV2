# TIER 3: Inventory Management & Suppliers

## Prerequisites
Tier 2 must be complete: Auth working, dashboard layout rendered, protected routes enforced.

## Overview
This tier builds the core inventory management system:
1. Inventory service layer (CRUD + business logic)
2. Inventory list page with table, search, filters
3. Add/Edit inventory item dialogs
4. Low stock & expiring items alerts
5. CSV import/export
6. Supplier management (CRUD)
7. Barcode product lookup

---

## Step 1: Inventory Service

Create `lib/services/inventory.ts`:

### CRUD Operations
```typescript
// All operations use the server-side Supabase client
// All queries are scoped to the authenticated user via RLS
// CRITICAL: All read queries MUST filter WHERE deleted_at IS NULL (soft-delete, see TIER 1)

getInventoryItems(userId: string, filters?: {
  category?: string
  search?: string
  lowStockOnly?: boolean
  expiringOnly?: boolean
  sortBy?: 'name' | 'quantity' | 'expiry_date' | 'price_per_unit' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}): Promise<InventoryItem[]>

getInventoryItem(id: string): Promise<InventoryItem | null>

createInventoryItem(data: {
  user_id: string
  name: string            // required, 1-200 chars
  category: string        // required
  quantity: number         // required, >= 0
  unit: string            // required
  expiry_date?: string    // optional, must be valid date
  reorder_point: number   // required, >= 0
  max_stock_level?: number // optional, must be > reorder_point if set
  price_per_unit: number  // required, >= 0
  supplier_id?: string    // optional
}): Promise<InventoryItem>

updateInventoryItem(id: string, data: Partial<CreateInventoryInput>): Promise<InventoryItem>

deleteInventoryItem(id: string): Promise<void>
```

### Business Logic Functions

```typescript
// Items where quantity < reorder_point AND deleted_at IS NULL
getLowStockItems(userId: string): Promise<InventoryItem[]>

// Items expiring within N days (default: 7, from user settings) AND deleted_at IS NULL
getExpiringItems(userId: string, withinDays?: number): Promise<InventoryItem[]>

// Sum of (quantity * price_per_unit) for all items WHERE deleted_at IS NULL
getTotalInventoryValue(userId: string): Promise<number>

// Estimated savings from addressing low stock + expiring items (deleted_at IS NULL)
// Low stock savings: sum of (reorder_point - quantity) * price_per_unit * 0.15
// Expiry savings: sum of quantity * price_per_unit * 0.20 for expiring items
calculateEstimatedSavings(userId: string): Promise<{
  lowStockSavings: number
  expirySavings: number
  totalSavings: number
}>

// Get unique categories for filter dropdown (deleted_at IS NULL)
getCategories(userId: string): Promise<string[]>

// RACE-SAFE relative quantity adjustment (used by mobile stepper + waste logging)
// Uses: UPDATE inventory_items SET quantity = GREATEST(0, quantity + $delta)
//       WHERE id = $id AND deleted_at IS NULL RETURNING *
// $delta is positive (restock) or negative (use/waste). GREATEST(0, ...) prevents negative inventory.
// This MUST be used instead of updateInventoryItem({ quantity: absoluteValue }) for any
// concurrent-safe quantity change (stepper buttons, waste decrement, recipe deductions).
//
// Implementation (Supabase):
//   const { data } = await supabase.rpc('adjust_quantity', { item_id: id, delta })
//   return data?.[0] ?? null   // Supabase returns [] for 0 rows, NOT null
//
// RETURNS null if 0 rows affected (item was soft-deleted). Callers MUST handle null:
//   - Mobile stepper: show toast "Item no longer exists", remove card from list
//   - Waste logging: unexpected under FOR UPDATE lock — treat as error
//   - Recipe deduction: return error "Ingredient item was deleted"
adjustQuantity(id: string, delta: number): Promise<InventoryItem | null>

// Bulk update quantities (for quick adjustments) — only for non-deleted items
// Uses adjustQuantity internally (relative deltas, NOT absolute sets)
bulkUpdateQuantities(updates: Array<{ id: string; delta: number }>): Promise<void>

// Get total count of inventory items for a user (used by dashboard KPIs)
// SELECT count(*) FROM inventory_items WHERE user_id = $1 AND deleted_at IS NULL
getCount(userId: string): Promise<number>
```

### Validation (Zod)

Create `lib/utils/validation.ts` (expand if exists):

```typescript
import { z } from 'zod'

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(0, 'Quantity must be >= 0'),
  unit: z.string().min(1, 'Unit is required'),
  expiry_date: z.string().nullable().optional(),
  reorder_point: z.number().min(0, 'Reorder point must be >= 0'),
  max_stock_level: z.number().min(0).nullable().optional(),
  price_per_unit: z.number().min(0, 'Price must be >= 0'),
  supplier_id: z.string().uuid().nullable().optional(),
})

// Common categories
export const INVENTORY_CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Seafood', 'Pantry',
  'Bakery', 'Beverages', 'Seasonings', 'Frozen', 'Other'
] as const

// Common units
export const INVENTORY_UNITS = [
  'pieces', 'lbs', 'kg', 'oz', 'g',
  'liters', 'gallons', 'bottles', 'cans',
  'boxes', 'bags', 'containers', 'heads',
  'jars', 'loaves', 'bunches'
] as const
```

---

## Step 2: Inventory List Page

### Desktop Wireframe (>=1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Inventory Management                                                │
│  Track and manage your restaurant's inventory                        │
│                                                                      │
│  ┌────────────────────────┐  ┌──────────┐  ┌──────┐  ┌──────────┐  │
│  │ 🔍 Search items...     │  │Category ▼│  │Status│  │[+ Add   ]│  │
│  └────────────────────────┘  └──────────┘  └──────┘  │[ Item   ]│  │
│                                                       └──────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  ⚠ 5 items low on stock  │  🔴 3 items expiring within 7 days ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ □  Name          │Category │Qty    │Unit  │Expiry   │Price │ ⋮ ││
│  │────────────────────────────────────────────────────────────────── ││
│  │ □  Tomato Sauce  │Pantry   │24     │cans  │Aug 2025 │$2.50 │ ⋮ ││
│  │ □  Mozzarella 🔴│Dairy    │5  ⚠  │kg    │Feb 5    │$12.00│ ⋮ ││
│  │ □  Pasta         │Pantry   │50     │kg    │—        │$3.20 │ ⋮ ││
│  │ □  Olive Oil     │Pantry   │8      │liters│Dec 2025 │$15.00│ ⋮ ││
│  │ □  Chicken    🔴 │Meat     │15  ⚠ │kg    │Feb 3    │$8.50 │ ⋮ ││
│  │────────────────────────────────────────────────────────────────── ││
│  │  ← Previous  Page 1 of 3  Next →                                ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌──────────────────────┐                                           │
│  │ [📥 Import CSV]      │  [📤 Export CSV]                          │
│  └──────────────────────┘                                           │
└──────────────────────────────────────────────────────────────────────┘
```

### Table Column Details

| Column | Width | Content |
|--------|-------|---------|
| Checkbox | 40px | Select for bulk actions |
| Name | flex | Item name. Red dot if expiring in <3 days |
| Category | 120px | Category badge |
| Quantity | 100px | Numeric. Yellow warning icon if < reorder_point |
| Unit | 80px | Unit string |
| Expiry | 100px | Date or "—" if null. Red text if <7 days |
| Price | 80px | Price formatted as $X.XX |
| Actions | 40px | "⋮" dropdown: Edit, Delete, Adjust Qty |

### Table Behavior
- Sortable columns: click header to sort (asc/desc toggle)
- Bulk select: checkbox in header selects all, enables bulk delete
- Search: filters by name (debounced 300ms)
- Category filter: dropdown of unique categories
- Status filter: "All", "Low Stock", "Expiring Soon"
- Pagination: 20 items per page

### Mobile Wireframe (<768px)

**Design principle:** This is the #1 screen for a chef doing inventory in a walk-in cooler with wet hands. Every interaction must be completable in 1-3 taps with fat fingers. No modals — full-screen pages only on mobile.

```
┌────────────────────────────────┐
│  Inventory                 [+] │  ← FAB (floating action button,
│                                │    bottom-right, always visible)
│  ┌──────────────────────────┐  │
│  │ 🔍 Search items...       │  │  ← 44px tall, 16px font
│  └──────────────────────────┘  │    (prevents iOS zoom)
│                                │
│  [All] [Low Stock] [Expiring]  │  ← Status: tap-friendly chips
│  [Produce] [Dairy] [Meat] >>>  │  ← Category: horizontal scroll
│                                │    chips, not dropdown
│  ┌──────────────────────────┐  │
│  │ 🔴 Mozzarella            │  │  ← Warning dot is FIRST visual
│  │ Dairy • ⚠ LOW    5 kg   │  │  ← Status + qty prominent
│  │ Exp Feb 5                │  │
│  │ [−] [−5]   5   [+5] [+] │  │  ← INLINE qty stepper
│  │         [🗑 Log Waste]    │  │  ← Quick-action: 1 tap
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Tomato Sauce              │  │
│  │ Pantry • OK      24 cans │  │
│  │ Exp Aug 15               │  │
│  │ [−] [−5]  24  [+5] [+]  │  │
│  │         [🗑 Log Waste]    │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Pasta                     │  │
│  │ Pantry • OK      50 kg   │  │
│  │ No expiry                │  │
│  │ [−] [−5]  50  [+5] [+]  │  │
│  │         [🗑 Log Waste]    │  │
│  └──────────────────────────┘  │
│                                │
│  (infinite scroll — no         │
│   "Load more" button)          │
│                            [+] │  ← FAB persists on scroll
└────────────────────────────────┘
```

#### Mobile card behavior:
- **Inline quantity stepper:** [−5] [−] qty [+] [+5] buttons directly on card. Chef adjusts quantity WITHOUT opening any dialog. Each button accumulates a delta (e.g., tap [+] twice = delta +2), then auto-saves after 1s debounce using `adjustQuantity(id, delta)` — a **relative** UPDATE, NOT an absolute set. This prevents race conditions with concurrent waste logging (see TIER 5 `recordWasteEvent` which also decrements relatively).
  - **After debounce fires:** UI MUST update displayed quantity from the server response (not optimistic local state). This corrects drift when another session changed the same item concurrently.
  - **Flush on unmount:** If the component unmounts (navigation, page close) with a pending debounce, flush it immediately — call `adjustQuantity()` synchronously in the `useEffect` cleanup. Prevents silent data loss when chef navigates away mid-adjustment.
  - **Null response:** If `adjustQuantity()` returns null (item was deleted), show toast "Item no longer exists" and remove the card from the list.
- **"Log Waste" quick-action:** Opens pre-filled waste form (item already selected). See TIER 5 for the minimal waste form.
- **Swipe left:** Reveals [Edit] [Delete] actions.
- **Tap card body** (not buttons): Opens full-screen detail/edit page.
- **Infinite scroll:** No pagination buttons. Auto-loads next batch on scroll.
- **Chip filters instead of dropdowns:** Category and status are horizontally-scrollable pill buttons. 44px height minimum. Selected chip = solid fill, unselected = outlined.
- **FAB (+):** Floating action button, bottom-right corner, opens full-screen add form (not a modal).
- **All form inputs:** min 44px height, 16px font-size (prevents iOS keyboard zoom).
- **Price hidden on mobile** — not needed during walk-in count. Visible on desktop only.

---

## Step 3: Add/Edit Inventory Item Dialog

### Wireframe

```
┌──────────────────────────────────────────┐
│  Add Inventory Item              [✕]     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Item Name *                        │  │
│  │ e.g., Fresh Tomatoes               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Category *   ▼ │ │ Unit *      ▼  │  │
│  │ Produce        │ │ lbs            │  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Quantity *      │ │ Price/Unit *   │  │
│  │ 0               │ │ $0.00          │  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Reorder Point * │ │ Max Stock      │  │
│  │ 0               │ │ (optional)     │  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Expiry Date          📅           │  │
│  │ (optional)                         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Supplier             ▼            │  │
│  │ (optional)                         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Cancel]              [Save Item]       │
└──────────────────────────────────────────┘
```

### Implementation

- **Desktop:** Use shadcn Dialog (Sheet) component
- **Mobile (<768px):** Replace dialog with **full-screen page** (`app/(dashboard)/inventory/add/page.tsx`). Use a large back-arrow button (top-left, 44px tap target) instead of tiny ✕ close button. This avoids keyboard-pushes-modal-offscreen issues.
- react-hook-form + zod validation
- Category: **chip/pill selector** (not dropdown) — predefined categories + "Other" for custom
- Unit: **chip/pill selector** — `[lbs] [kg] [oz] [gal] [cans] [pieces] [cases]`
- Supplier: searchable autocomplete dropdown (optional field — can be skipped)
- All inputs: min 44px height, 16px font-size
- On save: calls `createInventoryItem` or `updateInventoryItem`
- Success: toast notification, close dialog, refresh list
- Error: show inline error messages

---

## Step 4: Quick Quantity Adjustment

### Wireframe

```
┌────────────────────────────────────┐
│  Adjust Quantity            [✕]    │
│                                    │
│  Tomato Sauce                      │
│  Current: 24 cans                  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  [−]    24    [+]            │  │
│  └──────────────────────────────┘  │
│                                    │
│  or enter new quantity:            │
│  ┌──────────────────────────────┐  │
│  │ 24                           │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Cancel]          [Update]        │
└────────────────────────────────────┘
```

**Desktop:** Simple dialog with +/- buttons and direct input. The +/- buttons use `adjustQuantity(id, delta)` for race safety. The "enter new quantity" text input calculates the delta from current and calls `adjustQuantity(id, newQty - currentQty)`.

**Mobile:** This dialog is NOT needed — the inline [−5] [−] qty [+] [+5] stepper on the inventory card (see mobile wireframe above) replaces it entirely. Stepper accumulates deltas, auto-saves after 1s debounce via `adjustQuantity()`. Zero dialogs, zero navigation. The chef adjusts quantities without ever leaving the inventory list.

---

## Step 5: CSV Import/Export

Create `lib/utils/csv.ts`:

### CSV Export

```typescript
exportInventoryToCSV(items: InventoryItem[]): string
// Columns: Name, Category, Quantity, Unit, Expiry Date, Reorder Point, Price Per Unit
// Note: Max Stock is omitted from CSV (optional field, rarely used in imports)
// Returns CSV string
// Trigger download via Blob + URL.createObjectURL
```

### CSV Import

```typescript
parseInventoryCSV(csvString: string): ParseResult
// Expected columns: Name, Category, Quantity, Unit, Expiry Date, Reorder Point, Price Per Unit
// Returns: { valid: InventoryItemInput[], errors: { row: number, message: string }[] }
// Validates each row against inventoryItemSchema
```

### Import Dialog Wireframe

```
┌──────────────────────────────────────────┐
│  Import Inventory from CSV        [✕]    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │  📁 Drop CSV file here            │  │
│  │     or click to browse            │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Expected format:                        │
│  Name, Category, Quantity, Unit,         │
│  Expiry Date, Reorder Point, Price       │
│                                          │
│  [Download Template]                     │
│                                          │
│  ── After file selected ──               │
│                                          │
│  ✅ 15 items ready to import             │
│  ⚠ 2 rows have errors:                  │
│    Row 3: Invalid quantity               │
│    Row 7: Missing name                   │
│                                          │
│  [Cancel]          [Import 15 Items]     │
└──────────────────────────────────────────┘
```

---

## Step 6: Supplier Management

### Supplier Service

Create `lib/services/suppliers.ts`:

```typescript
getSuppliers(userId: string): Promise<Supplier[]>
getSupplier(id: string): Promise<Supplier | null>
createSupplier(data: CreateSupplierInput): Promise<Supplier>
updateSupplier(id: string, data: Partial<CreateSupplierInput>): Promise<Supplier>
deleteSupplier(id: string): Promise<void>
```

### Supplier List Page — `app/(dashboard)/suppliers/page.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│  Suppliers                                                    │
│  Manage your ingredient suppliers                             │
│                                                               │
│  ┌──────────────────────────┐            ┌────────────────┐  │
│  │ 🔍 Search suppliers...   │            │[+ Add Supplier]│  │
│  └──────────────────────────┘            └────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Fresh Valley Farms              ★★★★☆  Active         │   │
│  │ 📧 orders@freshvalley.com  📞 555-0123               │   │
│  │ 12 items supplied                              [Edit] │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Ocean Select Seafood            ★★★★★  Active         │   │
│  │ 📧 info@oceanselect.com   📞 555-0456                │   │
│  │ 3 items supplied                               [Edit] │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Artisan Mills                   ★★★☆☆  Inactive       │   │
│  │ 📧 sales@artisanmills.com 📞 555-0789                │   │
│  │ 5 items supplied                               [Edit] │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Add/Edit Supplier Dialog

```
┌──────────────────────────────────────────┐
│  Add Supplier                     [✕]    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Supplier Name *                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Email           │ │ Phone          │  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Address                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Notes                              │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Rating: ★★★★☆                          │
│  ☑ Active                               │
│                                          │
│  [Cancel]            [Save Supplier]     │
└──────────────────────────────────────────┘
```

---

## Step 6b: Supplier Server Actions

Create `lib/actions/suppliers.ts`:

```typescript
'use server'

export async function createSupplier(formData: FormData): Promise<ActionResult>
export async function updateSupplier(id: string, formData: FormData): Promise<ActionResult>
export async function deleteSupplier(id: string): Promise<ActionResult>

// ActionResult type is defined in types/index.ts (from Tier 1)
```

---

## Step 7: Product Barcode Lookup

Create `lib/services/products.ts`:

```typescript
lookupByBarcode(barcode: string): Promise<Product | null>
// Looks up product in the shared `products` table
// Returns product details for auto-filling inventory item form
```

Add barcode search to the Add Inventory Item dialog:

```
┌──────────────────────────────────────────┐
│  Add Inventory Item              [✕]     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🔍 Search by barcode...           │  │
│  └────────────────────────────────────┘  │
│  ↑ Type barcode to auto-fill fields      │
│                                          │
│  ... (rest of form as above) ...         │
└──────────────────────────────────────────┘
```

When a barcode is found, auto-populate: name, category, unit, price_per_unit.

---

## Step 8: Alert Banners

At the top of the inventory page, show contextual alerts:

```typescript
// Low stock alert
if (lowStockItems.length > 0) {
  // Yellow banner: "⚠ {count} items are below reorder point"
}

// Expiring alert
if (expiringItems.length > 0) {
  // Red banner: "🔴 {count} items expiring within 7 days"
}
```

These should be dismissible (session only, not persisted).

---

## Step 9: Delete Confirmation

```
┌──────────────────────────────────────────┐
│  Delete Item?                     [✕]    │
│                                          │
│  Are you sure you want to delete         │
│  "Tomato Sauce"?                         │
│                                          │
│  This action cannot be undone.           │
│                                          │
│  [Cancel]            [Delete]            │
│                       ↑ red/destructive  │
└──────────────────────────────────────────┘
```

Use shadcn AlertDialog component.

---

## Step 10: Server Actions for Inventory

Create `lib/actions/inventory.ts` with Server Actions for form submissions:

```typescript
'use server'

// IMPORTANT: Before inserting, call canAddInventoryItem(userId) from lib/services/plan-limits.ts
// If limit reached, return { success: false, error: 'PLAN_LIMIT_REACHED' }
// The client should show an upgrade prompt when it receives this error code.
export async function createItem(formData: FormData): Promise<ActionResult>
export async function updateItem(id: string, formData: FormData): Promise<ActionResult>
// SOFT DELETE: UPDATE inventory_items SET deleted_at = NOW() WHERE id = $1
// Do NOT hard-delete — preserves waste event references for historical analysis.
// All read queries (getInventoryItems, getLowStockItems, etc.) must filter: WHERE deleted_at IS NULL
export async function deleteItem(id: string): Promise<ActionResult>
export async function bulkDeleteItems(ids: string[]): Promise<ActionResult>
// IMPORTANT: Check plan limit with canAddInventoryItem(userId) BEFORE importing.
// If currentCount + parsed.valid.length > limit, reject entire import (all-or-nothing).
// Return { success: false, error: 'PLAN_LIMIT_REACHED' } with upgrade prompt.
// RACE SAFETY: The count check + bulk INSERT must run in a single transaction with
// SELECT ... FOR UPDATE or pg_advisory_xact_lock(hashtext(userId)) to prevent
// two concurrent imports from both passing the limit check against the same stale count.
//
// ROLLBACK STRATEGY: All-or-nothing via Supabase RPC stored procedure:
//   1. Parse + validate ALL rows client-side first (reject with per-row errors if any fail)
//   2. Call supabase.rpc('bulk_import_inventory', { userId, items: validRows })
//   3. The RPC function runs in a single SQL transaction: count check → INSERT ALL → COMMIT
//   4. If any INSERT fails (constraint violation), PostgreSQL rolls back the entire tx automatically
//   5. Return row-level errors from the RPC response if applicable
export async function importFromCSV(formData: FormData): Promise<ActionResult>

// ActionResult is imported from @/types — do NOT redefine locally
```

---

## Verification Checklist

1. `npm run build` passes with zero errors
2. `npm run type-check` passes
3. Inventory list page renders with table (or cards on mobile)
4. Search filters inventory items by name in real-time
5. Category dropdown filters by category
6. Status filter shows "Low Stock" and "Expiring Soon" subsets
7. Add Item dialog opens, validates inputs, creates item
8. Edit Item dialog pre-fills data, saves updates
9. Delete shows confirmation, removes item
10. Quick quantity adjustment works
11. CSV export downloads a valid CSV file
12. CSV import parses file, shows preview, imports valid rows
13. Supplier list page shows all suppliers
14. Add/Edit supplier dialog works
15. Barcode lookup auto-fills item form
16. Alert banners show for low stock / expiring items
17. Mobile card layout renders correctly
18. Pagination works (if >20 items)

## File Summary

```
lib/services/inventory.ts
lib/services/suppliers.ts
lib/services/products.ts
lib/actions/inventory.ts
lib/actions/suppliers.ts
lib/utils/csv.ts
lib/utils/validation.ts (expand)
app/(dashboard)/inventory/page.tsx
app/(dashboard)/suppliers/page.tsx
components/inventory/inventory-table.tsx
components/inventory/inventory-card.tsx (mobile)
components/inventory/add-item-dialog.tsx
components/inventory/edit-item-dialog.tsx
components/inventory/quantity-adjust-dialog.tsx
components/inventory/csv-import-dialog.tsx
components/inventory/delete-confirm-dialog.tsx
components/inventory/inventory-alerts.tsx
components/inventory/inventory-filters.tsx
components/suppliers/supplier-list.tsx
components/suppliers/add-supplier-dialog.tsx
app/(dashboard)/inventory/add/page.tsx (mobile full-screen add form)
```
