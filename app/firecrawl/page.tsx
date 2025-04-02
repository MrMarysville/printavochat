"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function FireCrawlPage() {
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCrawl = async (operation: string) => {
    if (!url) {
      setError('URL is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let params: any = { url };
      
      // If custom selectors are provided, parse them
      if (selectors.trim()) {
        try {
          params.selectors = JSON.parse(selectors);
        } catch (e) {
          setError('Invalid selectors JSON');
          setLoading(false);
          return;
        }
      }
      
      console.log(`Calling operation: firecrawl_${operation} with params:`, params);
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: `firecrawl_${operation}`,
          params
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error crawling website:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">FireCrawl Web Scraper</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Web Crawler</CardTitle>
            <CardDescription>
              Enter a URL and optional CSS selectors to extract data from a website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Custom Selectors (JSON)
                  <span className="text-xs text-gray-500 ml-2">Optional</span>
                </label>
                <Textarea
                  value={selectors}
                  onChange={(e) => setSelectors(e.target.value)}
                  placeholder={`{
  "title": "h1",
  "price": ".product-price",
  "description": ".product-description"
}`}
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Tabs defaultValue="crawl" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="crawl">Custom Crawl</TabsTrigger>
                <TabsTrigger value="product">Product Info</TabsTrigger>
                <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              </TabsList>
              <TabsContent value="crawl" className="pt-4">
                <Button 
                  onClick={() => handleCrawl('crawl_website')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crawl Website
                </Button>
              </TabsContent>
              <TabsContent value="product" className="pt-4">
                <Button 
                  onClick={() => handleCrawl('extract_product_info')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Extract Product Info
                </Button>
              </TabsContent>
              <TabsContent value="blog" className="pt-4">
                <Button 
                  onClick={() => handleCrawl('extract_blog_posts')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Extract Blog Posts
                </Button>
              </TabsContent>
            </Tabs>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Data extracted from the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : results ? (
              <div className="overflow-auto max-h-[500px]">
                <pre className="bg-gray-50 p-4 rounded text-sm font-mono">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No results yet. Enter a URL and click one of the buttons to start crawling.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
