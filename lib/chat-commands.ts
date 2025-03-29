import { OrdersAPI } from './printavo-api';
import { logger } from './logger';
import { QuoteCreateInput, LineItemCreateInput, LineItemGroupCreateInput, LineItemGroupWithItemsInput, ImprintInput } from './types';
import { printavoService } from './printavo-service';

type ChatCommandResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Global state to track quote creation
interface QuoteState {
  active: boolean;
  quoteData: QuoteCreateInput;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  lineItemGroups: Array<{
    name: string;
    description?: string;
    notes?: string;
    lineItems: Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
    }>;
    imprint?: {
      typeOfWork: string;
      details?: string;
      pricingMatrixColumnId?: string;
      mockupUrls?: string[];
    };
  }>;
  currentGroupName: string;
  stage: 'initial' | 'customer' | 'customer_details' | 'items' | 'payment' | 'notes' | 'review';
  existingCustomerId?: string;
  pendingCustomer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
  }
  paymentTerms?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  selectedPaymentTermId?: string;
}

// Initialize an empty quote state
function getEmptyQuoteState(): QuoteState {
  return {
    active: false,
    quoteData: {},
    lineItems: [],
    lineItemGroups: [],
    currentGroupName: "Items",
    stage: 'initial',
    pendingCustomer: {}
  };
}

// Global variable to keep track of the quote creation process
let globalQuoteCreationState: QuoteState = getEmptyQuoteState();

/**
 * Calculates a production date that falls on a business day (not weekend)
 * and is approximately 2 weeks from the current date
 */
function calculateProductionDate(): string {
  // Start with 2 weeks from now
  const date = new Date();
  date.setDate(date.getDate() + 14);
  
  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  const day = date.getDay();
  
  // If it's a weekend, move to next Monday
  if (day === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  } else if (day === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  }
  
  // Format as ISO string and return just the date part
  return date.toISOString().split('T')[0];
}

/**
 * Processes natural language queries for Printavo data
 * @param userQuery The natural language query from the user
 * @returns A result object with success status, message and optional data
 */
