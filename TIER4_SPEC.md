# TIER 4: Recipe & Menu Management

## Prerequisites
Tier 3 must be complete: Inventory CRUD working, supplier management in place.

## Overview
This tier builds:
1. Recipe service layer with cost calculations
2. Recipe list page with filtering
3. Add/Edit recipe with ingredient linking
4. Menu item management
5. Profit margin and cost analysis views

---

## Step 1: Recipe Service

Create `lib/services/recipes.ts`:

### CRUD Operations

```typescript
getRecipes(userId: string, filters?: {
  category?: string
  search?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  sortBy?: 'name' | 'profit_margin' | 'cost_per_serving' | 'popularity_score' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}): Promise<Recipe[]>

getRecipe(id: string): Promise<Recipe & { ingredients: (RecipeIngredient & { inventory_item: InventoryItem })[] }>

createRecipe(data: CreateRecipeInput): Promise<Recipe>

updateRecipe(id: string, data: Partial<CreateRecipeInput>): Promise<Recipe>

deleteRecipe(id: string): Promise<void>
```

### Ingredient Management

```typescript
addIngredient(data: {
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
}): Promise<RecipeIngredient>

removeIngredient(ingredientId: string): Promise<void>

updateIngredient(ingredientId: string, data: Partial<CreateIngredientInput>): Promise<RecipeIngredient>
```

### Business Logic — EXACT FORMULAS

```typescript
// Calculate total recipe cost from ingredients
// cost = SUM(ingredient.quantity_needed * ingredient.cost_per_unit)
calculateRecipeCost(recipeId: string): Promise<number>

// Calculate profit margin
// margin = ((sellingPrice - costPerServing) / sellingPrice) * 100
calculateProfitMargin(sellingPrice: number, costPerServing: number): number

// Check if all ingredients are available in inventory
// Returns items where inventory.quantity < recipe_ingredient.quantity_needed
checkIngredientAvailability(recipeId: string): Promise<{
  available: boolean
  missingItems: Array<{
    ingredient: RecipeIngredient
    inventoryItem: InventoryItem
    shortfall: number  // how much more is needed
  }>
}>

// Recalculate and update cost_per_serving and profit_margin on recipe
// Called after ingredient changes
recalculateRecipeCosts(recipeId: string): Promise<Recipe>
```

### Validation

```typescript
export const recipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  serving_size: z.number().int().min(1, 'Must serve at least 1'),
  prep_time_minutes: z.number().int().min(0).nullable().optional(),
  cook_time_minutes: z.number().int().min(0).nullable().optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  instructions: z.string().nullable().optional(),
  selling_price: z.number().min(0, 'Price must be >= 0'),
})

export const RECIPE_CATEGORIES = [
  'Appetizer', 'Main Course', 'Side Dish', 'Dessert',
  'Beverage', 'Pizza', 'Pasta', 'Salad', 'Soup',
  'Sandwich', 'Breakfast', 'Other'
] as const
```

---

## Step 2: Menu Service

Create `lib/services/menu.ts`:

```typescript
getMenuItems(userId: string, filters?: {
  category?: string
  search?: string
  activeOnly?: boolean
  sortBy?: 'name' | 'selling_price' | 'sales_percentage' | 'waste_percentage'
  sortOrder?: 'asc' | 'desc'
}): Promise<MenuItem[]>

createMenuItem(data: CreateMenuItemInput): Promise<MenuItem>
updateMenuItem(id: string, data: Partial<CreateMenuItemInput>): Promise<MenuItem>
deleteMenuItem(id: string): Promise<void>

// Calculate menu-wide statistics
getMenuStats(userId: string): Promise<{
  totalItems: number
  activeItems: number
  avgWastePercentage: number
  topPerformers: MenuItem[]     // top 3 by sales_percentage
  worstPerformers: MenuItem[]   // bottom 3 by sales_percentage with >3% waste
}>
```

---

## Step 3: Recipe List Page

### Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Recipes                                                             │
│  Manage recipes and track ingredient costs                           │
│                                                                      │
│  ┌────────────────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 🔍 Search recipes...   │ │Category ▼│ │Difficulty│ │[+ Add   ]│ │
│  └────────────────────────┘ └──────────┘ └──────────┘ │[ Recipe ]│ │
│                                                        └──────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ RECIPE CARDS (grid: 3 cols desktop, 2 tablet, 1 mobile)        ││
│  │                                                                  ││
│  │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ││
│  │ │ Margherita Pizza │ │ Spaghetti        │ │ Caesar Salad     │ ││
│  │ │                  │ │ Carbonara        │ │                  │ ││
│  │ │ 🏷 Pizza         │ │ 🏷 Pasta          │ │ 🏷 Salad          │ ││
│  │ │ ⏱ 15 + 12 min    │ │ ⏱ 10 + 15 min    │ │ ⏱ 10 + 0 min     │ ││
│  │ │ 👤 1 serving     │ │ 👤 1 serving     │ │ 👤 1 serving     │ ││
│  │ │ ⭐ Medium        │ │ ⭐ Medium        │ │ ⭐ Easy           │ ││
│  │ │                  │ │                  │ │                  │ ││
│  │ │ Cost: $4.50/srv  │ │ Cost: $3.80/srv  │ │ Cost: $2.10/srv  │ ││
│  │ │ Price: $16.00    │ │ Price: $14.00    │ │ Price: $10.00    │ ││
│  │ │ Margin: 71.9% ✅│ │ Margin: 72.9% ✅│ │ Margin: 79.0% ✅│ ││
│  │ │                  │ │                  │ │                  │ ││
│  │ │ [View] [Edit] ⋮  │ │ [View] [Edit] ⋮  │ │ [View] [Edit] ⋮  │ ││
│  │ └──────────────────┘ └──────────────────┘ └──────────────────┘ ││
│  │                                                                  ││
│  │ ┌──────────────────┐ ┌──────────────────┐                      ││
│  │ │ Sweet & Sour     │ │ Cappuccino       │                      ││
│  │ │ Pork             │ │                  │                      ││
│  │ │ 🏷 Main Course    │ │ 🏷 Beverage       │                      ││
│  │ │ ...              │ │ ...              │                      ││
│  │ └──────────────────┘ └──────────────────┘                      ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Recipe Card Color Coding
- Margin >= 60%: green border-left accent
- Margin 40-59%: yellow border-left accent
- Margin < 40%: red border-left accent

---

## Step 4: Recipe Detail / View Dialog

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Margherita Pizza                                     [✕]    │
│  Classic Italian pizza with fresh mozzarella                 │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Category │ │ Serves   │ │ Time     │ │Difficulty│       │
│  │ Pizza    │ │ 1        │ │ 27 min   │ │ Medium   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ── Ingredients ──────────────────────────────────────        │
│                                                              │
│  │ Ingredient       │ Qty Needed │ In Stock │ Cost    │      │
│  │──────────────────────────────────────────────────── │      │
│  │ Mozzarella       │ 0.25 kg    │ 5 kg ✅  │ $3.00   │      │
│  │ Tomato Sauce     │ 0.15 cans  │ 24 ✅    │ $0.38   │      │
│  │ Olive Oil        │ 0.02 liters│ 8 ✅     │ $0.30   │      │
│  │ Pasta (dough)    │ 0.30 kg    │ 50 ✅    │ $0.96   │      │
│  │──────────────────────────────────────────────────── │      │
│  │                  │            │ Total:   │ $4.64   │      │
│                                                              │
│  ── Cost Analysis ───────────────────────────────────        │
│                                                              │
│  Cost per serving:  $4.50                                    │
│  Selling price:     $16.00                                   │
│  Profit margin:     71.9%  ████████████████████░░░░ ✅       │
│  Waste percentage:  3.2%                                     │
│                                                              │
│  ── Instructions ────────────────────────────────────        │
│                                                              │
│  1. Prepare the dough...                                     │
│  2. Spread tomato sauce...                                   │
│  3. Add mozzarella...                                        │
│                                                              │
│  [Edit Recipe]           [Check Availability]                │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 5: Add/Edit Recipe Dialog

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Add Recipe                                           [✕]    │
│                                                              │
│  ── Basic Info ──────────────────────────────────────        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Recipe Name *                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Description                                          │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Category * ▼ │ │ Difficulty ▼ │ │ Servings *   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Prep (min)   │ │ Cook (min)   │ │ Sell Price * │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ── Ingredients ─────────────────────────────────────        │
│                                                              │
│  │ Inventory Item ▼  │ Qty │ Unit │ $/Unit │  [✕]  │        │
│  │ Mozzarella        │ 0.25│ kg   │ $12.00 │  [✕]  │        │
│  │ Tomato Sauce      │ 0.15│ cans │ $2.50  │  [✕]  │        │
│  │ [+ Add Ingredient]                               │        │
│                                                              │
│  Calculated cost/serving: $4.50                              │
│  Profit margin: 71.9%                                        │
│                                                              │
│  ── Instructions ────────────────────────────────────        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Step-by-step instructions...                         │   │
│  │                                                      │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [Cancel]                              [Save Recipe]         │
└──────────────────────────────────────────────────────────────┘
```

### Ingredient Row Behavior
- "Inventory Item" is a searchable dropdown of user's inventory items
- When an item is selected, auto-fill `unit` and `cost_per_unit` from the inventory item
- Cost per serving recalculates live as ingredients are added/modified
- Profit margin recalculates live based on selling price and cost

---

## Step 6: Menu Items Tab (on Recipes Page)

Add a tab bar at the top of the recipes page:

```
┌──────────────────────────────────────────────────────────────┐
│  [Recipes]  [Menu Items]                                     │
│  ─────────  ──────────                                       │
│  ← active tab has underline                                  │
└──────────────────────────────────────────────────────────────┘
```

### Menu Items Tab Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Recipes]  [Menu Items]                                             │
│              ───────────                                             │
│                                                                      │
│  ┌──────────────────────────┐                    ┌────────────────┐  │
│  │ 🔍 Search menu items...  │                    │[+ Add Menu    ]│  │
│  └──────────────────────────┘                    │[  Item        ]│  │
│                                                   └────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ Name             │Category   │Price   │Sales % │Waste % │Active ││
│  │─────────────────────────────────────────────────────────────────  ││
│  │ Margherita Pizza │Main Course│$16.00  │30.2%   │2.8%    │ ✅    ││
│  │ Spaghetti Carbon.│Main Course│$14.00  │25.5%   │3.2%    │ ✅    ││
│  │ Caesar Salad     │Salad      │$10.00  │12.8%   │8.5% ⚠ │ ✅    ││
│  │ Lasagna          │Main Course│$15.00  │18.3%   │5.1%    │ ✅    ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ── Menu Performance Summary ────────────────────────────────        │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ Active Items │ │ Avg Waste    │ │ Top Seller   │                 │
│  │     12       │ │   4.2%       │ │ Marg. Pizza  │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                      │
│  ⚠ Low performers (>3% waste, <5% sales):                          │
│  • Caesar Salad — 8.5% waste, 12.8% sales                          │
│    Consider: smaller portions or removing from menu                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Waste percentage color coding
- < 3%: green text
- 3-5%: default text
- 5-8%: yellow text with warning icon
- > 8%: red text with alert icon

---

## Step 7: Add/Edit Menu Item Dialog

```
┌──────────────────────────────────────────┐
│  Add Menu Item                    [✕]    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Item Name *                        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Category *   ▼ │ │ Selling Price *│  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ┌────────────────┐ ┌────────────────┐  │
│  │ Sales %        │ │ Waste %        │  │
│  │ (0-100)        │ │ (0-100)        │  │
│  └────────────────┘ └────────────────┘  │
│                                          │
│  ☑ Active on menu                       │
│                                          │
│  [Cancel]          [Save Menu Item]      │
└──────────────────────────────────────────┘
```

---

## Step 8: Server Actions

Create `lib/actions/recipes.ts`:

```typescript
'use server'

