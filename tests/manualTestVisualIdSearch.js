/**
 * Manual test script for Visual ID search
 * 
 * This file can be imported in the browser console to test Visual ID search functionality
 * without needing to use the UI. It provides a function to directly call the search logic.
 */

// Function to test visual ID search
async function testVisualIdSearch(visualId) {
  console.log(`Testing Visual ID search for: ${visualId}`);

  try {
    // Import necessary modules
    const { determineOperation } = await import('/lib/operations.js');
    
    // Create mock context and sentiment
    const mockContext = {
      lastOrderId: undefined,
      lastOrderType: undefined,
      lastCustomerId: undefined,
      lastSearchTerm: undefined,
      lastIntent: undefined,
    };
    
    const mockSentiment = {
      isUrgent: false,
      isConfused: false,
      isPositive: false,
      isNegative: false,
    };
    
    // Test different input formats
    const testInputs = [
      visualId, // Direct visual ID
      `visual id ${visualId}`, // Prefixed visual ID
      `find order with visual id ${visualId}`, // Search phrase
      `show order ${visualId}`, // Show order command
      `search orders with visual id ${visualId}` // Filter search
    ];
    
    console.group('Visual ID Search Test Results');
    
    for (const input of testInputs) {
      console.log(`\nTesting input: "${input}"`);
      
      // Determine the operation
      const operation = determineOperation(input, mockContext, mockSentiment);
      console.log(`Operation name: ${operation.name}`);
      
      // Execute the operation
      try {
        const result = await operation.execute();
        console.log('Operation result:', result);
        
        if (result.data && result.data.length > 0) {
          console.log('✅ Success: Found matching order(s)');
        } else if (result.data && !Array.isArray(result.data)) {
          console.log('✅ Success: Found single order');
        } else {
          console.log('❌ No matching orders found');
        }
      } catch (error) {
        console.error('❌ Error executing operation:', error);
      }
    }
    
    console.groupEnd();
    
    return 'Test completed. Check results above.';
  } catch (error) {
    console.error('❌ Test setup error:', error);
    return 'Test failed. See error above.';
  }
}

// Export for browser console
window.testVisualIdSearch = testVisualIdSearch;

// Instructions for use
console.log('Visual ID search test utility loaded.');
console.log('To test, run: testVisualIdSearch("9435") in the console.');

// Export for module usage
export { testVisualIdSearch }; 