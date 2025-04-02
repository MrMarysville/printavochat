/**
 * Integration script for FireCrawl MCP Server
 * 
 * This script provides a simple way to integrate the FireCrawl MCP Server
 * with your Printavo Chat application.
 */

const path = require('path');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const fs = require('fs');

// Configuration
const config = {
  // API key for FireCrawl
  apiKey: process.env.FIRECRAWL_API_KEY || 'fc-ec5d5a102f784849a71ae7ac67fa50f4',
  
  // Whether to start the server automatically
  autoStart: false
};

// Server process instance
let serverProcess = null;

/**
 * Start the FireCrawl MCP server
 * @returns {Promise<ChildProcess>} The server process
 */
function startFirecrawlServer() {
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
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`FireCrawl: ${data.toString().trim()}`);
      
      // Resolve when the server is ready
      if (data.toString().includes('Server listening') || 
          data.toString().includes('FireCrawl MCP Server running')) {
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`FireCrawl Error: ${data.toString().trim()}`);
      
      // Resolve when the server is ready (some logs go to stderr)
      if (data.toString().includes('Server listening') || 
          data.toString().includes('FireCrawl MCP Server running')) {
        resolve(serverProcess);
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
    serverProcess.stdout.on('data', () => {
      clearTimeout(timeout);
    });
    
    serverProcess.stderr.on('data', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Make a request to the FireCrawl MCP server
 * @param {string} endpoint - The endpoint to call (e.g., 'scrape', 'search')
 * @param {object} data - The data to send
 * @returns {Promise<object>} The response from the server
 */
async function callFirecrawl(endpoint, data = {}) {
  try {
    // This is a simplified implementation for testing
    // In production, you would use the MCP client to call the tool
    console.log(`Calling FireCrawl MCP tool: firecrawl_${endpoint}`);
    console.log(`Parameters: ${JSON.stringify(data)}`);
    
    // For testing purposes, return mock data
    // This will be replaced with actual MCP calls in production
    return {
      success: true,
      data: {
        // Mock data based on the endpoint
        url: data.url,
        operation: endpoint,
        result: `Mock result for ${endpoint} operation`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error calling FireCrawl MCP server: ${error.message}`);
    throw error;
  }
}

// Auto-start the server if configured
if (config.autoStart) {
  startFirecrawlServer()
    .then(() => {
      console.log('FireCrawl MCP server started successfully');
    })
    .catch((error) => {
      console.error(`Failed to start FireCrawl MCP server: ${error.message}`);
    });
}

module.exports = {
  startFirecrawlServer,
  callFirecrawl,
  config
};
