import {
  QuoteCreateInput,
  LineItemGroupCreateInput,
  LineItemCreateInput,
  CustomAddressInput,
  ImprintCreateInput,
  PrintavoOrder,
  LineItemGroupPricingInput,
  LineItemPricing,
  PrintavoLineItem,
  PrintavoLineItemGroup,
} from '../../types';
import { PrintavoAPIResponse, query, mutate } from '../utils';
import { MUTATIONS } from '../mutations';
import { getOrder } from './orders';
import { QUERIES } from '../queries';
import { logger } from '../../logger';

// Quote Creation and Management
export async function createQuote(input: QuoteCreateInput): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  return mutate(MUTATIONS.quoteCreate, { input });
}

export async function addLineItemGroup(parentId: string, input: LineItemGroupCreateInput): Promise<PrintavoAPIResponse<PrintavoLineItemGroup>> {
  return mutate(MUTATIONS.lineItemGroupCreate, { parentId, input });
}

export async function addLineItem(lineItemGroupId: string, input: LineItemCreateInput): Promise<PrintavoAPIResponse<PrintavoLineItem>> {
  return mutate(MUTATIONS.lineItemCreate, { lineItemGroupId, input });
}

export async function addCustomAddress(parentId: string, input: CustomAddressInput): Promise<PrintavoAPIResponse<any>> {
  return mutate(MUTATIONS.customAddressCreate, { parentId, input });
}

export async function addImprint(lineItemGroupId: string, input: ImprintCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/imprintcreate', { lineItemGroupId, input });
}

export async function updateStatus(parentId: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/statusupdate', { parentId, statusId });
}

// Delete operations for cleanup
async function deleteQuote(quoteId: string): Promise<PrintavoAPIResponse<boolean>> {
  return mutate('/mutation/quotedelete', { id: quoteId });
}

async function deleteLineItemGroup(groupId: string): Promise<PrintavoAPIResponse<boolean>> {
  return mutate('/mutation/lineitemgroupdelete', { id: groupId });
}

// Helper method for creating a complete quote with line items
export async function createCompleteQuote(
  quoteInput: QuoteCreateInput,
  lineItemGroups: Array<{
    group: LineItemGroupCreateInput;
    items: LineItemCreateInput[];
    imprints?: ImprintCreateInput[]; // Imprints are optional
  }>
): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    // Create the quote
    const quoteResponse = await createQuote(quoteInput);
    if (!quoteResponse.data || quoteResponse.errors) {
      return quoteResponse; // Return error if quote creation fails
    }

    const quoteId = quoteResponse.data.id;

    // Add each line item group and its items
    for (const groupData of lineItemGroups) {
      const groupResponse = await addLineItemGroup(quoteId, groupData.group);
      if (!groupResponse.data || groupResponse.errors) {
        continue; // Skip to the next group if group creation fails
      }

      const groupId = groupResponse.data.id;

      // Add line items to the group
      for (const item of groupData.items) {
        const itemResponse = await addLineItem(groupId, item);
        if (!itemResponse.data || itemResponse.errors) {
          continue; // Skip to next item if item creation fails
        }
        const itemId = itemResponse.data.id;

        // Add imprints to the line item if provided
        if (groupData.imprints) {
          for (const imprint of groupData.imprints) {
            await addImprint(itemId, imprint);
          }
        }
      }
    }

    // Return the final quote
    return getOrder(quoteId);
  } catch (error) {
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Failed to create complete quote' }],
      success: false
    };
  }
}

// Quote Pricing Methods
export async function calculatePricing(lineItemGroup: LineItemGroupPricingInput): Promise<PrintavoAPIResponse<LineItemPricing>> {
    return query('/query/lineitemgrouppricing', { lineItemGroup });
}
  
// Helper method for calculating quote pricing
export async function calculateQuoteTotal(lineItems: Array<{ name: string; quantity: number; unitPrice: number }>): Promise<PrintavoAPIResponse<LineItemPricing>> {
    return calculatePricing({
        items: lineItems
    });
}

