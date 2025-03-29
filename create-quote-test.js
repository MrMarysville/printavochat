const { printavoService } = require('./lib/printavo-service.js');
const { logger } = require('./lib/logger.js');

async function createQuoteForOMC() {
  try {
    // Create a quote for OMC
    const quoteInput = {
      customerName: 'OMC',
      customerEmail: 'sales@omc.com', // You'll need to provide the correct email
      description: 'Quote for OMC',
      lineItems: [
        {
          name: 'Sample Product',
          description: 'Sample product description',
          quantity: 1,
          unitPrice: 100
        }
      ],
      notes: 'Initial quote for OMC',
      inProductionAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    logger.info('Creating quote with input:', JSON.stringify(quoteInput, null, 2));
    
    const result = await printavoService.createQuote(quoteInput);
    
    if (result.success) {
      logger.info('Quote created successfully!');
      logger.info('Quote ID:', result.data.id);
      logger.info('Visual ID:', result.data.visualId);
    } else {
      logger.error('Failed to create quote:', result.errors);
    }
  } catch (error) {
    logger.error('Error creating quote:', error);
  }
}

createQuoteForOMC(); 