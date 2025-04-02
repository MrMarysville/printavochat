/**
 * Integration script for FireCrawl MCP Server
 * 
 * This script provides a simple way to integrate the FireCrawl MCP Server
 * with your Printavo Chat application.
 */

import { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Configuration
const config = {
  // API key for FireCrawl
  apiKey: process.env.FIRECRAWL_API_KEY || 'fc-ec5d5a102f784849a71ae7ac67fa50f4',
  
  // Whether to start the server automatically
  autoStart: false,
  
  // Path to the MCP config file
  mcpConfigPath: process.env.MCP_CONFIG_PATH || path.resolve(process.env.HOME || process.env.USERPROFILE || '.', '.codeium', 'windsurf-next', 'mcp_config.json')
};

// Server process instance
let serverProcess: ChildProcess | null = null;

/**
 * Start the FireCrawl MCP server
 * @returns {Promise<ChildProcess>} The server process
 */
export function startFirecrawlServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    if (serverProcess) {
      console.log('FireCrawl MCP server already running');
      resolve(serverProcess);
      return;
    }
    
    console.log(`Starting FireCrawl MCP server...`);
    
    // Get the current directory
    const currentDir = process.cwd();
    const firecrawlMcpDir = path.join(currentDir, 'firecrawl-mcp');
    
    // Check if firecrawl-mcp directory exists
    if (!fs.existsSync(firecrawlMcpDir)) {
      return reject(new Error(`FireCrawl MCP server directory not found at: ${firecrawlMcpDir}`));
    }
    
    // Use node to run the server directly from the dist directory
    const serverPath = path.join(firecrawlMcpDir, 'dist', 'index.js');
    
    // Check if the server file exists
    if (!fs.existsSync(serverPath)) {
      return reject(new Error(`FireCrawl MCP server file not found at: ${serverPath}`));
    }
    
    // Set up the environment variables
    const env = {
      ...process.env,
      FIRECRAWL_API_KEY: config.apiKey
    };
    
    // Run the server
    serverProcess = spawn('node', [serverPath], {
      cwd: firecrawlMcpDir,
      env: env,
      stdio: 'pipe'
    });
    
    serverProcess.stdout?.on('data', (data) => {
      console.log(`FireCrawl: ${data.toString().trim()}`);
      
      // Resolve when the server is ready
      if (data.toString().includes('Server listening') || 
          data.toString().includes('FireCrawl MCP Server running')) {
        resolve(serverProcess!);
      }
    });
    
    serverProcess.stderr?.on('data', (data) => {
      console.error(`FireCrawl Error: ${data.toString().trim()}`);
      
      // Resolve when the server is ready (some logs go to stderr)
      if (data.toString().includes('Server listening') || 
          data.toString().includes('FireCrawl MCP Server running')) {
        resolve(serverProcess!);
      }
    });
    
    serverProcess.on('error', (error) => {
      console.error(`Failed to start FireCrawl MCP server: ${error.message}`);
      serverProcess = null;
      reject(error);
    });
    
    serverProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`FireCrawl MCP server exited with code ${code}`);
      } else {
        console.log('FireCrawl MCP server stopped');
      }
      serverProcess = null;
    });
    
    // Set a timeout in case the server doesn't start
    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for FireCrawl MCP server to start'));
    }, 30000);
    
    // Clear the timeout when the server is ready
    serverProcess.stdout?.on('data', () => {
      clearTimeout(timeout);
    });
    
    serverProcess.stderr?.on('data', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Make a request to the FireCrawl MCP server
 * @param {string} operation - The operation to call (e.g., 'scrape', 'search')
 * @param {object} params - The parameters to send
 * @returns {Promise<object>} The response from the server
 */
export async function callFirecrawl(operation: string, params: any = {}): Promise<any> {
  try {
    console.log(`Calling FireCrawl MCP operation: ${operation}`);
    console.log(`Parameters: ${JSON.stringify(params)}`);
    
    // In a real implementation, we would call the MCP server here
    // For now, return mock data based on the operation
    switch (operation) {
      case 'crawl':
        return mockCrawlResponse(params);
      case 'scrape':
        return mockScrapeResponse(params);
      case 'search':
        return mockSearchResponse(params);
      case 'extract':
        return mockExtractResponse(params);
      default:
        return {
          success: true,
          data: {
            url: params.url,
            operation,
            result: `Mock result for ${operation} operation`,
            timestamp: new Date().toISOString()
          }
        };
    }
  } catch (error) {
    console.error(`Error calling FireCrawl MCP server: ${(error as Error).message}`);
    throw error;
  }
}

// Mock response generators for different operations
function mockCrawlResponse(params: any) {
  const { url, selectors = {} } = params;
  
  return {
    success: true,
    data: {
      url,
      crawled: true,
      timestamp: new Date().toISOString(),
      results: Object.keys(selectors).reduce((acc: any, key) => {
        acc[key] = `Mock content for selector "${selectors[key]}"`;
        return acc;
      }, {}),
      metadata: {
        title: 'Mock Website Title',
        description: 'This is a mock website description for testing.',
        siteName: url.split('//')[1]?.split('/')[0] || 'example.com'
      }
    }
  };
}

function mockScrapeResponse(params: any) {
  const { url, formats = ['markdown'] } = params;
  
  const content: Record<string, string> = {};
  
  formats.forEach((format: string) => {
    content[format] = `# Mock Scraped Content (${format})\n\nThis is mock content from ${url} in ${format} format.\n\n- Item 1\n- Item 2\n- Item 3`;
  });
  
  return {
    success: true,
    data: {
      url,
      content,
      metadata: {
        title: 'Mock Page Title',
        description: 'This is a mock meta description for testing.',
        author: 'Mock Author',
        publishDate: new Date().toISOString()
      }
    }
  };
}

function mockSearchResponse(params: any) {
  const { query, limit = 5 } = params;
  
  const results = Array.from({ length: limit }, (_, i) => ({
    title: `Mock Search Result ${i + 1} for "${query}"`,
    url: `https://example.com/result-${i + 1}`,
    snippet: `This is a mock search result snippet that contains the search query "${query}" and other relevant information.`,
    publishDate: new Date(Date.now() - i * 86400000).toISOString()
  }));
  
  return {
    success: true,
    data: {
      query,
      totalResults: 1000,
      searchTime: 0.35,
      results
    }
  };
}

function mockExtractResponse(params: any) {
  const { urls, prompt } = params;
  
  if (!Array.isArray(urls)) {
    return {
      success: false,
      error: 'URLs must be an array'
    };
  }
  
  const results = urls.map((url, i) => ({
    url,
    extracted: {
      title: `Mock Extracted Title ${i + 1}`,
      content: `This is mock extracted content based on the prompt: "${prompt}"`,
      metadata: {
        confidence: 0.95 - (i * 0.1),
        processingTime: 1.2 + (i * 0.3)
      },
      structured: {
        key1: `Value 1 for ${url}`,
        key2: `Value 2 for ${url}`,
        key3: i + 1
      }
    }
  }));
  
  return {
    success: true,
    data: {
      prompt,
      results
    }
  };
}

// Auto-start the server if configured
if (config.autoStart) {
  startFirecrawlServer()
    .then(() => {
      console.log('FireCrawl MCP server started successfully');
    })
    .catch((error) => {
      console.error(`Failed to start FireCrawl MCP server: ${(error as Error).message}`);
    });
}

export { config };
