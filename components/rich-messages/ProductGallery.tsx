"use client";

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface ProductGalleryProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToQuote?: (products: Product[]) => void;
  title?: string;
}

export function ProductGallery({
  products,
  onSelectProduct,
  onAddToQuote,
  title = 'Product Catalog'
}: ProductGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  const productsPerPage = 6;
  
  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      // Toggle selection for quote
      setSelectedProducts(prev => {
        const isSelected = prev.some(p => p.id === product.id);
        if (isSelected) {
          return prev.filter(p => p.id !== product.id);
        } else {
          return [...prev, product];
        }
      });
    }
  };
  
  const handleAddToQuote = () => {
    if (onAddToQuote && selectedProducts.length > 0) {
      onAddToQuote(selectedProducts);
      setSelectedProducts([]);
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">{title}</h3>
          {onAddToQuote && selectedProducts.length > 0 && (
            <Button 
              size="sm" 
              onClick={handleAddToQuote}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              Add {selectedProducts.length} to Quote
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="p-4">
        {currentProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No products found matching your search
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              
              return (
                <div 
                  key={product.id} 
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1 truncate">{product.name}</h4>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">
                        {formatCurrency(product.price)}
                      </span>
                      <Button 
                        variant={isSelected ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleSelectProduct(product)} 
                        className="flex items-center gap-1 h-8"
                      >
                        {onSelectProduct ? (
                          <>View</>
                        ) : (
                          <>
                            {isSelected ? 'Selected' : <><Plus className="h-3 w-3" /> Select</>}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 