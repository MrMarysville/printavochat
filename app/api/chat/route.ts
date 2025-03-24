import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { OrdersAPI, ProductsAPI, CustomersAPI, PrintavoAPIError } from '@/lib/printavo-api';

export interface ChatMessage {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  files?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface ChatRequest {
  messages: ChatMessage[];
  files?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, files } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // Check if we have files in the message
    const hasFiles = files && files.length > 0;

    // Process the message based on keywords
    let responseMessage = '';
    let richData = null;

    // Check for specific keywords to determine response type
    const messageContent = lastUserMessage.content.toLowerCase();

    if (hasFiles) {
      // Handle file uploads
      const imageFiles = files?.filter(file => file.type.startsWith('image/')) || [];
      const documentFiles = files?.filter(file => !file.type.startsWith('image/')) || [];
      
      if (imageFiles.length > 0) {
        responseMessage = `I've received ${imageFiles.length} image${imageFiles.length !== 1 ? 's' : ''}. `;
        if (documentFiles.length > 0) {
          responseMessage += `and ${documentFiles.length} document${documentFiles.length !== 1 ? 's' : ''}. `;
        }
        responseMessage += 'I can use these for mockups or product customization. Would you like me to proceed with creating a quote based on these images?';
      } else if (documentFiles.length > 0) {
        responseMessage = `I've received ${documentFiles.length} document${documentFiles.length !== 1 ? 's' : ''}. Would you like me to review this information for your order?`;
      }
    } else if (/^\d{4}$/.test(messageContent)) {
      // If the message is just a 4-digit number, treat it as a visual ID
      try {
        const visualId = messageContent;
        logger.info(`Detected standalone visual ID: ${visualId}`);
        const orderData = await OrdersAPI.getOrderByVisualId(visualId);
        responseMessage = orderData 
          ? `Here are the details for order with Visual ID #${visualId}:` 
          : `Sorry, I couldn't find an order with Visual ID #${visualId}. This Visual ID may not exist in the system.`;
        
        if (orderData) {
          richData = {
            type: 'order',
            content: orderData
          };
        }
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          // Check for 404 errors specifically
          if (error.statusCode === 404) {
            responseMessage = `Sorry, I couldn't find an order with Visual ID #${messageContent}. This Visual ID may not exist in the system.`;
          } else {
            responseMessage = `Sorry, I couldn't retrieve the order information. ${error.message}`;
          }
        } else {
          throw error;
        }
      }
    } else if (messageContent.includes('visual') && messageContent.includes('id')) {
      // Check for visual ID pattern
      const visualIdMatch = messageContent.match(/visual\s+(?:id|number)?\s*#?\s*(\d+)/i);
      if (visualIdMatch && visualIdMatch[1]) {
        try {
          const visualId = visualIdMatch[1];
          logger.info(`Detected visual ID in message: ${visualId}`);
          const orderData = await OrdersAPI.getOrderByVisualId(visualId);
          responseMessage = orderData 
            ? `Here are the details for order with Visual ID #${visualId}:` 
            : `Sorry, I couldn't find an order with Visual ID #${visualId}. This Visual ID may not exist in the system.`;
          
          if (orderData) {
            richData = {
              type: 'order',
              content: orderData
            };
          }
        } catch (error) {
          if (error instanceof PrintavoAPIError) {
            // Check for 404 errors specifically
            if (error.statusCode === 404) {
              responseMessage = `Sorry, I couldn't find an order with Visual ID #${visualIdMatch[1]}. This Visual ID may not exist in the system.`;
            } else {
              responseMessage = `Sorry, I couldn't retrieve the order information. ${error.message}`;
            }
          } else {
            throw error;
          }
        }
      }
    } else if (messageContent.includes('show') && messageContent.includes('order')) {
      try {
        // First check for 4-digit numbers which are likely Visual IDs
        const visualIdMatch = messageContent.match(/\b(\d{4})\b/);
        
        // Then check for traditional order IDs
        const orderIdMatch = messageContent.match(/order\s+(?:#|number|id|)?\s*(\w+-?\d+)/i);
        let orderData;
        
        if (visualIdMatch && visualIdMatch[1]) {
          // If we have a 4-digit number, treat it as a Visual ID
          const visualId = visualIdMatch[1];
          logger.info(`Detected Visual ID in show order command: ${visualId}`);
          orderData = await OrdersAPI.getOrderByVisualId(visualId);
          responseMessage = orderData 
            ? `Here are the details for order with Visual ID #${visualId}:` 
            : `Sorry, I couldn't find an order with Visual ID #${visualId}. This Visual ID may not exist in the system.`;
        } else if (orderIdMatch && orderIdMatch[1]) {
          // Get specific order by ID
          const orderId = orderIdMatch[1];
          orderData = await OrdersAPI.getOrder(orderId);
          responseMessage = `Here are the details for order #${orderId}:`;
        } else {
          // Get recent orders if no ID specified
          orderData = await OrdersAPI.getOrders({ limit: 5 });
          responseMessage = 'Here are your recent orders:';
        }
        
        if (orderData) {
          richData = {
            type: 'order',
            content: orderData
          };
        }
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          // Check for 404 errors specifically
          if (error.statusCode === 404) {
            if (messageContent.match(/\b(\d{4})\b/)) {
              const visualId = messageContent.match(/\b(\d{4})\b/)?.[1];
              responseMessage = `Sorry, I couldn't find an order with Visual ID #${visualId}. This Visual ID may not exist in the system.`;
            } else {
              const orderId = messageContent.match(/order\s+(?:#|number|id|)?\s*(\w+-?\d+)/i)?.[1] || 'specified';
              responseMessage = `Sorry, I couldn't find order #${orderId}. It may not exist in the system.`;
            }
          } else {
            responseMessage = `Sorry, I couldn't retrieve the order information. ${error.message}`;
          }
        } else {
          throw error;
        }
      }
    } else if (messageContent.includes('search') && messageContent.includes('order') && messageContent.includes('visual') && messageContent.includes('id')) {
      // Handle searching for orders with a Visual ID filter
      try {
        // Extract the Visual ID from the message
        const visualIdMatch = messageContent.match(/visual\s+(?:id|number)?\s*[:#]?\s*(\d{4})/i);
        
        if (visualIdMatch && visualIdMatch[1]) {
          const visualId = visualIdMatch[1];
          logger.info(`Searching for orders with Visual ID filter: ${visualId}`);
          
          try {
            // Use the searchOperations from graphql/operations to search with visual ID filter
            const { searchOrders } = await import('../../../lib/graphql/operations/searchOperations');
            const result = await searchOrders({ visualId });
            
            if (result.success && result.data && result.data.length > 0) {
              responseMessage = `Found ${result.data.length} order(s) matching Visual ID #${visualId}:`;
              richData = {
                type: 'orderList',
                content: result.data
              };
            } else {
              responseMessage = `Sorry, I couldn't find any orders matching Visual ID #${visualId}. This Visual ID may not exist in the system.`;
            }
          } catch (error) {
            if (error instanceof PrintavoAPIError && error.statusCode === 404) {
              responseMessage = `Sorry, I couldn't find any orders matching Visual ID #${visualId}. This Visual ID may not exist in the system.`;
            } else {
              throw error; // Re-throw non-404 errors to be caught by the outer try/catch
            }
          }
        } else {
          responseMessage = `I understand you want to search for orders with a Visual ID, but I couldn't identify the ID number. Please specify a 4-digit Visual ID.`;
        }
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          responseMessage = `Sorry, I couldn't search for orders. ${error.message}`;
        } else {
          logger.error('Error searching orders by Visual ID:', error);
          responseMessage = 'Sorry, there was an error processing your request.';
        }
      }
    } else if (messageContent.includes('show') && messageContent.includes('product')) {
      try {
        // Extract product ID if specified
        const productIdMatch = messageContent.match(/product\s+(?:#|number|id|)?\s*(\w+-?\d+)/i);
        let productData;
        
        if (productIdMatch && productIdMatch[1]) {
          // Get specific product
          const productId = productIdMatch[1];
          productData = await ProductsAPI.getProduct(productId);
          responseMessage = `Here are the details for product #${productId}:`;
        } else {
          // Get all products
          productData = await ProductsAPI.getProducts();
          responseMessage = 'Here are our available products:';
        }
        
        richData = {
          type: 'product',
          content: productData
        };
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          responseMessage = `Sorry, I couldn't retrieve the product information. ${error.message}`;
        } else {
          throw error;
        }
      }
    } else if (messageContent.includes('create') && messageContent.includes('order')) {
      // Show order creation form with real product data
      try {
        // Get products for the form dropdown
        const products = await ProductsAPI.getProducts();
        
        const orderForm = {
          title: 'Create New Order',
          description: 'Fill out the details to create a new order',
          fields: [
            {
              id: 'customerName',
              type: 'text',
              label: 'Customer Name',
              required: true,
              placeholder: 'Enter customer name'
            },
            {
              id: 'customerEmail',
              type: 'email',
              label: 'Customer Email',
              required: true,
              placeholder: 'Enter customer email'
            },
            {
              id: 'productId',
              type: 'select',
              label: 'Product',
              required: true,
              options: products.map((product: any) => ({
                value: product.id,
                label: product.name
              }))
            },
            {
              id: 'quantity',
              type: 'number',
              label: 'Quantity',
              required: true,
              min: 1,
              defaultValue: 1
            },
            {
              id: 'notes',
              type: 'textarea',
              label: 'Order Notes',
              placeholder: 'Any special instructions'
            }
          ]
        };
        
        responseMessage = 'Please fill out this form to create a new order:';
        richData = {
          type: 'form',
          content: orderForm
        };
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          responseMessage = `Sorry, I couldn't create the order form. ${error.message}`;
        } else {
          throw error;
        }
      }
    } else if (messageContent.includes('customer') && (messageContent.includes('list') || messageContent.includes('show'))) {
      try {
        // Get customers
        const customers = await CustomersAPI.getCustomers();
        responseMessage = 'Here are your customers:';
        richData = {
          type: 'customer',
          content: customers
        };
      } catch (error) {
        if (error instanceof PrintavoAPIError) {
          responseMessage = `Sorry, I couldn't retrieve the customer information. ${error.message}`;
        } else {
          throw error;
        }
      }
    } else if (messageContent.includes('help') || messageContent.includes('what can you do')) {
      // Provide help
      responseMessage = 'I can help you with the following:\n\n' +
        '• Show order details (e.g., "Show me order #12345" or "Find order with Visual ID 9876")\n' +
        '• Browse product catalog (e.g., "Show me your products")\n' +
        '• Create new orders (e.g., "I want to create a new order")\n' +
        '• View customer information (e.g., "Show me my customers")\n' +
        '• Upload files for orders\n' +
        '• Track order status\n\n' +
        'What would you like help with today?';
    } else {
      // Default response
      responseMessage = 'I understand you\'re asking about "' + 
        lastUserMessage.content + 
        '". How can I help with this specifically? You can ask me to show orders, products, or create a new order.';
    }

    return NextResponse.json({
      message: responseMessage,
      richData: richData
    });
  } catch (error) {
    logger.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
