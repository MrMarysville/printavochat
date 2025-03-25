import { SmartPoller, PollingOptions, DataChanges } from '../lib/smart-poller';

// Mock logger
jest.mock('../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('SmartPoller', () => {
  let mockFetchFn: jest.Mock;
  let mockOnChanges: jest.Mock;
  let mockOnError: jest.Mock;
  let poller: SmartPoller<any>;
  let options: PollingOptions<any>;
  
  // Mock data
  const initialData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' }
  ];
  
  const updatedData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2 Updated', status: 'active' },
    { id: '3', name: 'Item 3', status: 'new' }
  ];
  
  beforeEach(() => {
    jest.useFakeTimers();
    
    // Create mocks
    mockFetchFn = jest.fn();
    mockOnChanges = jest.fn();
    mockOnError = jest.fn();
    
    // Setup default fetch to return initial data
    mockFetchFn.mockResolvedValue(initialData);
    
    // Create options
    options = {
      fetchFn: mockFetchFn,
      interval: 1000,
      onChanges: mockOnChanges,
      onError: mockOnError,
      enableBackoff: true,
      maxBackoffInterval: 5000,
      resetBackoffOnChanges: true
    };
    
    // Create poller
    poller = new SmartPoller(options);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    
    // Stop polling if running
    if (poller) {
      poller.stop();
    }
  });
  
  it('should initialize with the provided options', () => {
    expect(poller).toBeDefined();
  });
  
  it('should call fetchFn when polling starts', () => {
    poller.start();
    expect(mockFetchFn).toHaveBeenCalled();
  });
  
  it('should call onChanges with initial data', async () => {
    poller.start();
    await jest.runAllTimersAsync();
    
    expect(mockOnChanges).toHaveBeenCalledWith(
      initialData,
      expect.objectContaining({
        hasChanges: true,
        newItems: expect.any(Array),
        removedItems: expect.any(Array),
        changedItems: expect.any(Array),
        unchangedItems: expect.any(Array)
      })
    );
  });
  
  it('should detect when items are added', async () => {
    // First poll gets initial data
    poller.start();
    await jest.runAllTimersAsync();
    
    // Reset mocks
    mockOnChanges.mockReset();
    mockFetchFn.mockReset();
    
    // Second poll will get updated data with a new item
    mockFetchFn.mockResolvedValue(updatedData);
    
    // Run another polling cycle
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync();
    
    // Check that onChanges was called with the right parameters
    const callArgs = mockOnChanges.mock.calls[0];
    expect(callArgs[0]).toEqual(updatedData);
    
    // Check that it correctly identified the new item
    const changes: DataChanges<any> = callArgs[1];
    expect(changes.hasChanges).toBe(true);
    expect(changes.newItems).toHaveLength(1);
    expect(changes.newItems[0].id).toBe('3');
    
    // And the changed item
    expect(changes.changedItems).toHaveLength(1);
    expect(changes.changedItems[0].id).toBe('2');
    
    // And the unchanged item
    expect(changes.unchangedItems).toHaveLength(1);
    expect(changes.unchangedItems[0].id).toBe('1');
  });
  
  it('should not call onChanges when no changes are detected', async () => {
    // First poll gets initial data
    poller.start();
    await jest.runAllTimersAsync();
    
    // Reset mocks
    mockOnChanges.mockReset();
    
    // Second poll gets the same data
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync();
    
    // onChanges should not be called again
    expect(mockOnChanges).not.toHaveBeenCalled();
  });
  
  it('should handle errors in fetchFn', async () => {
    const error = new Error('Test error');
    mockFetchFn.mockRejectedValue(error);
    
    poller.start();
    await jest.runAllTimersAsync();
    
    expect(mockOnError).toHaveBeenCalledWith(error);
  });
  
  it('should stop polling when stop is called', async () => {
    poller.start();
    poller.stop();
    
    // Reset mocks
    mockFetchFn.mockReset();
    
    // Advance time
    jest.advanceTimersByTime(2000);
    await jest.runAllTimersAsync();
    
    // fetchFn should not be called again
    expect(mockFetchFn).not.toHaveBeenCalled();
  });
  
  it('should allow changing the polling interval', async () => {
    poller.start();
    await jest.runAllTimersAsync();
    
    // Reset mocks
    mockFetchFn.mockReset();
    
    // Change interval
    poller.setInterval(2000);
    
    // Advance time by 1 second (less than new interval)
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync();
    
    // fetchFn should not be called yet
    expect(mockFetchFn).not.toHaveBeenCalled();
    
    // Advance time by another second (completing the new interval)
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync();
    
    // Now fetchFn should be called
    expect(mockFetchFn).toHaveBeenCalled();
  });
}); 