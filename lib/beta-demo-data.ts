// Beta demo data for realistic restaurant inventory demonstrations

export interface DemoInventoryItem {
  name: string
  category: string
  quantity: number
  unit: string
  reorderPoint: number
  pricePerUnit: number
  expiryDate?: string
  supplier: string
  wasteReduction?: number
  status: 'good' | 'low' | 'expiring' | 'critical'
}

export interface DemoMenuItem {
  name: string
  category: string
  salesPercentage: number
  wastePercentage: number
  costPerServing: number
  sellingPrice: number
  profitMargin: number
}

export interface DemoSupplier {
  name: string
  category: string
  contactPerson: string
  phone: string
  email: string
  deliveryDays: string[]
  minimumOrder: number
  rating: number
}

// Restaurant type-specific demo data
export const getDemoDataForRestaurantType = (restaurantType: string) => {
  const baseData = getBaseInventoryData()
  
  switch (restaurantType.toLowerCase()) {
    case 'pizza restaurant':
      return getPizzaRestaurantData()
    case 'cafe/coffee shop':
      return getCafeData()
    case 'fine dining':
      return getFineDiningData()
    case 'fast casual':
      return getFastCasualData()
    case 'bar & grill':
      return getBarGrillData()
    case 'bakery':
      return getBakeryData()
    default:
      return baseData
  }
}

function getBaseInventoryData(): DemoInventoryItem[] {
  return [
    {
      name: 'Roma Tomatoes',
      category: 'Produce',
      quantity: 25,
      unit: 'lbs',
      reorderPoint: 30,
      pricePerUnit: 2.50,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Fresh Farm Co',
      wasteReduction: 15,
      status: 'low'
    },
    {
      name: 'Yellow Onions',
      category: 'Produce',
      quantity: 40,
      unit: 'lbs',
      reorderPoint: 25,
      pricePerUnit: 1.20,
      supplier: 'Fresh Farm Co',
      wasteReduction: 8,
      status: 'good'
    },
    {
      name: 'Olive Oil',
      category: 'Oils & Condiments',
      quantity: 3,
      unit: 'gallons',
      reorderPoint: 5,
      pricePerUnit: 12.00,
      supplier: 'Mediterranean Imports',
      wasteReduction: 12,
      status: 'critical'
    }
  ]
}

function getPizzaRestaurantData(): DemoInventoryItem[] {
  return [
    // Produce
    {
      name: 'Roma Tomatoes',
      category: 'Produce',
      quantity: 25,
      unit: 'lbs',
      reorderPoint: 30,
      pricePerUnit: 2.50,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Fresh Farm Co',
      wasteReduction: 15,
      status: 'low'
    },
    {
      name: 'Fresh Basil',
      category: 'Herbs',
      quantity: 12,
      unit: 'bunches',
      reorderPoint: 15,
      pricePerUnit: 1.75,
      expiryDate: addDays(new Date(), 2),
      supplier: 'Local Herbs',
      wasteReduction: 35,
      status: 'expiring'
    },
    {
      name: 'Bell Peppers',
      category: 'Produce',
      quantity: 18,
      unit: 'lbs',
      reorderPoint: 20,
      pricePerUnit: 3.25,
      expiryDate: addDays(new Date(), 5),
      supplier: 'Fresh Farm Co',
      wasteReduction: 22,
      status: 'good'
    },
    {
      name: 'Mushrooms',
      category: 'Produce',
      quantity: 8,
      unit: 'lbs',
      reorderPoint: 12,
      pricePerUnit: 4.50,
      expiryDate: addDays(new Date(), 4),
      supplier: 'Fresh Farm Co',
      wasteReduction: 18,
      status: 'low'
    },
    
    // Dairy
    {
      name: 'Mozzarella Cheese',
      category: 'Dairy',
      quantity: 8,
      unit: 'lbs',
      reorderPoint: 10,
      pricePerUnit: 4.25,
      expiryDate: addDays(new Date(), 4),
      supplier: 'Dairy Direct',
      wasteReduction: 22,
      status: 'expiring'
    },
    {
      name: 'Parmesan Cheese',
      category: 'Dairy',
      quantity: 15,
      unit: 'lbs',
      reorderPoint: 8,
      pricePerUnit: 8.50,
      supplier: 'Dairy Direct',
      wasteReduction: 5,
      status: 'good'
    },
    
    // Dry Goods
    {
      name: 'Pizza Flour',
      category: 'Dry Goods',
      quantity: 150,
      unit: 'lbs',
      reorderPoint: 50,
      pricePerUnit: 0.85,
      supplier: 'Grain Supply Co',
      status: 'good'
    },
    {
      name: 'Pizza Sauce',
      category: 'Sauces',
      quantity: 24,
      unit: 'cans',
      reorderPoint: 30,
      pricePerUnit: 2.25,
      supplier: 'Italian Imports',
      wasteReduction: 8,
      status: 'low'
    },
    
    // Oils & Condiments
    {
      name: 'Olive Oil',
      category: 'Oils & Condiments',
      quantity: 3,
      unit: 'gallons',
      reorderPoint: 5,
      pricePerUnit: 12.00,
      supplier: 'Mediterranean Imports',
      wasteReduction: 8,
      status: 'critical'
    },
    
    // Meat
    {
      name: 'Pepperoni',
      category: 'Meat',
      quantity: 12,
      unit: 'lbs',
      reorderPoint: 15,
      pricePerUnit: 6.75,
      expiryDate: addDays(new Date(), 8),
      supplier: 'Meat Masters',
      wasteReduction: 12,
      status: 'low'
    },
    {
      name: 'Italian Sausage',
      category: 'Meat',
      quantity: 20,
      unit: 'lbs',
      reorderPoint: 18,
      pricePerUnit: 5.25,
      expiryDate: addDays(new Date(), 6),
      supplier: 'Meat Masters',
      wasteReduction: 15,
      status: 'good'
    }
  ]
}

