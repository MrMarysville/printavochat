/**
 * Universal MCP Client
 * 
 * A flexible client for working with any Model Context Protocol (MCP) server.
 * This client provides typed access to any MCP function from any project.
 */

// Type for storing MCP function references
type McpFunctionCache = {
  [serverName: string]: {
    [functionName: string]: Function;
  };
};

// Global function cache
const mcpFunctions: McpFunctionCache = {};

/**
 * Get an MCP function by name, caching it for future use
 * 
 * @param fullFunctionName The function name in format 'serverName_functionName'
 * @returns The MCP function
 */
function getMcpFunction(fullFunctionName: string): Function {
  // Split the function name to get server and function components
  const parts = fullFunctionName.split('_');
  
  if (parts.length < 2) {
    throw new Error(`Invalid MCP function name: ${fullFunctionName}. Format should be 'serverName_functionName'`);
  }
  
  const serverName = parts[0];
  const functionName = parts.slice(1).join('_');
  
  // Check if we've already cached this function
  if (!mcpFunctions[serverName]) {
    mcpFunctions[serverName] = {};
  }
  
  if (!mcpFunctions[serverName][functionName]) {
    // Get the function from the global scope
    const globalFunction = (globalThis as any)[fullFunctionName];
    
    if (typeof globalFunction !== 'function') {
      throw new Error(`MCP function '${fullFunctionName}' not found in global scope`);
    }
    
    // Cache the function
    mcpFunctions[serverName][functionName] = globalFunction;
  }
  
  return mcpFunctions[serverName][functionName];
}

/**
 * Universal MCP client that can call any MCP function
 */
export const mcpClient = new Proxy({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') {
      return undefined;
    }
    
    // Get the function and return a wrapper that calls it
    const mcpFunction = getMcpFunction(prop);
    
    return async (params: any) => {
      try {
        return await mcpFunction(params);
      } catch (error) {
        console.error(`Error calling MCP function '${prop}':`, error);
        throw error;
      }
    };
  }
}) as Record<string, (params: any) => Promise<any>>;

// Type-safe function for executing Supabase queries
export async function supabaseQuery(sql: string): Promise<{
  rows: any[];
  rowCount: number;
  command: string;
}> {
  return mcpClient.mcp_supabase_query({ sql });
}

// Utility for fetching records from Supabase
export async function fetchRecords(
  table: string, 
  columns: string = '*', 
  whereClause?: string,
  limit?: number
): Promise<any[]> {
  let query = `SELECT ${columns} FROM ${table}`;
  
  if (whereClause) {
    query += ` WHERE ${whereClause}`;
  }
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  const result = await supabaseQuery(query);
  return result.rows;
}

// Example functions for other MCP servers
// These are just examples and should be customized for your actual MCP servers

// SanMar MCP server - product search example
export async function searchSanMarProducts(keyword: string, limit: number = 10): Promise<any[]> {
  const result = await mcpClient.mcp_sanmar_searchProducts({
    keyword,
    limit
  });
  return result.products || [];
}

// Printavo MCP server - customer search example
export async function searchPrintavoCustomers(query: string, limit: number = 10): Promise<any[]> {
  const result = await mcpClient.mcp_printavo_searchCustomers({
    query,
    limit
  });
  return result.customers || [];
}

// SanMar FTP MCP server - file list example
export async function listSanMarFtpFiles(directory: string): Promise<string[]> {
  const result = await mcpClient.mcp_sanmar_ftp_listFiles({
    directory
  });
  return result.files || [];
}

export default mcpClient; 