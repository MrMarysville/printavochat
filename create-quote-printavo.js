/**
 * Create Quote for OMC using Printavo API directly
 * 
 * This script creates a quote for OMC company using the Printavo API.
 */

const fetch = require('node-fetch');
require('dotenv').config();

// Printavo API credentials from .env file
const API_URL = 'https://www.printavo.com/api/v2';
const EMAIL = 'sales@kingclothing.com';
const TOKEN = 'rEPQzTtowT_MQVbY1tfLtg';

// GraphQL endpoint (ensure it has the full URL)
const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;

console.log(`Using GraphQL endpoint: ${GRAPHQL_ENDPOINT}`);

// Function to execute GraphQL query
async function executeGraphQL(query, variables = {}, operationName = '') {
  try {
    console.log(`Executing GraphQL operation: ${operationName}`);
    console.log(`Variables: ${JSON.stringify(variables, null, 2)}`);
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': EMAIL,
        'token': TOKEN
      },
      body: JSON.stringify({
        query,
        variables,
        operationName
      })
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify([...response.headers], null, 2)}`);
    console.log(`Response text: ${responseText.substring(0, 500)}...`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${responseText}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }
    
    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }
    
    console.log(`Result: ${JSON.stringify(result.data, null, 2)}`);
    return result.data;
  } catch (error) {
    console.error(`Error executing GraphQL:`, error);
    throw error;
  }
}

// Search for a customer by name
async function searchCustomers(query) {
  const searchQuery = `
    query SearchCustomers($query: String!) {
      contacts(query: $query, first: 10) {
        edges {
          node {
            id
            fullName
            email
            phone
            company
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(searchQuery, { query }, 'SearchCustomers');
  
  if (!data?.contacts?.edges || data.contacts.edges.length === 0) {
    return [];
  }
  
  return data.contacts.edges.map(edge => edge.node);
}

// Create a new customer
async function createCustomer(input) {
  const createCustomerMutation = `
    mutation CreateCustomer($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          companyName
        }
      }
    }
  `;
  
  const data = await executeGraphQL(createCustomerMutation, { input }, 'CreateCustomer');
  return data?.customerCreate?.customer;
}

// Create a new contact
async function createContact(input) {
  const createContactMutation = `
    mutation CreateContact($input: ContactCreateInput!) {
      contactCreate(input: $input) {
        contact {
          id
          fullName
          email
          phone
        }
      }
    }
  `;
  
  const data = await executeGraphQL(createContactMutation, { input }, 'CreateContact');
  return data?.contactCreate?.contact;
}

// Create a quote
async function createQuote(input) {
  const createQuoteMutation = `
    mutation CreateQuote($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
        quote {
          id
          visualId
          name
          contact {
            id
            fullName
            email
          }
          status {
            id
            name
          }
          total
          subtotal
          customerNote
          productionNote
          createdAt
        }
      }
    }
  `;
  
  const data = await executeGraphQL(createQuoteMutation, { input }, 'CreateQuote');
  return data?.quoteCreate?.quote;
}

// Add a line item to a quote
async function addLineItemToQuote(quoteId, lineItemInput) {
  const addLineItemMutation = `
    mutation AddLineItem($quoteId: ID!, $input: LineItemCreateInput!) {
      lineItemCreate(quoteId: $quoteId, input: $input) {
        lineItem {
          id
          name
          description
          quantity
          unitPrice
          total
        }
      }
    }
  `;
  
  const data = await executeGraphQL(
    addLineItemMutation, 
    { 
      quoteId, 
      input: lineItemInput 
    }, 
    'AddLineItem'
  );
  
  return data?.lineItemCreate?.lineItem;
}

// Main function to create a quote for OMC
async function createQuoteForOMC() {
  try {
    // Step 1: Search for OMC customer
    console.log('Searching for OMC customer...');
    const customers = await searchCustomers('OMC');
    
    let customerId, contactId;
    
    // Check if OMC customer exists
    if (customers.length > 0) {
      // Use the first matching customer
      const customer = customers[0];
      customerId = customer.id;
      contactId = customer.id; // In Printavo, contact ID and customer ID are often the same
      
      console.log(`Found existing customer: ${customer.company || customer.fullName} (ID: ${customerId})`);
    } else {
      // Create a new customer if not found
      console.log('Customer OMC not found, creating new customer');
      
      const newCustomer = await createCustomer({
        companyName: 'OMC',
        email: 'sales@omc.com',
        phone: '555-123-4567'
      });
      
      if (newCustomer && newCustomer.id) {
        customerId = newCustomer.id;
        console.log(`Created new customer with ID: ${customerId}`);
        
        // Create a contact for the new customer
        const newContact = await createContact({
          customerId: customerId,
          fullName: 'OMC Contact',
          email: 'contact@omc.com',
          phone: '555-123-4567'
        });
        
        if (newContact && newContact.id) {
          contactId = newContact.id;
          console.log(`Created new contact with ID: ${contactId}`);
        }
      } else {
        throw new Error('Failed to create customer');
      }
    }
    
    // Step 2: Create the quote
    console.log('Creating quote...');
    const quoteInput = {
      customerId: customerId,
      contactId: contactId,
      description: 'Quote for OMC',
      customerNote: 'Initial quote for OMC',
      productionNote: 'Standard production time',
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
    };
    
    const quote = await createQuote(quoteInput);
    
    if (!quote || !quote.id) {
      throw new Error('Failed to create quote');
    }
    
    console.log(`Quote created successfully! ID: ${quote.id}, Visual ID: ${quote.visualId}`);
    
    // Step 3: Add line items to the quote
    console.log('Adding line items to quote...');
    
    const lineItems = [
      {
        name: 'T-Shirt',
        description: 'Custom T-Shirt with Logo',
        quantity: 20,
        unitPrice: 19.99
      },
      {
        name: 'Hoodie',
        description: 'Custom Hoodie with Logo',
        quantity: 15,
        unitPrice: 39.99
      }
    ];
    
    for (const lineItemInput of lineItems) {
      const lineItem = await addLineItemToQuote(quote.id, lineItemInput);
      console.log(`Added line item: ${lineItem.name} - ${lineItem.quantity} @ $${lineItem.unitPrice}`);
    }
    
    console.log('Quote creation completed successfully!');
    console.log(`Quote ID: ${quote.id}`);
    console.log(`Visual ID: ${quote.visualId}`);
    console.log(`Total: $${quote.total || 'N/A'}`);
  } catch (error) {
    console.error('Error creating quote for OMC:', error);
  }
}

// Run the main function
createQuoteForOMC(); 