function getCafeData(): DemoInventoryItem[] {
  return [
    // Coffee & Tea
    {
      name: 'Coffee Beans - House Blend',
      category: 'Coffee & Tea',
      quantity: 25,
      unit: 'lbs',
      reorderPoint: 30,
      pricePerUnit: 8.50,
      supplier: 'Charleston Coffee Roasters',
      wasteReduction: 5,
      status: 'low'
    },
    {
      name: 'Espresso Beans',
      category: 'Coffee & Tea',
      quantity: 15,
      unit: 'lbs',
      reorderPoint: 20,
      pricePerUnit: 12.00,
      supplier: 'Charleston Coffee Roasters',
      wasteReduction: 3,
      status: 'low'
    },
    
    // Dairy
    {
      name: 'Whole Milk',
      category: 'Dairy',
      quantity: 8,
      unit: 'gallons',
      reorderPoint: 12,
      pricePerUnit: 3.25,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Dairy Direct',
      wasteReduction: 18,
      status: 'expiring'
    },
    {
      name: 'Heavy Cream',
      category: 'Dairy',
      quantity: 4,
      unit: 'quarts',
      reorderPoint: 6,
      pricePerUnit: 4.50,
      expiryDate: addDays(new Date(), 4),
      supplier: 'Dairy Direct',
      wasteReduction: 25,
      status: 'low'
    },
    
    // Baked Goods
    {
      name: 'Croissants',
      category: 'Baked Goods',
      quantity: 24,
      unit: 'pieces',
      reorderPoint: 30,
      pricePerUnit: 1.25,
      expiryDate: addDays(new Date(), 2),
      supplier: 'Local Bakery',
      wasteReduction: 30,
      status: 'expiring'
    },
    {
      name: 'Bagels',
      category: 'Baked Goods',
      quantity: 36,
      unit: 'pieces',
      reorderPoint: 40,
      pricePerUnit: 0.85,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Local Bakery',
      wasteReduction: 20,
      status: 'good'
    },
    
    // Syrups & Flavorings
    {
      name: 'Vanilla Syrup',
      category: 'Syrups',
      quantity: 2,
      unit: 'bottles',
      reorderPoint: 3,
      pricePerUnit: 8.75,
      supplier: 'Flavor House',
      status: 'critical'
    },
    {
      name: 'Caramel Syrup',
      category: 'Syrups',
      quantity: 3,
      unit: 'bottles',
      reorderPoint: 3,
      pricePerUnit: 8.75,
      supplier: 'Flavor House',
      status: 'good'
    }
  ]
}

