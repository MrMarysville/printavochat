"use client";

import React, { useState } from 'react';
import { validateVisualId, searchByVisualId } from '@/lib/visual-id-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VisualIdSearchProps {
  onResultsFound: (orders: any[]) => void;
  className?: string;
  placeholder?: string;
  buttonText?: string;
}

export function VisualIdSearch({
  onResultsFound,
  className = '',
  placeholder = 'Enter 4-digit Visual ID',
  buttonText = 'Search'
}: VisualIdSearchProps) {
  const [visualId, setVisualId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualId(e.target.value);
    setError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the Visual ID
    const validation = validateVisualId(visualId);
    if (!validation.valid) {
      setError(validation.message || 'Invalid Visual ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Search for orders with this Visual ID
      const orders = await searchByVisualId(visualId, {
        includeSimilar: true,
        limit: 10
      });
      
      // Pass the results to the parent component
      onResultsFound(orders);
      
      // Provide feedback to the user
      if (orders.length === 0) {
        toast({
          title: 'No Orders Found',
          description: `No orders found with Visual ID ${visualId}`,
          variant: 'destructive'
        });
      } else if (orders.length === 1) {
        toast({
          title: 'Order Found',
          description: `Found 1 order with Visual ID ${visualId}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Orders Found',
          description: `Found ${orders.length} orders matching ${visualId}`,
          variant: 'default'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      setError(errorMessage);
      toast({
        title: 'Search Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={visualId}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`pr-8 ${error ? 'border-red-500' : ''}`}
            maxLength={4}
            pattern="\d{4}"
            title="Visual ID should be a 4-digit number"
          />
          {error && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle size={18} />
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading || !visualId}>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </form>
  );
}
