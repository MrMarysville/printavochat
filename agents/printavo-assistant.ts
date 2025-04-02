import OpenAI from 'openai';
import { executeGraphQL } from './printavo/graphql-client';
import { AgentStore } from './agent-store';
import { logger } from '@/lib/logger';
import { saveOrderToSupabase, saveCustomerToSupabase, saveQuoteToSupabase } from '@/lib/supabase-client'; // Import Supabase functions

// OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get Printavo API credentials
function getPrintavoCredentials() {
  const apiUrl = process.env.PRINTAVO_API_URL || process.env.NEXT_PUBLIC_PRINTAVO_API_URL || '';
  const email = process.env.PRINTAVO_EMAIL || process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';
  const token = process.env.PRINTAVO_TOKEN || process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';
  
  return { apiUrl, email, token };
}

// Define Printavo API tools
const printavoTools = [
  {
    type: "function",
    function: {
      name: "get_order_by_visual_id",
      description: "Get order details from Printavo using the visual ID",
      parameters: {
        type: "object",
        properties: {
          visualId: {
            type: "string",
            description: "The 4-digit visual ID of the order"
          }
        },
        required: ["visualId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_orders",
      description: "Search for orders in Printavo",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for finding orders"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_customer_by_email",
      description: "Find a customer by their email address",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The customer's email address"
          }
        },
        required: ["email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_customer",
      description: "Create a new customer in Printavo",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The customer's full name"
          },
          email: {
            type: "string",
            description: "The customer's email address"
          },
          phone: {
            type: "string",
            description: "The customer's phone number"
          }
        },
        required: ["name", "email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_quote",
      description: "Create a new quote in Printavo",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The customer's Printavo ID"
          },
          name: {
            type: "string",
            description: "Name of the quote"
          },
          lineItems: {
            type: "array",
            description: "Products to include in the quote",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the product"
                },
                quantity: {
                  type: "integer",
                  description: "Quantity of the product"
                },
                price: {
                  type: "number",
                  description: "Price per unit"
                },
                description: {
                  type: "string",
                  description: "Product description"
                }
              },
              required: ["name", "quantity", "price"]
            }
          }
        },
        required: ["customerId", "name", "lineItems"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_quote_natural_language",
      description: "Create a new quote in Printavo using natural language input for customer and line items. Example: 'Create a quote for customer example@email.com with 10 large blue shirts at $15 each and 5 medium red hoodies at $25 each.'",
      parameters: {
        type: "object",
        properties: {
          natural_language_query: {
            type: "string",
            description: "The full natural language request describing the quote to be created, including customer details and line items."
          }
        },
        required: ["natural_language_query"]
      }
    }
  }
];

// Create or load an assistant
export async function getPrintavoAssistant() {
  try {
    // Get or create the default agent from Supabase, passing the current tools definition
    const agent = await AgentStore.ensureDefaultAgent(openai, printavoTools);
    
    if (!agent) {
      throw new Error('Failed to get or create Printavo agent');
    }
    
    logger.info(`Using Printavo agent from Supabase with ID: ${agent.id}`);
    return agent.assistant_id;
  } catch (error) {
    logger.error('Error getting Printavo assistant:', error);
    throw error;
  }
}

