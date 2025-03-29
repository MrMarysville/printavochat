/**
 * Printavo SanMar Integration Test - ST850 Sport-Tek Pullover Hoodie
 * 
 * This test focuses specifically on the ST850 product from SanMar
 */

// Configuration 
const API_CONFIG = {
  url: 'https://www.printavo.com/api/v2',
  email: 'sales@kingclothing.com',
  token: 'your_api_token_here'
};

// ST850 product data
const st850Data = {
  styleNumber: 'ST850',
  name: 'Sport-Tek Pullover Hoodie',
  description: 'A comfortable pullover hoodie that is perfect for both performance and casual wear.',
  brand: 'Sport-Tek',
  availableColors: ['Black', 'Navy', 'Red', 'Royal', 'Athletic Heather'],
  availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  basePrice: 24.99,
  wholesalePrice: 18.99,
  retailPrice: 39.99,
  inventory: {
    'Black': {
      'S': 150,
      'M': 200,
      'L': 200,
      'XL': 100,
      '2XL': 75,
      '3XL': 40
    },
    'Navy': {
      'S': 125,
      'M': 175,
      'L': 175,
      'XL': 90,
      '2XL': 50,
      '3XL': 30
    },
    'Red': {
      'S': 100,
      'M': 150,
      'L': 150,
      'XL': 80,
      '2XL': 40,
      '3XL': 25
    }
  }
};

// Mock customer data
const customerData = {
  id: 'cust-456',
  companyName: 'ABC Sports Team',
  email: 'coach@abcsports.com',
  phone: '555-987-6543',
  contacts: [
    { 
      id: 'cont-789',
      fullName: 'Coach Smith',
      email: 'coach@abcsports.com',
      phone: '555-987-6543'
    }
  ]
};

