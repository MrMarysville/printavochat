import OpenAI from 'openai';
import { getPrintavoAssistant, executePrintavoOperation } from './printavo-assistant';
import { logger } from '@/lib/logger';

// OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class PrintavoAgentClient {
  private openai: OpenAI;
  private assistantId: string | null = null;
  private threadId: string | null = null;
  
  constructor() {
    this.openai = openai;
  }
  
  /**
   * Initialize the client with an assistant and thread
   */
  async initialize() {
    try {
      // Get or create assistant
      this.assistantId = await getPrintavoAssistant();
      
      // Create a new thread for this session
      const thread = await this.openai.beta.threads.create();
      this.threadId = thread.id;
      
      logger.info(`PrintavoAgentClient initialized with assistantId: ${this.assistantId} and threadId: ${this.threadId}`);
      
      return this;
    } catch (error) {
      logger.error('Error initializing PrintavoAgentClient:', error);
      throw error;
    }
  }
  
  /**
   * Process a user query using the OpenAI Assistant
   */
  async processQuery(query: string) {
    if (!this.threadId || !this.assistantId) {
      logger.info('PrintavoAgentClient not initialized, initializing now...');
      await this.initialize();
    }
    
    try {
      // Add user message to thread
      await this.openai.beta.threads.messages.create(
        this.threadId!,
        { role: "user", content: query }
      );
      
      logger.info(`Added user message to thread: ${this.threadId}`);
      
      // Run the assistant
      const run = await this.openai.beta.threads.runs.create(
        this.threadId!,
        { assistant_id: this.assistantId! }
      );
      
      logger.info(`Started run: ${run.id}`);
      
      // Poll for completion
      let runStatus = await this.openai.beta.threads.runs.retrieve(
        this.threadId!,
        run.id
      );
      
      // Wait for run to complete or require action
      while (runStatus.status !== "completed" && runStatus.status !== "requires_action") {
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
          const errorMessage = runStatus.status === "failed" && runStatus.last_error 
            ? runStatus.last_error.message 
            : `Run ${runStatus.status}`;
          
          logger.error(`Run failed: ${errorMessage}`);
          throw new Error(errorMessage);
        }
        
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        runStatus = await this.openai.beta.threads.runs.retrieve(
          this.threadId!,
          run.id
        );
      }
      
      // Handle tool calls if needed
      if (runStatus.status === "requires_action" && 
          runStatus.required_action?.type === "submit_tool_outputs" && 
          runStatus.required_action.submit_tool_outputs.tool_calls) {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          logger.info(`Processing tool call: ${functionName}`, functionArgs);
          
          let output;
          try {
            // Execute the actual Printavo API call
            const result = await executePrintavoOperation(functionName, functionArgs);
            logger.info(`Tool execution successful: ${functionName}`);
            output = JSON.stringify(result);
          } catch (error) {
            logger.error(`Error executing tool ${functionName}:`, error);
            output = JSON.stringify({ error: (error as Error).message });
          }
          
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output
          });
        }
        
        // Submit tool outputs back to the assistant
        logger.info(`Submitting ${toolOutputs.length} tool outputs to run: ${run.id}`);
        await this.openai.beta.threads.runs.submitToolOutputs(
          this.threadId!,
          run.id,
          { tool_outputs: toolOutputs }
        );
        
        // Wait for run to complete after tool outputs
        runStatus = await this.openai.beta.threads.runs.retrieve(
          this.threadId!,
          run.id
        );
        
        while (runStatus.status !== "completed") {
          if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
            const errorMessage = runStatus.status === "failed" && runStatus.last_error 
              ? runStatus.last_error.message 
              : `Run ${runStatus.status}`;
            
            logger.error(`Run failed after tool submission: ${errorMessage}`);
            throw new Error(errorMessage);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          runStatus = await this.openai.beta.threads.runs.retrieve(
            this.threadId!,
            run.id
          );
        }
      }
      
      // Get messages (newest first)
      const messages = await this.openai.beta.threads.messages.list(
        this.threadId!
      );
      
      // Return the latest assistant message
      const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
      if (assistantMessages.length === 0) {
        throw new Error("No assistant response received");
      }
      
      // Get the content
      const messageContent = assistantMessages[0].content[0];
      if (messageContent.type !== 'text') {
        throw new Error("Response is not text");
      }
      
      return messageContent.text.value;
    } catch (error) {
      logger.error('Error in processQuery:', error);
      throw error;
    }
  }
  
  /**
   * Get the thread ID for this client
   */
  getThreadId() {
    return this.threadId;
  }
} 