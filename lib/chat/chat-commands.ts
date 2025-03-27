/**
 * Chat Commands
 * 
 * This file contains handlers for various chat commands including quote creation
 * and management functions.
 */

import { ChatContext, ChatResponse, QuoteLineItem } from './chat-types';

/**
 * Enhanced quote item editing
 * Process a command to edit an existing line item in the quote
 */
export const handleEditQuoteItem = async (
  message: string,
  context: ChatContext
): Promise<ChatResponse> => {
  if (!context.quoteCreation || !context.quoteCreation.lineItems) {
    return {
      content: "There's no active quote creation in progress. Start by saying 'create a quote'.",
      context: context
    };
  }

  // Extract the item index and new details
  // Format: edit item 1: 25 shirts at $18 each
  const editMatch = message.match(/edit\s+item\s+(\d+):\s+(.+)/i);
  if (!editMatch) {
    return {
      content: "Please specify which item to edit and the new details. For example: 'edit item 2: 30 shirts at $20 each'",
      context: context
    };
  }

  const itemIndex = parseInt(editMatch[1], 10) - 1; // Convert to 0-based index
  const newItemDetails = editMatch[2].trim();

  // Check if the item index is valid
  if (itemIndex < 0 || itemIndex >= context.quoteCreation.lineItems.length) {
    return {
      content: `There is no item ${itemIndex + 1} in the current quote. The quote has ${context.quoteCreation.lineItems.length} item(s).`,
      context: context
    };
  }

  // Parse the new item details
  const { name, quantity, price, description } = parseLineItemDetails(newItemDetails);
  
  if (!name || !quantity || !price) {
    return {
      content: "I couldn't understand the item details. Please provide the name, quantity, and price clearly. For example: '25 shirts at $18 each'",
      context: context
    };
  }

  // Update the item with new details
  const updatedLineItems = [...context.quoteCreation.lineItems];
  updatedLineItems[itemIndex] = {
    name,
    quantity,
    price,
    description: description || updatedLineItems[itemIndex].description
  };

  // Update the context with the modified line items
  const updatedContext = {
    ...context,
    quoteCreation: {
      ...context.quoteCreation,
      lineItems: updatedLineItems
    }
  };

  // Format the updated item for display
  const formattedItem = `${quantity} ${name} at $${price.toFixed(2)} each`;
  
  return {
    content: `✅ Updated item ${itemIndex + 1} to: ${formattedItem}. Would you like to add more items, edit another item, or finalize the quote?`,
    context: updatedContext
  };
};

/**
 * Remove an item from the quote being created
 */
export const handleRemoveQuoteItem = async (
  message: string,
  context: ChatContext
): Promise<ChatResponse> => {
  if (!context.quoteCreation || !context.quoteCreation.lineItems) {
    return {
      content: "There's no active quote creation in progress. Start by saying 'create a quote'.",
      context: context
    };
  }

  // Extract the item index to remove
  // Format: remove item 2
  const removeMatch = message.match(/remove\s+item\s+(\d+)/i);
  if (!removeMatch) {
    return {
      content: "Please specify which item to remove. For example: 'remove item 2'",
      context: context
    };
  }

  const itemIndex = parseInt(removeMatch[1], 10) - 1; // Convert to 0-based index

  // Check if the item index is valid
  if (itemIndex < 0 || itemIndex >= context.quoteCreation.lineItems.length) {
    return {
      content: `There is no item ${itemIndex + 1} in the current quote. The quote has ${context.quoteCreation.lineItems.length} item(s).`,
      context: context
    };
  }

  // Get the item to be removed for confirmation
  const removedItem = context.quoteCreation.lineItems[itemIndex];
  
  // Remove the item from the array
  const updatedLineItems = [...context.quoteCreation.lineItems];
  updatedLineItems.splice(itemIndex, 1);

  // Update the context with the modified line items
  const updatedContext = {
    ...context,
    quoteCreation: {
      ...context.quoteCreation,
      lineItems: updatedLineItems
    }
  };

  // Format the removed item for display
  const formattedItem = `${removedItem.quantity} ${removedItem.name} at $${removedItem.price.toFixed(2)} each`;
  
  return {
    content: `✅ Removed item ${itemIndex + 1}: ${formattedItem}. The quote now has ${updatedLineItems.length} item(s). Would you like to add more items or finalize the quote?`,
    context: updatedContext
  };
};

