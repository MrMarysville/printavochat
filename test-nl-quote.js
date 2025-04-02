// test-nl-quote.js
// Test script to directly invoke executePrintavoOperation for NL quote creation

// Need to use require for CommonJS modules if project isn't set up for ES modules in Node scripts
// Adjust path as necessary based on project structure
const { executePrintavoOperation } = require('./agents/printavo-assistant'); 
const { logger } = require('./lib/logger');

async function testNaturalLanguageQuote() {
  const naturalLanguageQuery = "Create a quote for test@example.com, customer name Test User, with 12 large red t-shirts at $10 each and 5 small blue hoodies at $22 each.";
  
  logger.info(`Testing create_quote_natural_language with query: "${naturalLanguageQuery}"`);

  try {
    const result = await executePrintavoOperation('create_quote_natural_language', { 
      natural_language_query: naturalLanguageQuery 
    });
    
    logger.info("Test completed. Result:");
    console.log(JSON.stringify(result, null, 2));

    if (result?.errors) {
      logger.error("Test failed with errors:", result.errors);
    } else if (result?.data?.quoteCreate?.quote) {
      logger.info(`Successfully created quote: ${result.data.quoteCreate.quote.id}`);
    } else {
       logger.warn("Test completed, but no quote data found in the response structure:", result);
    }

  } catch (error) {
    logger.error("Test failed with exception:", error);
  }
}

// Load environment variables if needed (e.g., using dotenv)
require('dotenv').config({ path: '.env.local' }); // Adjust path if necessary

testNaturalLanguageQuote();
