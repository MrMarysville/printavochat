/**
 * OpenAI Agent Implementation Test
 * 
 * This script checks if your agent implementation is properly set up
 * by verifying the necessary files and configurations.
 * 
 * Run with: node test-agent-implementation.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Files that should exist for the agent implementation
const requiredFiles = [
  'agents/agent-client.ts',
  'agents/printavo-assistant.ts', 
  'agents/printavo/tools.ts',
  'agents/printavo/queries.ts',
  'lib/agent-service.ts',
  'app/api/agent/route.ts'
];

// Environment variables that should be set
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'USE_OPENAI_ASSISTANTS',
  'PRINTAVO_ASSISTANT_ID'
];

// Test if all required files exist
function checkRequiredFiles() {
  console.log('🔍 Checking required files...\n');
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found file: ${file}`);
    } else {
      console.error(`❌ Missing file: ${file}`);
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length === 0) {
    console.log('\n✅ All required files are present.');
    return true;
  } else {
    console.error(`\n❌ Missing ${missingFiles.length} required files.`);
    return false;
  }
}

// Test if all required environment variables are set
function checkEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...\n');
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
      
      // Check specific values
      if (envVar === 'USE_OPENAI_ASSISTANTS' && process.env[envVar] !== 'true') {
        console.warn(`⚠️ ${envVar} is set to "${process.env[envVar]}" instead of "true"`);
      }
      
      if (envVar === 'OPENAI_MODEL') {
        console.log(`   Value: ${process.env[envVar]}`);
      }
      
      if (envVar === 'OPENAI_API_KEY') {
        console.log(`   Starts with: ${process.env[envVar].substring(0, 10)}...`);
      }
      
      if (envVar === 'PRINTAVO_ASSISTANT_ID') {
        console.log(`   Value: ${process.env[envVar]}`);
      }
    } else {
      console.error(`❌ ${envVar} is not set`);
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length === 0) {
    console.log('\n✅ All required environment variables are set.');
    return true;
  } else {
    console.error(`\n❌ Missing ${missingVars.length} required environment variables.`);
    return false;
  }
}

// Check agent implementation in agent-client.ts
function checkAgentImplementation() {
  console.log('\n🔍 Checking agent implementation...\n');
  
  try {
    const agentClientPath = path.join(process.cwd(), 'agents/agent-client.ts');
    
    if (!fs.existsSync(agentClientPath)) {
      console.error('❌ Cannot check agent implementation: agent-client.ts file not found.');
      return false;
    }
    
    const content = fs.readFileSync(agentClientPath, 'utf8');
    
    // Check for key implementations
    const checks = [
      { name: 'OpenAI import', pattern: /import\s+OpenAI\s+from\s+['"]openai['"]/ },
      { name: 'API key configuration', pattern: /apiKey:\s*process\.env\.OPENAI_API_KEY/ },
      { name: 'Assistant ID handling', pattern: /assistantId/ },
      { name: 'Thread management', pattern: /threadId/ },
      { name: 'Tool execution', pattern: /executePrintavoOperation/ }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name} found`);
      } else {
        console.error(`❌ ${check.name} not found`);
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log('\n✅ Agent implementation appears to be correctly set up.');
      return true;
    } else {
      console.error('\n❌ Agent implementation has issues. Check the agent-client.ts file.');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking agent implementation: ${error.message}`);
    return false;
  }
}

// Main function
function runTests() {
  console.log('🔍 TESTING OPENAI AGENT IMPLEMENTATION\n');
  
  const filesCheck = checkRequiredFiles();
  const envVarsCheck = checkEnvironmentVariables();
  const implementationCheck = checkAgentImplementation();
  
  console.log('\n🎉 Tests completed!\n');
  
  if (filesCheck && envVarsCheck && implementationCheck) {
    console.log('✅ Your OpenAI agent implementation appears to be correctly set up.');
    console.log('✅ The only way to fully verify it is to run the application and test the agent functionality.');
    console.log('\nTo test the agent API endpoint:');
    console.log('1. Start your Next.js server: npm run dev');
    console.log('2. Send a POST request to /api/agent with an operation and parameters');
  } else {
    console.error('❌ There are issues with your OpenAI agent implementation. Please fix them and run this test again.');
    
    if (!filesCheck) {
      console.error('\nMissing files need to be created.');
    }
    
    if (!envVarsCheck) {
      console.error('\nEnvironment variables need to be set in your .env file.');
    }
    
    if (!implementationCheck) {
      console.error('\nAgent implementation needs to be fixed in agent-client.ts.');
    }
  }
}

// Run the tests
runTests(); 