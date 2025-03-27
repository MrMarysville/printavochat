/**
 * Declaration file for MCP tools provided by Cursor.ai
 * These declarations allow TypeScript to understand the global use_mcp_tool function
 */

declare function use_mcp_tool(
  toolName: string,
  params: Record<string, any>
): Promise<any>;

// PrintavoOrder as returned by the GraphQL MCP server
interface PrintavoMcpOrder {
  id: string;
  visualId: string;
  total: number;
  depositTotal: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  productionDate: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  notes?: string;
  lineItems?: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
}

// PrintavoCustomer as returned by the GraphQL MCP server
interface PrintavoMcpCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  companyName?: string;
  addresses?: Array<{
    id: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>;
}

// SearchResult as returned by the GraphQL MCP server
interface PrintavoMcpSearchResult {
  orders?: PrintavoMcpOrder[];
  customers?: PrintavoMcpCustomer[];
} 