// Helper method for creating a quote with products
export async function createQuoteFromProducts(
  quoteInput: QuoteCreateInput,
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
  }>,
  searchQuery?: string, // Optional search query parameter
  options: {
    cleanupOnFailure?: boolean; // Whether to delete the quote if some items fail
    retryCount?: number; // Number of times to retry failed line item creations
  } = {}
): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  const { cleanupOnFailure = true, retryCount = 1 } = options;
  let quoteId: string | undefined;
  let groupId: string | undefined;

  try {
    // Create a Set of unique product IDs we need to find
    const productIds = new Set(items.map(item => item.productId));
    const productMap = new Map<string, string>();

    // Determine the search query to use
    const searchTerm = searchQuery || (productIds.size > 0 ? 
      Array.from(productIds)[0] : // Use first product ID as fallback query
      'product'); // Generic fallback if no specific query or products

    // Fetch products to create a product ID to name map
    const productsResponse = await query<{ products: { edges: Array<{ node: { id: string; name: string; price?: number } }> } }>(
      QUERIES.products, 
      { query: searchTerm }
    );

    // Track any products we couldn't find
    const missingProducts = new Set(productIds);

    // Build product map from response
    if (productsResponse.data?.products?.edges) {
      for (const edge of productsResponse.data.products.edges) {
        if (productIds.has(edge.node.id)) {
          productMap.set(edge.node.id, edge.node.name);
          missingProducts.delete(edge.node.id);
        }
      }
    }

    // If we couldn't find all products, log a warning
    if (missingProducts.size > 0) {
      const missingIds = Array.from(missingProducts).join(', ');
      logger.warn(`Could not find products with IDs: ${missingIds}`);
      if (cleanupOnFailure && missingProducts.size === productIds.size) {
        // If all products are missing and cleanup is enabled, fail early
        return {
          success: false,
          errors: [{
            message: 'None of the requested products were found',
            extensions: { missingProductIds: Array.from(missingProducts) }
          }]
        };
      }
    }

    // Create the quote first
    const quoteResponse = await createQuote(quoteInput);
    if (!quoteResponse.data || quoteResponse.errors) {
      return quoteResponse;
    }

    quoteId = quoteResponse.data.id;

    // Create a single line item group for all products
    const groupResponse = await addLineItemGroup(quoteId, {
      name: 'Product Order',
      description: 'Order created from product catalog',
    });

    if (!groupResponse.data || groupResponse.errors) {
      if (cleanupOnFailure && quoteId) {
        await deleteQuote(quoteId);
      }
      return {
        success: false,
        errors: [{ message: 'Failed to create line item group' }]
      };
    }

    groupId = groupResponse.data.id;

    // Track any errors that occur during line item creation
    const lineItemErrors: Array<{ productId: string; error: string }> = [];

    // Add each product as a line item with retry logic
    for (const item of items) {
      const productName = productMap.get(item.productId) || `Product: ${item.productId}`;
      let success = false;
      let lastError: any;

      // Retry loop for line item creation
      for (let attempt = 0; attempt < retryCount && !success; attempt++) {
        try {
          const lineItemResponse = await addLineItem(groupId, {
            name: productName,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
          });

          if (lineItemResponse.data) {
            success = true;
          } else {
            lastError = lineItemResponse.errors?.[0]?.message || 'Unknown error adding line item';
            if (attempt < retryCount - 1) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          if (attempt < retryCount - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      if (!success) {
        lineItemErrors.push({
          productId: item.productId,
          error: lastError
        });
      }
    }

    // Get the final quote
    const finalQuote = await getOrder(quoteId);

    // If we had any errors and cleanup is enabled, we might want to delete the quote
    if (lineItemErrors.length > 0) {
      if (cleanupOnFailure && lineItemErrors.length === items.length) {
        // If all items failed and cleanup is enabled, delete the quote
        if (quoteId) {
          await deleteQuote(quoteId);
        }
        return {
          success: false,
          errors: [{
            message: 'Failed to add any line items to the quote',
            extensions: { lineItemErrors }
          }]
        };
      }

      // If some items succeeded, include the errors in the response
      return {
        ...finalQuote,
        errors: [
          ...(finalQuote.errors || []),
          {
            message: 'Some line items could not be added',
            extensions: { lineItemErrors }
          }
        ]
      };
    }

    return finalQuote;
  } catch (error) {
    // Cleanup on unexpected errors if enabled
    if (cleanupOnFailure) {
      if (groupId) {
        try {
          await deleteLineItemGroup(groupId);
        } catch (cleanupError) {
          logger.error('Failed to cleanup line item group:', cleanupError);
        }
      }
      if (quoteId) {
        try {
          await deleteQuote(quoteId);
        } catch (cleanupError) {
          logger.error('Failed to cleanup quote:', cleanupError);
        }
      }
    }

    return {
      errors: [{ message: error instanceof Error ? error.message : 'Failed to create quote from products' }],
      success: false,
    };
  }
}