export async function processChatQuery(userQuery: string): Promise<ChatCommandResult> {
  // Normalize the query to lowercase for easier matching
  const query = userQuery.toLowerCase().trim();

  // Check for quote or invoice creation
  const createQuoteMatch = query.match(/create (?:a |new )?(?:quote|invoice|estimate)(?: for| with)? (.*)/i) ||
                           query.match(/(?:make|new|start) (?:a |new )?(?:quote|invoice|estimate)(?: for| with)? (.*)/i);
  
  if (createQuoteMatch) {
    const customer = createQuoteMatch[1]?.trim();
    return await startQuoteCreation(customer);
  }

  // Check for simple "find order XXXX" pattern with a 4-digit number
  const simpleOrderMatch = query.match(/find (?:order|invoice) (\d{4})\b/i);
  if (simpleOrderMatch && simpleOrderMatch[1]) {
    const visualId = simpleOrderMatch[1];
    return await searchByVisualId(visualId);
  }

  // Check for order/invoice lookups by visual ID
  const visualIdMatch = 
    query.match(/find (?:order|invoice)(?: with| for| number)? (?:visual id|visualid|id) (\d+)/i) || 
    query.match(/(?:order|invoice)(?: with| for| number)? (?:visual id|visualid|id) (\d+)/i) ||
    query.match(/(?:search|look up|lookup|show|get)(?: for)? (?:order|invoice) (\d+)/i);
  
  if (visualIdMatch && visualIdMatch[1]) {
    const visualId = visualIdMatch[1];
    return await searchByVisualId(visualId);
  }

  // Check for adding items to an in-progress quote
  const addItemMatch = query.match(/add (?:a |an |)(?:item|product|line item)(?: to the quote)?:? (.*)/i);
  if (addItemMatch && globalQuoteCreationState.active) {
    const itemText = addItemMatch[1]?.trim();
    return await addLineItemToQuote(itemText);
  }

  // Check for editing a line item in the quote
  const editItemMatch = query.match(/edit (?:item|product|line item)(?: number| #)? (\d+):? (.*)/i);
  if (editItemMatch && globalQuoteCreationState.active) {
    const itemIndex = parseInt(editItemMatch[1]) - 1;
    const newItemText = editItemMatch[2]?.trim();
    return await editLineItem(itemIndex, newItemText);
  }

  // Check for removing a line item from the quote
  const removeItemMatch = query.match(/(?:remove|delete) (?:item|product|line item)(?: number| #)? (\d+)/i);
  if (removeItemMatch && globalQuoteCreationState.active) {
    const itemIndex = parseInt(removeItemMatch[1]) - 1;
    return await removeLineItem(itemIndex);
  }

  // Check for showing a preview of the current quote
  const previewMatch = query.match(/(?:preview|show|display|review|view)(?: the| this)? quote/i);
  if (previewMatch && globalQuoteCreationState.active) {
    return await previewQuote();
  }

  // Check for providing customer name during customer creation
  if (globalQuoteCreationState.active && globalQuoteCreationState.stage === 'customer_details') {
    // Capture first and last name
    const nameMatches = query.match(/(?:name|full name|first and last|customer name):?\s*(.*)/i);
    const firstNameMatches = query.match(/(?:first|first name):?\s*(.*)/i);
    const lastNameMatches = query.match(/(?:last|last name|surname):?\s*(.*)/i);
    const companyMatches = query.match(/(?:company|organization|business|company name):?\s*(.*)/i);
    const phoneMatches = query.match(/(?:phone|number|tel|telephone|cell):?\s*(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i);
    
    if (nameMatches) {
      const fullName = nameMatches[1].trim();
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        globalQuoteCreationState.pendingCustomer!.firstName = nameParts[0];
        globalQuoteCreationState.pendingCustomer!.lastName = nameParts.slice(1).join(' ');
      } else {
        globalQuoteCreationState.pendingCustomer!.firstName = fullName;
      }
    }
    
    if (firstNameMatches) {
      globalQuoteCreationState.pendingCustomer!.firstName = firstNameMatches[1].trim();
    }
    
    if (lastNameMatches) {
      globalQuoteCreationState.pendingCustomer!.lastName = lastNameMatches[1].trim();
    }
    
    if (companyMatches) {
      globalQuoteCreationState.pendingCustomer!.company = companyMatches[1].trim();
    }
    
    if (phoneMatches) {
      globalQuoteCreationState.pendingCustomer!.phone = phoneMatches[1].replace(/[-.\s]/g, '');
    }
    
    return await processCustomerDetails();
  }

  // Check for setting customer info
  const customerInfoMatch = query.match(/(?:customer|client)(?: info| information| details)?:? (.*)/i);
  if (customerInfoMatch && globalQuoteCreationState.active) {
    const customerInfo = customerInfoMatch[1]?.trim();
    return await setCustomerInfo(customerInfo);
  }

  // Check for adding notes
  const notesMatch = query.match(/(?:note|notes|add note|add notes):? (.*)/i);
  if (notesMatch && globalQuoteCreationState.active) {
    const notes = notesMatch[1]?.trim();
    return await addNotesToQuote(notes);
  }

  // Check for finalizing the quote
  const finalizeMatch = query.match(/(?:finalize|create|complete|finish|save)(?: the| this)? quote/i);
  if (finalizeMatch && globalQuoteCreationState.active) {
    return await finalizeQuote();
  }

  // Check for cancelling the quote creation
  const cancelMatch = query.match(/(?:cancel|abort|stop)(?: the| this)? quote/i);
  if (cancelMatch && globalQuoteCreationState.active) {
    globalQuoteCreationState = getEmptyQuoteState();
    return {
      success: true,
      message: "Quote creation cancelled."
    };
  }

  // Handle yes/no to using existing customer
  if (globalQuoteCreationState.active && globalQuoteCreationState.stage === 'customer') {
    const yesMatch = query.match(/^(yes|yeah|yep|y|correct|right|sure|ok|okay)$/i);
    const noMatch = query.match(/^(no|nope|n|nah)$/i);
    
    if (yesMatch && globalQuoteCreationState.existingCustomerId) {
      // Use existing customer
      globalQuoteCreationState.quoteData.customerId = globalQuoteCreationState.existingCustomerId;
      globalQuoteCreationState.stage = 'items';
      return {
        success: true,
        message: "Great! I'll use the existing customer. Now, let's add some items to the quote. You can say something like 'Add item: 24 custom t-shirts at $15 each'"
      };
    } else if (noMatch && globalQuoteCreationState.pendingCustomer?.email) {
      // Create new customer
      globalQuoteCreationState.stage = 'customer_details';
      return {
        success: true,
        message: "Okay, I'll create a new customer record. Please provide the following details:\n" +
                "- First name\n" +
                "- Last name\n" +
                "- Company name (optional)\n" +
                "- Phone number (optional)"
      };
    }
  }

  // Check for adding a new line item group
  const addGroupMatch = query.match(/(?:add|create|new) (?:a |an |)(?:group|item group|line item group)(?:\s|:)+(.*)/i);
  if (addGroupMatch && globalQuoteCreationState.active) {
    const groupName = addGroupMatch[1]?.trim();
    return await addLineItemGroup(groupName);
  }

  // Check for payment term selection
  const paymentTermMatch = query.match(/(?:payment terms?|pay terms?|due|payment|pay|terms?)(?:\s|:)+(.*)/i);
  if (paymentTermMatch && globalQuoteCreationState.active && globalQuoteCreationState.stage === 'payment') {
    const paymentTermInfo = paymentTermMatch[1]?.trim();
    return await setPaymentTerm(paymentTermInfo);
  }

  // Check for adding imprint to a line item group
  const imprintMatch = query.match(/(?:add|attach) (?:artwork|art|design|mockup|imprint)(?: to| for)?(?: group)?(?: ?[\"']?([^\"']+)[\"']?)?(?: ?:)? ?(.*)/i);
  if (imprintMatch && globalQuoteCreationState.active) {
    const groupName = imprintMatch[1]?.trim() || globalQuoteCreationState.currentGroupName;
    const imprintDetails = imprintMatch[2]?.trim();
    return await addImprintToGroup(groupName, imprintDetails);
  }

  // No recognized command pattern
  if (globalQuoteCreationState.active) {
    // If we're in quote creation mode but didn't match a specific command,
    // try to guess what the user is trying to do
    if (query.includes("item") || query.includes("product")) {
      return await addLineItemToQuote(query);
    } else if (query.includes("customer") || query.includes("client") || query.includes("email")) {
      return await setCustomerInfo(query);
    } else if (query.includes("note")) {
      return await addNotesToQuote(query);
    } else {
      return {
        success: false,
        message: "I'm not sure what you want to do with the quote. You can add items, set customer info, add notes, or finalize the quote."
      };
    }
  }

  return {
    success: false,
    message: "I didn't understand that query. You can ask me to find an order by visual ID (e.g., 'find order with visual ID 123'), or create a new quote (e.g., 'create a quote for ABC Company')."
  };
}

/**
 * Process customer details collection and validate required fields
 */
async function processCustomerDetails(): Promise<ChatCommandResult> {
  const pendingCustomer = globalQuoteCreationState.pendingCustomer!;
  
  // Check if we have required details
  const missingFields = [];
  
  if (!pendingCustomer.firstName) {
    missingFields.push("first name");
  }
  
  if (!pendingCustomer.lastName) {
    missingFields.push("last name");
  }
  
  if (missingFields.length > 0) {
    return {
      success: true,
      message: `Please provide the missing customer information: ${missingFields.join(" and ")}`
    };
  }
  
  // We have all required details, create the customer
  try {
    // Add non-null assertions as we've checked for missing fields
    const result = await printavoService.createCustomer({
      firstName: pendingCustomer.firstName!,
      lastName: pendingCustomer.lastName!,
      email: pendingCustomer.email,
      phone: pendingCustomer.phone,
      companyName: pendingCustomer.company
    });

    // Check for errors instead of success flag
    if (result.errors && result.errors.length > 0) {
      return {
        success: false, // Keep success flag for ChatCommandResult structure
        message: `Failed to create customer: ${result.errors[0]?.message || 'Unknown error'}. Please try again with different information.`
      };
    }

    // If no errors, proceed with data
    if (result.data) {
      globalQuoteCreationState.quoteData.customerId = result.data.id;
      globalQuoteCreationState.stage = 'items';

      // Create a default "Items" group
      globalQuoteCreationState.lineItemGroups.push({
        name: "Items",
        lineItems: []
      });
      
      return {
        success: true,
        message: `Customer ${pendingCustomer.firstName} ${pendingCustomer.lastName} created successfully. Now, let's add some items to the quote.
You can:
1. Add an item directly: "Add item: 24 custom t-shirts at $15 each"
2. Create a line item group first: "Add group: Screen Printing"

For items you can specify style, color and sizes:
Example: "Add item: 30 t-shirts style TS100 color Blue sizes: S(5), M(10), L(10), XL(5) at $15 each"
`
      };
    } else {
      // Handle case where data might be missing even without errors (shouldn't happen ideally)
      return {
        success: false,
        message: `Failed to create customer: Unknown error occurred after creation attempt.`
      };
    }
  } catch (error) {
    logger.error('Error creating customer:', error);
    return {
      success: false,
      message: `An error occurred while creating the customer: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
    };
  }
}

/**
 * Starts the quote creation process
 * @param customerInfo Optional customer information
 * @returns A result object with instructions for the next step
 */
async function startQuoteCreation(customerInfo?: string): Promise<ChatCommandResult> {
  // Reset the quote state
  globalQuoteCreationState = getEmptyQuoteState();
  globalQuoteCreationState.active = true;
  globalQuoteCreationState.stage = 'customer';
  
  logger.info(`Starting quote creation ${customerInfo ? `for ${customerInfo}` : ''}`);
  
  // If customer info was provided, try to parse it
  if (customerInfo && customerInfo.length > 0 && customerInfo !== "new" && customerInfo !== "a" && customerInfo !== "an") {
    return await setCustomerInfo(customerInfo);
  }
  
  return {
    success: true,
    message: "I'll help you create a new quote. Let's start with the customer information. Please provide the customer's email address so I can check if they already exist in the system."
  };
}

/**
 * Sets the customer information for the quote
 * @param customerInfo The customer information text
 * @returns A result object with instructions for the next step
 */
async function setCustomerInfo(customerInfo: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return startQuoteCreation(customerInfo);
  }
  
  logger.info(`Setting customer info: ${customerInfo}`);
  
  // Parse customer information
  const emailMatch = customerInfo.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
  const phoneMatch = customerInfo.match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/);
  
  // If email is provided, check if customer exists
  if (emailMatch) {
    const email = emailMatch[1];
    globalQuoteCreationState.pendingCustomer!.email = email;
    
    try {
      // Check if customer with this email already exists
      const existingCustomers = await printavoService.getCustomers({
        first: 5,
        query: email
      });

      // Check for errors first
      if (existingCustomers.errors && existingCustomers.errors.length > 0) {
         logger.error(`Error searching for existing customer: ${JSON.stringify(existingCustomers.errors)}`);
         // Fallback to creating a new customer if search fails
      } else if (existingCustomers.data?.customers?.edges &&
                 existingCustomers.data.customers.edges.length > 0) {

        // Find exact match for email
        const exactMatch = existingCustomers.data.customers.edges.find(
          (edge: any) => edge.node.email && edge.node.email.toLowerCase() === email.toLowerCase()
        );
        
        if (exactMatch) {
          const customer = exactMatch.node;
          globalQuoteCreationState.existingCustomerId = customer.id;
          
          return {
            success: true,
            message: `I found an existing customer with this email: ${customer.name} (${customer.email}). Would you like to use this customer for the quote? (Yes/No)`
          };
        }
      }
      
      // No exact match found, need to create a new customer
      globalQuoteCreationState.stage = 'customer_details';
      
      // Extract name by removing email and phone
      let name = customerInfo
        .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, '')
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, '')
        .trim();
      
      // Try to extract name parts
      if (name) {
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
          globalQuoteCreationState.pendingCustomer!.firstName = nameParts[0];
          globalQuoteCreationState.pendingCustomer!.lastName = nameParts.slice(1).join(' ');
        }
      }
      
      if (phoneMatch) {
        globalQuoteCreationState.pendingCustomer!.phone = phoneMatch[1].replace(/[-\.]/g, '');
      }
      
      const missingFields = [];
      if (!globalQuoteCreationState.pendingCustomer!.firstName) missingFields.push("first name");
      if (!globalQuoteCreationState.pendingCustomer!.lastName) missingFields.push("last name");
      
      let responseMessage = "I'll need to create a new customer record with this email. ";
      
      if (missingFields.length > 0) {
        responseMessage += `Please provide the customer's ${missingFields.join(" and ")}.`;
      } else {
        return await processCustomerDetails();
      }
      
      return {
        success: true,
        message: responseMessage
      };
    } catch (error) {
      logger.error('Error searching for existing customer:', error);
      
      // Continue with customer creation form
      globalQuoteCreationState.stage = 'customer_details';
      return {
        success: true,
        message: "I'll create a new customer record. Please provide the following details:\n" +
                "- First name\n" +
                "- Last name\n" +
                "- Company name (optional)\n" +
                "- Phone number (optional)"
      };
    }
  } else {
    // No email provided
    return {
      success: false,
      message: "Please provide the customer's email address so I can check if they already exist in the system."
    };
  }
}

/**
 * Adds a line item to the quote
 * @param itemText The line item text
 * @returns A result object with instructions for the next step
 */
async function addLineItemToQuote(itemText: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote. Start by saying 'create a quote for [customer name]'."
    };
  }
  
  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before adding items."
    };
  }
  
  logger.info(`Adding line item: ${itemText}`);
  
  // Parse the item text to extract quantity, name, and price
  const quantityMatch = itemText.match(/\b(\d+)\b/);
  const priceMatch = itemText.match(/\$(\d+(\.\d{1,2})?)/);
  
  // Parse style number, color and sizes
  const styleMatch = itemText.match(/style(?:\s|:)+([A-Za-z0-9-]+)/i);
  const colorMatch = itemText.match(/colou?r(?:\s|:)+([A-Za-z0-9 -]+?)(?:\s+(?:size|style|at|\$|each)|$)/i);
  
  // Look for size specifications like "sizes: S(2), M(3), L(5)"
  const sizesMatch = itemText.match(/sizes?(?:\s|:)+([^$]+?)(?:\s+(?:at|\$|each)|$)/i);
  
  // Look for group name in the item text
  const groupMatch = itemText.match(/(?:in|to|for) group(?:\s|:)+([^$]+?)(?:\s+(?:at|\$|each)|$)/i);
  
  let quantity = 1;
  let price = 0;
  let style = '';
  let color = '';
  let sizes: {size: string, quantity: number}[] = [];
  let groupName = globalQuoteCreationState.currentGroupName;
  
  if (quantityMatch) {
    quantity = parseInt(quantityMatch[1]);
  }
  
  if (priceMatch) {
    price = parseFloat(priceMatch[1]);
  }
  
  if (styleMatch) {
    style = styleMatch[1].trim();
  }
  
  if (colorMatch) {
    color = colorMatch[1].trim();
  }
  
  if (groupMatch) {
    groupName = groupMatch[1].trim();
  }
  
  // Parse size specifications if found
  if (sizesMatch) {
    const sizesText = sizesMatch[1].trim();
    
    // Look for sizes in format "S(2), M(3), L(5)"
    const sizeQuantityPattern = /([A-Za-z0-9]+)\s*\(\s*(\d+)\s*\)/g;
    let sizeMatch;
    let sizesFound = false;
    
    while ((sizeMatch = sizeQuantityPattern.exec(sizesText)) !== null) {
      sizesFound = true;
      const size = sizeMatch[1];
      const qty = parseInt(sizeMatch[2]);
      sizes.push({ size, quantity: qty });
    }
    
    // If no sizes in (qty) format were found, try simple comma-separated list
    if (!sizesFound) {
      const sizesList = sizesText.split(/,\s*/);
      for (const size of sizesList) {
        if (size.trim()) {
          sizes.push({ size: size.trim(), quantity: 1 });
        }
      }
    }
    
    // If sizes were specified, update the total quantity
    if (sizes.length > 0) {
      quantity = sizes.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  
  // Extract name by removing quantity, price, style, color and sizes
  let name = itemText
    .replace(/\b\d+\b/, '')
    .replace(/\$\d+(\.\d{1,2})?/, '')
    .replace(/style(?:\s|:)+[A-Za-z0-9-]+/i, '')
    .replace(/colou?r(?:\s|:)+[A-Za-z0-9 -]+/i, '')
    .replace(/sizes?(?:\s|:)+[^$]+?(?:\s+(?:at|\$|each)|$)/i, '')
    .replace(/(?:in|to|for) group(?:\s|:)+[^$]+?(?:\s+(?:at|\$|each)|$)/i, '')
    .replace(/(?:at|for|each|per)/, '')
    .trim();

  // --- SanMar Product Lookup ---
  let sanmarProductName: string | undefined;
  let sanmarProductDescription: string | undefined;

  if (style) {
    try {
      logger.info(`[ChatCommands] Looking up SanMar style: ${style}, color: ${color || 'any'}`);
      // @ts-ignore - Assume global use_mcp_tool exists and is typed correctly elsewhere
      const sanmarResult = await use_mcp_tool('sanmar-mcp-server', 'get_sanmar_product_info', {
        style: style,
        ...(color && { color: color }) // Only include color if it exists
      });

      // The tool returns an array of product variants. Find the best match or use the first one.
      if (Array.isArray(sanmarResult) && sanmarResult.length > 0) {
        // Try to find an exact match for color if provided
        let productData = sanmarResult.find(variant =>
          variant?.productBasicInfo?.color?.toLowerCase() === color?.toLowerCase()
        );
        
        // If no exact color match, use the first result
        if (!productData) {
          productData = sanmarResult[0];
        }

        if (productData?.productBasicInfo) {
          sanmarProductName = productData.productBasicInfo.productTitle || productData.productBasicInfo.style; // Fallback to style if title missing
          sanmarProductDescription = productData.productBasicInfo.productDescription;
          logger.info(`[ChatCommands] Found SanMar product: ${sanmarProductName}`);
        } else {
           logger.warn(`[ChatCommands] SanMar lookup for style ${style} returned data but missing productBasicInfo.`);
        }
      } else {
        logger.warn(`[ChatCommands] SanMar lookup for style ${style} did not return a valid product array. Result: ${JSON.stringify(sanmarResult)}`);
      }
    } catch (error) {
      logger.error(`[ChatCommands] Error looking up SanMar style ${style}: ${error instanceof Error ? error.message : String(error)}`);
      // Proceed without SanMar data, error is logged
    }
  }
  // --- End SanMar Product Lookup ---


  // Use SanMar name if available, otherwise use parsed/default name
  name = sanmarProductName || name || "Item"; // Use fetched name or parsed name, fallback to "Item"
  if (!sanmarProductName && (name.toLowerCase().includes("shirt") || name.toLowerCase().includes("tee"))) {
    name = "Custom T-shirts"; // Default name if not from SanMar and looks like a shirt
  } else if (!sanmarProductName && (name.toLowerCase().includes("hoodie") || name.toLowerCase().includes("sweatshirt"))) {
    name = "Custom Hoodies"; // Default name if not from SanMar and looks like a hoodie
  }
  
  if (price === 0) {
    return {
      success: false,
      message: "Please specify a price for the item. For example: '24 custom t-shirts at $15 each'"
    };
  }
  
  // Generate description including style, color and sizes if provided
  let description = sanmarProductDescription || ''; // Start with SanMar description if available


  if (style) {
    description += `Style: ${style}. `;
  }
  
  if (color) {
    description += `Color: ${color}. `;
  }
  
  if (sizes.length > 0) {
    description += `Sizes: ${sizes.map(s => `${s.size}(${s.quantity})`).join(', ')}. `;
  }
  
  // Create a line item with the parsed data
  const lineItem = {
    name, // Use the potentially updated name from SanMar lookup or parsing
    description: description.trim() || undefined, // Use the potentially updated description
    quantity,
    unitPrice: price
  };
  
  // Find or create the appropriate group
  let groupFound = false;
  
  for (const group of globalQuoteCreationState.lineItemGroups) {
    if (group.name.toLowerCase() === groupName.toLowerCase()) {
      // Add to existing group
      group.lineItems.push(lineItem);
      groupFound = true;
      break;
    }
  }
  
  if (!groupFound) {
    // Create a new group with this item
    globalQuoteCreationState.lineItemGroups.push({
      name: groupName,
      lineItems: [lineItem]
    });
    
    // Update current group name
    globalQuoteCreationState.currentGroupName = groupName;
  }
  
  globalQuoteCreationState.stage = 'items';
  
  // Construct response with details about what was added
  let responseMessage = `Added ${quantity} ${name} at $${price} each to group "${groupName}". `;
  
  if (style || color || sizes.length > 0) {
    responseMessage += "Details: ";
    if (style) responseMessage += `Style #${style}. `;
    if (color) responseMessage += `Color: ${color}. `;
    if (sizes.length > 0) responseMessage += `Sizes: ${sizes.map(s => `${s.size}(${s.quantity})`).join(', ')}. `;
  }
  
  responseMessage += `You can add more items, add another group by saying 'add group: [group name]', ` +
                    `or move to payment terms by saying 'payment terms'.`;
  
  return {
    success: true,
    message: responseMessage
  };
}

/**
 * Adds notes to the quote
 * @param notes The notes text
 * @returns A result object with instructions for the next step
 */
async function addNotesToQuote(notes: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote. Start by saying 'create a quote for [customer name]'."
    };
  }
  
  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before adding notes."
    };
  }
  
  logger.info(`Adding notes: ${notes}`);
  
  // Determine if these are customer notes or production notes
  if (notes.toLowerCase().includes("production") || notes.toLowerCase().includes("internal")) {
    globalQuoteCreationState.quoteData.productionNotes = notes;
  } else {
    globalQuoteCreationState.quoteData.customerNotes = notes;
  }
  
  globalQuoteCreationState.stage = 'notes';
  
  return {
    success: true,
    message: "I've added the notes to the quote. You can add more items, more notes, or finalize the quote by saying 'finalize quote'."
  };
}

