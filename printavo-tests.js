/**
 * Printavo SanMar Integration Tests
 * 
 * This script tests the SanMar integration functionality
 * It's currently using mock data but is structured to be
 * easily modified to use real API data in the future.
 */

// === Configuration - Replace with your real API credentials to use real data ===
const USE_REAL_API = false; // Set to true to use real Printavo API
const API_CONFIG = {
  url: 'https://www.printavo.com/api/v2',
  email: 'sales@kingclothing.com',
  token: 'your_api_token_here'
};

// === Mock Data ===
const MOCK_DATA = {
  // Order with visual ID 9435
  order: {
    id: 'order-123456',
    visualId: '9435',
    customer: {
      id: 'cust-789',
      companyName: 'OMC Test Customer'
    },
    status: {
      id: 'status-1',
      name: 'In Production'
    },
    createdAt: '2023-03-15T14:30:00Z',
    lineItems: [
      {
        id: 'line-1',
        product: 'SanMar PC61',
        description: 'Port & Company Essential T-Shirt - Front Logo',
        quantity: 20,
        price: 15.99,
        sizes: ['S(5)', 'M(10)', 'L(5)']
      },
      {
        id: 'line-2',
        product: 'SanMar ST850',
        description: 'Sport-Tek Pullover Hoodie - Back Design',
        quantity: 15,
        price: 34.99,
        sizes: ['M(5)', 'L(7)', 'XL(3)']
      }
    ]
  },
  
  // SanMar Products
  sanmarProducts: {
    'PC61': {
      styleNumber: 'PC61',
      name: 'Port & Company Essential T-Shirt',
      description: 'A customer favorite, this t-shirt is made of 100% cotton for softness and durability.',
      brand: 'Port & Company',
      availableColors: ['Athletic Heather', 'Black', 'Navy', 'Red', 'Royal', 'White'],
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      basePrice: 6.99,
      inventory: {
        'Athletic Heather': {
          'S': 250,
          'M': 350,
          'L': 300,
          'XL': 200,
          '2XL': 150
        },
        'Black': {
          'S': 200,
          'M': 300,
          'L': 250,
          'XL': 150,
          '2XL': 100
        }
      }
    },
    'ST850': {
      styleNumber: 'ST850',
      name: 'Sport-Tek Pullover Hoodie',
      description: 'A comfortable pullover hoodie that is perfect for both performance and casual wear.',
      brand: 'Sport-Tek',
      availableColors: ['Black', 'Navy', 'Red', 'Royal', 'Athletic Heather'],
      availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      basePrice: 24.99,
      inventory: {
        'Black': {
          'S': 150,
          'M': 200,
          'L': 200,
          'XL': 100,
          '2XL': 75
        },
        'Navy': {
          'S': 125,
          'M': 175,
          'L': 175,
          'XL': 90,
          '2XL': 50
        }
      }
    }
  },
  
  // Customers
  customers: [
    {
      id: 'cust-789',
      companyName: 'OMC Test Customer',
      email: 'test@example.com',
      phone: '555-123-4567',
      contacts: [
        { 
          id: 'cont-123',
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '555-123-4567'
        }
      ]
    }
  ]
};

