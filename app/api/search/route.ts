import { NextRequest, NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/printavo-api";
import { logger } from "@/lib/logger";
import { isVisualId } from "@/lib/visual-id-utils";
import { PrintavoAPIError } from "@/lib/graphql/errors";

export const dynamic = "force-dynamic"; // Disable caching for this route

/**
 * Global search API endpoint
 * Searches across Printavo entities (orders, customers, quotes, invoices)
 * Supports searching by visual ID, name, email, etc.
 */
export async function GET(request: NextRequest) {
  const searchQuery = request.nextUrl.searchParams.get("q");
  
  if (!searchQuery || searchQuery.trim().length < 2) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Search query must be at least 2 characters",
        results: [] 
      },
      { status: 400 }
    );
  }

  const query = searchQuery.trim();
  
  try {
    logger.info(`Global search for: ${query}`);
    
    // Determine if it's potentially a Visual ID search
    const isVisualIdSearch = isVisualId(query);
    
    // Initially empty results array
    let results = [];
    
    // Visual ID specific search
    if (isVisualIdSearch) {
      results = await searchByVisualId(query);
    }
    
    // If no results from Visual ID or it's not a Visual ID, do a general search
    if (results.length === 0) {
      results = await generalSearch(query);
    }
    
    return NextResponse.json({
      success: true,
      results: results.slice(0, 10) // Limit to top 10 results
    });
  } catch (error) {
    logger.error(`Error in global search API: ${error}`);
    
    if (error instanceof PrintavoAPIError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          results: []
        },
        { status: error._statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Search failed. Please try again later.",
        results: []
      },
      { status: 500 }
    );
  }
}

/**
 * Search specifically by Visual ID, looking first at orders
 */
async function searchByVisualId(visualId: string) {
  try {
    const ordersQuery = `
      query SearchOrdersByVisualId($query: String!) {
        invoices(first: 5, query: $query) {
          edges {
            node {
              id
              visualId
              nickname
              createdAt
              status {
                id
                name
                color
              }
              contact {
                id
                fullName
                email
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(ordersQuery, { query: visualId }, "SearchOrdersByVisualId");
    
    if (!data?.invoices?.edges || data.invoices.edges.length === 0) {
      return [];
    }
    
    return data.invoices.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        type: "order",
        title: node.nickname || `Order ${node.visualId}`,
        subtitle: node.contact?.fullName ? `${node.contact.fullName} (${node.contact.email || 'No email'})` : 'No customer',
        visualId: node.visualId,
        status: node.status?.name || "Unknown",
        statusColor: getStatusColorClass(node.status?.color),
        href: `/orders/${node.id}`
      };
    });
  } catch (error) {
    logger.error(`Error in Visual ID search: ${error}`);
    return [];
  }
}

/**
 * General search across multiple entity types
 */
async function generalSearch(query: string) {
  try {
    // Search across orders, customers, and quotes in parallel
    const [ordersResults, customersResults] = await Promise.all([
      searchOrders(query),
      searchCustomers(query)
    ]);
    
    // Combine and sort results
    return [...ordersResults, ...customersResults]
      .sort((a, b) => {
        // Sort by "relevance" - we could make this more sophisticated
        // Currently prioritizing exact matches in the title
        if (a.title.toLowerCase().includes(query.toLowerCase()) && 
            !b.title.toLowerCase().includes(query.toLowerCase())) {
          return -1;
        }
        if (!a.title.toLowerCase().includes(query.toLowerCase()) && 
            b.title.toLowerCase().includes(query.toLowerCase())) {
          return 1;
        }
        return 0;
      });
  } catch (error) {
    logger.error(`Error in general search: ${error}`);
    return [];
  }
}

/**
 * Search orders 
 */
async function searchOrders(query: string) {
  try {
    const ordersQuery = `
      query SearchOrders($query: String!) {
        invoices(first: 5, query: $query) {
          edges {
            node {
              id
              visualId
              nickname
              createdAt
              status {
                id
                name
                color
              }
              contact {
                id
                fullName
                email
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(ordersQuery, { query }, "SearchOrders");
    
    if (!data?.invoices?.edges || data.invoices.edges.length === 0) {
      return [];
    }
    
    return data.invoices.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        type: "order",
        title: node.nickname || `Order ${node.visualId}`,
        subtitle: node.contact?.fullName ? `${node.contact.fullName} (${node.contact.email || 'No email'})` : 'No customer',
        visualId: node.visualId,
        status: node.status?.name || "Unknown",
        statusColor: getStatusColorClass(node.status?.color),
        href: `/orders/${node.id}`
      };
    });
  } catch (error) {
    logger.error(`Error in orders search: ${error}`);
    return [];
  }
}

/**
 * Search customers
 */
async function searchCustomers(query: string) {
  try {
    const customersQuery = `
      query SearchCustomers($query: String!) {
        contacts(first: 5, query: $query) {
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
    
    const data = await executeGraphQL(customersQuery, { query }, "SearchCustomers");
    
    if (!data?.contacts?.edges || data.contacts.edges.length === 0) {
      return [];
    }
    
    return data.contacts.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        type: "customer",
        title: node.fullName || 'Unnamed Customer',
        subtitle: node.company ? `${node.company} (${node.email || node.phone || 'No contact info'})` : (node.email || node.phone || 'No contact info'),
        href: `/customers/${node.id}`
      };
    });
  } catch (error) {
    logger.error(`Error in customers search: ${error}`);
    return [];
  }
}

/**
 * Helper to convert Printavo status colors to Tailwind classes
 */
function getStatusColorClass(color: string | undefined): string {
  if (!color) return '';
  
  // Map Printavo status colors to Tailwind text colors
  const colorMap: Record<string, string> = {
    '#FF0000': 'text-red-600',
    '#00FF00': 'text-green-600',
    '#0000FF': 'text-blue-600',
    '#FFFF00': 'text-yellow-600',
    '#FFA500': 'text-orange-600',
    '#800080': 'text-purple-600',
    '#FFC0CB': 'text-pink-600',
    '#A52A2A': 'text-amber-800',
    '#808080': 'text-gray-600',
    '#000000': 'text-black',
  };
  
  // Default fallback behavior - try to extract basic color
  const colorName = color.toLowerCase().replace('#', '');
  
  // Check if the color is a known hex value
  if (colorMap[color.toUpperCase()]) {
    return colorMap[color.toUpperCase()];
  }
  
  // Try to match with basic color names
  if (colorName.includes('red')) return 'text-red-600';
  if (colorName.includes('green')) return 'text-green-600';
  if (colorName.includes('blue')) return 'text-blue-600';
  if (colorName.includes('yellow')) return 'text-yellow-600';
  if (colorName.includes('orange')) return 'text-orange-600';
  if (colorName.includes('purple')) return 'text-purple-600';
  if (colorName.includes('pink')) return 'text-pink-600';
  if (colorName.includes('brown')) return 'text-amber-800';
  if (colorName.includes('gray') || colorName.includes('grey')) return 'text-gray-600';
  
  // Default
  return '';
}