/**
 * Finalizes the quote and creates it in the system
 * @returns A result object with the result of the quote creation
 */
async function finalizeQuote(): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote to finalize."
    };
  }
  
  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before finalizing the quote."
    };
  }
  
  logger.info(`Finalizing quote`);
  
  // Validate the quote data
  if (!globalQuoteCreationState.quoteData.customerId && 
      !globalQuoteCreationState.quoteData.customerEmail) {
    return {
      success: false,
      message: "Please provide customer information before finalizing the quote."
    };
  }
  
  // Check if we need to move to payment terms first
  if (globalQuoteCreationState.stage === 'items' && 
      globalQuoteCreationState.lineItemGroups.some(group => group.lineItems.length > 0)) {
    return await promptForPaymentTerms();
  }
  
  // Check if we have any items to include
  const hasItems = globalQuoteCreationState.lineItemGroups.some(group => group.lineItems.length > 0);
  if (!hasItems) {
    return {
      success: false,
      message: "Please add at least one item to the quote before finalizing it."
    };
  }
  
  try {
    // If we don't have a production date yet, set one
    if (!globalQuoteCreationState.quoteData.inProductionAt) {
      globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
    }
    
    // Create line item groups array for the API
    const lineItemGroups: LineItemGroupWithItemsInput[] = globalQuoteCreationState.lineItemGroups
      .filter(group => group.lineItems.length > 0) // Only include groups with items
      .map(group => ({
        name: group.name,
        description: group.description,
        lineItems: group.lineItems.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        imprint: group.imprint ? {
          typeOfWork: group.imprint.typeOfWork,
          details: group.imprint.details,
          pricingMatrixColumnId: group.imprint.pricingMatrixColumnId,
          mockupUrls: group.imprint.mockupUrls
        } : undefined
      }));
    
    // Create a proper quote input object with line items
    const quoteInput: QuoteCreateInput = {
      ...globalQuoteCreationState.quoteData,
      description: `Quote for ${globalQuoteCreationState.quoteData.customerName || 'customer'}`,
      lineItemGroups: lineItemGroups
    };
    
    // Create the quote using the printavo service
    const result = await printavoService.createQuote(quoteInput);
    
    // Reset the quote state
    globalQuoteCreationState = getEmptyQuoteState();
    
    // Provide a more detailed success message
    let successMessage = `Quote created successfully! `;
    
    if (result.data?.visualId) {
      successMessage += `Visual ID: ${result.data.visualId}`;
    }
    
    if (result.data?.id) {
      successMessage += ` (ID: ${result.data.id})`;
    }
    
    if (result.data?.total) {
      successMessage += `\nTotal: $${parseFloat(String(result.data.total)).toFixed(2)}`;
    }
    
    return {
      success: true,
      message: successMessage,
      data: result.data
    };
  } catch (error) {
    logger.error(`Error creating quote:`, error);
    return {
      success: false,
      message: `Sorry, there was an error creating the quote: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Searches for an order by visual ID
 * @param visualId The visual ID to search for
 * @returns A result object with the search results
 */
async function searchByVisualId(visualId: string): Promise<ChatCommandResult> {
  try {
    logger.info(`Processing chat request to search for visual ID: ${visualId}`);
    const order = await OrdersAPI.getOrderByVisualId(visualId);
    
    if (!order) {
      return {
        success: false,
        message: `I couldn't find any order with visual ID ${visualId}.`
      };
    }
    
    // Format the order data for display in chat
    const formattedOrder = formatOrderForChat(order);
    
    return {
      success: true,
      message: `I found order with visual ID ${visualId}:`,
      data: formattedOrder
    };
  } catch (error) {
    logger.error(`Error searching for visual ID ${visualId}:`, error);
    return {
      success: false,
      message: `Sorry, I encountered an error while searching for visual ID ${visualId}. ${error instanceof Error ? error.message : 'Please try again later.'}`
    };
  }
}

