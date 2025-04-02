import { supabase, Agent } from '../lib/supabase-client';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';
import { isEqual } from 'lodash'; // Using lodash for deep comparison

// Default agent definition (excluding tools, which will be passed in)
const DEFAULT_PRINTAVO_AGENT_CONFIG = {
  name: "Printavo Agent",
  model: "gpt-4o",
  instructions: "You are a Printavo management assistant that helps users find and manage orders, customers, and quotes in their Printavo account. You can look up orders by visual ID, search for orders, find customers, create new customers, and create quotes.",
  is_active: true,
};

/**
 * Agent Store handles CRUD operations for agents in Supabase
 */
export class AgentStore {
  /**
   * Get an agent by its name
   */
  static async getAgentByName(name: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();
      
      if (error) {
        logger.error(`Error getting agent by name: ${name}`, error);
        return null;
      }
      
      return data as Agent;
    } catch (error) {
      logger.error(`Exception getting agent by name: ${name}`, error);
      return null;
    }
  }
  
  /**
   * Creates an OpenAI Assistant for an agent and saves it to Supabase
   */
  static async createAgent(
    openai: OpenAI,
    name: string, 
    model: string, 
    instructions: string, 
    tools: any[]
  ): Promise<Agent | null> {
    try {
      // Create the assistant in OpenAI using the beta namespace
      const assistant = await openai.beta.assistants.create({
        name,
        instructions,
        model,
        tools
      });
      
      const assistantId = assistant.id;
      logger.info(`Created assistant with ID: ${assistantId}`);
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name,
          assistant_id: assistantId,
          model,
          instructions,
          is_active: true,
          tools
        })
        .select()
        .single();
      
      if (error) {
        logger.error(`Error saving agent: ${name}`, error);
        return null;
      }
      
      return data as Agent;
    } catch (error) {
      logger.error(`Exception creating agent: ${name}`, error);
      return null;
    }
  }
  
  /**
   * Update an existing agent
   */
  static async updateAgent(
    agent: Agent,
    openai: OpenAI,
    updateAssistant: boolean = true
  ): Promise<Agent | null> {
    try {
      // Update the assistant in OpenAI if requested
      if (updateAssistant) {
        // Update the assistant in OpenAI using the beta namespace
        await openai.beta.assistants.update(
          agent.assistant_id,
          {
            name: agent.name,
            instructions: agent.instructions,
            model: agent.model,
            tools: agent.tools
          }
        );
        
        logger.info(`Updated assistant: ${agent.assistant_id}`);
      }
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('agents')
        .update({
          name: agent.name,
          model: agent.model,
          instructions: agent.instructions,
          tools: agent.tools,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)
        .select()
        .single();
      
      if (error) {
        logger.error(`Error updating agent: ${agent.id}`, error);
        return null;
      }
      
      return data as Agent;
    } catch (error) {
      logger.error(`Exception updating agent: ${agent.id}`, error);
      return null;
    }
  }
  
  /**
   * Ensure the default Printavo agent exists and is up-to-date with the provided tools.
   */
  static async ensureDefaultAgent(openai: OpenAI, currentTools: any[]): Promise<Agent | null> {
    const agentName = DEFAULT_PRINTAVO_AGENT_CONFIG.name;
    // First check if agent already exists
    const existingAgent = await this.getAgentByName(agentName);

    if (existingAgent) {
      logger.info(`Default Printavo agent already exists with ID: ${existingAgent.id}. Checking for updates...`);

      // Deep compare current tools with stored tools
      const toolsChanged = !isEqual(existingAgent.tools, currentTools);
      // Also check if other config needs update (optional, but good practice)
      const configChanged = existingAgent.model !== DEFAULT_PRINTAVO_AGENT_CONFIG.model ||
                            existingAgent.instructions !== DEFAULT_PRINTAVO_AGENT_CONFIG.instructions;

      if (toolsChanged || configChanged) {
        logger.info(`Agent configuration or tools have changed. Updating agent ${existingAgent.id}...`);
        // Update the existing agent object before saving
        existingAgent.tools = currentTools;
        existingAgent.model = DEFAULT_PRINTAVO_AGENT_CONFIG.model;
        existingAgent.instructions = DEFAULT_PRINTAVO_AGENT_CONFIG.instructions;
        
        // Update both Supabase and OpenAI Assistant
        return this.updateAgent(existingAgent, openai, true); 
      } else {
        logger.info(`Agent ${existingAgent.id} is up-to-date.`);
        return existingAgent;
      }
    } else {
       logger.info(`Default Printavo agent not found. Creating new agent...`);
       // Create the default agent using current config and tools
       return this.createAgent(
         openai,
         agentName,
         DEFAULT_PRINTAVO_AGENT_CONFIG.model,
         DEFAULT_PRINTAVO_AGENT_CONFIG.instructions,
         currentTools // Use the passed-in tools
       );
    }
  }
  
  /**
   * Get all active agents
   */
  static async getAllActiveAgents(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        logger.error('Error getting active agents', error);
        return [];
      }
      
      return data as Agent[];
    } catch (error) {
      logger.error('Exception getting active agents', error);
      return [];
    }
  }
}
