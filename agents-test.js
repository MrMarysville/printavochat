/**
 * Test script for the agent system.
 * This script tests the main functionality of the agent system, 
 * ensuring that all agents are working properly.
 * 
 * Run with: node agents-test.js
 */

// Load environment variables from .env
require('dotenv').config();

const { AgentManager } = require('./agents');

// Test function
async function testAgents() {
  try {
    console.log('🚀 Testing agent system...');
    
    // Create agent manager
    const agentManager = new AgentManager();
    
    // Get agent status
    console.log('\n📊 Getting agent status...');
    const status = agentManager.getStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    
    // Test Printavo agent
    console.log('\n🔍 Testing Printavo agent...');
    
    try {
      console.log('  • Getting account info...');
      const account = await agentManager.executeOperation('printavo_get_account', {});
      console.log('    ✅ Success:', account.name);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    try {
      console.log('  • Getting statuses...');
      const statuses = await agentManager.executeOperation('printavo_list_statuses', {});
      console.log(`    ✅ Success: Found ${statuses.length} statuses`);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    // Test SanMar agent
    console.log('\n🧵 Testing SanMar agent...');
    
    try {
      console.log('  • Getting product info for PC61...');
      const product = await agentManager.executeOperation('sanmar_get_product_info', {
        styleNumber: 'PC61',
        color: 'Black',
        size: 'L'
      });
      console.log(`    ✅ Success: ${product.productName}`);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    try {
      console.log('  • Checking inventory for PC61...');
      const inventory = await agentManager.executeOperation('sanmar_get_inventory', {
        styleNumber: 'PC61',
        color: 'Black',
        size: 'L'
      });
      console.log(`    ✅ Success: ${inventory.inventoryLevels[0].quantity} units available`);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    // Test SanMar FTP agent
    console.log('\n📁 Testing SanMar FTP agent...');
    
    try {
      console.log('  • Listing files...');
      const files = await agentManager.executeOperation('sanmar_ftp_list_files', {
        remotePath: '/'
      });
      console.log(`    ✅ Success: Found ${files.length} files`);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    // Test composite operations
    console.log('\n🔄 Testing composite operations...');
    
    try {
      console.log('  • Checking product availability for PC61...');
      const productAvailability = await agentManager.executeOperation('sanmar_check_product_availability', {
        styleNumber: 'PC61',
        color: 'Black',
        size: 'L'
      });
      console.log(`    ✅ Success: Available: ${productAvailability.isAvailable}`);
    } catch (error) {
      console.error('    ❌ Error:', error.message);
    }
    
    console.log('\n✨ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testAgents().catch(console.error); 