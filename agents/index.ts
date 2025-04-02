import { Agent } from './agent-base';
import { PrintavoAgent } from './printavo';
import { SanMarAgent } from './sanmar';
import { SanMarFTPAgent } from './sanmar-ftp';
import { FireCrawlAgent } from './firecrawl';
import '../lib/env'; // Ensure environment variables are loaded

// Removed KNOWN_OPERATIONS map that was causing the errors

/**
 * The AgentManager is responsible for coordinating between multiple agents
 * and providing a unified interface for all agent operations.
 */
export class AgentManager {
  private agents: Record<string, Agent> = {};
  
  constructor() {
    try {
      // Initialize all required agents with better error handling
      this.agents.printavo = new PrintavoAgent();
      console.log('PrintavoAgent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PrintavoAgent:', error);
    }
    
    try {
      this.agents.sanmar = new SanMarAgent();
      console.log('SanMarAgent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SanMarAgent:', error);
    }
    
    try {
      this.agents.sanmarFTP = new SanMarFTPAgent();
      console.log('SanMarFTPAgent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SanMarFTPAgent:', error);
    }
    
    try {
      this.agents.firecrawl = new FireCrawlAgent();
      console.log('FireCrawlAgent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FireCrawlAgent:', error);
    }
  }

  /**
   * Execute an operation on an agent.
   * The operation format is "agent_operation", e.g. "printavo_get_order".
   */
  async executeOperation(operation: string, params: any = {}): Promise<any> {
    console.log(`AgentManager.executeOperation called with operation: ${operation}`);
    
    const [agentName, ...operationParts] = operation.split('_');
    const operationName = operationParts.join('_');
    
    if (!agentName || !operationName) {
      throw new Error(`Invalid operation format: ${operation}. Expected format: agent_operation`);
    }
    
    // Check if agent exists
    const agent = this.agents[agentName];
    if (!agent) {
      const availableAgents = Object.keys(this.agents).join(', ');
      throw new Error(`Agent not found: ${agentName}. Available agents: ${availableAgents}`);
    }
    
    // For template operations, make sure they're prefixed with "quote_"
    if (operationName.includes('template') && !operationName.startsWith('quote_')) {
      // Convert operations like "printavo_list_templates" to "printavo_list_quote_templates"
      const adjustedOperationName = `quote_${operationName}`;
      console.log(`Adjusting template operation name to: ${adjustedOperationName}`);
      return agent.executeOperation(adjustedOperationName, params);
    }
    
    // Removed the KNOWN_OPERATIONS check that was causing the errors
    // Each agent is now responsible for handling its own operation validation
    
    console.log(`Executing operation ${operationName} on agent ${agentName} with params:`, params);
    return agent.executeOperation(operationName, params);
  }

  /**
   * Create a quote with product lookup
   * This is a composite operation that uses multiple agents
   */
  async createQuoteWithProductLookup(customerInfo: any, productDetails: any) {
    // Ensure required agents exist
    if (!this.agents.sanmar || !this.agents.printavo) {
      throw new Error("Required agents (SanMar, Printavo) are not initialized");
    }
    
    try {
      // 1. Use SanMar agent to lookup product information
      const products = await this.agents.sanmar.lookupProducts(productDetails);
      
      // 2. Use Printavo agent to create a quote with the products
      return this.agents.printavo.createQuote(customerInfo, products);
    } catch (error) {
      console.error("Error in createQuoteWithProductLookup:", error);
      throw new Error(`Failed to create quote with product lookup: ${(error as Error).message}`);
    }
  }

  /**
   * Get the status of all agents.
   */
  getStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [name, agent] of Object.entries(this.agents)) {
      try {
        status[name] = {
          status: agent.getStatus ? agent.getStatus() : 'unknown'
        };
      } catch (error) {
        status[name] = {
          status: 'error',
          error: (error as Error).message
        };
      }
    }
    
    return status;
  }
}

export { PrintavoAgent } from './printavo';
export { SanMarAgent } from './sanmar';
export { SanMarFTPAgent } from './sanmar-ftp'; 
export { FireCrawlAgent } from './firecrawl';