// === API Layer ===
// This can be modified to use real API when USE_REAL_API is true
const PrintavoAPI = {
  /**
   * Get an order by visual ID
   */
  getOrderByVisualId: async (visualId) => {
    console.log(`🔍 Looking up order with visual ID: ${visualId}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      if (visualId === '9435') {
        console.log('✅ Order found!');
        return MOCK_DATA.order;
      } else {
        console.error(`❌ Order with visual ID ${visualId} not found`);
        return null;
      }
    }
  },
  
  /**
   * Get product information for a SanMar style
   */
  getSanMarProductInfo: async (styleNumber) => {
    console.log(`🔍 Getting product info for style number: ${styleNumber}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const product = MOCK_DATA.sanmarProducts[styleNumber];
      if (product) {
        console.log('✅ Product found!');
        const { inventory, ...productInfo } = product;
        return productInfo;
      } else {
        console.error(`❌ Product with style number ${styleNumber} not found`);
        return null;
      }
    }
  },
  
  /**
   * Check inventory for a SanMar product
   */
  checkSanMarInventory: async (styleNumber, color) => {
    console.log(`🔍 Checking inventory for ${styleNumber} in ${color}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const product = MOCK_DATA.sanmarProducts[styleNumber];
      if (product && product.availableColors.includes(color)) {
        const inventory = product.inventory[color] || {};
        const totalAvailable = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
        
        console.log(`✅ Found inventory for ${styleNumber} in ${color}`);
        return {
          styleNumber,
          color,
          available: totalAvailable > 0,
          totalAvailable,
          inventory
        };
      } else {
        console.error(`❌ No inventory found for ${styleNumber} in ${color}`);
        return {
          styleNumber,
          color,
          available: false,
          totalAvailable: 0,
          inventory: {}
        };
      }
    }
  },
  
  /**
   * Create a quote with SanMar products
   */
  createQuoteWithSanmarProducts: async (customerId, contactId, sanmarItems, settings = {}) => {
    console.log(`🔍 Creating quote for customer ${customerId} with SanMar products`);
    console.log('Items:', JSON.stringify(sanmarItems, null, 2));
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      // Generate a random quote ID
      const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
      
      // Create line items from the provided SanMar items
      const lineItems = await Promise.all(sanmarItems.map(async (item, idx) => {
        // Get product info
        const product = await PrintavoAPI.getSanMarProductInfo(item.styleNumber);
        
        const sizeEntries = Object.entries(item.sizes || {});
        const sizes = sizeEntries.map(([size, qty]) => `${size}(${qty})`);
        
        // Calculate total quantity
        const quantity = sizeEntries.reduce((sum, [_, qty]) => sum + parseInt(qty), 0);
        
        return {
          id: `line-${idx + 1}`,
          product: `${product?.brand || 'SanMar'} ${item.styleNumber}`,
          description: item.description || `SanMar Style #${item.styleNumber}`,
          color: item.color || 'No Color Specified',
          sizes,
          quantity,
          price: item.price || product?.basePrice || 19.99
        };
      }));
      
      // Check inventory if requested
      const inventoryWarnings = [];
      if (sanmarItems.some(item => item.checkInventory)) {
        for (const item of sanmarItems) {
          if (!item.checkInventory) continue;
          
          const inventoryResult = await PrintavoAPI.checkSanMarInventory(item.styleNumber, item.color);
          
          if (!inventoryResult.available) {
            inventoryWarnings.push({
              styleNumber: item.styleNumber,
              color: item.color,
              message: `No inventory available for ${item.styleNumber} in ${item.color}`
            });
            continue;
          }
          
          // Check each size
          for (const [size, requestedQty] of Object.entries(item.sizes)) {
            const availableQty = inventoryResult.inventory[size] || 0;
            if (requestedQty > availableQty) {
              inventoryWarnings.push({
                styleNumber: item.styleNumber,
                color: item.color,
                size,
                requestedQuantity: requestedQty,
                availableQuantity: availableQty,
                message: `Requested quantity (${requestedQty}) exceeds available inventory (${availableQty}) for ${item.styleNumber} ${item.color} size ${size}`
              });
            }
          }
        }
      }
      
      // Create the quote response
      const quote = {
        id: quoteId,
        customerId,
        contactId,
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
    }
  },
  
  /**
   * Update line item sizes
   */
  updateLineItemSizes: async (lineItemId, sizes) => {
    console.log(`🔍 Updating sizes for line item ${lineItemId}`);
    console.log('New sizes:', JSON.stringify(sizes, null, 2));
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      // Format sizes as strings
      const formattedSizes = Object.entries(sizes).map(([size, qty]) => `${size}(${qty})`);
      
      // Calculate total quantity
      const quantity = Object.values(sizes).reduce((sum, qty) => sum + parseInt(qty), 0);
      
      const updatedLineItem = {
        id: lineItemId,
        sizes: formattedSizes,
        quantity
      };
      
      console.log(`✅ Updated sizes for line item ${lineItemId}`);
      console.log(`New quantity: ${quantity}`);
      
      return {
        lineItem: updatedLineItem,
        message: 'Line item sizes updated successfully'
      };
    }
  },
  
  /**
   * Get customers
   */
  getCustomers: async (limit = 10) => {
    console.log(`🔍 Getting customers (limit: ${limit})`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      return MOCK_DATA.customers.slice(0, limit);
    }
  },
  
  /**
   * Get contacts for a customer
   */
  getContacts: async (customerId) => {
    console.log(`🔍 Getting contacts for customer: ${customerId}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const customer = MOCK_DATA.customers.find(c => c.id === customerId);
      if (customer) {
        return customer.contacts || [];
      } else {
        return [];
      }
    }
  }
};

// === Test Runner ===
async function runTests() {
  console.log('🧪 Running Printavo SanMar Integration Tests\n');
  console.log(`Mode: ${USE_REAL_API ? 'REAL API' : 'MOCK DATA'}\n`);
  
  try {
    // Test 1: Get order by visual ID
    console.log('\n== Test 1: Get Order by Visual ID ==');
    const order = await PrintavoAPI.getOrderByVisualId('9435');
    
    if (order) {
      console.log('📋 Order details:');
      console.log(`ID: ${order.id}`);
      console.log(`Visual ID: ${order.visualId}`);
      console.log(`Customer: ${order.customer.companyName}`);
      console.log(`Status: ${order.status.name}`);
      console.log(`Created: ${order.createdAt}`);
      console.log(`Line Items: ${order.lineItems.length}`);
    }
    
    // Test 2: Get product information
    console.log('\n== Test 2: Get Product Information ==');
    const product = await PrintavoAPI.getSanMarProductInfo('PC61');
    
    if (product) {
      console.log('📋 Product details:');
      console.log(`Style Number: ${product.styleNumber}`);
      console.log(`Name: ${product.name}`);
      console.log(`Brand: ${product.brand}`);
      console.log(`Description: ${product.description}`);
      console.log(`Base Price: $${product.basePrice}`);
      console.log(`Available Colors: ${product.availableColors.join(', ')}`);
      console.log(`Available Sizes: ${product.availableSizes.join(', ')}`);
    }
    
    // Test 3: Check product inventory
    console.log('\n== Test 3: Check Product Inventory ==');
    const inventoryResult = await PrintavoAPI.checkSanMarInventory('PC61', 'Athletic Heather');
    
    if (inventoryResult.available) {
      console.log('📋 Inventory details:');
      console.log(`Total Available: ${inventoryResult.totalAvailable} units`);
      console.log('Inventory by Size:');
      Object.entries(inventoryResult.inventory).forEach(([size, qty]) => {
        console.log(`  ${size}: ${qty} units`);
      });
    }
    
    // Test 4: Create quote with SanMar products
    console.log('\n== Test 4: Create Quote with SanMar Products ==');
    
    // Get a customer and contact
    const customers = await PrintavoAPI.getCustomers(1);
    if (!customers || customers.length === 0) {
      throw new Error('No customers found for testing');
    }
    
    const customerId = customers[0].id;
    console.log(`Using customer: ${customers[0].companyName} (${customerId})`);
    
    const contacts = await PrintavoAPI.getContacts(customerId);
    let contactId = null;
    if (contacts && contacts.length > 0) {
      contactId = contacts[0].id;
      console.log(`Using contact: ${contacts[0].fullName} (${contactId})`);
    }
    
    const sanmarItems = [
      {
        styleNumber: 'PC61',
        color: 'Athletic Heather',
        sizes: { 'S': 5, 'M': 10, 'L': 5 },
        checkInventory: true,
        description: 'Front logo, left chest',
        price: 15.99
      }
    ];
    
    const settings = {
      customerNote: 'SanMar PC61 test order',
      productionNote: 'Rush order - 5 day turnaround'
    };
    
    const quoteResult = await PrintavoAPI.createQuoteWithSanmarProducts(
      customerId,
      contactId,
      sanmarItems,
      settings
    );
    
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
    
    if (quoteResult.inventoryWarnings.length > 0) {
      console.log('\n⚠️ Inventory Warnings:');
      quoteResult.inventoryWarnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    } else {
      console.log('\n✅ No inventory warnings');
    }
    
    // Test 5: Update line item sizes
    console.log('\n== Test 5: Update Line Item Sizes ==');
    const lineItemId = quoteResult.lineItems[0].id;
    const newSizes = { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 };
    
    const updateResult = await PrintavoAPI.updateLineItemSizes(lineItemId, newSizes);
    
    console.log('📋 Updated Line Item:');
    console.log(`ID: ${updateResult.lineItem.id}`);
    console.log(`Sizes: ${updateResult.lineItem.sizes.join(', ')}`);
    console.log(`Total Quantity: ${updateResult.lineItem.quantity}`);
    console.log(`Message: ${updateResult.message}`);
    
    // Test 6: Force inventory warning (Large order)
    console.log('\n== Test 6: Test Inventory Warning ==');
    const largeOrder = [
      {
        styleNumber: 'PC61',
        color: 'Athletic Heather',
        sizes: { 'S': 300, 'M': 400, 'L': 350 },  // Exceeds inventory
        checkInventory: true,
        description: 'Front logo, left chest'
      }
    ];
    
    const largeQuoteResult = await PrintavoAPI.createQuoteWithSanmarProducts(
      customerId,
      contactId,
      largeOrder
    );
    
    if (largeQuoteResult.inventoryWarnings.length > 0) {
      console.log('⚠️ Inventory Warnings:');
      largeQuoteResult.inventoryWarnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    } else {
      console.log('❌ Expected inventory warnings but none were found');
    }
    
    // Test 7: Non-existent product
    console.log('\n== Test 7: Test Non-existent Product ==');
    const nonExistentProduct = await PrintavoAPI.getSanMarProductInfo('INVALID123');
    console.log(`Result: ${nonExistentProduct === null ? 'Product not found (expected)' : 'Product found (unexpected)'}`);
    
    // Test 8: Unavailable color
    console.log('\n== Test 8: Test Unavailable Color ==');
    const unavailableColorResult = await PrintavoAPI.checkSanMarInventory('PC61', 'Neon Pink');
    console.log(`Available: ${unavailableColorResult.available}`);
    console.log(`Total Available: ${unavailableColorResult.totalAvailable} units`);
    
    // Summary
    console.log('\n🎯 All tests completed!');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the tests
runTests(); 