/**
 * Smart Polling Utility
 * 
 * This utility handles polling for data changes with intelligent change detection
 * to avoid unnecessary UI updates and reduce load on the Printavo API.
 */

import { logger } from './logger';

export interface PollingOptions<T> {
  // Function that fetches data
  fetchFn: () => Promise<T[]>;
  
  // Initial interval in milliseconds
  interval: number;
  
  // Callback for when changes are detected
  onChanges: (newData: T[], changes: DataChanges<T>) => void;
  
  // Callback for errors
  onError?: (error: Error) => void;
  
  // Optional function to extract ID from data item
  idExtractor?: (item: T) => string;
  
  // Optional function to get fingerprint for change detection
  fingerprintExtractor?: (item: T) => any;
  
  // Whether to enable backoff when no changes detected
  enableBackoff?: boolean;
  
  // Maximum backoff interval
  maxBackoffInterval?: number;
  
  // Reset backoff on changes
  resetBackoffOnChanges?: boolean;
}

export interface DataChanges<T> {
  hasChanges: boolean;
  newItems: T[];
  removedItems: T[];
  changedItems: T[];
  unchangedItems: T[];
}

export class SmartPoller<T> {
  private options: PollingOptions<T>;
  private timer: NodeJS.Timeout | null = null;
  private lastData: T[] | null = null;
  private lastDataMap = new Map<string, T>();
  private lastFingerprintMap = new Map<string, any>();
  private currentInterval: number;
  private consecutiveNoChanges = 0;
  private isPolling: boolean = false;
  private lastPollTime = 0;
  private lastError: Error | null = null;
  private failedAttempts: number = 0;
  private maxRetries: number = 3;
  private consecutiveErrors: number = 0;
  private currentBackoff: number = 0;
  
  constructor(options: PollingOptions<T>) {
    this.options = {
      enableBackoff: true,
      maxBackoffInterval: 5 * 60 * 1000, // 5 minutes max
      resetBackoffOnChanges: true,
      idExtractor: (item: T) => (item as any).id?.toString() || JSON.stringify(item),
      fingerprintExtractor: (item: T) => item,
      ...options
    };
    
    this.currentInterval = this.options.interval;
  }
  
  /**
   * Start polling for data
   */
  public start(): void {
    if (this.isPolling) {
      logger.warn('SmartPoller already running');
      return;
    }
    
    this.isPolling = true;
    this.poll(); // Start polling immediately
    logger.info(`Started smart polling with interval ${this.currentInterval}ms`);
  }
  
