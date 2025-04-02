import OpenAI from 'openai';
import { AgentStore } from '../agents/agent-store';
import { logger } from '../lib/logger';
import setupSupabase from './setup-supabase';

/**
 * This script ensures the default Printavo agent exists in both OpenAI and Supabase.
 * It should be run manually after setting up the Supabase database.
 */
async function createDefaultAgent() {
  try {
    // First, ensure Supabase schema is set up
    const dbSetup = await setupSupabase();
    
    if (!dbSetup) {
      logger.error('Failed to set up Supabase schema. Please check your configuration.');
      process.exit(1);
    }
    
    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.error('OPENAI_API_KEY is not set. Please add it to your environment variables.');
      process.exit(1);
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey
    });
    
    // Ensure default agent exists
    logger.info('Creating or verifying default Printavo agent...');
    const agent = await AgentStore.ensureDefaultAgent(openai);
    
    if (!agent) {
      logger.error('Failed to create default agent. Check the logs for details.');
      process.exit(1);
    }
    
    logger.info(`Default Printavo agent is set up successfully.`);
    logger.info(`Agent ID: ${agent.id}`);
    logger.info(`Assistant ID: ${agent.assistant_id}`);
    
    // Print a message about updating environment variables
    logger.info('\nOptional: You can add the following to your .env.local file:');
    logger.info(`PRINTAVO_ASSISTANT_ID=${agent.assistant_id}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Unhandled error creating default agent:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  // Load environment variables if not already done by parent process
  require('dotenv').config();
  
  createDefaultAgent();
}

export default createDefaultAgent; 