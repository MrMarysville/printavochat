/**
 * Create Quote for OMC using Printavo Mock API
 * 
 * This script creates a quote for OMC company using the Printavo mock API.
 * Set USE_REAL_API to true when ready to use the real Printavo API.
 */

// === Configuration ===
const USE_REAL_API = false; // Set to true to use real Printavo API
const API_CONFIG = {
  url: 'https://www.printavo.com/api/v2',
  email: 'sales@kingclothing.com',
  token: 'rEPQzTtowT_MQVbY1tfLtg'
};

// === Mock Data ===
const MOCK_DATA = {
  // Customers
  customers: [
    {
      id: 'cust-789',
      companyName: 'OMC',
      email: 'sales@omc.com',
      phone: '555-123-4567',
      contacts: [
        { 
          id: 'cont-123',
          fullName: 'OMC Contact',
          email: 'contact@omc.com',
          phone: '555-123-4567'
        }
      ]
    }
  ]
};

// === API Layer ===
const PrintavoAPI = {
  /**
   * Get customers
   */
  getCustomers: async (limit = 10) => {
    console.log(`🔍 Getting customers (limit: ${limit})`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      return MOCK_DATA.customers.slice(0, limit);
    }
  },
  
  /**
   * Get customer by company name
   */
  getCustomerByName: async (companyName) => {
    console.log(`🔍 Looking up customer with name: ${companyName}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const customer = MOCK_DATA.customers.find(c => 
        c.companyName.toLowerCase().includes(companyName.toLowerCase())
      );
      
      if (customer) {
        console.log('✅ Customer found!');
        return customer;
      } else {
        console.log(`❌ Customer with name ${companyName} not found`);
        return null;
      }
    }
  },
  
  /**
   * Create a new customer
   */
  createCustomer: async (customerData) => {
    console.log(`🔍 Creating new customer: ${customerData.companyName}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const newCustomerId = `cust-${Math.floor(Math.random() * 10000)}`;
      const newCustomer = {
        id: newCustomerId,
        ...customerData,
        contacts: []
      };
      
      // Add to mock data
      MOCK_DATA.customers.push(newCustomer);
      
      console.log(`✅ Created customer with ID: ${newCustomerId}`);
      return newCustomer;
    }
  },
  
  /**
   * Create a contact for a customer
   */
  createContact: async (customerId, contactData) => {
    console.log(`🔍 Creating contact for customer ${customerId}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      const customer = MOCK_DATA.customers.find(c => c.id === customerId);
      
      if (!customer) {
        console.error(`❌ Customer ${customerId} not found`);
        return null;
      }
      
      const newContactId = `cont-${Math.floor(Math.random() * 10000)}`;
      const newContact = {
        id: newContactId,
        ...contactData
      };
      
      // Add to customer's contacts
      if (!customer.contacts) {
        customer.contacts = [];
      }
      customer.contacts.push(newContact);
      
      console.log(`✅ Created contact with ID: ${newContactId}`);
      return newContact;
    }
  },
  
  /**
   * Create a quote
   */
  createQuote: async (customerId, contactId, quoteData, lineItems) => {
    console.log(`🔍 Creating quote for customer ${customerId}`);
    
    if (USE_REAL_API) {
      // Real API implementation would go here
      throw new Error('Real API not yet implemented');
    } else {
      // Mock implementation
      // Generate a random quote ID and visual ID
      const quoteId = `quote-${Math.floor(Math.random() * 10000)}`;
      const visualId = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Create the quote
      const quote = {
        id: quoteId,
        visualId,
        customerId,
        contactId,
        ...quoteData,
        lineItems: lineItems.map((item, index) => ({
          id: `line-${index + 1}`,
          ...item
        })),
        createdAt: new Date().toISOString(),
        status: {
          id: 'status-1',
          name: 'Draft'
        }
      };
      
      console.log(`✅ Created quote ${quoteId} with visual ID ${visualId}`);
      return quote;
    }
  }
};

// Main function to create a quote for OMC
async function createQuoteForOMC() {
  try {
    console.log('Starting quote creation for OMC...');
    
    // Step 1: Look up or create OMC customer
    let customer = await PrintavoAPI.getCustomerByName('OMC');
    let contact;
    
    if (customer) {
      console.log(`Found existing customer: ${customer.companyName} (ID: ${customer.id})`);
      contact = customer.contacts && customer.contacts.length > 0 ? customer.contacts[0] : null;
      
      if (contact) {
        console.log(`Using existing contact: ${contact.fullName} (ID: ${contact.id})`);
      } else {
        console.log('No contacts found, creating a new contact');
        contact = await PrintavoAPI.createContact(customer.id, {
          fullName: 'OMC Contact',
          email: 'contact@omc.com',
          phone: '555-123-4567'
        });
      }
    } else {
      console.log('Customer OMC not found, creating new customer');
      customer = await PrintavoAPI.createCustomer({
        companyName: 'OMC',
        email: 'sales@omc.com',
        phone: '555-123-4567'
      });
      
      console.log('Creating contact for the new customer');
      contact = await PrintavoAPI.createContact(customer.id, {
        fullName: 'OMC Contact',
        email: 'contact@omc.com',
        phone: '555-123-4567'
      });
    }
    
    // Step 2: Create a quote with line items
    console.log('Creating quote with line items');
    
    const quoteData = {
      description: 'Quote for OMC',
      customerNote: 'Initial quote for OMC',
      productionNote: 'Standard production time',
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
    };
    
    const lineItems = [
      {
        name: 'T-Shirt',
        description: 'Custom T-Shirt with Logo',
        quantity: 20,
        unitPrice: 19.99,
        color: 'Navy',
        sizes: ['S(5)', 'M(10)', 'L(5)']
      },
      {
        name: 'Hoodie',
        description: 'Custom Hoodie with Logo',
        quantity: 15,
        unitPrice: 39.99,
        color: 'Black',
        sizes: ['M(5)', 'L(5)', 'XL(5)']
      }
    ];
    
    const quote = await PrintavoAPI.createQuote(customer.id, contact.id, quoteData, lineItems);
    
    console.log('\n===== Quote Created Successfully =====');
    console.log(`Quote ID: ${quote.id}`);
    console.log(`Visual ID: ${quote.visualId}`);
    console.log(`Customer: ${customer.companyName}`);
    console.log(`Contact: ${contact.fullName}`);
    console.log(`Line Items: ${quote.lineItems.length}`);
    console.log('======================================\n');
    
    // Print line items details
    console.log('Line Items:');
    quote.lineItems.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  Product: ${item.name}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Color: ${item.color}`);
      console.log(`  Sizes: ${item.sizes.join(', ')}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Unit Price: $${item.unitPrice}`);
      console.log(`  Total: $${item.quantity * item.unitPrice}`);
    });
    
    // Calculate and print the total
    const total = quote.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    console.log(`\nTotal Quote Amount: $${total.toFixed(2)}`);
    
    return quote;
  } catch (error) {
    console.error('Error creating quote for OMC:', error);
    throw error;
  }
}

// Run the function
createQuoteForOMC()
  .then(quote => {
    console.log('Quote creation process completed!');
  })
  .catch(error => {
    console.error('The quote creation process failed:', error);
  }); 