export async function createRecipe(formData: FormData): Promise<ActionResult>
export async function updateRecipe(id: string, formData: FormData): Promise<ActionResult>
export async function deleteRecipe(id: string): Promise<ActionResult>
export async function addIngredient(data: AddIngredientInput): Promise<ActionResult>
export async function removeIngredient(id: string): Promise<ActionResult>
```

Create `lib/actions/menu.ts`:

```typescript
'use server'

export async function createMenuItem(formData: FormData): Promise<ActionResult>
export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult>
export async function deleteMenuItem(id: string): Promise<ActionResult>
export async function toggleMenuItemActive(id: string): Promise<ActionResult>
```

---

## Verification Checklist

1. `npm run build` passes with zero errors
2. `npm run type-check` passes
3. Recipe list page renders with card grid
4. Search/filter recipes works
5. Add recipe dialog validates all fields
6. Ingredient picker shows inventory items
7. Cost per serving calculates live: `SUM(qty * cost_per_unit)`
8. Profit margin calculates live: `((price - cost) / price) * 100`
9. Recipe detail view shows all ingredients with availability status
10. "Check Availability" shows missing/short items
11. Menu items tab shows table with all menu items
12. Waste percentage color coding is correct
13. Menu performance summary shows stats
14. Low performers identified correctly (<5% sales AND >3% waste)
15. Add/Edit/Delete menu items works
16. Recipe cards have margin-based color coding

## File Summary

```
lib/services/recipes.ts
lib/services/menu.ts
lib/actions/recipes.ts
lib/actions/menu.ts
lib/utils/validation.ts (expand with recipe/menu schemas)
app/(dashboard)/recipes/page.tsx (replace placeholder)
components/recipes/recipe-grid.tsx
components/recipes/recipe-card.tsx
components/recipes/recipe-detail-dialog.tsx
components/recipes/add-recipe-dialog.tsx
components/recipes/edit-recipe-dialog.tsx
components/recipes/ingredient-picker.tsx
components/recipes/menu-items-tab.tsx
components/recipes/menu-item-table.tsx
components/recipes/add-menu-item-dialog.tsx
components/recipes/menu-performance-summary.tsx
```
