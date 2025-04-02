import { Agent, AgentTool } from '../agent-base';
import { sanmarFtpTools } from './tools';
import { FtpClient, createFtpClient } from './ftp-client';
import { SANMAR_FTP_HOST, SANMAR_FTP_USERNAME, SANMAR_FTP_PASSWORD, SANMAR_FTP_PORT } from '../../lib/env';

// Debug function to show exact values
function debugVar(name: string, value: string) {
  return `'${name}': '${value === '' ? 'EMPTY' : value.substring(0, 3) + '...'}'`;
}

/**
 * SanMarFTPAgent handles file transfers with SanMar's FTP server.
 */
export class SanMarFTPAgent extends Agent {
  private ftpClient: FtpClient | null = null;
  private host: string;
  private username: string;
  private password: string;
  private port: number;

  constructor(apiKey?: string) {
    super(apiKey);
    
    // Get SanMar FTP credentials from our environment utility
    this.host = SANMAR_FTP_HOST;
    this.username = SANMAR_FTP_USERNAME;
    this.password = SANMAR_FTP_PASSWORD;
    this.port = parseInt(SANMAR_FTP_PORT, 10);
    
    // Debug log environment variables with more details
    console.log('SanMarFTPAgent initialized with credentials:');
    console.log(debugVar('SANMAR_FTP_HOST', this.host));
    console.log(debugVar('SANMAR_FTP_USERNAME', this.username));
    console.log(debugVar('SANMAR_FTP_PASSWORD', this.password));
    console.log('SANMAR_FTP_PORT:', this.port);
    
    if (!this.host || !this.username || !this.password) {
      console.error('SanMar FTP credentials are missing. Check your environment variables.');
      // Not throwing error to allow app to start, but logging clearly
    }
  }
  
  /**
   * Initialize the SanMar FTP agent with FTP client and tools.
   */
  protected async initialize(): Promise<void> {
    try {
      // Initialize the FTP client
      this.ftpClient = await createFtpClient({
        host: this.host || 'ftp.example.com', // Default for development
        username: this.username || 'dev-user', // Default for development
        password: this.password || 'dev-password', // Default for development
        port: this.port || 21
      });
      
      // Register all SanMar FTP tools
      for (const tool of sanmarFtpTools) {
        this.registerTool({
          name: tool.name,
          description: tool.description,
          handler: async (params: any) => {
            if (!this.ftpClient) {
              throw new Error('FTP client not initialized');
            }
            
            return tool.handler(params, { 
              ftpClient: this.ftpClient
            });
          }
        });
      }
      
      this.status = 'ready';
    } catch (error) {
      this.status = 'error';
      this.lastError = error as Error;
      throw new Error(`Failed to initialize SanMar FTP client: ${(error as Error).message}`);
    }
  }

  /**
   * Download a file from the SanMar FTP server.
   */
  async downloadFile(remotePath: string, localPath: string): Promise<string> {
    return this.executeOperation('download_file', {
      remotePath,
      localPath
    });
  }

  /**
   * List files in a directory on the SanMar FTP server.
   */
  async listFiles(remotePath: string): Promise<any[]> {
    return this.executeOperation('list_files', {
      remotePath
    });
  }

  /**
   * Download all inventory files and parse them.
   */
  async downloadAndParseInventory(): Promise<any> {
    return this.executeOperation('download_and_parse_inventory', {});
  }
} 