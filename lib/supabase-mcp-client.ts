/**
 * Supabase MCP Client
 * 
 * This module provides a global utility for interacting with the Supabase database
 * through MCP (Model Context Protocol) functions.
 */

// Types for SQL query response
export interface SqlQueryResult {
  rows: any[];
  rowCount: number;
  command: string;
}

/**
 * Execute a read-only SQL query against the Supabase database
 * 
 * @param sql The SQL query to execute (read-only operations only)
 * @returns Promise resolving to the query result
 */
export async function executeSqlQuery(sql: string): Promise<SqlQueryResult> {
  try {
    // Use the global mcp_supabase_query function
    const result = await globalThis.mcp_supabase_query({ sql });
    return result;
  } catch (error) {
    console.error('Error executing SQL query via MCP:', error);
    throw error;
  }
}

/**
 * Fetch records from a Supabase table
 * 
 * @param table The table name to query
 * @param columns The columns to select (defaults to '*')
 * @param whereClause Optional WHERE clause (without the 'WHERE' keyword)
 * @param limit Optional result limit
 * @returns Promise resolving to the query results as rows
 */
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
  
  const result = await executeSqlQuery(query);
  return result.rows;
}

/**
 * Get a record by ID from a Supabase table
 * 
 * @param table The table name to query
 * @param id The ID of the record to fetch
 * @param columns The columns to select (defaults to '*')
 * @returns Promise resolving to the record or null if not found
 */
export async function getRecordById(
  table: string,
  id: string,
  columns: string = '*'
): Promise<any | null> {
  const result = await fetchRecords(table, columns, `id = '${id}'`, 1);
  return result.length > 0 ? result[0] : null;
}

// Export a default object for convenient imports
const supabaseMcp = {
  executeSqlQuery,
  fetchRecords,
  getRecordById
};

export default supabaseMcp; 