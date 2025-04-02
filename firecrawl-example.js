/**
 * Example script for using the FireCrawl MCP Server
 * 
 * This script demonstrates how to use the FireCrawl MCP Server
 * to crawl websites and extract information.
 */

const { startFirecrawlServer, callFirecrawl } = require('./firecrawl-integration');

// Example function to crawl a website and extract information
async function crawlWebsite(url, selectors) {
  try {
    // Start the FireCrawl MCP server if it's not already running
    const server = await startFirecrawlServer();
    
    console.log(`Crawling website: ${url}`);
    
    // Call the FireCrawl MCP server to crawl the website
    const result = await callFirecrawl('/api/crawl', {
      url,
      selectors,
      maxDepth: 2,
      maxPages: 10
    });
    
    console.log('Crawl results:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`Error crawling website: ${error.message}`);
    throw error;
  }
}

// Example function to extract product information from a website
async function extractProductInfo(url) {
  const selectors = {
    name: 'h1.product-title',
    price: '.product-price',
    description: '.product-description',
    images: {
      selector: '.product-image img',
      attr: 'src'
    }
  };
  
  return crawlWebsite(url, selectors);
}

// Example function to extract blog posts from a website
async function extractBlogPosts(url) {
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
    }
  };
  
  return crawlWebsite(url, selectors);
}

// Example usage
if (require.main === module) {
  // Example: Extract product information from a website
  extractProductInfo('https://example.com/product/123')
    .then(result => {
      console.log('Product information extracted successfully');
    })
    .catch(error => {
      console.error('Failed to extract product information:', error);
    });
  
  // Example: Extract blog posts from a website
  extractBlogPosts('https://example.com/blog')
    .then(result => {
      console.log('Blog posts extracted successfully');
    })
    .catch(error => {
      console.error('Failed to extract blog posts:', error);
    });
}

module.exports = {
  crawlWebsite,
  extractProductInfo,
  extractBlogPosts
};
