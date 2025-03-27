/**
 * Direct Printavo API Client for Orders
 * This module provides direct API calls to Printavo as a fallback
 */

import { logger } from './logger';
import { normalizeVisualId } from './utils';
import { executeGraphQL } from './graphql-client';

// Get environment variables
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_PRINTAVO_API_URL ? `${process.env.NEXT_PUBLIC_PRINTAVO_API_URL}/graphql` : 'https://www.printavo.com/api/v2/graphql';

// Helper function to check if credentials are set
function checkCredentials() {
  if (!API_URL || !API_TOKEN) {
    throw new Error('Printavo API credentials not configured');
  }
}

/**
 * Enhanced function to extract all line items regardless of nesting
 * This handles complex nested structures that might be present in the Printavo API
 */
function extractAllLineItems(data: any): any[] {
  if (!data) return [];
  
  let allLineItems: any[] = [];
  
  // Function to recursively extract items
  const extractItems = (node: any) => {
    // Handle direct line items
    if (node.lineItems?.edges) {
      allLineItems = [
        ...allLineItems,
        ...node.lineItems.edges.map((edge: any) => ({
          ...edge.node,
          groupName: node.name || 'Default Group'
        }))
      ];
    }
    
    // Handle nested line item groups
    if (node.lineItemGroups?.edges) {
      node.lineItemGroups.edges.forEach((edge: any) => {
        if (edge.node) {
          extractItems(edge.node);
        }
      });
    }
    
    // Handle array of line items
    if (Array.isArray(node)) {
      node.forEach(item => extractItems(item));
    }
  };
  
  // Start extraction from the data object
  extractItems(data);
  
  return allLineItems;
}

/**
 * Get a specific order by ID with enhanced line item extraction
 */
