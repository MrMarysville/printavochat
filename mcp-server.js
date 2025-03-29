const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Load the main MCP server
require('./build/index.js');

// Parse JSON request bodies
app.use(bodyParser.json());

// MCP endpoint
app.post('/mcp', (req, res) => {
  try {
    const { tool, params } = req.body;
    console.log(`Received request for tool: ${tool}`);
    console.log(`Parameters: ${JSON.stringify(params)}`);
    
    // Mock successful response for testing
    res.json({
      success: true,
      data: getMockData(tool, params)
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate mock data
function getMockData(tool, params) {
  switch (tool) {
    case 'get_account':
      return {
        id: 'acc-123',
        name: 'King Clothing',
        email: 'sales@kingclothing.com'
      };
    case 'get_current_user':
      return {
        id: 'user-123',
        email: 'sales@kingclothing.com',
        name: 'King Admin'
      };
    case 'list_customers':
      return [
        {
          id: 'cust-123',
          companyName: 'ABC Corp',
          primaryContact: {
            id: 'cont-123',
            fullName: 'John Doe',
            email: 'john@abc.com'
          }
        },
        {
          id: 'cust-456',
          companyName: 'XYZ Inc',
          primaryContact: {
            id: 'cont-456',
            fullName: 'Jane Smith',
            email: 'jane@xyz.com'
          }
        }
      ];
    case 'get_customer':
      return {
        id: params.id || 'cust-123',
        companyName: 'ABC Corp',
        primaryContact: {
          id: 'cont-123',
          fullName: 'John Doe',
          email: 'john@abc.com'
        }
      };
    case 'list_contacts':
      return [
        {
          id: 'cont-123',
          fullName: 'John Doe',
          email: 'john@abc.com',
          customer: {
            id: 'cust-123',
            companyName: 'ABC Corp'
          }
        },
        {
          id: 'cont-456',
          fullName: 'Jane Smith',
          email: 'jane@xyz.com',
          customer: {
            id: 'cust-456',
            companyName: 'XYZ Inc'
          }
        }
      ];
    case 'get_contact':
      return {
        id: params.id || 'cont-123',
        fullName: 'John Doe',
        email: 'john@abc.com',
        customer: {
          id: 'cust-123',
          companyName: 'ABC Corp'
        }
      };
    case 'list_orders':
      return [
        {
          id: 'ord-123',
          visualId: '1001',
          total: '500.00',
          status: {
            id: 'status-1',
            name: 'Confirmed'
          },
          customer: {
            id: 'cust-123',
            companyName: 'ABC Corp'
          },
          lineItems: [
            {
              id: 'line-123',
              product: 'T-Shirt',
              color: 'Blue',
              sizes: ['S(5)', 'M(10)', 'L(5)'],
              price: 19.99
            }
          ],
          lineItemGroups: [
            {
              id: 'group-123',
              name: 'Default Group'
            }
          ]
        }
      ];
    case 'get_order':
      return {
        id: params.id || 'ord-123',
        visualId: '1001',
        total: '500.00',
        status: {
          id: 'status-1',
          name: 'Confirmed'
        },
        customer: {
          id: 'cust-123',
          companyName: 'ABC Corp'
        },
        lineItems: [
          {
            id: 'line-123',
            product: 'T-Shirt',
            color: 'Blue',
            sizes: ['S(5)', 'M(10)', 'L(5)'],
            price: 19.99
          }
        ],
        lineItemGroups: [
          {
            id: 'group-123',
            name: 'Default Group'
          }
        ]
      };
    case 'get_order_by_visual_id':
      return {
        id: 'ord-123',
        visualId: params.visual_id || '1001',
        total: '500.00',
        status: {
          id: 'status-1',
          name: 'Confirmed'
        }
      };
    case 'get_line_item':
      return {
        id: params.id || 'line-123',
        product: 'T-Shirt',
        color: 'Blue',
        sizes: ['S(5)', 'M(10)', 'L(5)'],
        price: 19.99
      };
    case 'get_line_item_group':
      return {
        id: params.id || 'group-123',
        name: 'Default Group'
      };
    case 'list_statuses':
      return [
        {
          id: 'status-1',
          name: 'Confirmed',
          color: '#00FF00'
        },
        {
          id: 'status-2',
          name: 'In Production',
          color: '#0000FF'
        }
      ];
    case 'get_status':
      return {
        id: params.id || 'status-1',
        name: 'Confirmed',
        color: '#00FF00'
      };
    case 'search_orders':
      return [
        {
          id: 'ord-123',
          visualId: '1001',
          total: '500.00',
          customer: {
            companyName: 'ABC Corp'
          }
        }
      ];
    case 'quote_create':
      return {
        id: 'quote-123',
        customerNote: params.input.customerNote || '',
        status: {
          id: params.input.statusId || 'status-1',
          name: 'Confirmed'
        },
        lineItemGroups: [
          {
            id: 'group-123',
            name: 'Default Group'
          }
        ]
      };
    case 'line_item_create':
      return {
        id: 'line-' + Math.floor(Math.random() * 1000),
        product: params.input.product,
        color: params.input.color,
        description: params.input.description,
        sizes: params.input.sizes,
        price: params.input.price
      };
    case 'line_item_update':
      return {
        id: params.id,
        product: 'Updated Product',
        color: 'Updated Color',
        description: params.input.description,
        sizes: params.input.sizes,
        price: 29.99
      };
    case 'quote_update':
      return {
        id: params.id,
        customerNote: params.input.customerNote,
        status: {
          id: 'status-1',
          name: 'Confirmed'
        }
      };
    case 'quote_duplicate':
      return {
        id: 'quote-' + Math.floor(Math.random() * 1000),
        customerNote: 'Duplicated quote',
        status: {
          id: 'status-1',
          name: 'Confirmed'
        }
      };
    case 'update_status':
      return {
        statusUpdate: true
      };
    case 'line_item_delete':
      return {
        id: params.id,
        deleted: true
      };
    case 'get_order_summary':
      return {
        success: true,
        order: {
          id: params.id,
          visualId: '1001',
          total: '500.00'
        },
        lineItems: [
          {
            id: 'line-123',
            product: 'T-Shirt',
            color: 'Blue',
            sizes: ['S(5)', 'M(10)', 'L(5)'],
            price: 19.99
          }
        ],
        customer: {
          id: 'cust-123',
          companyName: 'ABC Corp'
        },
        contact: {
          id: 'cont-123',
          fullName: 'John Doe'
        },
        transactions: [],
        timeline: [],
        summary: {
          invoiceNumber: '1001',
          customerName: 'ABC Corp',
          totalAmount: '500.00',
          amountPaid: '0.00',
          amountDue: '500.00',
          status: 'Confirmed',
          createdAt: '2023-01-01T00:00:00Z',
          dueAt: '2023-02-01T00:00:00Z',
          isPaid: false,
          daysSinceCreation: 30,
          daysUntilDue: 7
        }
      };
    case 'create_quote_with_items':
      return {
        success: true,
        quote: {
          id: 'quote-' + Math.floor(Math.random() * 1000),
          customerId: params.customer_id,
          contactId: params.contact_id,
          customerNote: params.settings?.customerNote || ''
        },
        lineItems: params.line_items.map((item, idx) => ({
          id: 'line-' + (idx + 1),
          product: item.product,
          color: item.color,
          sizes: item.sizes,
          price: item.price
        }))
      };
    case 'convert_quote_to_invoice':
      return {
        success: true,
        originalQuote: {
          id: params.quote_id
        },
        invoice: {
          id: 'inv-' + Math.floor(Math.random() * 1000),
          originalQuoteId: params.quote_id,
          statusId: params.status_id
        }
      };
    case 'search_customer_detail':
      return {
        success: true,
        results: [
          {
            id: 'cust-123',
            companyName: 'ABC Corp',
            contacts: [
              {
                id: 'cont-123',
                fullName: 'John Doe',
                email: 'john@abc.com'
              }
            ],
            orderCount: 5,
            recentOrders: [],
            metrics: {
              totalSpent: 2500,
              averageOrderValue: 500,
              daysSinceFirstOrder: 90,
              daysSinceLastOrder: 5,
              frequency: 18
            }
          }
        ],
        count: 1,
        query: params.query
      };
    case 'get_order_analytics':
      return {
        success: true,
        totalOrders: 25,
        totalValue: 12500,
        periodDays: params.days || 30,
        byStatus: {
          'Confirmed': {
            count: 10,
            value: 5000,
            orders: []
          },
          'In Production': {
            count: 8,
            value: 4000,
            orders: []
          },
          'Shipped': {
            count: 7,
            value: 3500,
            orders: []
          }
        },
        metrics: {
          averageOrderValue: 500,
          ordersPerDay: 0.83,
          revenuePerDay: 416.67
        }
      };
    case 'get_customer_analytics':
      return {
        success: true,
        customerCount: 50,
        customerSegments: {
          'Champions': [],
          'Loyal Customers': [],
          'Promising': [],
          'At Risk': [],
          'Lost': []
        },
        segmentMetrics: {
          'Champions': {
            customerCount: 10,
            percentOfCustomers: 20,
            totalRevenue: 15000,
            percentOfRevenue: 60,
            averageOrderValue: 750
          }
        },
        individualCustomers: []
      };
    case 'create_quote_with_sanmar_products':
    case 'create_quote_with_sanmar_live_data':
      return {
        success: true,
        quote: {
          id: 'quote-' + Math.floor(Math.random() * 1000),
          customerId: params.customer_id,
          contactId: params.contact_id,
          customerNote: params.settings?.customerNote || ''
        },
        lineItems: params.sanmar_items.map((item, idx) => ({
          id: 'line-' + (idx + 1),
          product: `SanMar ${item.styleNumber}`,
          color: item.color,
          description: item.description || `SanMar Style #${item.styleNumber}`,
          sizes: Object.entries(item.sizes).map(([size, qty]) => `${size}(${qty})`),
          price: item.price || 19.99
        })),
        inventoryWarnings: []
      };
    case 'update_line_item_sizes':
      return {
        success: true,
        lineItem: {
          id: params.line_item_id,
          sizes: Object.entries(params.sizes).map(([size, qty]) => `${size}(${qty})`)
        },
        message: 'Line item sizes updated successfully'
      };
    default:
      return {
        message: `Mock response for ${tool}`
      };
  }
}

// Start the server
app.listen(port, () => {
  console.log(`MCP Test Server running on http://localhost:${port}`);
  console.log(`MCP endpoint available at http://localhost:${port}/mcp`);
}); 