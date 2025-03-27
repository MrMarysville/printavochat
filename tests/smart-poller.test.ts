import { SmartPoller, DataChanges } from '../lib/smart-poller';

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
  const initialData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetchFn = jest.fn().mockResolvedValue(initialData);
    mockOnChanges = jest.fn();
    mockOnError = jest.fn();
    
    poller = new SmartPoller({
      fetchFn: mockFetchFn,
      interval: 1000,
      onChanges: mockOnChanges,
      onError: mockOnError,
      idExtractor: (item) => item.id,
      fingerprintExtractor: (item) => ({ name: item.name, status: item.status }),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    if (poller) {
      poller.stop();
    }
  });

  it('should call onChanges with initial data', async () => {
    // Directly trigger a poll without starting the timer
    await poller.pollNow();
    
    // Check that onChanges was called with the initial data
    expect(mockOnChanges).toHaveBeenCalledWith(
      initialData,
      {
        hasChanges: false,
        newItems: [],
        removedItems: [],
        changedItems: [],
        unchangedItems: initialData
      }
    );
  });

  it('should detect when items are added', async () => {
    // Start with the initial data
    await poller.pollNow();
    
    // Reset the mock so we can check the next call
    mockOnChanges.mockReset();
    
    // New data with an added item
    const updatedData = [
      ...initialData,
      { id: '3', name: 'Item 3', status: 'active' }
    ];
    mockFetchFn.mockResolvedValue(updatedData);
    
    // Trigger another poll directly
    await poller.pollNow();
    
    // Check that onChanges was called with the right parameters
    expect(mockOnChanges).toHaveBeenCalled();
    const callArgs = mockOnChanges.mock.calls[0];
    expect(callArgs[0]).toEqual(updatedData);
    
    // Check that it correctly identified the new item
    const changes: DataChanges<any> = callArgs[1];
    expect(changes.newItems).toHaveLength(1);
    expect(changes.newItems[0].id).toBe('3');
    expect(changes.hasChanges).toBe(true);
  });

  it('should handle errors in fetchFn', async () => {
    const error = new Error('Test error');
    mockFetchFn.mockRejectedValue(error);
    
    poller.start();
    await Promise.resolve();
    
    // Let the error handler run
    jest.runAllTimers();
    
    expect(mockOnError).toHaveBeenCalledWith(error);
  });
  
  it('should stop polling when stop is called', () => {
    poller.start();
    expect(poller['isPolling']).toBe(true);
    
    poller.stop();
    expect(poller['isPolling']).toBe(false);
    
    // The timer should be cleared
    expect(poller['timer']).toBe(null);
  });

  it('should allow changing the interval', () => {
    poller.start();
    poller.setInterval(2000);
    
    expect(poller['currentInterval']).toBe(2000);
  });

  it('should detect when items are changed', async () => {
    // Start with the initial data
    await poller.pollNow();
    
    // Reset the mock so we can check the next call
    mockOnChanges.mockReset();
    
    // New data with modified item
    const updatedData = [
      { id: '1', name: 'Item 1 Modified', status: 'active' },
      { id: '2', name: 'Item 2', status: 'inactive' }
    ];
    mockFetchFn.mockResolvedValue(updatedData);
    
    // Trigger another poll directly
    await poller.pollNow();
    
    // Check that onChanges was called with right parameters
    expect(mockOnChanges).toHaveBeenCalled();
    const callArgs = mockOnChanges.mock.calls[0];
    
    // Check that it correctly identified the changed item
    const changes: DataChanges<any> = callArgs[1];
    expect(changes.changedItems).toHaveLength(1);
    expect(changes.changedItems[0].id).toBe('1');
    expect(changes.changedItems[0].name).toBe('Item 1 Modified');
    expect(changes.hasChanges).toBe(true);
  });
}); 