// API functions for ST850 testing
const ST850API = {
  /**
   * Get product information for ST850
   */
  getProductInfo: () => {
    console.log(`🔍 Getting product info for style number: ST850`);
    
    // Return product info without inventory
    const { inventory, ...productInfo } = st850Data;
    console.log('✅ Product found!');
    return productInfo;
  },
  
  /**
   * Check inventory for ST850 in a specific color
   */
  checkInventory: (color) => {
    console.log(`🔍 Checking inventory for ST850 in ${color}`);
    
    if (st850Data.availableColors.includes(color)) {
      const inventory = st850Data.inventory[color] || {};
      const totalAvailable = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
      
      console.log(`✅ Found inventory for ST850 in ${color}`);
      return {
        styleNumber: 'ST850',
        color,
        available: totalAvailable > 0,
        totalAvailable,
        inventory
      };
    } else {
      console.error(`❌ No inventory found for ST850 in ${color}`);
      return {
        styleNumber: 'ST850',
        color,
        available: false,
        totalAvailable: 0,
        inventory: {}
      };
    }
  },
  
  /**
   * Create a quote with ST850 products
   */
  createQuote: (items, settings = {}) => {
    console.log(`🔍 Creating quote for ST850 products`);
    console.log('Items:', JSON.stringify(items, null, 2));
    
    // Generate a random quote ID
    const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
    
    // Create line items
    const lineItems = items.map((item, idx) => {
      const sizeEntries = Object.entries(item.sizes || {});
      const sizes = sizeEntries.map(([size, qty]) => `${size}(${qty})`);
      
      // Calculate total quantity
      const quantity = sizeEntries.reduce((sum, [_, qty]) => sum + parseInt(qty), 0);
      
      return {
        id: `line-${idx + 1}`,
        product: `Sport-Tek ST850`,
        description: item.description || 'Sport-Tek Pullover Hoodie',
        color: item.color || 'Black',
        sizes,
        quantity,
        price: item.price || st850Data.basePrice
      };
    });
    
    // Check inventory if requested
    const inventoryWarnings = [];
    for (const item of items) {
      if (!item.checkInventory) continue;
      
      // Get inventory for this color
      const inventoryResult = ST850API.checkInventory(item.color);
      
      if (!inventoryResult.available) {
        inventoryWarnings.push({
          styleNumber: 'ST850',
          color: item.color,
          message: `No inventory available for ST850 in ${item.color}`
        });
        continue;
      }
      
      // Check each size
      for (const [size, requestedQty] of Object.entries(item.sizes)) {
        const availableQty = inventoryResult.inventory[size] || 0;
        if (requestedQty > availableQty) {
          inventoryWarnings.push({
            styleNumber: 'ST850',
            color: item.color,
            size,
            requestedQuantity: requestedQty,
            availableQuantity: availableQty,
            message: `Requested quantity (${requestedQty}) exceeds available inventory (${availableQty}) for ST850 ${item.color} size ${size}`
          });
        }
      }
    }
    
    // Create the quote
    const quote = {
      id: quoteId,
      customerId: customerData.id,
      contactId: customerData.contacts[0].id,
      customerNote: settings.customerNote || '',
      productionNote: settings.productionNote || '',
      createdAt: new Date().toISOString()
    };
    
    console.log(`✅ Created quote ${quoteId} with ${lineItems.length} items`);
    
    if (inventoryWarnings.length > 0) {
      console.log(`⚠️ Found ${inventoryWarnings.length} inventory warnings`);
    }
    
    return {
      quote,
      lineItems,
      inventoryWarnings
    };
  },
  
  /**
   * Calculate pricing for ST850 with various print locations
   */
  calculatePricing: (quantity, printLocations = [], options = {}) => {
    console.log(`🔍 Calculating pricing for ${quantity} ST850 hoodies`);
    
    // Base price with volume discount
    let basePrice = st850Data.basePrice;
    if (quantity >= 100) {
      basePrice -= 2.00; // $2 discount for 100+ units
    } else if (quantity >= 50) {
      basePrice -= 1.00; // $1 discount for 50+ units
    } else if (quantity >= 24) {
      basePrice -= 0.50; // $0.50 discount for 24+ units
    }
    
    // Add costs for print locations
    const printPrices = printLocations.map(location => {
      let locationPrice = 0;
      
      switch (location.type) {
        case 'front_chest':
          locationPrice = 3.50;
          break;
        case 'back':
          locationPrice = 5.00;
          break;
        case 'sleeve':
          locationPrice = 2.50;
          break;
        case 'hood':
          locationPrice = 4.00;
          break;
        default:
          locationPrice = 3.00;
      }
      
      // Adjust for colors in the design
      if (location.colors > 1) {
        locationPrice += (location.colors - 1) * 0.75;
      }
      
      return {
        location: location.type,
        price: locationPrice,
        colors: location.colors
      };
    });
    
    const totalPrintCost = printPrices.reduce((sum, location) => sum + location.price, 0);
    
    // Add optional features
    let optionalCosts = 0;
    if (options.nameOnBack) {
      optionalCosts += 5.00;
    }
    if (options.numberOnBack) {
      optionalCosts += 2.50;
    }
    if (options.premium) {
      optionalCosts += 3.00;
    }
    
    // Calculate total unit price
    const unitPrice = basePrice + totalPrintCost + optionalCosts;
    
    // Calculate total
    const subtotal = unitPrice * quantity;
    const tax = options.taxRate ? subtotal * options.taxRate : 0;
    const total = subtotal + tax;
    
    console.log(`✅ Pricing calculated for ${quantity} ST850 hoodies`);
    
    return {
      basePrice,
      printPrices,
      optionalCosts,
      unitPrice,
      quantity,
      subtotal,
      tax,
      total
    };
  }
};