  /**
   * Stop polling
   */
  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.isPolling = false;
    logger.info('Stopped smart polling');
  }
  
  /**
   * Change the polling interval
   */
  public setInterval(interval: number): void {
    this.options.interval = interval;
    this.currentInterval = interval;
    this.consecutiveNoChanges = 0;
    
    // If already polling, restart with new interval
    if (this.isPolling) {
      this.stop();
      this.start();
    }
    
    logger.info(`Changed polling interval to ${interval}ms`);
  }
  
  /**
   * Force an immediate poll
   */
  public async pollNow(): Promise<DataChanges<T>> {
    // Set isPolling temporarily to true to ensure doPoll processes correctly
    const wasPolling = this.isPolling;
    this.isPolling = true;
    
    try {
      const newData = await this.options.fetchFn();
      const changes = this.detectChanges(newData);
      
      // Always call onChanges when pollNow is directly called
      this.options.onChanges(newData, changes);
      
      return changes;
    } finally {
      // Restore previous polling state if we changed it
      if (!wasPolling) {
        this.isPolling = false;
      }
    }
  }
  
  /**
   * Internal polling function
   */
  private async doPoll(): Promise<DataChanges<T>> {
    // Don't poll if disabled
    if (!this.isPolling) {
      return {
        hasChanges: false,
        newItems: [],
        removedItems: [],
        changedItems: [],
        unchangedItems: []
      };
    }

    try {
      const now = Date.now();
      const timeSinceLastPoll = now - this.lastPollTime;
      this.lastPollTime = now;
      
      logger.debug(`Polling for changes (interval: ${this.currentInterval}ms, time since last poll: ${timeSinceLastPoll}ms)`);
      
      const newData = await this.options.fetchFn();
      const changes = this.detectChanges(newData);
      
      // Handle backoff logic
      if (this.options.enableBackoff) {
        if (!changes.hasChanges) {
          this.consecutiveNoChanges++;
          
          // Increase interval up to the maximum
          const newInterval = Math.min(
            this.options.interval * Math.pow(1.5, this.consecutiveNoChanges),
            this.options.maxBackoffInterval || Infinity
          );
          
          if (newInterval !== this.currentInterval) {
            logger.debug(`No changes detected for ${this.consecutiveNoChanges} consecutive polls, increasing interval to ${newInterval}ms`);
            this.currentInterval = newInterval;
          }
        } else if (this.options.resetBackoffOnChanges) {
          // Reset backoff when changes detected
          if (this.currentInterval !== this.options.interval) {
            logger.debug('Changes detected, resetting polling interval');
            this.currentInterval = this.options.interval;
          }
          this.consecutiveNoChanges = 0;
        }
      }
      
      // Call onChanges for initial data load or when there are changes
      if (!this.lastData || changes.hasChanges) {
        this.options.onChanges(newData, changes);
      }
      
      // Always update last data
      this.lastData = newData;
      this.lastDataMap = new Map<string, T>();
      this.lastFingerprintMap = new Map<string, any>();
      for (const item of newData) {
        const id = this.options.idExtractor!(item);
        this.lastDataMap.set(id, item);
        this.lastFingerprintMap.set(id, this.options.fingerprintExtractor!(item));
      }
      
      // Reset errors counter on success
      this.consecutiveErrors = 0;
      
      return changes;
    } catch (error) {
      this.failedAttempts++;
      this.lastError = error as Error;
      
      logger.error('Error during smart polling:', error);
      
      // Special handling for GraphQL "No operation named" errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('No operation named')) {
        console.error('GraphQL operation name error in SmartPoller, will retry with backoff', error);
        
        // Don't call onError for this specific type of error since we're handling it internally
        // Allow the system to retry with backoff
      } else {
        // For other errors, call the onError callback
        if (this.options.onError && error instanceof Error) {
          this.options.onError(error);
        }
      }
      
      // Apply exponential backoff if enabled
      if (this.options.enableBackoff && this.consecutiveErrors > 1) {
        const maxBackoff = this.options.maxBackoffInterval || 5 * 60 * 1000; // 5 minutes max
        
        // Calculate new backoff (exponential with jitter)
        this.currentBackoff = Math.min(
          this.currentBackoff * 2 * (0.8 + Math.random() * 0.4), // Add 20% jitter
          maxBackoff
        );
        
        console.log(`SmartPoller: Backoff set to ${this.currentBackoff}ms after ${this.consecutiveErrors} consecutive errors`);
      }
      
      return {
        hasChanges: false,
        newItems: [],
        removedItems: [],
        changedItems: [],
        unchangedItems: this.lastData || []
      };
    } finally {
      // Schedule the next poll
      this.scheduleNextPoll();
    }
  }
  
  /**
   * Schedule the next poll
   */
  private scheduleNextPoll(): void {
    if (!this.isPolling) {
      return; // Don't schedule if we've been stopped
    }
    
    // Clean up any existing timer first to prevent leaks
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    // Use the currentBackoff if we have consecutive errors, otherwise use the normal interval
    const interval = this.consecutiveErrors > 1 && this.currentBackoff ? this.currentBackoff : this.currentInterval;
    
    this.timer = setTimeout(() => this.poll(), interval);
    
    // Log if we're using backoff
    if (this.consecutiveErrors > 1 && this.currentBackoff) {
      logger.debug(`Next poll scheduled with backoff in ${interval}ms due to errors`);
    }
  }
  
  /**
   * Detect changes between old and new data
   */
  private detectChanges(newData: T[]): DataChanges<T> {
    const idExtractor = this.options.idExtractor!;
    const fingerprintExtractor = this.options.fingerprintExtractor!;
    
    // Build maps for current data
    const newDataMap = new Map<string, T>();
    const newFingerprintMap = new Map<string, any>();
    
    for (const item of newData) {
      const id = idExtractor(item);
      newDataMap.set(id, item);
      newFingerprintMap.set(id, fingerprintExtractor(item));
    }
    
    // If this is the initial data load (no previous data), treat all items as unchanged
    if (!this.lastData) {
      // Update state maps before returning
      this.lastData = newData;
      this.lastDataMap = newDataMap;
      this.lastFingerprintMap = newFingerprintMap;
      
      return {
        hasChanges: false,
        newItems: [],
        removedItems: [],
        changedItems: [],
        unchangedItems: newData
      };
    }
    
    // Find new, removed and changed items
    const newItems: T[] = [];
    const removedItems: T[] = [];
    const changedItems: T[] = [];
    const unchangedItems: T[] = [];
    
    // Find new and changed items
    for (const [id, item] of Array.from(newDataMap.entries())) {
      const oldItem = this.lastDataMap.get(id);
      
      if (!oldItem) {
        // Item is new
        newItems.push(item);
      } else {
        // Item exists, check if it changed
        const newFingerprint = newFingerprintMap.get(id);
        const oldFingerprint = this.lastFingerprintMap.get(id);
        
        const changed = JSON.stringify(newFingerprint) !== JSON.stringify(oldFingerprint);
        
        if (changed) {
          changedItems.push(item);
        } else {
          unchangedItems.push(item);
        }
      }
    }
    
    // Find removed items
    for (const [id, item] of Array.from(this.lastDataMap.entries())) {
      if (!newDataMap.has(id)) {
        removedItems.push(item);
      }
    }
    
    return {
      hasChanges: newItems.length > 0 || removedItems.length > 0 || changedItems.length > 0,
      newItems,
      removedItems,
      changedItems,
      unchangedItems
    };
  }
  
  /**
   * Execute polling and schedule next poll
   */
  private poll(): void {
    if (!this.isPolling) {
      return; // Don't poll if we've been stopped
    }
    
    this.doPoll()
      .then((changes) => {
        // Always call onChanges for initial data or when there are changes
        if (!this.lastData || changes.hasChanges) {
          this.options.onChanges(this.lastData || [], changes);
        }
      })
      .catch((error) => {
        if (this.options.onError) {
          this.options.onError(error);
        }
      })
      .finally(() => {
        if (this.isPolling) {
          this.scheduleNextPoll();
        }
      });
  }
} 