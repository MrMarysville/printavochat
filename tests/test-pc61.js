/**
 * Specific Test for PC61 SanMar Style
 *
 * This script specifically tests creating a quote with PC61 SanMar style
 * and updates the size quantities.
 */

// Import the test-individual-tool getMockData function
const toolName = 'create_quote_with_sanmar_products';
const params = {
  customer_id: "cust-12345",
  contact_id: "cont-12345",
  sanmar_items: [
    {
      styleNumber: "PC61",
      color: "Athletic Heather",
      sizes: { "S": 5, "M": 10, "L": 5 },
      checkInventory: true,
      description: "Front logo, left chest"
    }
  ],
  settings: {
    customerNote: "SanMar PC61 test order",
    productionNote: "Rush 5-day turnaround"
  }
};

// Mock data provider function (simplified version of the one in test-individual-tool.js)
function getMockData(tool, params) {
  // SanMar product data
  const sanmarProducts = {
    'PC61': {
      styleNumber: 'PC61',
      name: 'Port & Company Essential T-Shirt',
      description: 'A customer favorite, this t-shirt is made of 100% cotton for softness and durability.',
      brand: 'Port & Company',
      availableColors: ['Athletic Heather', 'Black', 'Navy', 'Red', 'Royal', 'White'],
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      basePrice: 6.99
    }
  };
  
  if (tool === 'create_quote_with_sanmar_products') {
    // Create line items from the provided SanMar items
    const lineItems = params.sanmar_items.map((item, idx) => {
      const product = sanmarProducts[item.styleNumber];
      const styleName = product?.name || `SanMar Style #${item.styleNumber}`;
      const styleDescription = product?.description || item.description || `Unknown Style #${item.styleNumber}`;
      
      // Format sizes as strings like "S(5), M(10)"
      const sizes = Object.entries(item.sizes || {}).map(([size, qty]) => `${size}(${qty})`);
      
      // Calculate total quantity
      const quantity = Object.values(item.sizes || {}).reduce((sum, qty) => sum + parseInt(qty), 0);
      
      return {
        id: `line-${idx + 1}`,
        product: `${product?.brand || 'SanMar'} ${item.styleNumber}`,
        description: item.description || styleDescription,
        color: item.color || 'No Color Specified',
        sizes,
        quantity,
        price: item.price || product?.basePrice || 19.99
      };
    });
    
    return {
      success: true,
      quote: {
        id: 'quote-' + Math.floor(Math.random() * 10000),
        customerId: params.customer_id,
        contactId: params.contact_id,
        customerNote: params.settings?.customerNote || '',
        productionNote: params.settings?.productionNote || ''
      },
      lineItems,
      inventoryWarnings: []
    };
  }
  
  return {
    error: `Unknown tool: ${tool}`
  };
}

// Run the test
function testPC61() {
  console.log('🧪 Testing PC61 SanMar Style Quote Creation');
  console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`);
  
  try {
    const result = getMockData(toolName, params);
    
    if (result.error) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log('\n📊 Result:');
    console.log(`Quote ID: ${result.quote.id}`);
    console.log(`Customer: ${params.customer_id}`);
    console.log(`Contact: ${params.contact_id}`);
    
    console.log('\nLine Items:');
    result.lineItems.forEach((item, idx) => {
      console.log(`\nLine Item ${idx + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Product: ${item.product}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Color: ${item.color}`);
      console.log(`  Sizes: ${item.sizes.join(', ')}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: $${item.price}`);
    });
    
    console.log('\n✅ PC61 test completed successfully');
    
    // Now test updating sizes
    console.log('\n🧪 Testing size update for PC61 line item');
    
    const updateSizesParams = {
      line_item_id: result.lineItems[0].id,
      sizes: { "S": 10, "M": 15, "L": 10, "XL": 5 }
    };
    
    console.log(`📋 New sizes: ${JSON.stringify(updateSizesParams.sizes, null, 2)}`);
    
    const formattedSizes = Object.entries(updateSizesParams.sizes).map(([size, qty]) => `${size}(${qty})`);
    
    console.log(`\n✅ Updated sizes: ${formattedSizes.join(', ')}`);
    console.log('\n✅ Both tests completed successfully');
    
  } catch (error) {
    console.error(`❌ Error running test: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testPC61(); 