// Run tests for ST850
async function runST850Tests() {
  console.log('🧪 Running ST850 Sport-Tek Pullover Hoodie Tests\n');
  
  try {
    // Test 1: Get product information
    console.log('\n== Test 1: Get ST850 Product Information ==');
    const product = ST850API.getProductInfo();
    
    console.log('📋 Product details:');
    console.log(`Style Number: ${product.styleNumber}`);
    console.log(`Name: ${product.name}`);
    console.log(`Brand: ${product.brand}`);
    console.log(`Description: ${product.description}`);
    console.log(`Base Price: $${product.basePrice}`);
    console.log(`Available Colors: ${product.availableColors.join(', ')}`);
    console.log(`Available Sizes: ${product.availableSizes.join(', ')}`);
    
    // Test 2: Check inventory for multiple colors
    console.log('\n== Test 2: Check ST850 Inventory in Multiple Colors ==');
    const colors = ['Black', 'Navy', 'Red'];
    
    for (const color of colors) {
      const inventoryResult = ST850API.checkInventory(color);
      
      console.log(`\nColor: ${color}`);
      console.log(`Available: ${inventoryResult.available}`);
      console.log(`Total Available: ${inventoryResult.totalAvailable} units`);
      console.log('Inventory by Size:');
      Object.entries(inventoryResult.inventory).forEach(([size, qty]) => {
        console.log(`  ${size}: ${qty} units`);
      });
    }
    
    // Test 3: Create quote with different colors and sizes
    console.log('\n== Test 3: Create Quote with ST850 Products ==');
    
    const quoteItems = [
      {
        color: 'Black',
        sizes: { 'M': 10, 'L': 15, 'XL': 5 },
        checkInventory: true,
        description: 'Front and back print - Team logo',
        price: 32.99
      },
      {
        color: 'Navy',
        sizes: { 'S': 5, 'M': 8, 'L': 7 },
        checkInventory: true,
        description: 'Left chest print - Coach edition',
        price: 29.99
      }
    ];
    
    const settings = {
      customerNote: 'Rush order for basketball team',
      productionNote: 'Coach items need name on back'
    };
    
    const quoteResult = ST850API.createQuote(quoteItems, settings);
    
    console.log('📋 Quote details:');
    console.log(`ID: ${quoteResult.quote.id}`);
    console.log(`Customer ID: ${quoteResult.quote.customerId}`);
    console.log(`Contact ID: ${quoteResult.quote.contactId}`);
    console.log(`Created: ${quoteResult.quote.createdAt}`);
    
    console.log('\n📦 Line Items:');
    quoteResult.lineItems.forEach((item, i) => {
      console.log(`\nItem ${i + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Product: ${item.product}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Color: ${item.color}`);
      console.log(`  Sizes: ${item.sizes.join(', ')}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: $${item.price}`);
    });
    
    // Test 4: Create order with exceeding inventory
    console.log('\n== Test 4: Test Inventory Warning ==');
    
    const largeOrder = [
      {
        color: 'Red',
        sizes: { 'S': 150, 'M': 200, 'L': 200 },  // Exceeds inventory
        checkInventory: true,
        description: 'Tournament special edition'
      }
    ];
    
    const largeQuoteResult = ST850API.createQuote(largeOrder);
    
    if (largeQuoteResult.inventoryWarnings.length > 0) {
      console.log('⚠️ Inventory Warnings:');
      largeQuoteResult.inventoryWarnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    }
    
    // Test 5: Calculate pricing for different quantities and options
    console.log('\n== Test 5: Calculate Pricing ==');
    
    const pricingScenarios = [
      {
        name: "Basic Team Order",
        quantity: 20,
        printLocations: [
          { type: 'front_chest', colors: 1 },
          { type: 'back', colors: 2 }
        ]
      },
      {
        name: "Premium Coach Package",
        quantity: 5,
        printLocations: [
          { type: 'front_chest', colors: 2 },
          { type: 'back', colors: 3 },
          { type: 'sleeve', colors: 1 }
        ],
        options: {
          nameOnBack: true,
          premium: true
        }
      },
      {
        name: "Large Tournament Order",
        quantity: 100,
        printLocations: [
          { type: 'front_chest', colors: 3 },
          { type: 'back', colors: 3 }
        ],
        options: {
          taxRate: 0.06
        }
      }
    ];
    
    for (const scenario of pricingScenarios) {
      console.log(`\nScenario: ${scenario.name}`);
      const pricing = ST850API.calculatePricing(
        scenario.quantity, 
        scenario.printLocations, 
        scenario.options || {}
      );
      
      console.log(`Base Price: $${pricing.basePrice.toFixed(2)}`);
      console.log(`Print Locations:`);
      pricing.printPrices.forEach(location => {
        console.log(`  ${location.location}: $${location.price.toFixed(2)} (${location.colors} colors)`);
      });
      
      if (pricing.optionalCosts > 0) {
        console.log(`Optional Features: $${pricing.optionalCosts.toFixed(2)}`);
      }
      
      console.log(`Unit Price: $${pricing.unitPrice.toFixed(2)}`);
      console.log(`Quantity: ${pricing.quantity}`);
      console.log(`Subtotal: $${pricing.subtotal.toFixed(2)}`);
      
      if (pricing.tax > 0) {
        console.log(`Tax: $${pricing.tax.toFixed(2)}`);
      }
      
      console.log(`Total: $${pricing.total.toFixed(2)}`);
    }
    
    // Test 6: Check unavailable color
    console.log('\n== Test 6: Test Unavailable Color ==');
    const unavailableColorResult = ST850API.checkInventory('Neon Green');
    console.log(`Color: Neon Green`);
    console.log(`Available: ${unavailableColorResult.available}`);
    console.log(`Total Available: ${unavailableColorResult.totalAvailable} units`);
    
    // Summary
    console.log('\n🎯 All ST850 tests completed!');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the tests
runST850Tests(); 