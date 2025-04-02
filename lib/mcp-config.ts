/**
 * MCP Configuration Utility
 * 
 * This module provides utilities to generate MCP configuration files for any project.
 * It creates the necessary .cursor/mcp.json file for Cursor to start the MCP servers.
 */

import fs from 'fs';
import path from 'path';

/**
 * MCP Server configuration types
 */
export interface McpServerConfig {
  command: string;
  args: string[];
  cwd?: string;
}

export interface McpConfig {
  mcpServers: {
    [serverName: string]: McpServerConfig;
  };
}

/**
 * Standard MCP server configurations that can be reused
 */
export const standardConfigs = {
  // Supabase MCP Server configuration
  supabase: (connectionString: string): McpServerConfig => ({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', connectionString]
  }),

  // File MCP Server configuration
  file: (directory: string): McpServerConfig => ({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-file', directory]
  }),

  // Custom MCP Server configuration (for executable or script)
  custom: (executable: string, ...args: string[]): McpServerConfig => ({
    command: executable,
    args
  }),

  // NodeJS MCP Server configuration (for npm packages)
  node: (packageOrScript: string, ...args: string[]): McpServerConfig => ({
    command: 'node',
    args: [packageOrScript, ...args]
  })
};

/**
 * Generate a complete MCP configuration object
 * 
 * @param configs Object mapping server names to their configurations
 * @returns Complete MCP configuration object
 */
export function generateMcpConfig(configs: { [serverName: string]: McpServerConfig }): McpConfig {
  return {
    mcpServers: configs
  };
}

/**
 * Write the MCP configuration to the .cursor/mcp.json file
 * 
 * @param config MCP configuration object
 * @param basePath Optional base path (defaults to current directory)
 */
export function writeMcpConfig(config: McpConfig, basePath: string = '.'): void {
  const cursorDir = path.join(basePath, '.cursor');
  
  // Create .cursor directory if it doesn't exist
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }
  
  // Write the configuration file
  fs.writeFileSync(
    path.join(cursorDir, 'mcp.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('MCP configuration written to .cursor/mcp.json');
}

/**
 * Set up MCP servers for a project
 * 
 * @param configs Object mapping server names to their configurations
 * @param basePath Optional base path (defaults to current directory)
 */
export function setupMcpServers(
  configs: { [serverName: string]: McpServerConfig },
  basePath: string = '.'
): void {
  const config = generateMcpConfig(configs);
  writeMcpConfig(config, basePath);
}

/**
 * Example usage:
 * 
 * // Set up Supabase and SanMar MCP servers
 * setupMcpServers({
 *   supabase: standardConfigs.supabase('postgresql://user:pass@host:port/db'),
 *   sanmar: standardConfigs.node('./sanmar-mcp-server/index.js')
 * });
 */

export default {
  setupMcpServers,
  standardConfigs,
  generateMcpConfig,
  writeMcpConfig
}; 