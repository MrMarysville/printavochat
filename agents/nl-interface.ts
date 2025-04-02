import OpenAI from 'openai';
import { AgentManager } from './index';

/**
 * Natural Language Interface for Agents
 * 
 * This module provides a natural language interface to the agent system,
 * allowing users to interact with agents using plain English.
 */

// Types
interface NaturalLanguageQuery {
  query: string;
  context?: any;
}

interface NaturalLanguageResponse {
  success: boolean;
  response: string;
  data?: any;
  error?: string;
  type?: string;
}

// Intent mapping for agent operations
interface AgentOperation {
  agent: string;
  operation: string;
  description: string;
  parameters: any[];
}

// Structure for NL processing results
interface NLProcessingResult {
  intent: string;
  operation: AgentOperation;
  parameters: Record<string, any>;
  reasoning: string;
  confidence: number;
}

// OpenAI client for natural language processing
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Natural Language Interface class
 */
export class NaturalLanguageInterface {
  private agentManager: AgentManager;
  
  constructor() {
    this.agentManager = new AgentManager();
  }
  
  /**
   * Process a natural language query and execute the appropriate agent operation
   */
  async processQuery(nlQuery: NaturalLanguageQuery): Promise<NaturalLanguageResponse> {
    try {
      // Check if it's a customer creation query first
      if (this.isCustomerCreationIntent(nlQuery.query)) {
        const customerResult = await this.handleCustomerCreation(nlQuery);
        return customerResult;
      }
      
      // Check if it's a template-related query first
      if (this.isTemplateQuery(nlQuery.query)) {
        const templateResult = await this.handleTemplateQuery(nlQuery);
        return templateResult;
      }
      
      // Check for quote creation intent directly
      if (this.isQuoteCreationIntent(nlQuery.query)) {
        // Get available templates to display in the response
        let templateList = '';
        try {
          const templates = await this.agentManager.executeOperation('printavo_list_quote_templates', {});
          if (Array.isArray(templates) && templates.length > 0) {
            templateList = "\n\n**Available Templates:**\n" + 
              templates.map((t: any) => `• **${t.name}** - ${t.description || ''}`).join('\n') +
              "\n\nYou can use a template by saying: \"Create a quote for [customer] using the [template name] template\"";
          }
        } catch (error) {
          console.error('Error getting templates for quote creation:', error);
        }
        
        return {
          success: true,
          response: "I'll help you create a quote. To get started, I'll need to know:\n\n1. Who is this quote for? (customer name)\n2. What products would you like to include?\n3. How many of each item do you need?\n\nYou can provide this information now, or I can guide you through the process step by step." + templateList,
          type: 'quote_creation',
          data: {
            type: 'quote_creation_started',
            stage: 'initial'
          }
        };
      }
      
      // 1. Extract intent and parameters from the query
      const processingResult = await this.extractIntentAndParameters(nlQuery);
      
      // 2. If confidence is too low, return a clarification request
      if (processingResult.confidence < 0.7) {
        return {
          success: false,
          response: `I'm not entirely sure what you're asking for. Could you please provide more details about ${processingResult.intent}?`,
          error: 'Low confidence in intent detection'
        };
      }
      
      // 3. Execute the operation with the extracted parameters
      const operation = `${processingResult.operation.agent}_${processingResult.operation.operation}`;
      const result = await this.agentManager.executeOperation(operation, processingResult.parameters);
      
      // 4. Format the response based on the operation and result
      const formattedResponse = await this.formatResponse(nlQuery.query, processingResult, result);
      
      return {
        success: true,
        response: formattedResponse,
        data: result
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      
      return {
        success: false,
        response: `I'm sorry, I couldn't process your request: ${(error as Error).message}`,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Check if query is a template-related query
   */
  private isTemplateQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    
    // Template-related patterns
    const templatePatterns = [
      /template/,
      /standard order/,
      /standard package/,
      /usual order/,
      /corporate package/,
      /team package/,
      /t-shirt package/
    ];
    
    return templatePatterns.some(pattern => pattern.test(lowerQuery));
  }
  
  /**
   * Handle template-related queries
   */
  private async handleTemplateQuery(nlQuery: NaturalLanguageQuery): Promise<NaturalLanguageResponse> {
    try {
      const query = nlQuery.query.toLowerCase();
      
      // Determine template intent
      if (query.includes('list') || query.includes('show') || query.includes('available') || query.includes('what templates')) {
        // List templates
        const result = await this.agentManager.executeOperation('printavo_list_quote_templates', {});
        
        if (!result || !Array.isArray(result)) {
          return {
            success: false,
            response: "I couldn't find any quote templates. Would you like to create one?",
            error: 'No templates found'
          };
        }
        
        // Format template list response
        const templateList = result.map((template: any) => `• **${template.name}** - ${template.description || 'No description'}`).join('\n');
        
        return {
          success: true,
          response: `## Available Quote Templates\n\n${templateList}\n\n### How to Use Templates\n\n- **View template details**: Say "Show me what's in the [template name] template"\n- **Create a quote**: Say "Create a quote for [customer name] using the [template name] template"\n- **Save a quote as template**: After creating a quote, say "Save this as a template called [name]"\n\nTemplates save time by pre-populating product information, quantities, and pricing.`,
          data: result
        };
      } else if (query.includes('help') || query.includes('how') || query.includes('instruct') || query.includes('guide')) {
        // Provide detailed help on using templates
        return {
          success: true,
          response: `## Quote Template Guide\n\nTemplates help you create quotes faster by pre-filling common orders.\n\n### Template Commands\n\n1. **View available templates**:\n   • "Show me available templates"\n   • "List quote templates"\n   • "What templates do we have?"\n\n2. **View template details**:\n   • "What's in the Corporate Package template?"\n   • "Show me details of Standard T-Shirt Order"\n   • "Tell me about the Team Sports Package"\n\n3. **Create quotes from templates**:\n   • "Create a quote for King Clothing using the Corporate Package template"\n   • "Start a new quote from Standard T-Shirt Order for ABC Company"\n   • "Make Team Sports Package quote for City High School"\n\n4. **Save templates**:\n   • "Save this quote as a template called Monthly Reorder"\n   • "Create a template from this quote"\n\nTemplates include product details, quantities, pricing, and can be customized during quote creation.`,
          type: 'template_help',
          data: {
            type: 'template_help'
          }
        };
      } else if (query.includes('create') || query.includes('make') || query.includes('start') || query.includes('new') || query.includes('using') || query.includes('from')) {
        // Creating a quote from template
        // This requires more context, so we'll guide the user
        const templateName = this.extractTemplateName(query);
        const customerName = this.extractCustomerName(query);
        
        if (!templateName) {
          // List available templates to help user choose
          const templates = await this.agentManager.executeOperation('printavo_list_quote_templates', {});
          const templateOptions = Array.isArray(templates) ? 
            templates.map((t: any) => `• **${t.name}** - ${t.description || ''}`).join('\n') :
            'No templates found';
            
          return {
            success: true,
            response: `I can create a quote from a template for you. Please specify which template to use.\n\n**Available templates:**\n${templateOptions}\n\nYou can say something like:\n"Create a quote for [Customer Name] using the Standard T-Shirt Order template"`,
            type: 'template_selection',
            data: {
              type: 'template_selection',
              stage: 'template_required',
              customerName: customerName
            }
          };
        }
        
        if (!customerName) {
          return {
            success: true,
            response: `I'll create a quote using the **${templateName}** template. Who is this quote for? Please provide a customer name.`,
            type: 'template_selection',
            data: {
              type: 'template_selection',
              stage: 'customer_required',
              templateName: templateName
            }
          };
        }
        
        // Both template and customer specified, so give confirmation
        return {
          success: true,
          response: `I'll create a quote for **${customerName}** using the **${templateName}** template. Would you like to:\n\n1. Create the quote as is\n2. Preview the template contents first\n3. Customize the template before creating`,
          type: 'template_confirmation',
          data: {
            type: 'template_confirmation',
            stage: 'confirm',
            templateName: templateName,
            customerName: customerName
          }
        };
      } else if (query.includes('detail') || query.includes('what') || query.includes('show me') || query.includes('whats in')) {
        // Get template details - extract template name
        const templateName = this.extractTemplateName(query);
        
        if (!templateName) {
          // List available templates to help user choose
          const templates = await this.agentManager.executeOperation('printavo_list_quote_templates', {});
          const templateOptions = Array.isArray(templates) ? 
            templates.map((t: any) => `• **${t.name}**`).join('\n') :
            'No templates found';
            
          return {
            success: true,
            response: `Which template would you like to see details for?\n\n**Available templates:**\n${templateOptions}\n\nYou can say something like "Show me details of the Corporate Package template".`,
            type: 'template_details_request',
            data: {
              type: 'template_details_request',
              stage: 'name_required'
            }
          };
        }
        
        // Get template details
        const result = await this.agentManager.executeOperation('printavo_get_quote_template', { name: templateName });
        
        if (!result) {
          return {
            success: false,
            response: `I couldn't find a template named "${templateName}". Would you like to see a list of available templates?`,
            error: 'Template not found'
          };
        }
        
        // Format line items for display
        const lineItems = result.lineItems.map((item: any, index: number) => 
          `${index + 1}. **${item.quantity} x ${item.product}** - $${item.price.toFixed(2)} each${item.color ? ` (${item.color})` : ''}${item.customization ? `\n   • ${item.customization}` : ''}`
        ).join('\n');
        
        // Calculate total value
        const totalValue = result.lineItems.reduce((total: number, item: any) => 
          total + (item.price * item.quantity), 0
        ).toFixed(2);
        
        return {
          success: true,
          response: `## ${result.name}\n\n${result.description || ''}\n\n### Line Items:\n${lineItems}\n\n**Total Value:** $${totalValue}\n\n${result.defaultNotes ? `**Notes:** ${result.defaultNotes}\n\n` : ''}### How to Use This Template\nTo create a quote with this template, say:\n"Create a quote for [customer name] using the ${result.name} template"`,
          data: result
        };
      } else {
        // Generic template response
        return {
          success: true,
          response: `## Quote Templates\n\nTemplates help you create quotes faster by pre-filling with standard products, quantities and pricing.\n\n### What would you like to do?\n\n1. **See available templates**\n   Say: "Show me available templates"\n\n2. **View template details**\n   Say: "What's in the Corporate Package template?"\n\n3. **Create a quote from template**\n   Say: "Create a quote for King Clothing using the Standard T-Shirt Order template"\n\n4. **Get help with templates**\n   Say: "How do I use templates?"`,
          type: 'template_info',
          data: {
            type: 'template_info',
            stage: 'options'
          }
        };
      }
    } catch (error) {
      console.error('Error handling template query:', error);
      
      return {
        success: false,
        response: `I'm sorry, I had trouble processing your template request: ${(error as Error).message}`,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Extract template name from a query
   */
  private extractTemplateName(query: string): string | null {
    const commonTemplates = [
      'standard t-shirt order',
      'corporate package',
      'team sports package'
    ];
    
    // Check for common template names first
    for (const template of commonTemplates) {
      if (query.toLowerCase().includes(template.toLowerCase())) {
        return template;
      }
    }
    
    // Try more complex extraction
    const patterns = [
      /template(?:\s+called|\s+named)?\s+"([^"]+)"/i,
      /template(?:\s+called|\s+named)?\s+'([^']+)'/i,
      /template(?:\s+called|\s+named)?\s+([a-z0-9 -]+)(?:\s|$)/i,
      /(?:the|using|from)\s+(?:the\s+)?([a-z0-9 -]+)\s+template/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  /**
   * Extract customer name from a query
   */
  private extractCustomerName(query: string): string | null {
    // Try to extract customer name
    const patterns = [
      /quote for (?:customer |client )?"?([^"]+)"?(?:\s+using|\s+with|\s+from)/i,
      /quote for (?:customer |client )?"([^"]+)"/i,
      /quote for (?:customer |client )?'([^']+)'/i,
      /quote for (?:customer |client )?([a-z0-9 &.,'-]+?)(?:\s+using|\s+with|\s+from|\s*$)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Ignore if the "name" is actually a template reference
        if (name.toLowerCase().includes('template') || 
            name.toLowerCase().includes('package') ||
            name.toLowerCase() === 'standard') {
          continue;
        }
        return name;
      }
    }
    