/**
 * Formats an order object for display in a chat interface
 * @param order The order data from the API
 * @returns A formatted version of the order data
 */
function formatOrderForChat(order: any): any {
  // Format the order data to match the PrintavoOrder interface as much as possible
  return {
    id: order.id,
    visualId: order.visualId,
    name: order.name || order.nickname || `Order ${order.visualId}`,
    status: {
      id: order.status?.id || 'unknown',
      name: order.status?.name || 'Unknown'
    },
    customer: {
      id: order.contact?.id || order.customer?.id || 'unknown',
      name: order.contact?.fullName || order.customer?.fullName || 'Unknown Customer',
      email: order.contact?.email || order.customer?.email || '',
      phone: order.contact?.phone || order.customer?.phone || ''
    },
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    total: typeof order.total === 'number' ? order.total : parseFloat(order.total || '0'),
    subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal || '0'),
    tax: typeof order.tax === 'number' ? order.tax : parseFloat(order.tax || '0'),
    shipping: typeof order.shipping === 'number' ? order.shipping : parseFloat(order.shipping || '0'),
    discount: typeof order.discount === 'number' ? order.discount : parseFloat(order.discount || '0'),
    notes: order.notes,
    dueAt: order.dueAt,
    customerDueAt: order.customerDueAt,
    productionNote: order.productionNote,
    customerNote: order.customerNote,
    paymentStatus: order.paymentStatus,
    billingAddress: order.billingAddress,
    shippingAddress: order.shippingAddress,
    lineItemGroups: order.lineItemGroups ? order.lineItemGroups.map((group: any) => ({
      id: group.id || '',
      name: group.name || '',
      style: group.style || {},
      quantity: group.quantity,
      price: group.price,
      lineItems: group.lineItems ? group.lineItems.map((item: any) => ({
        id: item.id || '',
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity,
        price: item.price,
        total: typeof item.total === 'number' ? item.total : (item.quantity || 0) * (item.price || 0)
      })) : []
    })) : [],
    threadSummary: order.threadSummary
  };
}