function getFineDiningData(): DemoInventoryItem[] {
  return [
    // Premium Proteins
    {
      name: 'Salmon Fillets',
      category: 'Seafood',
      quantity: 12,
      unit: 'lbs',
      reorderPoint: 15,
      pricePerUnit: 18.50,
      expiryDate: addDays(new Date(), 2),
      supplier: 'Ocean Fresh Seafood',
      wasteReduction: 25,
      status: 'expiring'
    },
    {
      name: 'Beef Tenderloin',
      category: 'Meat',
      quantity: 8,
      unit: 'lbs',
      reorderPoint: 10,
      pricePerUnit: 28.00,
      expiryDate: addDays(new Date(), 5),
      supplier: 'Prime Cuts',
      wasteReduction: 15,
      status: 'low'
    },
    
    // Premium Produce
    {
      name: 'Truffle Oil',
      category: 'Oils & Condiments',
      quantity: 2,
      unit: 'bottles',
      reorderPoint: 3,
      pricePerUnit: 45.00,
      supplier: 'Gourmet Imports',
      status: 'critical'
    },
    {
      name: 'Microgreens',
      category: 'Herbs',
      quantity: 6,
      unit: 'containers',
      reorderPoint: 8,
      pricePerUnit: 12.50,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Specialty Greens',
      wasteReduction: 40,
      status: 'expiring'
    },
    
    // Wine & Spirits
    {
      name: 'House White Wine',
      category: 'Beverages',
      quantity: 18,
      unit: 'bottles',
      reorderPoint: 24,
      pricePerUnit: 12.00,
      supplier: 'Wine Distributors',
      status: 'low'
    }
  ]
}

function getFastCasualData(): DemoInventoryItem[] {
  return [
    // Proteins
    {
      name: 'Chicken Breast',
      category: 'Meat',
      quantity: 30,
      unit: 'lbs',
      reorderPoint: 35,
      pricePerUnit: 4.25,
      expiryDate: addDays(new Date(), 4),
      supplier: 'Poultry Plus',
      wasteReduction: 18,
      status: 'low'
    },
    {
      name: 'Ground Beef',
      category: 'Meat',
      quantity: 25,
      unit: 'lbs',
      reorderPoint: 30,
      pricePerUnit: 5.50,
      expiryDate: addDays(new Date(), 3),
      supplier: 'Meat Masters',
      wasteReduction: 12,
      status: 'low'
    },
    
    // Vegetables
    {
      name: 'Lettuce',
      category: 'Produce',
      quantity: 15,
      unit: 'heads',
      reorderPoint: 20,
      pricePerUnit: 1.50,
      expiryDate: addDays(new Date(), 4),
      supplier: 'Fresh Farm Co',
      wasteReduction: 28,
      status: 'low'
    },
    {
      name: 'Avocados',
      category: 'Produce',
      quantity: 24,
      unit: 'pieces',
      reorderPoint: 30,
      pricePerUnit: 1.25,
      expiryDate: addDays(new Date(), 2),
      supplier: 'Fresh Farm Co',
      wasteReduction: 35,
      status: 'expiring'
    }
  ]
}

function getBarGrillData(): DemoInventoryItem[] {
  return [
    // Bar Supplies
    {
      name: 'House Beer',
      category: 'Beverages',
      quantity: 48,
      unit: 'bottles',
      reorderPoint: 60,
      pricePerUnit: 2.25,
      supplier: 'Beer Distributors',
      status: 'low'
    },
    {
      name: 'Wings',
      category: 'Meat',
      quantity: 20,
      unit: 'lbs',
      reorderPoint: 25,
      pricePerUnit: 3.75,
      expiryDate: addDays(new Date(), 5),
      supplier: 'Poultry Plus',
      wasteReduction: 15,
      status: 'low'
    }
  ]
}

function getBakeryData(): DemoInventoryItem[] {
  return [
    // Baking Ingredients
    {
      name: 'Bread Flour',
      category: 'Dry Goods',
      quantity: 100,
      unit: 'lbs',
      reorderPoint: 50,
      pricePerUnit: 0.95,
      supplier: 'Grain Supply Co',
      status: 'good'
    },
    {
      name: 'Butter',
      category: 'Dairy',
      quantity: 15,
      unit: 'lbs',
      reorderPoint: 20,
      pricePerUnit: 4.50,
      expiryDate: addDays(new Date(), 8),
      supplier: 'Dairy Direct',
      wasteReduction: 10,
      status: 'low'
    },
    {
      name: 'Fresh Eggs',
      category: 'Dairy',
      quantity: 24,
      unit: 'dozen',
      reorderPoint: 30,
      pricePerUnit: 2.25,
      expiryDate: addDays(new Date(), 6),
      supplier: 'Farm Fresh',
      wasteReduction: 8,
      status: 'low'
    }
  ]
}

