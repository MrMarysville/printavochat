/**
 * Tool definitions for SanMar operations.
 */

// Types
export interface SanMarTool {
  name: string;
  description: string;
  handler: (params: any, context: any) => Promise<any>;
}

// Context type
interface ToolContext {
  soapClient: {
    callMethod: (serviceName: string, methodName: string, args: any) => Promise<any>;
  };
}

// Create the tools array
export const sanmarTools: SanMarTool[] = [
  // Product information
  {
    name: 'get_product_info',
    description: 'Get product information by style number, color, and size',
    handler: async (
      params: { styleNumber: string; color?: string; size?: string }, 
      { soapClient }: ToolContext
    ) => {
      const result = await soapClient.callMethod(
        'ProductService',
        'getProduct',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size
        }
      );
      
      return result;
    }
  },
  
  {
    name: 'get_product_sellable',
    description: 'Get sellable products with colors and sizes',
    handler: async (params: { lastModified?: string }, { soapClient }: ToolContext) => {
      const result = await soapClient.callMethod(
        'ProductService',
        'getProductSellable',
        {
          lastModifiedDate: params.lastModified
        }
      );
      
      return result;
    }
  },
  
  // Inventory
  {
    name: 'get_inventory',
    description: 'Get inventory levels for a product',
    handler: async (
      params: { styleNumber: string; color?: string; size?: string }, 
      { soapClient }: ToolContext
    ) => {
      const result = await soapClient.callMethod(
        'InventoryService',
        'getInventoryLevels',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size
        }
      );
      
      return result;
    }
  },
  
  // Media
  {
    name: 'get_product_media',
    description: 'Get media content for a product',
    handler: async (
      params: { styleNumber: string; color?: string }, 
      { soapClient }: ToolContext
    ) => {
      const result = await soapClient.callMethod(
        'MediaContentService',
        'getMediaContent',
        {
          styleNumber: params.styleNumber,
          color: params.color
        }
      );
      
      return result;
    }
  },
  
  // Pricing
  {
    name: 'get_product_pricing',
    description: 'Get pricing information for a product',
    handler: async (
      params: { styleNumber: string; color?: string; size?: string; quantity?: number }, 
      { soapClient }: ToolContext
    ) => {
      const result = await soapClient.callMethod(
        'ProductPricingService',
        'getProductPricing',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size,
          quantity: params.quantity || 1
        }
      );
      
      return result;
    }
  },
  
  // Purchase Orders
  {
    name: 'create_purchase_order',
    description: 'Create a purchase order',
    handler: async (params: any, { soapClient }: ToolContext) => {
      const result = await soapClient.callMethod(
        'POService',
        'createPurchaseOrder',
        params
      );
      
      return result;
    }
  },
  
  {
    name: 'get_purchase_order_status',
    description: 'Get the status of a purchase order',
    handler: async (params: { poNumber: string }, { soapClient }: ToolContext) => {
      const result = await soapClient.callMethod(
        'POService',
        'getPurchaseOrderStatus',
        {
          poNumber: params.poNumber
        }
      );
      
      return result;
    }
  },
  
  // Composite operations
  {
    name: 'check_product_availability',
    description: 'Check if a product is available and get pricing information',
    handler: async (
      params: { styleNumber: string; color?: string; size?: string; quantity?: number }, 
      { soapClient }: ToolContext
    ) => {
      // 1. Get product details
      const product = await soapClient.callMethod(
        'ProductService',
        'getProduct',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size
        }
      );
      
      // 2. Check inventory
      const inventory = await soapClient.callMethod(
        'InventoryService',
        'getInventoryLevels',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size
        }
      );
      
      // 3. Get pricing
      const pricing = await soapClient.callMethod(
        'ProductPricingService',
        'getProductPricing',
        {
          styleNumber: params.styleNumber,
          color: params.color,
          size: params.size,
          quantity: params.quantity || 1
        }
      );
      
      // 4. Combine all information
      return {
        product,
        inventory,
        pricing,
        isAvailable: inventory.inventoryLevels.some((level: any) => 
          level.quantity > 0 && level.availableForSale
        )
      };
    }
  }
]; 