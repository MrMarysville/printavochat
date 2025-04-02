/**
 * Global TypeScript declarations for MCP (Model Context Protocol) functions
 */

declare global {
  /**
   * Supabase MCP query function
   * Executes a read-only SQL query against the Supabase database
   */
  function mcp_supabase_query(params: { sql: string }): Promise<{
    rows: any[];
    rowCount: number;
    command: string;
  }>;

  /**
   * Generic interface for all MCP functions
   * This allows TypeScript to recognize any MCP function in the global scope
   * 
   * Usage: const result = await mcp_[server]_[function](params);
   */
  interface Window {
    [key: `mcp_${string}`]: (params: any) => Promise<any>;
  }
}

export {}; 