export const getOrder = async (orderId: string) => {
  // Validate order ID
  if (!orderId || orderId.trim() === '') {
    throw new Error('Order ID is required');
  }
  
  logger.info(`Fetching order with ID: ${orderId}`);
  try {
    const query = `
      query GetOrder($id: ID!) {
        invoice(id: $id) {
          id
          visualId
          nickname
          total
          subtotal
          createdAt
          dueAt
          customerDueAt
          productionNote
          customerNote
          status {
            id
            name
          }
          contact {
            id
            fullName
            email
            phone
          }
          billingAddress {
            name
            address1
            address2
            city
            state
            country
            postalCode
          }
          shippingAddress {
            name
            address1
            address2
            city
            state
            country
            postalCode
          }
          lineItemGroups {
            edges {
              node {
                id
                name
                lineItems {
                  edges {
                    node {
                      id
                      name
                      quantity
                      price
                      description
                      items {
                        edges {
                          node {
                            id
                            name
                            description
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          threadSummary {
            lastMessage
            previewText
            updatedAt
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id: orderId }, "GetOrder");
    
    if (!data.invoice) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Enhance the order with all line items extracted from the nested structure
    const enhancedOrder = {
      ...data.invoice,
      allLineItems: extractAllLineItems(data.invoice)
    };
    
    return enhancedOrder;
  } catch (error) {
    logger.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

export const OrdersAPI = {
  /**
   * Get an order by its visual ID directly from the Printavo API
   * @param visualId - The visual ID of the order to retrieve
   * @returns The order data
   */
  async getOrderByVisualId(visualId: string): Promise<any> {
    checkCredentials();
    
    logger.info(`[OrdersAPI] Searching for order with visual ID: ${visualId}`);
    
    const query = `
      query GetOrderByVisualId($query: String!) {
        invoices(query: $query, first: 1) {
          edges {
            node {
              id
              visualId
              status {
                id
                name
              }
              contact {
                id
                fullName
                email
              }
              createdAt
              total
              // Add other needed fields
            }
          }
        }
      }
    `;
    
    try {
      // Try direct GraphQL query
      const data = await executeGraphQL(query, { query: visualId }, "FindInvoiceByVisualId");
      
      if (data.invoices.edges.length > 0) {
        logger.info(`[OrdersAPI] Found order with visual ID: ${visualId}`);
        return data.invoices.edges[0].node;
      }
      
      // If not found, fall back to existing REST API methods
      // Normalize the visual ID to try multiple formats
      const possibleIds = normalizeVisualId(visualId);
      logger.info(`[OrdersAPI] Will try these formats: ${possibleIds.join(', ')}`);
      
      // For each possible ID format, try all methods
      for (const idFormat of possibleIds) {
        logger.info(`[OrdersAPI] Trying format: ${idFormat}`);
        
        // Try all these methods in sequence
        const methods = [
          // Method 1: Direct query with invoices endpoint
          async () => {
            logger.info(`[OrdersAPI] Method 1: Querying invoices endpoint with ${idFormat}`);
            const resp = await fetch(`${API_URL}/invoices?query=${idFormat}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              }
            });
            if (!resp.ok) throw new Error(`API error: ${resp.status}`);
            return resp.json();
          },
          
          // Method 2: Direct query with orders endpoint
          async () => {
            logger.info(`[OrdersAPI] Method 2: Querying orders endpoint with ${idFormat}`);
            const resp = await fetch(`${API_URL}/orders?query=${idFormat}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              }
            });
            if (!resp.ok) throw new Error(`API error: ${resp.status}`);
            return resp.json();
          },
          
          // Method 3: Try REST API query on invoices with filter
          async () => {
            logger.info(`[OrdersAPI] Method 3: Trying filter parameter on invoices with ${idFormat}`);
            const resp = await fetch(`${API_URL}/invoices?filter[visual_id]=${idFormat}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              }
            });
            if (!resp.ok) throw new Error(`API error: ${resp.status}`);
            return resp.json();
          },
        ];
        
        // Try all methods in sequence until one works
        for (let i = 0; i < methods.length; i++) {
          try {
            const method = methods[i];
            const data = await method();
            
            logger.info(`[OrdersAPI] Method ${i+1} succeeded with ${data?.data?.length || 0} results for ${idFormat}`);
            
            // If we have results, try to find matching order
            if (data?.data?.length > 0) {
              // Try to find exact match by visual ID or number
              const match = data.data.find((item: any) => 
                possibleIds.some(id => 
                  (item.attributes?.visual_id && 
                    (item.attributes.visual_id === id || 
                     item.attributes.visual_id.toString() === id)) || 
                  (item.attributes?.number && item.attributes.number === id) ||
                  (item.attributes?.order_number && item.attributes.order_number === id)
                )
              );
              
              if (match) {
                logger.info(`[OrdersAPI] Found exact match for format ${idFormat} using method ${i+1}`);
                return match;
              } else {
                // If no exact match, use the first result
                logger.info(`[OrdersAPI] No exact match for ${idFormat} in results, using first result`);
                return data.data[0];
              }
            }
          } catch (error) {
            logger.error(`[OrdersAPI] Method ${i+1} failed for ${idFormat}:`, error);
            // Continue to next method
          }
        }
      }
      
      throw new Error(`Order with visual ID ${visualId} not found`);
    } catch (error) {
      logger.error(`[OrdersAPI] Error finding order: ${error}`);
      throw error;
    }
  },

  // Create a new quote/invoice
  async createQuote(quoteData: any): Promise<any> {
    checkCredentials();
    
    logger.info(`[OrdersAPI] Creating new quote/invoice`);
    
    const mutation = `
      mutation CreateQuote($input: QuoteCreateInput!) {
        quoteCreate(input: $input) {
          id
          visualId
          name
          contact {
            id
            fullName
            email
          }
          status {
            id
            name
          }
          total
          subtotal
          customerNote
          productionNote
          createdAt
        }
      }
    `;
    
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { input: quoteData },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0].message;
        logger.error('[OrdersAPI] GraphQL Error:', errorMessage);
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      logger.info(`[OrdersAPI] Successfully created quote with ID: ${result.data.quoteCreate.id}`);
      return result.data.quoteCreate;
    } catch (error) {
      logger.error(`[OrdersAPI] Error creating quote:`, error);
      throw error;
    }
  }
}