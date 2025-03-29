/**
 * Direct Test of Printavo MCP SanMar Tools
 * 
 * This test does not require a running server - it tests the tools directly.
 */

// Mock data for testing
const mockOrder = {
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
};

// Mock SanMar product data
const sanmarProductData = {
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
  }
};

// Mock implementation of get_order_by_visual_id
function getOrderByVisualId(visualId) {
  console.log(`🔍 Looking up order with visual ID: ${visualId}`);
  
  if (visualId === '9435') {
    console.log('✅ Order found!');
    return mockOrder;
  } else {
    console.error(`❌ Order with visual ID ${visualId} not found`);
    return null;
  }
}

// Mock implementation of create_quote_with_sanmar_products
function createQuoteWithSanmarProducts(customerId, contactId, sanmarItems, settings = {}) {
  console.log(`🔍 Creating quote for customer ${customerId} with SanMar products`);
  console.log('Items:', JSON.stringify(sanmarItems, null, 2));
  
  // Generate a random quote ID
  const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
  
  // Create line items from the provided SanMar items
  const lineItems = sanmarItems.map((item, idx) => {
    const product = sanmarProductData[item.styleNumber];
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
  });
  
  // Check inventory if requested
  const inventoryWarnings = [];
  if (sanmarItems.some(item => item.checkInventory)) {
    for (const item of sanmarItems) {
      if (!item.checkInventory) continue;
      
      const product = sanmarProductData[item.styleNumber];
      if (!product) continue;
      
      const inventory = product.inventory[item.color];
      if (!inventory) continue;
      
      for (const [size, requestedQty] of Object.entries(item.sizes)) {
        const availableQty = inventory[size] || 0;
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

// Mock implementation of update_line_item_sizes
function updateLineItemSizes(lineItemId, sizes) {
  console.log(`🔍 Updating sizes for line item ${lineItemId}`);
  console.log('New sizes:', JSON.stringify(sizes, null, 2));
  
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
  
  return updatedLineItem;
}

// Run the tests
async function runTests() {
  console.log('🧪 Running Printavo GraphQL MCP Tools Tests\n');
  
  // Test 1: Get order by visual ID
  console.log('\n== Test 1: Get Order by Visual ID ==');
  const order = getOrderByVisualId('9435');
  
  if (order) {
    console.log('📋 Order details:');
    console.log(`ID: ${order.id}`);
    console.log(`Visual ID: ${order.visualId}`);
    console.log(`Customer: ${order.customer.companyName}`);
    console.log(`Status: ${order.status.name}`);
    console.log(`Created: ${order.createdAt}`);
    console.log(`Line Items: ${order.lineItems.length}`);
  }
  
  // Test 2: Create quote with SanMar products
  console.log('\n== Test 2: Create Quote with SanMar Products ==');
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
  
  const quoteResult = createQuoteWithSanmarProducts(
    'cust-789', 
    'cont-123', 
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
  
  // Test 3: Update line item sizes
  console.log('\n== Test 3: Update Line Item Sizes ==');
  const lineItemId = quoteResult.lineItems[0].id;
  const newSizes = { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 };
  
  const updatedLineItem = updateLineItemSizes(lineItemId, newSizes);
  
  console.log('📋 Updated Line Item:');
  console.log(`ID: ${updatedLineItem.id}`);
  console.log(`Sizes: ${updatedLineItem.sizes.join(', ')}`);
  console.log(`Total Quantity: ${updatedLineItem.quantity}`);
  
  // Test 4: Force inventory warning
  console.log('\n== Test 4: Test Inventory Warning ==');
  const largeOrder = [
    {
      styleNumber: 'PC61',
      color: 'Athletic Heather',
      sizes: { 'S': 300, 'M': 400, 'L': 350 },  // Exceeds inventory
      checkInventory: true,
      description: 'Front logo, left chest'
    }
  ];
  
  const largeQuoteResult = createQuoteWithSanmarProducts(
    'cust-789',
    'cont-123',
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
  
  // Summary
  console.log('\n🎯 All tests completed!');
}

// Run all tests
runTests(); 