    return null;
  }
  
  /**
   * Check if query is a quote creation intent
   */
  private isQuoteCreationIntent(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    
    // Template-related patterns
    const templatePatterns = [
      /use template/,
      /from template/,
      /quote template/,
      /template.*quote/,
      /standard order/,
      /use.*standard/,
      /usual order/,
      /standard package/,
      /corporate package/,
      /team package/
    ];
    
    // Check if this is a template-related query
    const isTemplateQuery = templatePatterns.some(pattern => pattern.test(lowerQuery));
    
    // If template-related, we'll return false so it gets handled by the operation lookup
    if (isTemplateQuery) {
      return false;
    }
    
    // Otherwise, check for regular quote creation patterns
    const quotePatterns = [
      /create (a|new) quote/,
      /start (a|new) quote/,
      /make (a|new) quote/,
      /generate (a|new) quote/,
      /quote for/,
      /^new quote/,
      /^quote/,
      /need (a|to) quote/,
      /order form/,
      /place (an|a) order/
    ];
    
    return quotePatterns.some(pattern => pattern.test(lowerQuery));
  }
  
  /**
   * Extract intent and parameters from a natural language query
   */
  private async extractIntentAndParameters(nlQuery: NaturalLanguageQuery): Promise<NLProcessingResult> {
    // Define the available operations for the AI to choose from
    const availableOperations: Record<string, AgentOperation> = {
      get_order: {
        agent: 'printavo',
        operation: 'get_order',
        description: 'Get order details by ID',
        parameters: ['id']
      },
      get_order_by_visual_id: {
        agent: 'printavo',
        operation: 'get_order_by_visual_id',
        description: 'Get order details by visual ID (a 4-digit number)',
        parameters: ['visualId']
      },
      search_orders: {
        agent: 'printavo',
        operation: 'search_orders',
        description: 'Search for orders by query string',
        parameters: ['query']
      },
      create_quote: {
        agent: 'printavo',
        operation: 'create_quote',
        description: 'Create a new quote for a customer with specified products',
        parameters: ['customerId', 'lineItems', 'notes', 'settings']
      },
      list_quote_templates: {
        agent: 'printavo',
        operation: 'list_quote_templates',
        description: 'List all available quote templates',
        parameters: []
      },
      get_quote_template: {
        agent: 'printavo',
        operation: 'get_quote_template',
        description: 'Get a quote template by ID or name',
        parameters: ['id', 'name']
      },
      search_quote_templates: {
        agent: 'printavo',
        operation: 'search_quote_templates',
        description: 'Search for quote templates by query',
        parameters: ['query']
      },
      create_quote_from_template: {
        agent: 'printavo',
        operation: 'create_quote_from_template',
        description: 'Create a new quote using a template',
        parameters: ['templateId', 'templateName', 'customerId', 'notes', 'tag']
      },
      get_product_info: {
        agent: 'sanmar',
        operation: 'get_product_info',
        description: 'Get product information from SanMar by style number and optionally color and size',
        parameters: ['styleNumber', 'color', 'size']
      },
      check_inventory: {
        agent: 'sanmar',
        operation: 'get_inventory',
        description: 'Check inventory levels for a SanMar product',
        parameters: ['styleNumber', 'color', 'size']
      },
      check_product_availability: {
        agent: 'sanmar',
        operation: 'check_product_availability',
        description: 'Check if a SanMar product is available and get pricing information',
        parameters: ['styleNumber', 'color', 'size', 'quantity']
      },
      list_files: {
        agent: 'sanmar_ftp',
        operation: 'list_files',
        description: 'List files in a directory on the SanMar FTP server',
        parameters: ['remotePath']
      },
      check_product_inventory: {
        agent: 'sanmar_ftp',
        operation: 'check_product_inventory',
        description: 'Check inventory for specific SanMar products',
        parameters: ['products']
      }
    };
    
    try {
      // Use OpenAI to determine the intent and extract parameters
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes user queries to determine their intent and extract parameters.
              Available operations:
              ${Object.entries(availableOperations)
                .map(([intent, op]) => `- ${intent}: ${op.description} (Parameters: ${op.parameters.join(', ')})`)
                .join('\n')
              }
              
              Respond with a JSON object containing:
              - intent: The identified intent from the available operations
              - parameters: An object containing the extracted parameters for the operation
              - reasoning: A brief explanation of why you chose this intent
              - confidence: A number between 0 and 1 indicating your confidence in this interpretation`
          },
          {
            role: 'user',
            content: nlQuery.query
          }
        ],
        response_format: { type: 'json_object' },
      });
      
      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }
      
      const parsed = JSON.parse(content);
      
      // Validate the parsed response
      if (!parsed.intent || !availableOperations[parsed.intent]) {
        throw new Error(`Invalid intent: ${parsed.intent}`);
      }
      
      // Return the processing result
      return {
        intent: parsed.intent,
        operation: availableOperations[parsed.intent],
        parameters: parsed.parameters || {},
        reasoning: parsed.reasoning || 'No reasoning provided',
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error extracting intent and parameters:', error);
      
      // Default to search intent for error cases
      return {
        intent: 'search_orders',
        operation: availableOperations.search_orders,
        parameters: { query: nlQuery.query },
        reasoning: 'Defaulted to search due to processing error',
        confidence: 0.1
      };
    }
  }
  
  /**
   * Format a response based on the operation and result
   */
  private async formatResponse(query: string, processingResult: NLProcessingResult, result: any): Promise<string> {
    try {
      // Use OpenAI to generate a natural language response
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that generates natural language responses based on query results.
              - Keep responses concise and directly answer the query
              - Include relevant details from the result data
              - For error cases, explain what went wrong and suggest alternatives
              - Use a helpful, professional tone`
          },
          {
            role: 'user',
            content: `User query: "${query}"
              Operation: ${processingResult.operation.agent}_${processingResult.operation.operation}
              Parameters: ${JSON.stringify(processingResult.parameters)}
              Result: ${JSON.stringify(result)}`
          }
        ]
      });
      
      return response.choices[0].message.content || 'I processed your request, but could not generate a proper response.';
    } catch (error) {
      console.error('Error formatting response:', error);
      
      // Fallback to a simple response in case of error
      if (result && result.success === false) {
        return `I'm sorry, there was an error processing your request: ${result.error || 'Unknown error'}`;
      }
      
      return `I found the information you requested about ${processingResult.intent}.`;
    }
  }

  /**
   * Check if query is a customer creation intent
   */
  private isCustomerCreationIntent(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    
    const customerPatterns = [
      /add (a |new )?customer/i,
      /create (a |new )?customer/i,
      /new customer/i,
      /add (a |new )?client/i,
      /create (a |new )?client/i,
      /new client/i,
      /register (a |new )?customer/i,
      /register (a |new )?client/i
    ];
    
    return customerPatterns.some(pattern => pattern.test(lowerQuery));
  }

  /**
   * Handle customer creation
   */
  private async handleCustomerCreation(nlQuery: NaturalLanguageQuery): Promise<NaturalLanguageResponse> {
    try {
      // Extract customer email from the query if provided
      const email = this.extractEmail(nlQuery.query);
      
      // If email provided, check if customer already exists
      if (email) {
        try {
          const existingCustomer = await this.agentManager.executeOperation('printavo_get_customer_by_email', { email });
          
          if (existingCustomer) {
            return {
              success: true,
              response: `I found an existing customer with email ${email}:\n\n**${existingCustomer.name}**\nEmail: ${existingCustomer.email}\nPhone: ${existingCustomer.phone || 'Not provided'}\nAddress: ${existingCustomer.address || 'Not provided'}\n\nWould you like to create a quote for this customer? Or would you like to update their information?`,
              type: 'customer_found',
              data: {
                type: 'existing_customer',
                customer: existingCustomer
              }
            };
          }
        } catch (error) {
          console.error('Error checking for existing customer:', error);
        }
      }
      
      // Start customer creation workflow
      return {
        success: true,
        response: "I'll help you create a new customer. Please provide the following information:\n\n1. Customer name (required)\n2. Email address (required)\n3. Phone number\n4. Street address\n5. City\n6. State\n7. Zip code\n\nYou can provide this information in a single message or I can guide you through each field step by step.",
        type: 'customer_creation',
        data: {
          type: 'customer_creation_started',
          stage: 'initial',
          email: email || null
        }
      };
    } catch (error) {
      console.error('Error in customer creation handler:', error);
      
      return {
        success: false,
        response: `I'm sorry, I encountered an error while trying to create a customer: ${(error as Error).message}`,
        error: (error as Error).message
      };
    }
  }

  /**
   * Extract email from query text
   */
  private extractEmail(query: string): string | null {
    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    
    const match = query.match(emailPattern);
    if (match) {
      return match[0];
    }
    
    return null;
  }
}

// Export singleton instance
export const nlInterface = new NaturalLanguageInterface(); 