// Demo menu items
export function getDemoMenuItems(restaurantType: string): DemoMenuItem[] {
  switch (restaurantType.toLowerCase()) {
    case 'pizza restaurant':
      return [
        {
          name: 'Margherita Pizza',
          category: 'Pizza',
          salesPercentage: 25,
          wastePercentage: 6.2,
          costPerServing: 4.50,
          sellingPrice: 16.99,
          profitMargin: 73.5
        },
        {
          name: 'Pepperoni Pizza',
          category: 'Pizza',
          salesPercentage: 35,
          wastePercentage: 4.8,
          costPerServing: 5.25,
          sellingPrice: 18.99,
          profitMargin: 72.4
        },
        {
          name: 'Caesar Salad',
          category: 'Salads',
          salesPercentage: 15,
          wastePercentage: 4.1,
          costPerServing: 3.75,
          sellingPrice: 12.99,
          profitMargin: 71.1
        }
      ]
    default:
      return [
        {
          name: 'House Special',
          category: 'Entrees',
          salesPercentage: 20,
          wastePercentage: 5.5,
          costPerServing: 6.50,
          sellingPrice: 19.99,
          profitMargin: 67.5
        }
      ]
  }
}

// Demo suppliers
export function getDemoSuppliers(): DemoSupplier[] {
  return [
    {
      name: 'Fresh Farm Co',
      category: 'Produce',
      contactPerson: 'Sarah Johnson',
      phone: '(843) 555-0101',
      email: 'sarah@freshfarmco.com',
      deliveryDays: ['Monday', 'Wednesday', 'Friday'],
      minimumOrder: 150,
      rating: 4.8
    },
    {
      name: 'Dairy Direct',
      category: 'Dairy',
      contactPerson: 'Mike Wilson',
      phone: '(843) 555-0102',
      email: 'mike@dairydirect.com',
      deliveryDays: ['Tuesday', 'Thursday', 'Saturday'],
      minimumOrder: 100,
      rating: 4.6
    },
    {
      name: 'Meat Masters',
      category: 'Meat',
      contactPerson: 'Tony Rodriguez',
      phone: '(843) 555-0103',
      email: 'tony@meatmasters.com',
      deliveryDays: ['Monday', 'Thursday'],
      minimumOrder: 200,
      rating: 4.9
    },
    {
      name: 'Charleston Coffee Roasters',
      category: 'Coffee & Tea',
      contactPerson: 'Emma Davis',
      phone: '(843) 555-0104',
      email: 'emma@charlestoncoffee.com',
      deliveryDays: ['Tuesday', 'Friday'],
      minimumOrder: 75,
      rating: 4.7
    }
  ]
}

// Utility function to add days to current date
function addDays(date: Date, days: number): string {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}

// Generate realistic waste insights based on demo data
export function generateWasteInsights(inventoryItems: DemoInventoryItem[]) {
  const insights = []
  
  // Find items with high waste reduction potential
  const highWasteItems = inventoryItems.filter(item => 
    item.wasteReduction && item.wasteReduction > 20
  )
  
  if (highWasteItems.length > 0) {
    const item = highWasteItems[0]
    insights.push({
      title: `Optimize ${item.name} Usage`,
      description: `${item.name} shows ${item.wasteReduction}% waste reduction potential. Consider portion control or menu adjustments.`,
      impact: 'high',
      savings: Math.round(item.quantity * item.pricePerUnit * 0.3),
      category: 'Waste Reduction'
    })
  }
  
  // Find expiring items
  const expiringItems = inventoryItems.filter(item => item.status === 'expiring')
  if (expiringItems.length > 0) {
    insights.push({
      title: 'Expiring Items Alert',
      description: `${expiringItems.length} items expiring soon. Consider daily specials or prep adjustments.`,
      impact: 'medium',
      savings: Math.round(expiringItems.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0) * 0.8),
      category: 'Inventory Management'
    })
  }
  
  return insights
}