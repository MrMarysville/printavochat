"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import ErrorBoundary from "@/components/error-boundary";

type SearchResult = {
  id: string;
  type: "order" | "customer" | "quote" | "invoice";
  title: string;
  subtitle?: string;
  visualId?: string;
  status?: string;
  statusColor?: string;
  href: string;
};

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside click to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedTerm.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedTerm)}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedTerm]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setSearchTerm("");
  };

  const renderResultIcon = (type: string) => {
    switch (type) {
      case "order":
        return <span className="text-blue-500 text-xl font-bold">O</span>;
      case "customer":
        return <span className="text-green-500 text-xl font-bold">C</span>;
      case "quote":
        return <span className="text-purple-500 text-xl font-bold">Q</span>;
      case "invoice":
        return <span className="text-orange-500 text-xl font-bold">I</span>;
      default:
        return <span className="text-gray-500 text-xl font-bold">?</span>;
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <ErrorBoundary apiErrorFallback>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true);
              }
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <Card className="absolute top-full mt-1 w-full z-50 max-h-96 overflow-auto shadow-lg">
            <div className="p-2">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (debouncedTerm.length >= 2) {
                        // Re-trigger search by setting the term again
                        const currentTerm = debouncedTerm;
                        setSearchTerm("");
                        setTimeout(() => setSearchTerm(currentTerm), 100);
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : results.length === 0 && debouncedTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  No results found for &quot;{debouncedTerm}&quot;
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {results.map((result) => (
                    <li 
                      key={`${result.type}-${result.id}`}
                      className="hover:bg-gray-50 cursor-pointer p-2 rounded"
                      onClick={() => handleNavigate(result.href)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 mr-3">
                          {renderResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                              {result.visualId && (
                                <span className="ml-1 text-xs font-semibold text-gray-500">
                                  #{result.visualId}
                                </span>
                              )}
                            </p>
                            {result.status && (
                              <Badge variant="outline" className={`text-xs ml-2 ${result.statusColor || ''}`}>
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        )}
      </ErrorBoundary>
    </div>
  );
}
