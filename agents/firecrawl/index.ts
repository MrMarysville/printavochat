import { Agent, AgentTool } from '../agent-base';
import { startFirecrawlServer, callFirecrawl } from '../../firecrawl-integration';

/**
 * FireCrawlAgent handles web crawling operations using the FireCrawl MCP server.
 */
export class FireCrawlAgent extends Agent {
  private isServerRunning: boolean = false;

  constructor(apiKey?: string) {
    super(apiKey);
    
    console.log('FireCrawlAgent initialized');
  }
  
  /**
   * Initialize the agent.
   */
  protected async initialize(): Promise<void> {
    try {
      // Register all tools
      this.registerTool({
        name: 'crawl_website',
        description: 'Crawl a website and extract information based on selectors',
        handler: this.crawlWebsite.bind(this)
      });
      
      this.registerTool({
        name: 'extract_product_info',
        description: 'Extract product information from a website',
        handler: this.extractProductInfo.bind(this)
      });
      
      this.registerTool({
        name: 'extract_blog_posts',
        description: 'Extract blog posts from a website',
        handler: this.extractBlogPosts.bind(this)
      });
      
      // Add MCP standard tools
      this.registerTool({
        name: 'scrape',
        description: 'Scrape content from a single URL with advanced options',
        handler: this.scrape.bind(this)
      });
      
      this.registerTool({
        name: 'search',
        description: 'Search the web and optionally extract content from search results',
        handler: this.search.bind(this)
      });
      
      this.registerTool({
        name: 'extract',
        description: 'Extract structured information from web pages using LLM capabilities',
        handler: this.extract.bind(this)
      });
      
      console.log('FireCrawlAgent tools registered');
    } catch (error) {
      console.error('Error initializing FireCrawlAgent:', error);
      throw error;
    }
  }
  
  /**
   * Ensure the FireCrawl server is running.
   */
  private async ensureServerRunning(): Promise<void> {
    if (!this.isServerRunning) {
      try {
        console.log('Starting FireCrawl server...');
        // The MCP server is managed by Codeium, but we'll still call this
        // for consistency and to handle any required setup
        await startFirecrawlServer();
        this.isServerRunning = true;
        console.log('FireCrawl server started');
      } catch (error) {
        console.error('Error starting FireCrawl server:', error);
        throw error;
      }
    }
  }
  
  /**
   * Crawl a website and extract information based on selectors.
   */
  private async crawlWebsite(params: any): Promise<any> {
    await this.ensureServerRunning();
    
    const { url, selectors, maxDepth = 2, maxPages = 10 } = params;
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    try {
      console.log(`Crawling website: ${url}`);
      
      return await callFirecrawl('crawl', {
        url,
        selectors: selectors || {},
        maxDepth,
        maxPages
      });
    } catch (error) {
      console.error('Error crawling website:', error);
      throw error;
    }
  }
  
  /**
   * Extract product information from a website.
   */
  private async extractProductInfo(params: any): Promise<any> {
    const { url } = params;
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    const selectors = {
      name: 'h1.product-title',
      price: '.product-price',
      description: '.product-description',
      images: {
        selector: '.product-image img',
        attr: 'src'
      },
      ...params.selectors
    };
    
    return this.crawlWebsite({ url, selectors });
  }
  
  /**
   * Extract blog posts from a website.
   */
  private async extractBlogPosts(params: any): Promise<any> {
    const { url } = params;
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    const selectors = {
      posts: {
        selector: 'article',
        multiple: true,
        data: {
          title: 'h2',
          summary: '.post-summary',
          date: '.post-date',
          link: {
            selector: 'a.read-more',
            attr: 'href'
          }
        }
      },
      ...params.selectors
    };
    
    return this.crawlWebsite({ url, selectors });
  }
  
  /**
   * Scrape content from a single URL with advanced options.
   */
  private async scrape(params: any): Promise<any> {
    await this.ensureServerRunning();
    
    const { url, formats = ['markdown'], onlyMainContent = true } = params;
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    try {
      console.log(`Scraping website: ${url}`);
      
      return await callFirecrawl('scrape', {
        url,
        formats,
        onlyMainContent,
        ...params
      });
    } catch (error) {
      console.error('Error scraping website:', error);
      throw error;
    }
  }
  
  /**
   * Search the web and optionally extract content from search results.
   */
  private async search(params: any): Promise<any> {
    await this.ensureServerRunning();
    
    const { query, limit = 5 } = params;
    
    if (!query) {
      throw new Error('Search query is required');
    }
    
    try {
      console.log(`Searching for: ${query}`);
      
      return await callFirecrawl('search', {
        query,
        limit,
        ...params
      });
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
  
  /**
   * Extract structured information from web pages using LLM capabilities.
   */
  private async extract(params: any): Promise<any> {
    await this.ensureServerRunning();
    
    const { urls, prompt } = params;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs array is required');
    }
    
    if (!prompt) {
      throw new Error('Extraction prompt is required');
    }
    
    try {
      console.log(`Extracting from ${urls.length} URLs`);
      
      return await callFirecrawl('extract', params);
    } catch (error) {
      console.error('Error extracting information:', error);
      throw error;
    }
  }
}

export default FireCrawlAgent;