/**
 * Adds a new line item group to the quote
 * @param groupName The name of the group to add
 */
async function addLineItemGroup(groupName: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote. Start by saying 'create a quote for [customer name]'."
    };
  }
  
  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before adding line item groups."
    };
  }
  
  if (!groupName || groupName.trim() === '') {
    return {
      success: false,
      message: "Please provide a name for the line item group. For example: 'Add group: Screen Printing'"
    };
  }
  
  logger.info(`Adding line item group: ${groupName}`);
  
  // Set the current group name for future items
  globalQuoteCreationState.currentGroupName = groupName;
  
  // Add the group to our state
  globalQuoteCreationState.lineItemGroups.push({
    name: groupName,
    description: '',
    lineItems: []
  });
  
  globalQuoteCreationState.stage = 'items';
  
  return {
    success: true,
    message: `Added line item group "${groupName}". Now you can add items to this group by saying "Add item: [item details]"`
  };
}

/**
 * Fetches payment terms from Printavo API and prompts user to select one
 */
async function promptForPaymentTerms(): Promise<ChatCommandResult> {
  try {
    // Make a request to fetch payment terms
    const response = await printavoService.getPaymentTerms();

    // Check for errors first
    if (response.errors && response.errors.length > 0) {
      logger.error(`Error fetching payment terms: ${JSON.stringify(response.errors)}`);
      // Continue without payment terms if fetch fails
      globalQuoteCreationState.stage = 'notes';
      globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
      return {
        success: true, // Still success from chat command perspective
        message: "There was an error retrieving payment terms. Let's continue without setting one. You can add notes by saying 'notes: [your notes]'."
      };
    }

    // If no errors and data exists
    if (response.data && response.data.paymentTerms) {
      // Store the payment terms in the state
      globalQuoteCreationState.paymentTerms = response.data.paymentTerms.map((term: any) => ({
        id: term.id,
        name: term.name,
        description: term.description
      }));
      
      // Create a string listing all available payment terms
      const paymentTermsList = globalQuoteCreationState.paymentTerms && globalQuoteCreationState.paymentTerms.length > 0 
        ? globalQuoteCreationState.paymentTerms
            .map((term, index) => `${index + 1}. ${term.name}${term.description ? ` - ${term.description}` : ''}`)
            .join('\n')
        : 'No payment terms available';
      
      globalQuoteCreationState.stage = 'payment';
      
      return {
        success: true,
        message: `Please select a payment term for this quote:\n${paymentTermsList}\n\nYou can select by number or name.`
      };
    } else {
      // Set a default payment term
      globalQuoteCreationState.stage = 'notes';
      
      // Set a default production date
      globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
      
      return {
        success: true,
        message: "I couldn't retrieve payment terms. Let's continue without setting one. You can add notes by saying 'notes: [your notes]'."
      };
    }
  } catch (error) {
    logger.error('Error fetching payment terms:', error);
    
    // Continue without payment terms
    globalQuoteCreationState.stage = 'notes';
    
    // Set a default production date
    globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
    
    return {
      success: true,
      message: "There was an error retrieving payment terms. Let's continue without setting one. You can add notes by saying 'notes: [your notes]'."
    };
  }
}

