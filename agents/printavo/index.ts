import { Agent, AgentTool } from '../agent-base';
import { printavoTools, PrintavoTool, createToolContext } from './tools';
import { executeGraphQL } from './graphql-client';
import * as queries from './queries';

// Debug function
function debugVar(name: string, value: string) {
  console.log(`DEBUG ${name}: ${value}`);
}

/**
 * PrintavoAgent handles all GraphQL operations with the Printavo API.
 */
export class PrintavoAgent extends Agent {
  public apiUrl: string;
  public token: string;
  private email: string;
  // Fix: Change the type to match the Agent base class
  protected tools: AgentTool[] = [];
  private printavoTools: Record<string, PrintavoTool> = {};

  constructor(apiKey?: string) {
    super(apiKey);
    
    // Get API URL and token from environment variables
    this.apiUrl = process.env.PRINTAVO_API_URL || '';
    this.email = process.env.PRINTAVO_EMAIL || '';
    this.token = process.env.PRINTAVO_TOKEN || '';
    
    // Log the credentials (masked for security)
    console.log('PrintavoAgent initialized with credentials:');
    console.log(`'PRINTAVO_API_URL': '${this.apiUrl ? this.apiUrl.substring(0, 4) + '...' : 'not set'}'`);
    console.log(`'PRINTAVO_EMAIL': '${this.email ? this.email.substring(0, 3) + '...' : 'not set'}'`);
    console.log(`'PRINTAVO_TOKEN': '${this.token ? this.token.substring(0, 3) + '...' : 'not set'}'`);
    
    if (!this.apiUrl || !this.email || !this.token) {
      console.error('Printavo API credentials are missing. Check your environment variables.');
      // Not throwing to allow app to start
    }
    
    // Initialize tools
    this.initializeTools();
  }
  
  /**
   * Initialize the agent.
   */
  protected async initialize(): Promise<void> {
    // No additional initialization needed
    // Optionally perform a health check
    try {
      await this.checkHealth();
      console.log('PrintavoAgent health check passed');
    } catch (error) {
      console.warn('PrintavoAgent health check failed:', error);
      // Don't throw, just log the warning
    }
  }
  
  /**
   * Initialize the tools for this agent.
   */
  private initializeTools(): void {
    // Create a map of tools for quick lookup
    printavoTools.forEach(tool => {
      this.printavoTools[tool.name] = tool;
      
      // Create an adapter for each PrintavoTool to match the AgentTool interface
      const agentTool: AgentTool = {
        name: tool.name,
        description: tool.description,
        handler: async (params: any): Promise<any> => {
          const toolContext = createToolContext();
          return tool.handler(params, toolContext);
        }
      };
      
      // Register the adapted tool with the base class
      this.registerTool(agentTool);
    });
    
    console.log(`PrintavoAgent initialized with ${Object.keys(this.printavoTools).length} tools`);
  }
  
  /**
   * Execute a GraphQL query with the Printavo API.
   */
  async executeGraphQL(query: string, variables: any = {}, operationName?: string): Promise<any> {
    return executeGraphQL(query, variables, operationName);
  }
  
  /**
   * Get information about the current Printavo account.
   */
  async getAccount(): Promise<any> {
    return this.executeOperation('get_account', {});
  }
  
  /**
   * Get information about the current Printavo user.
   */
  async getCurrentUser(): Promise<any> {
    return this.executeOperation('get_current_user', {});
  }
  
  /**
   * Get an order by ID.
   */
  async getOrder(id: string): Promise<any> {
    return this.executeOperation('get_order', { id });
  }
  
  /**
   * List orders with pagination.
   */
  async listOrders(params: any = {}): Promise<any> {
    return this.executeOperation('list_orders', params);
  }

  /**
   * Check the health of the Printavo API connection.
   * This method makes a simple query to verify that the API is accessible
   * and the credentials are valid.
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Use a simple query to check if the API is accessible
      const result = await this.executeGraphQL(
        `query HealthCheck { __typename }`,
        {},
        'HealthCheck'
      );
      
      // If we get here, the API is accessible
      return true;
    } catch (error) {
      console.error('Printavo API health check failed:', error);
      throw new Error(`Printavo API health check failed: ${(error as Error).message}`);
    }
  }
}

// Export the necessary components
export { executeGraphQL, queries, createToolContext };