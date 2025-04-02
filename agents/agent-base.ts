import OpenAI from 'openai';

/**
 * Base Agent class that provides common functionality for all agents.
 */
export abstract class Agent {
  protected openai: OpenAI;
  protected apiKey: string;
  protected status: AgentStatus = 'initializing';
  protected tools: AgentTool[] = [];
  protected lastError: Error | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key is missing. Set OPENAI_API_KEY environment variable or pass in constructor.');
      // Use a placeholder key for development
      this.apiKey = 'sk-placeholder-key-for-development';
    }
    
    this.openai = new OpenAI({ apiKey: this.apiKey });
    
    // Initialize asynchronously to avoid blocking constructor
    this.initializeAsync().catch(error => {
      console.error(`Error initializing agent: ${error.message}`);
      this.status = 'error';
      this.lastError = error;
    });
  }
  
  /**
   * Initialize the agent with necessary setup.
   * This should be overridden by subclasses and is called asynchronously.
   */
  protected abstract initialize(): Promise<void>;
  
  /**
   * Private method to handle async initialization
   */
  private async initializeAsync(): Promise<void> {
    try {
      await this.initialize();
      this.status = 'ready';
    } catch (error) {
      console.error(`Agent initialization error: ${(error as Error).message}`);
      this.status = 'error';
      this.lastError = error as Error;
      throw error;
    }
  }
  
  /**
   * Register a tool with the agent.
   */
  protected registerTool(tool: AgentTool): void {
    console.log(`Registering tool: ${tool.name}`);
    this.tools.push(tool);
  }
  
  /**
   * Execute an operation using the agent's tools.
   */
  async executeOperation(operation: string, params: any): Promise<any> {
    console.log(`Agent.executeOperation called with operation: ${operation}, status: ${this.status}`);
    
    // Wait for initialization if still in progress
    if (this.status === 'initializing') {
      console.log('Agent still initializing, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check status again after waiting
      if (this.status === 'initializing') {
        console.warn('Agent initialization taking too long, proceeding with caution');
      }
    }
    
    const tool = this.tools.find(t => t.name === operation);
    
    if (!tool) {
      const availableTools = this.tools.map(t => t.name).join(', ');
      throw new Error(`Unknown operation: ${operation}. Available operations: ${availableTools || 'none'}`);
    }
    
    try {
      this.status = 'busy';
      console.log(`Executing tool handler for ${operation}`);
      const result = await tool.handler(params);
      this.status = 'ready';
      return result;
    } catch (error) {
      this.status = 'error';
      this.lastError = error as Error;
      console.error(`Error executing operation ${operation}: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Get the current status of the agent.
   */
  getStatus(): AgentStatusInfo {
    return {
      status: this.status,
      tools: this.tools.map(t => t.name),
      lastError: this.lastError ? this.lastError.message : null,
    };
  }
  
  /**
   * Run an AI-assisted function.
   */
  protected async runFunctionWithAI(functionName: string, params: any, toolDefinitions: any[]): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant that can use tools.' },
          { role: 'user', content: `Execute the function ${functionName} with these parameters: ${JSON.stringify(params)}` }
        ],
        tools: toolDefinitions,
      });
      
      // Process the response and execute the requested tool
      // This is a simplified implementation - in a real app you'd need to handle
      // multiple message exchanges with the AI to complete multi-step operations
      return response.choices[0].message;
    } catch (error) {
      throw new Error(`AI function execution failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Types for agent status and tools
 */
export type AgentStatus = 'initializing' | 'ready' | 'busy' | 'error';

export interface AgentStatusInfo {
  status: AgentStatus;
  tools: string[];
  lastError: string | null;
}

export interface AgentTool {
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
}

export interface AgentToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
} 