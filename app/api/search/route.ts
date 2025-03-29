import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isVisualId } from "@/lib/visual-id-utils";
import { PrintavoAPIError } from "@/lib/printavo-api";
import { printavoService } from "@/lib/printavo-service";
import { PrintavoOrder } from "@/lib/types";

// Define result type for search results
interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  visualId?: string;
  status?: string;
  statusColor?: string;
  href: string;
}

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
    let results: SearchResult[] = [];
    
    // Visual ID specific search
    if (isVisualIdSearch) {
      // Try to get the order directly by visual ID first
      const visualIdResult = await printavoService.getOrderByVisualId(query);
      if (visualIdResult.success && visualIdResult.data) {
        // Format the result - handle the data structure from MCP
        const order = visualIdResult.data as any; // Type as any to handle unknown structure
        results = [{
          id: order.id,
          type: "order",
          title: order.nickname || `Order ${order.visualId || ''}`,
          subtitle: order.contact?.fullName 
            ? `${order.contact.fullName} (${order.contact.email || 'No email'})` 
            : 'No customer',
          visualId: order.visualId || '',
          status: order.status?.name || "Unknown",
          statusColor: getStatusColorClass(order.status?.color),
          href: `/orders/${order.id}`
        }];
      }
    }
    
    // If no results from Visual ID or it's not a Visual ID, do a general search
    if (results.length === 0) {
      // Use the searchOrders method from printavoService
      const searchResult = await printavoService.searchOrders({ query, first: 10 });
      
      if (searchResult.success && searchResult.data?.quotes?.edges) {
        results = searchResult.data.quotes.edges.map((edge: any) => {
          const node = edge.node;
          return {
            id: node.id,
            type: "order",
            title: node.nickname || `Order ${node.visualId || ''}`,
            subtitle: node.contact?.fullName 
              ? `${node.contact.fullName} (${node.contact.email || 'No email'})` 
              : 'No customer',
            visualId: node.visualId || '',
            status: node.status?.name || "Unknown",
            statusColor: getStatusColorClass(node.status?.color),
            href: `/orders/${node.id}`
          };
        });
      }
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
        { status: error.statusCode || 500 }
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

// Note: The searchByVisualId, generalSearch, searchOrders, and searchCustomers functions
// have been removed since we're now using the printavoService directly in the main GET function

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
