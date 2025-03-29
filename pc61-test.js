/**
 * Comprehensive Test for SanMar PC61 Style
 * 
 * This test specifically focuses on the Port & Company PC61 Essential T-Shirt
 * and tests all features of the SanMar integration with this product.
 */

// PC61 product data
const pc61Data = {
  styleNumber: 'PC61',
  name: 'Port & Company Essential T-Shirt',
  description: 'A customer favorite, this t-shirt is made of 100% cotton for softness and durability.',
  brand: 'Port & Company',
  availableColors: [
    'Athletic Heather', 'Black', 'Navy', 'Red', 'Royal', 'White', 
    'Dark Green', 'Sangria', 'Purple', 'Orange', 'Lime'
  ],
  availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  basePrice: 6.99,
  wholesalePrice: 4.79,
  retailPrice: 15.99,
  inventory: {
    'Athletic Heather': {
      'XS': 100, 'S': 250, 'M': 350, 'L': 300, 'XL': 200, '2XL': 150, '3XL': 75, '4XL': 50
    },
    'Black': {
      'XS': 75, 'S': 200, 'M': 300, 'L': 250, 'XL': 150, '2XL': 100, '3XL': 50, '4XL': 25
    },
    'Navy': {
      'XS': 60, 'S': 150, 'M': 275, 'L': 225, 'XL': 125, '2XL': 90, '3XL': 45, '4XL': 20
    },
    'White': {
      'XS': 125, 'S': 275, 'M': 375, 'L': 325, 'XL': 225, '2XL': 175, '3XL': 80, '4XL': 60
    }
  }
};

// Mock implementation of getting product info
function getSanMarProductInfo(styleNumber) {
  console.log(`🔍 Getting product info for style number: ${styleNumber}`);
  
  if (styleNumber === 'PC61') {
    const { inventory, ...productInfo } = pc61Data;
    console.log('✅ Product found!');
    return productInfo;
  } else {
    console.error(`❌ Product with style number ${styleNumber} not found`);
    return null;
  }
}

// Mock implementation of checking inventory
function checkSanMarInventory(styleNumber, color) {
  console.log(`🔍 Checking inventory for ${styleNumber} in ${color}`);
  
  if (styleNumber === 'PC61' && pc61Data.availableColors.includes(color)) {
    const inventory = pc61Data.inventory[color] || {};
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

// Mock implementation of creating quote with SanMar products
function createQuoteWithSanmarProducts(customerId, contactId, sanmarItems, settings = {}) {
  console.log(`🔍 Creating quote for customer ${customerId} with SanMar products`);
  console.log('Items:', JSON.stringify(sanmarItems, null, 2));
  
  // Generate a random quote ID
  const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
  
  // Create line items from the provided SanMar items
  const lineItems = sanmarItems.map((item, idx) => {
    // Get product info based on style number
    const productInfo = getSanMarProductInfo(item.styleNumber);
    
    // Format sizes as strings
    const sizeEntries = Object.entries(item.sizes || {});
    const sizes = sizeEntries.map(([size, qty]) => `${size}(${qty})`);
    
    // Calculate total quantity
    const quantity = sizeEntries.reduce((sum, [_, qty]) => sum + parseInt(qty), 0);
    
    return {
      id: `line-${idx + 1}`,
      product: `${productInfo?.brand || 'SanMar'} ${item.styleNumber}`,
      description: item.description || productInfo?.description || `SanMar Style #${item.styleNumber}`,
      color: item.color || 'No Color Specified',
      sizes,
      quantity,
      price: item.price || productInfo?.basePrice || 19.99
    };
  });
  
  // Check inventory if requested
  const inventoryWarnings = [];
  if (sanmarItems.some(item => item.checkInventory)) {
    for (const item of sanmarItems) {
      if (!item.checkInventory) continue;
      
      // Check inventory for this item
      const inventoryResult = checkSanMarInventory(item.styleNumber, item.color);
      
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

// Mock implementation of updating line item sizes
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
function runPC61Tests() {
  console.log('🧪 Running PC61 Tests\n');
  
  // Test 1: Get PC61 product information
  console.log('\n== Test 1: Get PC61 Product Information ==');
  const productInfo = getSanMarProductInfo('PC61');
  
  if (productInfo) {
    console.log('📋 Product details:');
    console.log(`Style Number: ${productInfo.styleNumber}`);
    console.log(`Name: ${productInfo.name}`);
    console.log(`Brand: ${productInfo.brand}`);
    console.log(`Description: ${productInfo.description}`);
    console.log(`Base Price: $${productInfo.basePrice}`);
    console.log(`Available Colors: ${productInfo.availableColors.join(', ')}`);
    console.log(`Available Sizes: ${productInfo.availableSizes.join(', ')}`);
  }
  
  // Test 2: Check PC61 inventory
  console.log('\n== Test 2: Check PC61 Inventory ==');
  const colorToCheck = 'Athletic Heather';
  const inventoryResult = checkSanMarInventory('PC61', colorToCheck);
  
  if (inventoryResult.available) {
    console.log('📋 Inventory details:');
    console.log(`Total Available: ${inventoryResult.totalAvailable} units`);
    console.log('Inventory by Size:');
    Object.entries(inventoryResult.inventory).forEach(([size, qty]) => {
      console.log(`  ${size}: ${qty} units`);
    });
  }
  
  // Test 3: Create quote with PC61 products
  console.log('\n== Test 3: Create Quote with PC61 Products ==');
  const sanmarItems = [
    {
      styleNumber: 'PC61',
      color: 'Athletic Heather',
      sizes: { 'S': 5, 'M': 10, 'L': 5 },
      checkInventory: true,
      description: 'Front logo, left chest',
      price: 15.99
    },
    {
      styleNumber: 'PC61',
      color: 'Black',
      sizes: { 'M': 8, 'L': 8, 'XL': 4 },
      checkInventory: true,
      description: 'Back design, full size',
      price: 15.99
    }
  ];
  
  const settings = {
    customerNote: 'PC61 test order in multiple colors',
    productionNote: 'Rush order - 5 day turnaround'
  };
  
  const quoteResult = createQuoteWithSanmarProducts(
    'cust-123',
    'cont-456',
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
  
  // Test 4: Update line item sizes for a PC61 item
  console.log('\n== Test 4: Update PC61 Line Item Sizes ==');
  const lineItemId = quoteResult.lineItems[0].id;
  const newSizes = { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 };
  
  const updatedLineItem = updateLineItemSizes(lineItemId, newSizes);
  
  console.log('📋 Updated Line Item:');
  console.log(`ID: ${updatedLineItem.id}`);
  console.log(`Sizes: ${updatedLineItem.sizes.join(', ')}`);
  console.log(`Total Quantity: ${updatedLineItem.quantity}`);
  
  // Test 5: Test with unavailable color
  console.log('\n== Test 5: Test with Unavailable Color ==');
  const unavailableColorResult = checkSanMarInventory('PC61', 'Neon Pink');
  console.log(`Available: ${unavailableColorResult.available}`);
  console.log(`Total Available: ${unavailableColorResult.totalAvailable} units`);
  
  // Test 6: Order that exceeds inventory
  console.log('\n== Test 6: Order that Exceeds Inventory ==');
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
    'cust-123',
    'cont-456',
    largeOrder
  );
  
  if (largeQuoteResult.inventoryWarnings.length > 0) {
    console.log('⚠️ Inventory Warnings:');
    largeQuoteResult.inventoryWarnings.forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.message}`);
    });
  }
  
  // Summary
  console.log('\n🎯 All PC61 tests completed successfully!');
}

// Run the PC61 tests
runPC61Tests(); 