// Execute Printavo API calls
export async function executePrintavoOperation(operation: string, params: any) {
  // Get API credentials
  const { apiUrl, email, token } = getPrintavoCredentials();
  
  // Build GraphQL query based on the operation
  let query = '';
  let variables = {};
  
  switch (operation) {
    case 'get_order_by_visual_id':
      query = `
        query GetOrderByVisualId($visualId: String!) {
          orders(first: 1, filter: { visualId: { eq: $visualId } }) {
            edges {
              node {
                id
                name
                visualId
                status {
                  name
                }
                customer {
                  name
                  email
                }
                total
              }
            }
          }
        }
      `;
      variables = { visualId: params.visualId };
      break;
    
    case 'search_orders':
      query = `
        query SearchOrders($query: String!) {
          orders(first: 10, query: $query) {
            edges {
              node {
                id
                name
                visualId
                status {
                  name
                }
                customer {
                  name
                }
                total
              }
            }
          }
        }
      `;
      variables = { query: params.query };
      break;
    
    case 'get_customer_by_email':
      query = `
        query GetCustomerByEmail($email: String!) {
          customers(first: 1, filter: { email: { eq: $email } }) {
            edges {
              node {
                id
                name
                email
                phone
              }
            }
          }
        }
      `;
      variables = { email: params.email };
      break;
    
    case 'create_customer': // Tool name remains 'create_customer'
      query = `
        mutation customerCreate($input: CustomerCreateInput!) { # Corrected mutation name
          customerCreate(input: $input) { # Corrected mutation name
            customer {
              id
              name
              email
              phone
            }
          }
        }
      `;
      variables = { 
        input: { 
          name: params.name,
          email: params.email,
          phone: params.phone || ""
        } 
      };
      break;
    
    case 'create_quote': // Tool name remains 'create_quote'
      query = `
        mutation quoteCreate($input: QuoteCreateInput!) { # Corrected mutation name
          quoteCreate(input: $input) { # Corrected mutation name
            quote {
              id
              name
              total
              customer {
                name
              }
            }
          }
        }
      `;
      
      // Transform line items into Printavo format
      const lineItems = params.lineItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        description: item.description || ""
      }));
      
      variables = { 
        input: {
          customerId: params.customerId,
          name: params.name,
          lineItems: lineItems
        }
      };
      break;

    case 'create_quote_natural_language':
      // Placeholder for complex natural language parsing logic
      logger.info(`Handling create_quote_natural_language with query: ${params.natural_language_query}`);
      
      // 1. Parse params.natural_language_query using LLM
      logger.info(`Attempting to parse natural language query for quote: ${params.natural_language_query}`);
      let parsedQuoteDetails: { customerEmail?: string; customerName?: string; customerPhone?: string; quoteName?: string; lineItemsArray: any[] } | null = null;
      try {
        const parsingPrompt = `
          Parse the following natural language query to extract information for creating a Printavo quote.
          Respond ONLY with a JSON object matching this schema:
          {
            "customerEmail": "string (required, extract email)",
            "customerName": "string (optional, extract full name if provided)",
            "customerPhone": "string (optional, extract phone number if provided)",
            "quoteName": "string (optional, generate a name like 'Quote for [Customer Name]' if not specified)",
            "lineItemsArray": [
              {
                "name": "string (required, full item description including size/color if mentioned)",
                "quantity": "integer (required)",
                "price": "number (required, price per unit)",
                "description": "string (optional, any extra details)"
              }
            ]
          }

          Natural Language Query: "${params.natural_language_query}"

          JSON Output:
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // Or your preferred model
          messages: [{ role: "user", content: parsingPrompt }],
          response_format: { type: "json_object" }, // Use JSON mode if available
          temperature: 0.2, // Lower temperature for more deterministic parsing
        });

        const jsonResponse = completion.choices[0]?.message?.content;
        if (jsonResponse) {
          parsedQuoteDetails = JSON.parse(jsonResponse);
          logger.info("Successfully parsed quote details from LLM:", parsedQuoteDetails);
          // Basic validation
          if (!parsedQuoteDetails?.customerEmail || !parsedQuoteDetails.lineItemsArray || parsedQuoteDetails.lineItemsArray.length === 0) {
             throw new Error("LLM parsing failed to extract required fields (customerEmail, lineItemsArray).");
          }
          // Generate quote name if missing
          if (!parsedQuoteDetails.quoteName) {
            parsedQuoteDetails.quoteName = `Quote for ${parsedQuoteDetails.customerName || parsedQuoteDetails.customerEmail}`;
          }
        } else {
          throw new Error("LLM returned empty response during parsing.");
        }
      } catch (parseError) {
        logger.error("Error parsing natural language quote query:", parseError);
        throw new Error("Could not understand the quote details from your request.");
      }

      if (!parsedQuoteDetails) {
         throw new Error("Failed to parse quote details.");
      }

      // 2. Find or Create Customer
      let customerId: string | null = null; // Ensure customerId is string or null
      try {
          // Attempt to find customer by email
          const customerResult = await executeGraphQL(
              `query GetCustomerByEmail($email: String!) { customers(first: 1, filter: { email: { eq: $email } }) { edges { node { id } } } }`,
              { email: parsedQuoteDetails.customerEmail },
              'get_customer_by_email_internal'
          );
          if (customerResult?.customers?.edges?.length > 0) {
              customerId = customerResult.customers.edges[0].node.id;
              logger.info(`Found existing customer ID: ${customerId}`);
              // Save/update customer in Supabase
              await saveCustomerToSupabase({ id: customerId, email: parsedQuoteDetails.customerEmail /* Add other fields if available */ });
          } else {
              // If not found, create customer if name is available
              if (parsedQuoteDetails.customerName) {
                logger.info(`Customer not found, attempting to create new customer: ${parsedQuoteDetails.customerName} (${parsedQuoteDetails.customerEmail})`);
                const createCustomerResult = await executeGraphQL(
                    `mutation customerCreate($input: CustomerCreateInput!) { customerCreate(input: $input) { customer { id name email phone } } }`,
                    { 
                      input: { 
                        name: parsedQuoteDetails.customerName, 
                        email: parsedQuoteDetails.customerEmail,
                        phone: parsedQuoteDetails.customerPhone || "" 
                      } 
                    },
                    'create_customer_internal'
                );
                if (createCustomerResult?.data?.customerCreate?.customer) { // Adjusted path based on mutation structure
                    customerId = createCustomerResult.data.customerCreate.customer.id;
                    logger.info(`Created new customer ID: ${customerId}`);
                    await saveCustomerToSupabase(createCustomerResult.data.customerCreate.customer);
                } else {
                     logger.error("Failed to create new customer.", createCustomerResult?.errors);
                     throw new Error("Failed to create customer for quote.");
                }
              } else {
                 logger.warn(`Customer not found by email (${parsedQuoteDetails.customerEmail}) and no customer name provided in the query. Cannot create quote.`);
                 throw new Error("Customer not found and name not provided to create a new one.");
              }
          }
      } catch (customerError) {
          logger.error("Error finding/creating customer for quote:", customerError);
          throw new Error("Could not process customer for quote creation.");
      }
      
      if (!customerId) {
          throw new Error("Customer ID could not be determined for quote creation.");
      }

      // 3. Prepare and execute quote creation mutation
      query = `
        mutation quoteCreate($input: QuoteCreateInput!) { # Corrected mutation name
          quoteCreate(input: $input) { # Corrected mutation name
            quote {
              id
              name
              total
              visualId # Assuming visualId is returned
              status { name }
              notes
              subtotal
              tax
              # Add other fields needed for Supabase mapping
            }
          }
        }
      `;
      variables = { 
        input: {
          customerId: customerId,
          name: parsedQuoteDetails.quoteName,
          // Map parsed line items to the format expected by Printavo mutation
          lineItems: parsedQuoteDetails.lineItemsArray.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: item.description || ""
          }))
        }
      };
      // The main executeGraphQL call below will handle this mutation
      break; // Break here, the actual execution happens after the switch

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
  
  // Execute GraphQL query
  const result = await executeGraphQL(query, variables, operation); // Pass query, variables, and operation name

  // After successful execution, try saving the data to Supabase
  if (result && !result.errors && result.data) { // Check the defined 'result'
    try {
      logger.info(`Attempting to save data for operation: ${operation} to Supabase.`);
      switch (operation) {
        case 'get_order_by_visual_id':
          if (result.data.orders?.edges?.length > 0) {
            const orderData = result.data.orders.edges[0].node;
            // TODO: Refine mapping in mapPrintavoOrderToSupabase if needed
            await saveOrderToSupabase(orderData); 
            // logger.info(`Placeholder: Would save order ${orderData.id} to Supabase.`); // Replaced with actual call
          }
          break;
        
        case 'search_orders':
           if (result.data.orders?.edges?.length > 0) {
             for (const edge of result.data.orders.edges) {
               const orderData = edge.node;
               // TODO: Refine mapping in mapPrintavoOrderToSupabase if needed
               await saveOrderToSupabase(orderData);
               // logger.info(`Placeholder: Would save order ${orderData.id} from search to Supabase.`); // Replaced with actual call
             }
           }
          break;
        
        case 'get_customer_by_email':
          if (result.data.customers?.edges?.length > 0) {
            const customerData = result.data.customers.edges[0].node;
            // TODO: Refine mapping in mapPrintavoCustomerToSupabase if needed
            await saveCustomerToSupabase(customerData);
            // logger.info(`Placeholder: Would save customer ${customerData.id} to Supabase.`); // Replaced with actual call
          }
          break;
        
        case 'create_customer':
          if (result.data.createCustomer?.customer) {
            const customerData = result.data.createCustomer.customer;
            // TODO: Refine mapping in mapPrintavoCustomerToSupabase if needed
            await saveCustomerToSupabase(customerData);
            // logger.info(`Placeholder: Would save newly created customer ${customerData.id} to Supabase.`); // Replaced with actual call
          }
          break;
        
        case 'create_quote': // Handles both direct and NL creation now
        case 'create_quote_natural_language':
           if (result?.data?.quoteCreate?.quote) { // Adjusted path based on mutation structure
             const quoteData = result.data.quoteCreate.quote;
             // Mapping and saving handled by saveQuoteToSupabase, which now includes line items
             await saveQuoteToSupabase(quoteData);
           }
          break;
      }
    } catch (dbError) {
      logger.error(`Failed to save data to Supabase for operation ${operation}:`, dbError);
      // Do not throw error here, allow the original Printavo result to be returned
    }
  }

  return result; // Return the original result regardless of Supabase save status
}
