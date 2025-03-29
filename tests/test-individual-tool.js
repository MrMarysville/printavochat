/**
 * Individual Tool Tester for Printavo GraphQL MCP Server
 * 
 * This script allows testing a single tool with custom parameters.
 * Usage: node test-individual-tool.js [toolName] [paramsJson]
 * Example: node test-individual-tool.js get_customer {"id": "123456"}
 */

// Parse command line arguments
const toolName = process.argv[2];
let params = {};

if (process.argv[3]) {
  try {
    params = JSON.parse(process.argv[3]);
  } catch (error) {
    console.error(`❌ Error parsing parameters: ${error.message}`);
    console.error('Parameters must be valid JSON');
    process.exit(1);
  }
}

if (!toolName) {
  console.error('❌ No tool name provided');
  console.log('Usage: node test-individual-tool.js [toolName] [paramsJson]');
  console.log('Example: node test-individual-tool.js get_customer {"id": "123456"}');
  console.log('\nAvailable SanMar tools:');
  console.log('- create_quote_with_sanmar_products');
  console.log('- create_quote_with_sanmar_live_data');
  console.log('- update_line_item_sizes');
  process.exit(1);
}

// Mock data provider function
function getMockData(tool, params) {
  // Basic mock data
  const mockCustomer = {
    id: params.id || 'cust-12345',
    companyName: 'OMC Test Customer',
    primaryContact: {
      id: 'cont-12345',
      fullName: 'John Smith',
      email: 'john@omc.com'
    }
  };
  
  const mockQuote = {
    id: 'quote-' + Math.floor(Math.random() * 10000),
    customer: mockCustomer,
    contact: mockCustomer.primaryContact,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
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
    },
    'ST850': {
      styleNumber: 'ST850', 
      name: 'Sport-Tek PosiCharge Competitor Hooded Pullover',
      description: 'Moisture-wicking, colorfast performance pullover that resists static cling.',
      brand: 'Sport-Tek',
      availableColors: ['Black', 'Forest Green', 'Silver', 'True Navy', 'True Red', 'True Royal'],
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      basePrice: 22.99
    }
  };
  
  // Generate mock responses based on the tool
  switch (tool) {
    case 'create_quote_with_sanmar_products':
    case 'create_quote_with_sanmar_live_data':
      if (!params.sanmar_items || !Array.isArray(params.sanmar_items)) {
        return { 
          error: 'Missing or invalid sanmar_items parameter. Must be an array.'
        };
      }
      
      // Create line items from the provided SanMar items
      const lineItems = params.sanmar_items.map((item, idx) => {
        const styleName = sanmarProducts[item.styleNumber]?.name || `SanMar Style #${item.styleNumber}`;
        const styleDescription = sanmarProducts[item.styleNumber]?.description || item.description || `Unknown Style #${item.styleNumber}`;
        
        // Format sizes as strings like "S(5), M(10)"
        const sizes = Object.entries(item.sizes || {}).map(([size, qty]) => `${size}(${qty})`);
        
        // Calculate total quantity
        const quantity = Object.values(item.sizes || {}).reduce((sum, qty) => sum + parseInt(qty), 0);
        
        return {
          id: `line-${idx + 1}`,
          product: `${sanmarProducts[item.styleNumber]?.brand || 'SanMar'} ${item.styleNumber}`,
          description: item.description || styleDescription,
          color: item.color || 'No Color Specified',
          sizes: sizes,
          quantity: quantity,
          price: item.price || sanmarProducts[item.styleNumber]?.basePrice || 19.99
        };
      });
      
      // Check for inventory issues
      const inventoryWarnings = [];
      if (params.sanmar_items.some(item => item.checkInventory)) {
        // Simulate some inventory warnings for demo purposes
        if (Math.random() > 0.7) {
          inventoryWarnings.push({
            styleNumber: params.sanmar_items[0].styleNumber,
            color: params.sanmar_items[0].color,
            size: Object.keys(params.sanmar_items[0].sizes)[0],
            requestedQuantity: Object.values(params.sanmar_items[0].sizes)[0],
            availableQuantity: Math.floor(Object.values(params.sanmar_items[0].sizes)[0] * 0.8),
            message: 'Requested quantity exceeds available inventory'
          });
        }
      }
      
      return {
        success: true,
        quote: {
          id: mockQuote.id,
          customerId: params.customer_id,
          contactId: params.contact_id,
          customerNote: params.settings?.customerNote || '',
          productionNote: params.settings?.productionNote || ''
        },
        lineItems,
        inventoryWarnings
      };
      
    case 'update_line_item_sizes':
      if (!params.line_item_id) {
        return { 
          error: 'Missing required parameter: line_item_id'
        };
      }
      
      if (!params.sizes || typeof params.sizes !== 'object') {
        return { 
          error: 'Missing or invalid sizes parameter. Must be an object with size:quantity pairs.'
        };
      }
      
      // Format sizes as strings
      const sizeStrings = Object.entries(params.sizes).map(([size, qty]) => `${size}(${qty})`);
      
      return {
        success: true,
        lineItem: {
          id: params.line_item_id,
          sizes: sizeStrings
        },
        message: 'Line item sizes updated successfully'
      };
      
    case 'get_customer':
      return mockCustomer;
      
    case 'get_line_item':
      return {
        id: params.id || 'line-12345',
        product: 'SanMar PC61',
        description: 'Port & Company Essential T-Shirt',
        color: params.color || 'Athletic Heather',
        sizes: ['S(5)', 'M(10)', 'L(5)', 'XL(3)'],
        quantity: 23,
        price: 15.99
      };
      
    default:
      return {
        message: `Mock response for ${tool}`,
        toolName: tool,
        params: params
      };
  }
}

// Run the individual tool test
function testTool() {
  console.log(`🧪 Testing tool: ${toolName}`);
  console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`);
  
  try {
    const result = getMockData(toolName, params);
    
    if (result.error) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error(`❌ Error running test: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testTool(); 