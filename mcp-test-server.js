/**
 * Simple MCP Test Server to test Printavo GraphQL tools
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001; // Changed to 3001 for SanMar server

// Mock data for testing
const mockOrders = {
  '9435': {
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
  }
};

// Mock data for SanMar products
const mockSanmarProducts = {
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

// Set up middleware
app.use(bodyParser.json());

// MCP endpoint
app.post('/mcp', (req, res) => {
  const { tool, params } = req.body;
  console.log(`Received request for tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(params)}`);
  
  let response = {
    success: false,
    error: `Tool ${tool} not implemented in test server`
  };
  
  // Handle different tools
  switch (tool) {
    case 'get_order_by_visual_id':
      if (!params.visual_id) {
        response = {
          success: false,
          error: 'Missing required parameter: visual_id'
        };
      } else {
        const order = mockOrders[params.visual_id];
        if (order) {
          response = {
            success: true,
            data: order
          };
        } else {
          response = {
            success: false,
            error: `Order with visual ID ${params.visual_id} not found`
          };
        }
      }
      break;
      
    case 'create_quote_with_sanmar_products':
      if (!params.customer_id || !params.contact_id || !params.sanmar_items) {
        response = {
          success: false,
          error: 'Missing required parameters'
        };
      } else {
        const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
        const lineItems = params.sanmar_items.map((item, idx) => {
          const product = mockSanmarProducts[item.styleNumber];
          const sizes = Object.entries(item.sizes || {}).map(([size, qty]) => `${size}(${qty})`);
          
          return {
            id: `line-${idx + 1}`,
            product: `${product?.brand || 'SanMar'} ${item.styleNumber}`,
            description: item.description || `SanMar Style #${item.styleNumber}`,
            color: item.color || 'No Color Specified',
            sizes,
            quantity: Object.values(item.sizes || {}).reduce((sum, qty) => sum + parseInt(qty), 0),
            price: item.price || product?.basePrice || 19.99
          };
        });
        
        response = {
          success: true,
          data: {
            quote: {
              id: quoteId,
              customerId: params.customer_id,
              contactId: params.contact_id,
              customerNote: params.settings?.customerNote || '',
              productionNote: params.settings?.productionNote || ''
            },
            lineItems,
            inventoryWarnings: []
          }
        };
      }
      break;
      
    case 'update_line_item_sizes':
      if (!params.line_item_id || !params.sizes) {
        response = {
          success: false,
          error: 'Missing required parameters'
        };
      } else {
        const sizes = Object.entries(params.sizes).map(([size, qty]) => `${size}(${qty})`);
        
        response = {
          success: true,
          data: {
            lineItem: {
              id: params.line_item_id,
              sizes
            },
            message: 'Line item sizes updated successfully'
          }
        };
      }
      break;
  }
  
  // Send the response
  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`MCP Test Server running at http://localhost:${port}`);
  console.log('Available tools:');
  console.log('- get_order_by_visual_id');
  console.log('- create_quote_with_sanmar_products');
  console.log('- update_line_item_sizes');
}); 