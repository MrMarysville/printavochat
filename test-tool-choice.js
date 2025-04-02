// Test the OpenAI Assistants API v2 tool_choice feature

const { AgentService } = require('./lib/agent-service');

async function testToolChoice() {
  console.log('Testing OpenAI Assistants API v2 tool_choice feature...');
  
  try {
    // Test regular getOrderByVisualId (without tool choice)
    console.log('\nTesting regular getOrderByVisualId without tool choice:');
    const resultWithoutToolChoice = await AgentService.getOrderByVisualId('1234');
    console.log('Success:', resultWithoutToolChoice.success);
    console.log('--------------------------------------------------');
    
    // Test directed tool choice
    console.log('\nTesting getOrderByVisualIdDirected with tool choice:');
    const resultWithToolChoice = await AgentService.getOrderByVisualIdDirected('1234');
    console.log('Success:', resultWithToolChoice.success);
    console.log('Used tool choice:', resultWithToolChoice.usedToolChoice === true);
    console.log('--------------------------------------------------');
    
  } catch (error) {
    console.error('Error testing tool choice:', error);
  }
}

testToolChoice();
