import React from 'react';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@/tests/test-utils';
import { searchOrders } from '@/lib/printavo-api';
import GlobalSearch from '@/components/GlobalSearch';
import { VisualIdSearch } from '@/components/VisualIdSearch';
import { searchByVisualId } from '@/lib/visual-id-utils';

// Mock the API modules
jest.mock('@/lib/printavo-api', () => ({
  searchOrders: jest.fn(),
}));

jest.mock('@/lib/visual-id-utils', () => ({
  searchByVisualId: jest.fn(),
  validateVisualId: jest.fn().mockReturnValue({ valid: true })
}));

describe('Search Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Global Search to Order Details Flow', () => {
    it('allows searching and viewing order details', async () => {
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

      // Wait for results - check for customer name text
      await waitFor(() => {
        const customerElement = screen.getByText(/Test Customer/i);
        expect(customerElement).toBeInTheDocument();
      });

      // Click on result - use the parent list item
      const resultItem = screen.getByText(/Test Customer/i).closest('li');
      await userEvent.click(resultItem);

      // Verify navigation was called with correct path
      expect(mockRouter.push).toHaveBeenCalledWith('/orders/ORD-001');
    });

    it('handles API errors gracefully', async () => {
      (searchOrders as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('Search orders, customers...');
      await userEvent.type(input, 'test customer');

      // Verify error message
      await waitFor(() => {
        expect(screen.getByTestId('search-error')).toHaveTextContent(/Error loading results/i);
      });
    });
  });

  describe('Visual ID Search Flow', () => {
    it('allows direct order lookup by visual ID', async () => {
      const mockOrder = [{
        id: '1',
        visualId: '1234',
        customer: { name: 'Test Customer' },
        status: { name: 'pending' },
        total: 100
      }];

      // Mock the searchByVisualId function to return the mock order
      (searchByVisualId as jest.Mock).mockResolvedValue(mockOrder);

      // Create an onResultsFound mock function to pass to VisualIdSearch
      const onResultsFound = jest.fn();

      render(<VisualIdSearch onResultsFound={onResultsFound} />);
      const input = screen.getByPlaceholderText('Enter 4-digit Visual ID');
      
      // Type 4 digits as expected by the validation
      await userEvent.type(input, '1234');
      
      // Click the search button
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await userEvent.click(searchButton);

      // Verify onResultsFound was called with the mock order
      await waitFor(() => {
        expect(onResultsFound).toHaveBeenCalledWith(mockOrder);
      });
    });

    it('shows not found message for invalid order ID', async () => {
      // Mock the searchByVisualId function to return an empty array
      (searchByVisualId as jest.Mock).mockResolvedValue([]);

      // Create an onResultsFound mock function to pass to VisualIdSearch
      const onResultsFound = jest.fn();

      render(<VisualIdSearch onResultsFound={onResultsFound} />);
      const input = screen.getByPlaceholderText('Enter 4-digit Visual ID');
      
      // Type 4 digits as expected by the validation
      await userEvent.type(input, '5678');
      
      // Click the search button
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await userEvent.click(searchButton);

      // The component should call onResultsFound with an empty array
      await waitFor(() => {
        expect(onResultsFound).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('Search Results Navigation', () => {
    it('allows navigation between search results', async () => {
      const mockResults = {
        data: {
          orders: [
            { id: '1', visual_id: 'ORD-001', customer: { name: 'Customer 1' }, status: 'pending', total: 100 },
            { id: '2', visual_id: 'ORD-002', customer: { name: 'Customer 2' }, status: 'pending', total: 200 }
          ]
        }
      };

      (searchOrders as jest.Mock).mockResolvedValue(mockResults);

      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('Search orders, customers...');
      await userEvent.type(input, 'customer');

      // Wait for results
      await waitFor(() => {
        const customer1Element = screen.getByText(/Customer 1/i);
        const customer2Element = screen.getByText(/Customer 2/i);
        expect(customer1Element).toBeInTheDocument();
        expect(customer2Element).toBeInTheDocument();
      });

      // Click second result - use the parent list item
      const resultItem = screen.getByText(/Customer 2/i).closest('li');
      await userEvent.click(resultItem);

      // Verify navigation was called with correct path
      expect(mockRouter.push).toHaveBeenCalledWith('/orders/ORD-002');
    });
  });
}); 