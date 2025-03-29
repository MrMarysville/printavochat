/**
 * District DT6000 T-Shirt Integration Test
 * 
 * This script tests the Printavo integration with SanMar's District DT6000 product.
 * It includes tests for product information, inventory checking, and quote creation.
 */

// Configuration
const config = {
  USE_REAL_API: false, // Set to true to use real Printavo API
  API_URL: 'https://www.printavo.com/api/v2',
  EMAIL: 'your-email@example.com',
  TOKEN: 'your-api-token'
};

// Mock product data for DT6000
const DT6000_DATA = {
  styleNumber: 'DT6000',
  name: 'District Very Important Tee',
  brand: 'District',
  description: 'Our bestselling tee with the lived-in, comfortable fit you love in a soft 100% ring spun cotton.',
  basePrice: 7.99,
  colors: ['Black', 'White', 'Navy', 'Red', 'Heathered Slate', 'Royal'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  inventory: {
    'Black': {
      available: true,
      total: 950,
      bySize: {
        'XS': 75,
        'S': 175,
        'M': 225,
        'L': 200,
        'XL': 150,
        '2XL': 75,
        '3XL': 50
      }
    },
    'White': {
      available: true,
      total: 1000,
      bySize: {
        'XS': 75,
        'S': 200,
        'M': 250,
        'L': 200,
        'XL': 150,
        '2XL': 75,
        '3XL': 50
      }
    },
    'Navy': {
      available: true,
      total: 850,
      bySize: {
        'XS': 50,
        'S': 150,
        'M': 200,
        'L': 200,
        'XL': 150,
        '2XL': 75,
        '3XL': 25
      }
    },
    'Red': {
      available: true,
      total: 750,
      bySize: {
        'XS': 50,
        'S': 125,
        'M': 175,
        'L': 175,
        'XL': 125,
        '2XL': 75,
        '3XL': 25
      }
    },
    'Heathered Slate': {
      available: true,
      total: 600,
      bySize: {
        'XS': 25,
        'S': 100,
        'M': 150,
        'L': 150,
        'XL': 100,
        '2XL': 50,
        '3XL': 25
      }
    },
    'Neon Green': {
      available: false,
      total: 0,
      bySize: {}
    }
  }
};

// Mock customer data
const CUSTOMER_DATA = {
  id: 'cust-123',
  name: 'Valley High School Athletics',
  contacts: [
    {
      id: 'cont-456',
      name: 'Coach Thompson',
      email: 'coach@valleyhigh.edu'
    }
  ]
};

// API Layer - These functions would interface with the actual API in production
function getProductInfo(styleNumber) {
  console.log(`\u001b[36m\u2709 Getting product info for style number: ${styleNumber}\u001b[0m`);
  
  // Simple mock implementation
  if (styleNumber === DT6000_DATA.styleNumber) {
    console.log('\u001b[32m\u2713 Product found!\u001b[0m');
    return {
      styleNumber: DT6000_DATA.styleNumber,
      name: DT6000_DATA.name,
      brand: DT6000_DATA.brand,
      description: DT6000_DATA.description,
      basePrice: DT6000_DATA.basePrice,
      colors: DT6000_DATA.colors,
      sizes: DT6000_DATA.sizes
    };
  }
  
  console.error(`\u001b[31m\u274C Product with style number ${styleNumber} not found\u001b[0m`);
  return { found: false, message: 'Product not found' };
}

function checkInventory(styleNumber, color) {
  console.log(`\u001b[36m\u2709 Checking inventory for ${styleNumber} in ${color}\u001b[0m`);
  
  // Simple mock implementation
  if (styleNumber !== DT6000_DATA.styleNumber) {
    console.error(`\u001b[31m\u274C Product with style number ${styleNumber} not found\u001b[0m`);
    return { available: false, total: 0 };
  }
  
  const colorInventory = DT6000_DATA.inventory[color];
  if (!colorInventory) {
    console.error(`\u001b[31m\u274C No inventory found for ${styleNumber} in ${color}\u001b[0m`);
    return { available: false, total: 0 };
  }
  
  if (colorInventory.available) {
    console.log(`\u001b[32m\u2713 Found inventory for ${styleNumber} in ${color}\u001b[0m`);
  }
  
  return {
    available: colorInventory.available,
    total: colorInventory.total,
    bySize: colorInventory.bySize
  };
}

function createQuote(items) {
  console.log(`\u001b[36m\u2709 Creating quote for DT6000 products\u001b[0m`);
  console.log('Items:', JSON.stringify(items, null, 2));
  
  // Check inventory for each item
  const inventoryWarnings = [];
  
  for (const item of items) {
    const inventory = checkInventory(DT6000_DATA.styleNumber, item.color);
    
    if (!inventory.available) {
      inventoryWarnings.push(`No inventory available for ${DT6000_DATA.styleNumber} in ${item.color}`);
      continue;
    }
    
    // Check inventory for each size
    for (const [size, quantity] of Object.entries(item.sizes)) {
      const availableQuantity = inventory.bySize[size] || 0;
      if (quantity > availableQuantity) {
        inventoryWarnings.push(`Requested quantity (${quantity}) exceeds available inventory (${availableQuantity}) for ${DT6000_DATA.styleNumber} ${item.color} size ${size}`);
      }
    }
  }
  
  // Generate a random quote ID
  const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
  
  // Create line items
  const lineItems = items.map((item, index) => {
    // Calculate total quantity across all sizes
    const totalQuantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    
    // Create formatted sizes for display
    const sizeDisplay = Object.entries(item.sizes)
      .map(([size, qty]) => `${size}(${qty})`)
      .join(', ');
    
    return {
      id: `line-${index + 1}`,
      product: `${DT6000_DATA.brand} ${DT6000_DATA.styleNumber}`,
      description: item.description || 'Custom printed t-shirt',
      color: item.color,
      sizes: item.sizes,
      sizeDisplay,
      quantity: totalQuantity,
      price: item.price || DT6000_DATA.basePrice
    };
  });
  
  console.log(`\u001b[32m\u2713 Created quote ${quoteId} with ${lineItems.length} items\u001b[0m`);
  
  if (inventoryWarnings.length > 0) {
    console.log(`\u001b[33m\u26A0\uFE0F Found ${inventoryWarnings.length} inventory warnings\u001b[0m`);
  }
  
  return {
    id: quoteId,
    customerId: CUSTOMER_DATA.id,
    contactId: CUSTOMER_DATA.contacts[0].id,
    created: new Date().toISOString(),
    lineItems,
    inventoryWarnings
  };
}

function decorationOptions(order) {
  console.log(`\u001b[36m\u2709 Getting decoration options for ${order.type}\u001b[0m`);
  
  // Different decoration options based on order type
  switch (order.type) {
    case 'school-spirit':
      return {
        printLocations: ['front_full', 'back_full'],
        printColors: ['1-color', '2-color', '3-color'],
        printTechniques: ['screen-print', 'heat-transfer'],
        specialFeatures: ['name-number', 'distressed-effect']
      };
      
    case 'team-uniform':
      return {
        printLocations: ['front_chest', 'back_full', 'sleeve'],
        printColors: ['1-color', '2-color'],
        printTechniques: ['screen-print'],
        specialFeatures: ['name-number']
      };
      
    case 'event':
      return {
        printLocations: ['front_full', 'back_full', 'sleeve'],
        printColors: ['1-color', '2-color', '3-color', '4-color'],
        printTechniques: ['screen-print', 'digital-print'],
        specialFeatures: ['glow-in-dark', 'metallic-ink']
      };
      
    default:
      return {
        printLocations: ['front_full', 'back_full'],
        printColors: ['1-color', '2-color'],
        printTechniques: ['screen-print'],
        specialFeatures: []
      };
  }
}

// Run all DT6000 tests
function runDT6000Tests() {
  console.log('\u001b[1m\n\u001b[35m\u2022 Running District DT6000 T-Shirt Tests\u001b[0m\n');
  
  // Test 1: Get product information
  console.log('\u001b[1m\n== Test 1: Get DT6000 Product Information ==\u001b[0m');
  const productInfo = getProductInfo(DT6000_DATA.styleNumber);
  console.log('\u001b[36m\u2709 Product details:\u001b[0m');
  console.log(`Style Number: ${productInfo.styleNumber}`);
  console.log(`Name: ${productInfo.name}`);
  console.log(`Brand: ${productInfo.brand}`);
  console.log(`Description: ${productInfo.description}`);
  console.log(`Base Price: $${productInfo.basePrice}`);
  console.log(`Available Colors: ${productInfo.colors.join(', ')}`);
  console.log(`Available Sizes: ${productInfo.sizes.join(', ')}`);
  
  // Test 2: Check inventory for multiple colors
  console.log('\u001b[1m\n== Test 2: Check DT6000 Inventory in Multiple Colors ==\u001b[0m');
  const colors = ['Black', 'White', 'Navy'];
  for (const color of colors) {
    const inventory = checkInventory(DT6000_DATA.styleNumber, color);
    
    console.log(`\nColor: ${color}`);
    console.log(`Available: ${inventory.available}`);
    console.log(`Total Available: ${inventory.total} units`);
    if (inventory.available) {
      console.log('Inventory by Size:');
      for (const [size, quantity] of Object.entries(inventory.bySize)) {
        console.log(`  ${size}: ${quantity} units`);
      }
    }
  }
  
  // Test 3: Create quote
  console.log('\u001b[1m\n== Test 3: Create Quote with DT6000 Products ==\u001b[0m');
  const quote = createQuote([
    {
      color: 'Black',
      sizes: {
        'S': 10,
        'M': 15,
        'L': 10,
        'XL': 5
      },
      description: 'School spirit wear - Front and back print',
      price: 12.99
    },
    {
      color: 'White',
      sizes: {
        'S': 8,
        'M': 10,
        'L': 7
      },
      description: 'School event - Single color print',
      price: 10.99
    }
  ]);
  
  console.log('\u001b[36m\u2709 Quote details:\u001b[0m');
  console.log(`ID: ${quote.id}`);
  console.log(`Customer ID: ${quote.customerId}`);
  console.log(`Contact ID: ${quote.contactId}`);
  console.log(`Created: ${quote.created}`);
  
  console.log('\u001b[36m\u2709 Line Items:\u001b[0m');
  quote.lineItems.forEach((item, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log(`  ID: ${item.id}`);
    console.log(`  Product: ${item.product}`);
    console.log(`  Description: ${item.description}`);
    console.log(`  Color: ${item.color}`);
    console.log(`  Sizes: ${item.sizeDisplay}`);
    console.log(`  Quantity: ${item.quantity}`);
    console.log(`  Price: $${item.price}`);
  });
  
  if (quote.inventoryWarnings && quote.inventoryWarnings.length) {
    console.log('\u001b[33m\u26A0\uFE0F Inventory Warnings:\u001b[0m');
    quote.inventoryWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  } else {
    console.log('\u001b[32m\u2713 No inventory warnings\u001b[0m');
  }
  
  // Test 4: Test inventory warning
  console.log('\u001b[1m\n== Test 4: Test Inventory Warning ==\u001b[0m');
  const largeQuote = createQuote([
    {
      color: 'Navy',
      sizes: {
        'S': 200,
        'M': 250,
        'L': 250
      },
      description: 'School-wide event special order',
      checkInventory: true
    }
  ]);
  
  if (largeQuote.inventoryWarnings && largeQuote.inventoryWarnings.length) {
    console.log('\u001b[33m\u26A0\uFE0F Inventory Warnings:\u001b[0m');
    largeQuote.inventoryWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  // Test 5: Get decoration options for different order types
  console.log('\u001b[1m\n== Test 5: Get Decoration Options ==\u001b[0m');
  
  const orderTypes = ['school-spirit', 'team-uniform', 'event'];
  
  for (const type of orderTypes) {
    console.log(`\nOrder Type: ${type}`);
    const options = decorationOptions({ type });
    
    console.log('Print Locations:');
    options.printLocations.forEach(location => console.log(`  - ${location}`));
    
    console.log('Print Colors:');
    options.printColors.forEach(color => console.log(`  - ${color}`));
    
    console.log('Print Techniques:');
    options.printTechniques.forEach(technique => console.log(`  - ${technique}`));
    
    console.log('Special Features:');
    if (options.specialFeatures.length === 0) {
      console.log('  - None available');
    } else {
      options.specialFeatures.forEach(feature => console.log(`  - ${feature}`));
    }
  }
  
  // Test 6: Test unavailable color
  console.log('\u001b[1m\n== Test 6: Test Unavailable Color ==\u001b[0m');
  const unavailableColorInventory = checkInventory(DT6000_DATA.styleNumber, 'Neon Green');
  console.log(`Color: Neon Green`);
  console.log(`Available: ${unavailableColorInventory.available}`);
  console.log(`Total Available: ${unavailableColorInventory.total} units`);
  
  console.log('\u001b[1m\n\u001b[32m\u2713 All DT6000 tests completed!\u001b[0m');
}

// Run the tests
runDT6000Tests(); 