/**
 * Sets the payment term for the quote
 * @param termInfo Information about the selected payment term
 */
async function setPaymentTerm(termInfo: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active || !globalQuoteCreationState.paymentTerms) {
    return {
      success: false,
      message: "Please start creating a quote first."
    };
  }
  
  // Check if the user provided an index number
  const indexMatch = termInfo.match(/^(\d+)$/);
  
  if (indexMatch) {
    const index = parseInt(indexMatch[1]) - 1;
    
    if (index >= 0 && index < globalQuoteCreationState.paymentTerms.length) {
      const selectedTerm = globalQuoteCreationState.paymentTerms[index];
      globalQuoteCreationState.selectedPaymentTermId = selectedTerm.id;
      globalQuoteCreationState.quoteData.paymentTermId = selectedTerm.id;
      
      // Set a default production date
      globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
      
      globalQuoteCreationState.stage = 'notes';
      
      return {
        success: true,
        message: `Selected payment term: ${selectedTerm.name}. I've also set the production date to ${globalQuoteCreationState.quoteData.inProductionAt} (2 weeks from today, adjusted to avoid weekends). You can add notes by saying 'notes: [your notes]'.`
      };
    } else {
      return {
        success: false,
        message: `Please select a valid payment term number between 1 and ${globalQuoteCreationState.paymentTerms.length}.`
      };
    }
  } else {
    // Look for a term that matches by name
    const matchingTerm = globalQuoteCreationState.paymentTerms.find(
      term => term.name.toLowerCase().includes(termInfo.toLowerCase())
    );
    
    if (matchingTerm) {
      globalQuoteCreationState.selectedPaymentTermId = matchingTerm.id;
      globalQuoteCreationState.quoteData.paymentTermId = matchingTerm.id;
      
      // Set a default production date
      globalQuoteCreationState.quoteData.inProductionAt = calculateProductionDate();
      
      globalQuoteCreationState.stage = 'notes';
      
      return {
        success: true,
        message: `Selected payment term: ${matchingTerm.name}. I've also set the production date to ${globalQuoteCreationState.quoteData.inProductionAt} (2 weeks from today, adjusted to avoid weekends). You can add notes by saying 'notes: [your notes]'.`
      };
    } else {
      return {
        success: false,
        message: `I couldn't find a payment term matching "${termInfo}". Please select one of the available terms.`
      };
    }
  }
}

