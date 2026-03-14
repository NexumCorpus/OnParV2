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
// Items where quantity < reorder_point
getLowStockItems(userId: string): Promise<InventoryItem[]>

// Items expiring within N days (default: 7, from user settings)
getExpiringItems(userId: string, withinDays?: number): Promise<InventoryItem[]>

// Sum of (quantity * price_per_unit) for all items
getTotalInventoryValue(userId: string): Promise<number>

// Estimated savings from addressing low stock + expiring items
// Low stock savings: sum of (reorder_point - quantity) * price_per_unit * 0.15
// Expiry savings: sum of quantity * price_per_unit * 0.20 for expiring items
calculateEstimatedSavings(userId: string): Promise<{
  lowStockSavings: number
  expirySavings: number
  totalSavings: number
}>

// Get unique categories for filter dropdown
getCategories(userId: string): Promise<string[]>

// Bulk update quantities (for quick adjustments)
bulkUpdateQuantities(updates: Array<{ id: string; quantity: number }>): Promise<void>
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

```
┌────────────────────────────────┐
│  Inventory                     │
│                                │
│  ┌──────────────────────────┐  │
│  │ 🔍 Search...             │  │
│  └──────────────────────────┘  │
│  [Category ▼] [Status ▼]      │
│                    [+ Add]     │
│                                │
│  ┌──────────────────────────┐  │
│  │ Tomato Sauce       $2.50 │  │
│  │ Pantry • 24 cans         │  │
│  │ Expires: Aug 15, 2025    │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 🔴 Mozzarella     $12.00│  │
│  │ Dairy • 5 kg  ⚠ low     │  │
│  │ Expires: Feb 5 🔴        │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Pasta              $3.20 │  │
│  │ Pantry • 50 kg           │  │
│  │ No expiry                │  │
│  └──────────────────────────┘  │
│                                │
│  Load more...                  │
└────────────────────────────────┘
```

Mobile uses card layout instead of table. Tap card to open edit dialog. Swipe left to delete (optional — can use long press menu instead).

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

- Use shadcn Dialog component
- react-hook-form + zod validation
- Category: dropdown with predefined categories + "Other" option for custom
- Unit: dropdown with predefined units
- Supplier: dropdown populated from user's suppliers (from suppliers table)
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

Simple dialog with +/- buttons and direct input. Updates quantity only.

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

export async function createItem(formData: FormData): Promise<ActionResult>
export async function updateItem(id: string, formData: FormData): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>
export async function bulkDeleteItems(ids: string[]): Promise<ActionResult>
export async function importFromCSV(formData: FormData): Promise<ActionResult>

type ActionResult = { success: true } | { success: false; error: string }
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
```
