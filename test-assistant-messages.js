// Test the OpenAI Assistants API v2 custom assistant messages feature
import 'dotenv/config';
import { OpenAI } from 'openai';

// Create OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get assistant ID from environment
const assistantId = process.env.PRINTAVO_ASSISTANT_ID;

async function testAssistantMessages() {
  console.log('Testing OpenAI Assistants API v2 custom assistant messages feature...');
  console.log('Using assistant ID:', assistantId);
  
  try {
    // Create a new thread for testing
    console.log('\nCreating a new thread...');
    const thread = await openai.v2.threads.create();
    console.log('Thread created with ID:', thread.id);
    
    // Test 1: Add a custom assistant message
    console.log('\nTest 1: Adding a custom assistant message...');
    const assistantMessage = await openai.v2.threads.messages.create(
      thread.id,
      {
        role: "assistant",
        content: "I've analyzed your recent orders and found the following patterns..."
      }
    );
    console.log('Assistant message created with ID:', assistantMessage.id);
    
    // Test 2: Add a user message
    console.log('\nTest 2: Adding a user message...');
    const userMessage = await openai.v2.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: "Show me order details for #1234"
      }
    );
    console.log('User message created with ID:', userMessage.id);
    
    // Test 3: Run the assistant with tool_choice parameter
    console.log('\nTest 3: Running the assistant with tool_choice parameter...');
    const run = await openai.v2.threads.runs.create(
      thread.id,
      {
        assistant_id: assistantId,
        tool_choice: {
          type: "function",
          function: {
            name: "get_order_by_visual_id",
            arguments: JSON.stringify({ visualId: "1234" })
          }
        }
      }
    );
    console.log('Run created with ID:', run.id);
    
    // Wait for the run to complete
    console.log('\nWaiting for run to complete...');
    let runStatus = await openai.v2.threads.runs.retrieve(thread.id, run.id);
    
    // Poll for completion (normally this would be done with proper backoff)
    while (runStatus.status !== "completed" && 
           runStatus.status !== "requires_action" &&
           !["failed", "cancelled", "expired"].includes(runStatus.status)) {
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Current status:', runStatus.status);
      runStatus = await openai.v2.threads.runs.retrieve(thread.id, run.id);
    }
    
    if (runStatus.status === "requires_action") {
      console.log('\nRun requires action (tool calls detected)');
      console.log('Tool calls:', JSON.stringify(runStatus.required_action?.submit_tool_outputs.tool_calls, null, 2));
      
      // In a real implementation, we would execute the tool and submit results
      // For this test, we'll just submit a mock result
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = toolCalls.map(toolCall => ({
        tool_call_id: toolCall.id,
        output: JSON.stringify({
          id: "order_12345",
          visualId: "1234",
          customer: { name: "Test Customer" },
          status: { name: "In Production" },
          total: 500.00
        })
      }));
      
      // Submit tool outputs
      console.log('\nSubmitting tool outputs...');
      await openai.v2.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        { tool_outputs: toolOutputs }
      );
      
      // Wait for run to complete after submitting tool outputs
      runStatus = await openai.v2.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status !== "completed" && 
             !["failed", "cancelled", "expired"].includes(runStatus.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Current status after tool submission:', runStatus.status);
        runStatus = await openai.v2.threads.runs.retrieve(thread.id, run.id);
      }
    }
    
    if (runStatus.status === "completed") {
      console.log('\nRun completed successfully!');
      
      // Get messages after the run
      const messages = await openai.v2.threads.messages.list(thread.id);
      console.log('\nThread messages after completion:');
      for (const msg of messages.data) {
        console.log(`- [${msg.role}]: ${msg.content[0].type === 'text' ? msg.content[0].text.value : '[non-text content]'}`);
      }
    } else {
      console.log('\nRun did not complete successfully:', runStatus.status);
      if (runStatus.last_error) {
        console.log('Error:', runStatus.last_error.message);
      }
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the tests
testAssistantMessages();
