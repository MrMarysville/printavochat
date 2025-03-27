import React from 'react';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import GlobalSearch from '../GlobalSearch';
import { searchOrders } from '@/lib/printavo-api';

// Mock the API module
jest.mock('@/lib/printavo-api', () => ({
  searchOrders: jest.fn(),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('GlobalSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    render(<GlobalSearch />);
    expect(screen.getByPlaceholderText('Search orders, customers...')).toBeInTheDocument();
  });

  // This test requires a wait for UI update because of debounce
  it('shows loading state during search', async () => {
    let resolvePromise: (value: any) => void;
    
    // Mock the API call to delay response
    (searchOrders as jest.Mock).mockImplementation(() => 
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    render(<GlobalSearch />);
    const input = screen.getByPlaceholderText('Search orders, customers...');
    
    // Type search term to trigger the loading state
    await userEvent.type(input, 'test');
    
    // Force wait for debounce and state updates
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Expect the loading state to be visible now
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    
    // Resolve the API call
    resolvePromise({ data: { orders: [] } });
  });

  it('displays search results', async () => {
    const mockResults = {
      data: {
        orders: [
          { id: '1', visual_id: 'ORD-001', customer: { name: 'Test Customer' }, status: 'pending', total: 100 }
        ]
      }
    };

    (searchOrders as jest.Mock).mockResolvedValue(mockResults);

    render(<GlobalSearch />);
    const input = screen.getByPlaceholderText('Search orders, customers...');
    await userEvent.type(input, 'test');

    // Wait for results - the customer name should be in the document
    await waitFor(() => {
      const customerElement = screen.getByText(/Test Customer/i);
      expect(customerElement).toBeInTheDocument();
    });
    
    // Check that the order ID appears in some element
    const orderIdElement = screen.getByText(/#ORD-001/i);
    expect(orderIdElement).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    (searchOrders as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<GlobalSearch />);
    const input = screen.getByPlaceholderText('Search orders, customers...');
    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByTestId('search-error')).toHaveTextContent('Error loading results');
    });
  });

  it('clears search results when input is cleared', async () => {
    const mockResults = {
      data: {
        orders: [
          { id: '1', visual_id: 'ORD-001', customer: { name: 'Test Customer' }, status: 'pending', total: 100 }
        ]
      }
    };

    (searchOrders as jest.Mock).mockResolvedValue(mockResults);

    render(<GlobalSearch />);
    const input = screen.getByPlaceholderText('Search orders, customers...');
    
    // Type search term
    await userEvent.type(input, 'test');

    // Wait for results
    await waitFor(() => {
      const customerElement = screen.getByText(/Test Customer/i);
      expect(customerElement).toBeInTheDocument();
    });

    // Clear input
    await userEvent.clear(input);

    // Verify results are cleared
    await waitFor(() => {
      expect(screen.queryByText(/Test Customer/i)).not.toBeInTheDocument();
    });
  });
}); 