/**
 * Display the current state of the quote being created
 */
export const handlePreviewQuote = async (
  message: string,
  context: ChatContext
): Promise<ChatResponse> => {
  if (!context.quoteCreation || !context.quoteCreation.lineItems || context.quoteCreation.lineItems.length === 0) {
    return {
      content: "There's no active quote or the quote has no items. Start by saying 'create a quote' and adding some items.",
      context: context
    };
  }

  const { customer, lineItems } = context.quoteCreation;
  
  // Calculate total amount
  const total = lineItems.reduce((sum: number, item: QuoteLineItem) => sum + (item.quantity * item.price), 0);
  
  // Format the quote preview
  let previewContent = "📋 **Current Quote Preview**\n\n";
  
  // Add customer info if available
  if (customer) {
    previewContent += `**Customer:** ${customer.name || 'Unnamed'}\n`;
    if (customer.email) previewContent += `**Email:** ${customer.email}\n`;
    if (customer.phone) previewContent += `**Phone:** ${customer.phone}\n`;
  } else {
    previewContent += "**Customer:** Not specified yet\n";
  }
  
  previewContent += "\n**Line Items:**\n";
  
  // List all line items with numbers
  lineItems.forEach((item: QuoteLineItem, index: number) => {
    const itemTotal = item.quantity * item.price;
    previewContent += `${index + 1}. ${item.quantity} × ${item.name} @ $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}\n`;
    if (item.description) {
      previewContent += `   Description: ${item.description}\n`;
    }
  });
  
  // Add total
  previewContent += `\n**Total: $${total.toFixed(2)}**\n\n`;
  
  // Add instructions
  previewContent += "You can:\n";
  previewContent += "- Add more items by saying 'add 25 shirts at $18 each'\n";
  previewContent += "- Edit an item by saying 'edit item 1: 30 shirts at $20 each'\n";
  previewContent += "- Remove an item by saying 'remove item 2'\n";
  previewContent += "- Finalize the quote by saying 'finalize quote'";
  
  return {
    content: previewContent,
    context: context
  };
};

/**
 * Helper function to parse line item details from natural language
 */
function parseLineItemDetails(text: string): { 
  name: string; 
  quantity: number; 
  price: number; 
  description?: string;
} {
  // Try several regex patterns to handle different formats

  // Pattern: "25 shirts at $18 each with red logo"
  let match = text.match(/(\d+)\s+([a-z\s]+)\s+at\s+\$?(\d+\.?\d*)\s+each(?:\s+with\s+(.+))?/i);
  if (match) {
    const quantity = parseInt(match[1], 10);
    const name = match[2].trim();
    const price = parseFloat(match[3]);
    const description = match[4] ? match[4].trim() : undefined;
    
    return { name, quantity, price, description };
  }
  
  // Pattern: "25 shirts for $18 each with blue design"
  match = text.match(/(\d+)\s+([a-z\s]+)\s+for\s+\$?(\d+\.?\d*)\s+each(?:\s+with\s+(.+))?/i);
  if (match) {
    const quantity = parseInt(match[1], 10);
    const name = match[2].trim();
    const price = parseFloat(match[3]);
    const description = match[4] ? match[4].trim() : undefined;
    
    return { name, quantity, price, description };
  }
  
  // Pattern: "25 shirts, $18 each, blue logo"
  match = text.match(/(\d+)\s+([a-z\s]+),\s*\$?(\d+\.?\d*)\s+each(?:,\s*(.+))?/i);
  if (match) {
    const quantity = parseInt(match[1], 10);
    const name = match[2].trim();
    const price = parseFloat(match[3]);
    const description = match[4] ? match[4].trim() : undefined;
    
    return { name, quantity, price, description };
  }
  
  // Default fallback with empty values if no pattern matches
  return { name: '', quantity: 0, price: 0 };
} 