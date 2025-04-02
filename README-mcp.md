# Universal MCP Client

A portable, flexible client for working with any Model Context Protocol (MCP) server across projects.

## Overview

This package provides a universal client for interacting with MCP servers in Cursor. It includes:

- **Universal MCP Client**: A proxy-based client that works with any MCP function from any server
- **Setup Utilities**: Tools to configure MCP servers in any project
- **TypeScript Support**: Type declarations for MCP functions
- **Example Usage**: Demonstrations of how to use the client

## Files

- `lib/universal-mcp-client.ts`: The main client for calling MCP functions
- `lib/mcp-config.ts`: Utilities for configuring MCP servers
- `types/global.d.ts`: TypeScript declarations for MCP functions
- `scripts/setup-mcp.ts`: Setup script for configuring MCP in new projects
- `examples/mcp-usage-example.ts`: Example usage

## How to Use in Any Project

### Option 1: Run the Setup Script

1. Copy this entire directory to your project
2. Update `scripts/setup-mcp.ts` with your specific MCP server configurations
3. Run the setup script:

```bash
ts-node scripts/setup-mcp.ts
```

### Option 2: Manual Setup

1. Create a `.cursor/mcp.json` file with your MCP server configurations:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "your-connection-string"]
    }
  }
}
```

2. Copy `lib/universal-mcp-client.ts` and `types/global.d.ts` to your project
3. Update your `tsconfig.json` to include the types:

```json
"include": ["types/global.d.ts"]
```

## Basic Usage

```typescript
import mcpClient from './lib/universal-mcp-client';

// Supabase MCP Example
async function queryDatabase() {
  const result = await mcpClient.mcp_supabase_query({
    sql: 'SELECT * FROM users LIMIT 10'
  });
  
  console.log(result.rows);
}

// Any MCP function
async function callAnyMcpFunction() {
  // Format: mcp_[server]_[function]
  const result = await mcpClient.mcp_sanmar_searchProducts({
    keyword: 'shirt',
    limit: 5
  });
  
  console.log(result);
}
```

## Dynamic Usage

You can dynamically construct MCP function calls:

```typescript
async function dynamicCall(server, func, params) {
  const functionName = `mcp_${server}_${func}`;
  const result = await mcpClient[functionName](params);
  return result;
}

// Example usage
const products = await dynamicCall('sanmar', 'searchProducts', { keyword: 'shirt' });
```

## Supported MCP Servers

This client works with any MCP server, including but not limited to:

- **Supabase**: `@modelcontextprotocol/server-postgres`
- **File**: `@modelcontextprotocol/server-file` 
- **Custom servers**: Any MCP-compatible server

## Adding New MCP Servers

1. Update your `.cursor/mcp.json` file with the new server configuration:

```json
{
  "mcpServers": {
    "supabase": { ... },
    "newserver": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-your-server", "options"]
    }
  }
}
```

2. Use it in your code:

```typescript
const result = await mcpClient.mcp_newserver_function({ param1: 'value' });
```

## Notes

- MCP functions are only available within Cursor
- The client uses JavaScript's Proxy to dynamically handle any MCP function call
- All MCP functions follow the naming pattern: `mcp_[server]_[function]` 