/**
 * Adds imprint details to a line item group
 * @param groupName The name of the group to add imprint to
 * @param imprintDetails The details of the imprint
 */
async function addImprintToGroup(groupName: string, imprintDetails: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote. Start by saying 'create a quote for [customer name]'."
    };
  }
  
  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before adding imprint details."
    };
  }
  
  logger.info(`Adding imprint to group: ${groupName}`);
  
  // Check if we have the group
  let groupFound = false;
  let targetGroup = null;
  
  for (const group of globalQuoteCreationState.lineItemGroups) {
    if (group.name.toLowerCase() === groupName.toLowerCase()) {
      groupFound = true;
      targetGroup = group;
      break;
    }
  }
  
  if (!groupFound) {
    return {
      success: false,
      message: `I couldn't find a line item group named "${groupName}". Please create it first with "Add group: ${groupName}".`
    };
  }
  
  // Parse imprint details
  // Try to extract typeOfWork, details, and mockup URLs
  let typeOfWork = '';
  let details = '';
  let mockupUrls: string[] = [];
  
  // Extract type of work
  const typeMatch = imprintDetails.match(/type(?:\s|:)+[\"']?([^\"']+)[\"']?/i) || 
                   imprintDetails.match(/method(?:\s|:)+[\"']?([^\"']+)[\"']?/i);
  
  if (typeMatch) {
    typeOfWork = typeMatch[1].trim();
  } else {
    // Try to determine the type of work from the description
    if (imprintDetails.toLowerCase().includes('screen')) typeOfWork = 'Screen Print';
    else if (imprintDetails.toLowerCase().includes('embroider')) typeOfWork = 'Embroidery';
    else if (imprintDetails.toLowerCase().includes('dtg') || 
             imprintDetails.toLowerCase().includes('direct to garment')) typeOfWork = 'DTG';
    else if (imprintDetails.toLowerCase().includes('sublim')) typeOfWork = 'Sublimation';
    else if (imprintDetails.toLowerCase().includes('heat') || 
             imprintDetails.toLowerCase().includes('transfer')) typeOfWork = 'Heat Transfer';
    else typeOfWork = 'Other';
  }
  
  // Extract details/description
  const detailsMatch = imprintDetails.match(/details(?:\s|:)+[\"']?([^\"']+)[\"']?/i) ||
                      imprintDetails.match(/description(?:\s|:)+[\"']?([^\"']+)[\"']?/i);
  
  if (detailsMatch) {
    details = detailsMatch[1].trim();
  } else {
    // If no explicit details, use the remaining text after removing type of work
    details = imprintDetails
      .replace(/type(?:\s|:)+[\"']?([^\"']+)[\"']?/i, '')
      .replace(/method(?:\s|:)+[\"']?([^\"']+)[\"']?/i, '')
      .trim();
  }
  
  // Extract mockup URLs
  const urlRegex = /(https?:\/\/[^\s"]+)/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(imprintDetails)) !== null) {
    mockupUrls.push(urlMatch[1]);
  }
  
  // Create imprint object
  const imprint: ImprintInput = {
    typeOfWork: typeOfWork,
    details: details || undefined,
    mockupUrls: mockupUrls.length > 0 ? mockupUrls : undefined
  };
  
  // Add imprint to the group
  if (targetGroup) {
    targetGroup.imprint = imprint;
    
    // Construct response message
    let responseMessage = `Added imprint "${typeOfWork}" to line item group "${groupName}". `;
    
    if (imprint.details) {
      responseMessage += `Details: ${imprint.details}. `;
    }
    
    if (imprint.mockupUrls && imprint.mockupUrls.length > 0) {
      responseMessage += `Added ${imprint.mockupUrls.length} mockup URL${imprint.mockupUrls.length > 1 ? 's' : ''}. `;
    }
    
    responseMessage += "You can continue adding items to this group, or say 'finalize quote' when ready.";
    
    return {
      success: true,
      message: responseMessage
    };
  } else {
    // This should never happen as we already checked groupFound
    return {
      success: false,
      message: `I couldn't find a line item group named "${groupName}". Please create it first with "Add group: ${groupName}".`
    };
  }
}

/**
 * Edits an existing line item in the quote
 * @param itemIndex The 0-based index of the item to edit
 * @param newItemText The new line item text
 * @returns A result object with the result of the operation
 */
async function editLineItem(itemIndex: number, newItemText: string): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote to edit."
    };
  }

  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before editing items."
    };
  }

  logger.info(`Editing line item ${itemIndex + 1} with text: ${newItemText}`);

  // Find the item to edit
  let itemFound = false;
  let itemName = "";
  
  // Iterate through all line item groups to find the item at the specified index
  let flatIndex = 0;
  for (const group of globalQuoteCreationState.lineItemGroups) {
    for (let i = 0; i < group.lineItems.length; i++) {
      if (flatIndex === itemIndex) {
        // Parse the new item text
        const { quantity, name, price, description } = parseLineItemText(newItemText);
        
        if (quantity !== undefined && price !== undefined) {
          // Store the original name for the success message
          itemName = group.lineItems[i].name;
          
          // Update the item
          group.lineItems[i] = {
            name: name || group.lineItems[i].name,
            description: description || group.lineItems[i].description,
            quantity: quantity,
            unitPrice: price
          };
          
          itemFound = true;
          break;
        } else {
          return {
            success: false,
            message: "Invalid item format. Please specify quantity and price, e.g., 'edit item 1: 25 t-shirts at $18 each'."
          };
        }
      }
      flatIndex++;
    }
    if (itemFound) break;
  }

  if (!itemFound) {
    return {
      success: false,
      message: `Cannot find item #${itemIndex + 1}. Use 'preview quote' to see the current items.`
    };
  }

  return {
    success: true,
    message: `Updated item #${itemIndex + 1} (${itemName}). You can say 'preview quote' to see all current items.`
  };
}

/**
 * Removes a line item from the quote
 * @param itemIndex The 0-based index of the item to remove
 * @returns A result object with the result of the operation
 */
async function removeLineItem(itemIndex: number): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote to edit."
    };
  }

  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before removing items."
    };
  }

  logger.info(`Removing line item ${itemIndex + 1}`);

  // Find the item to remove
  let itemFound = false;
  let itemName = "";
  
  // Iterate through all line item groups to find the item at the specified index
  let flatIndex = 0;
  for (const group of globalQuoteCreationState.lineItemGroups) {
    for (let i = 0; i < group.lineItems.length; i++) {
      if (flatIndex === itemIndex) {
        // Store the name for the success message
        itemName = group.lineItems[i].name;
        
        // Remove the item
        group.lineItems.splice(i, 1);
        itemFound = true;
        break;
      }
      flatIndex++;
    }
    if (itemFound) break;
  }

  if (!itemFound) {
    return {
      success: false,
      message: `Cannot find item #${itemIndex + 1}. Use 'preview quote' to see the current items.`
    };
  }

  // Remove any empty groups after item removal
  globalQuoteCreationState.lineItemGroups = globalQuoteCreationState.lineItemGroups.filter(
    group => group.lineItems.length > 0
  );

  return {
    success: true,
    message: `Removed item #${itemIndex + 1} (${itemName}). You can say 'preview quote' to see all current items.`
  };
}

/**
 * Shows a preview of the current quote
 * @returns A result object with the formatted preview
 */
async function previewQuote(): Promise<ChatCommandResult> {
  if (!globalQuoteCreationState.active) {
    return {
      success: false,
      message: "There's no active quote to preview."
    };
  }

  // Skip if we're still in customer info stage
  if (globalQuoteCreationState.stage === 'customer' || globalQuoteCreationState.stage === 'customer_details') {
    return {
      success: false,
      message: "Let's finish setting up the customer information first before previewing the quote."
    };
  }

  logger.info(`Generating quote preview`);

  // Create a preview of the quote
  let preview = "**Current Quote Preview:**\n\n";

  // Add customer information
  preview += "**Customer:**\n";
  if (globalQuoteCreationState.quoteData.customerId) {
    const customerName = globalQuoteCreationState.quoteData.customerName || "Customer ID: " + globalQuoteCreationState.quoteData.customerId;
    preview += `${customerName}\n`;
  } else if (globalQuoteCreationState.pendingCustomer?.email) {
    const name = globalQuoteCreationState.pendingCustomer.firstName && globalQuoteCreationState.pendingCustomer.lastName
      ? `${globalQuoteCreationState.pendingCustomer.firstName} ${globalQuoteCreationState.pendingCustomer.lastName}`
      : "New customer";
    preview += `${name} (${globalQuoteCreationState.pendingCustomer.email})\n`;
  } else {
    preview += "No customer set\n";
  }

  // Add line items
  preview += "\n**Items:**\n";
  
  if (globalQuoteCreationState.lineItemGroups.length === 0) {
    preview += "No items added yet\n";
  } else {
    let totalAmount = 0;
    let itemNumber = 1;
    
    globalQuoteCreationState.lineItemGroups.forEach(group => {
      preview += `\n*${group.name}*\n`;
      
      group.lineItems.forEach(item => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
        
        preview += `${itemNumber}. ${item.name} - ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${itemTotal.toFixed(2)}\n`;
        if (item.description) {
          preview += `   Description: ${item.description}\n`;
        }
        itemNumber++;
      });
    });
    
    // Add total
    preview += `\n**Total: $${totalAmount.toFixed(2)}**\n`;
  }

  // Add notes
  if (globalQuoteCreationState.quoteData.notes) {
    preview += `\n**Notes:** ${globalQuoteCreationState.quoteData.notes}\n`;
  }

  // Add actions
  preview += "\n**Available Actions:**\n";
  preview += "- Add item: 'add item: 20 shirts at $15 each'\n";
  preview += "- Edit item: 'edit item 1: 25 shirts at $18 each'\n";
  preview += "- Remove item: 'remove item 2'\n";
  preview += "- Add notes: 'notes: This is a rush order'\n";
  preview += "- Finalize: 'finalize quote'\n";

  return {
    success: true,
    message: preview
  };
}

/**
 * Helper function to parse line item text into components
 * @param itemText The text to parse
 * @returns An object with the extracted components
 */
function parseLineItemText(itemText: string): { quantity?: number; name?: string; price?: number; description?: string } {
  // This is a simplified version - the actual implementation would need to be more robust
  const quantityMatch = itemText.match(/(\d+)/);
  const priceMatch = itemText.match(/\$(\d+\.?\d*)/);
  
  // Extract name
  let name = itemText;
  name = name.replace(/\d+ +/, ''); // Remove quantity
  name = name.replace(/\$\d+\.?\d* *(each|per item|per unit|per piece)?/, ''); // Remove price
  name = name.replace(/(at|for) +$/, ''); // Remove trailing "at" or "for"
  name = name.replace(/^[,\s]+|[,\s]+$/g, ''); // Trim spaces and commas
  
  // Extract description
  let description: string | undefined;
  const descriptionMatch = name.match(/(.*?) - (.*)/);
  if (descriptionMatch) {
    name = descriptionMatch[1]?.trim();
    description = descriptionMatch[2]?.trim();
  }
  
  return {
    quantity: quantityMatch ? parseInt(quantityMatch[1]) : undefined,
    name: name || undefined,
    price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
    description
  };
}
