'use client';

import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';

/**
 * ProductLookup component for searching SanMar products
 * and displaying the results.
 */
export default function ProductLookup() {
  const [styleNumber, setStyleNumber] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [productDetails, setProductDetails] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Use our agent hook
  const { isLoading, error, getProductInfo, checkProductAvailability } = useAgent();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setProductDetails(null);
    
    if (!styleNumber) {
      setSearchError('Style number is required');
      return;
    }
    
    // Get product info
    const productResult = await getProductInfo(styleNumber, color || undefined, size || undefined);
    
    if (!productResult.success || !productResult.data) {
      setSearchError(productResult.error || 'Failed to fetch product information');
      return;
    }
    
    // Get availability
    const availabilityResult = await checkProductAvailability(
      styleNumber,
      color || undefined,
      size || undefined,
      1
    );
    
    // Combine product info and availability
    setProductDetails({
      ...productResult.data,
      availability: availabilityResult.success ? availabilityResult.data : null
    });
  };
  
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">SanMar Product Lookup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="styleNumber" className="block text-sm font-medium text-gray-700">
              Style Number*
            </label>
            <input
              type="text"
              id="styleNumber"
              value={styleNumber}
              onChange={(e) => setStyleNumber(e.target.value)}
              placeholder="PC61"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color (Optional)
            </label>
            <input
              type="text"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Black"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Size (Optional)
            </label>
            <input
              type="text"
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="L"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading || !styleNumber}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {(error || searchError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || searchError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results */}
      {productDetails && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium text-gray-800">Basic Information</h4>
              <dl className="mt-2 space-y-1">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Product ID:</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{productDetails.productId}</dd>
                </div>
                
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name:</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{productDetails.productName}</dd>
                </div>
                
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Brand:</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{productDetails.brand}</dd>
                </div>
                
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Description:</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{productDetails.description}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-800">Pricing & Availability</h4>
              <dl className="mt-2 space-y-1">
                {productDetails.price && (
                  <>
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">List Price:</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        ${productDetails.price.listPrice?.toFixed(2) || 'N/A'}
                      </dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Net Price:</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        ${productDetails.price.netPrice?.toFixed(2) || 'N/A'}
                      </dd>
                    </div>
                  </>
                )}
                
                {productDetails.availability && (
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Available:</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${productDetails.availability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {productDetails.availability.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </dd>
                  </div>
                )}
                
                {productDetails.availability?.inventory?.inventoryLevels && (
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Inventory:</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="space-y-1">
                        {productDetails.availability.inventory.inventoryLevels.map((level: any, idx: number) => (
                          <li key={idx} className="text-xs">
                            {level.warehouseId}: {level.quantity} units
                            {level.availableForSale ? ' (Available)' : ' (Not Available)'}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 