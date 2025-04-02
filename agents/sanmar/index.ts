import { Agent, AgentTool } from '../agent-base';
import { sanmarTools } from './tools';
import { SoapClient, createSoapClient } from './soap-client';
import { SANMAR_USERNAME, SANMAR_PASSWORD, SANMAR_CUSTOMER_NUMBER, SANMAR_CUSTOMER_IDENTIFIER } from '../../lib/env';

// Debug function to show exact values
function debugVar(name: string, value: string) {
  return `'${name}': '${value === '' ? 'EMPTY' : value.substring(0, 3) + '...'}'`;
}

/**
 * SanMarAgent handles all interactions with SanMar's SOAP APIs.
 */
export class SanMarAgent extends Agent {
  private soapClient: SoapClient | null = null;
  private username: string;
  private password: string;
  private customerNumber: string;
  private customerIdentifier: string;

  constructor(apiKey?: string) {
    super(apiKey);
    
    // Get SanMar credentials from our environment utility
    this.username = SANMAR_USERNAME;
    this.password = SANMAR_PASSWORD;
    this.customerNumber = SANMAR_CUSTOMER_NUMBER;
    this.customerIdentifier = SANMAR_CUSTOMER_IDENTIFIER;
    
    // Debug log environment variables with more details
    console.log('SanMarAgent initialized with credentials:');
    console.log(debugVar('SANMAR_USERNAME', this.username));
    console.log(debugVar('SANMAR_PASSWORD', this.password));
    console.log(debugVar('SANMAR_CUSTOMER_NUMBER', this.customerNumber));
    console.log(debugVar('SANMAR_CUSTOMER_IDENTIFIER', this.customerIdentifier));
    
    if (!this.username || !this.password) {
      console.error('SanMar credentials are missing. Check your environment variables.');
      // Not throwing error to allow app to start, but logging clearly
    }
  }
  
  /**
   * Initialize the SanMar agent with SOAP client and tools.
   */
  protected async initialize(): Promise<void> {
    try {
      // Initialize the SOAP client
      this.soapClient = await createSoapClient(
        this.username,
        this.password,
        this.customerNumber,
        this.customerIdentifier
      );
      
      // Register all SanMar tools
      for (const tool of sanmarTools) {
        this.registerTool({
          name: tool.name,
          description: tool.description,
          handler: async (params: any) => {
            if (!this.soapClient) {
              throw new Error('SOAP client not initialized');
            }
            
            return tool.handler(params, { 
              soapClient: this.soapClient
            });
          }
        });
      }
      
      this.status = 'ready';
    } catch (error) {
      this.status = 'error';
      this.lastError = error as Error;
      throw new Error(`Failed to initialize SanMar SOAP client: ${(error as Error).message}`);
    }
  }

  /**
   * Lookup product details by style, color, and size.
   */
  async lookupProducts(productDetails: any[]): Promise<any[]> {
    try {
      const products = [];
      
      for (const detail of productDetails) {
        const product = await this.executeOperation('get_product_info', {
          styleNumber: detail.styleNumber,
          color: detail.color,
          size: detail.size
        });
        
        products.push({
          ...product,
          quantity: detail.quantity,
          price: detail.price
        });
      }
      
      return products;
    } catch (error) {
      throw new Error(`Product lookup failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check inventory availability for products.
   */
  async checkInventory(products: any[]): Promise<any[]> {
    try {
      const inventoryResults = [];
      
      for (const product of products) {
        const inventory = await this.executeOperation('get_inventory', {
          styleNumber: product.styleNumber,
          color: product.color,
          size: product.size
        });
        
        inventoryResults.push({
          ...product,
          inventory
        });
      }
      
      return inventoryResults;
    } catch (error) {
      throw new Error(`Inventory check failed: ${(error as Error).message}`);
    }
  }
} 