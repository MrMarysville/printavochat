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
    this.poll();
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
    return await this.doPoll();
  }
  
  /**
   * Internal polling function
   */
  private async doPoll(): Promise<DataChanges<T>> {
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
      
      // Call the onChange handler if there are changes
      if (changes.hasChanges || this.lastData?.length === 0) {
        this.options.onChanges(newData, changes);
      }
      
      return changes;
    } catch (error) {
      this.failedAttempts++;
      this.lastError = error as Error;
      
      logger.error('Error during smart polling:', error);
      if (this.options.onError && error instanceof Error) {
        this.options.onError(error);
      }
      
      if (this.failedAttempts >= this.maxRetries) {
        // Reset polling if we've failed too many times
        this.stop();
        // Don't restart automatically as this could cause more issues
      }
      
      return {
        hasChanges: false,
        newItems: [],
        removedItems: [],
        changedItems: [],
        unchangedItems: this.lastData || []
      };
    }
  }
  
  /**
   * Schedule the next poll
   */
  private poll(): void {
    if (!this.isPolling) {
      return; // Don't poll if we've been stopped
    }
    
    this.doPoll().finally(() => {
      if (this.isPolling) {
        // Clean up any existing timer first to prevent leaks
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => this.poll(), this.currentInterval);
      }
    });
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
    
    // Update last data
    this.lastData = newData;
    this.lastDataMap = newDataMap;
    this.lastFingerprintMap = newFingerprintMap;
    
    return {
      hasChanges: newItems.length > 0 || removedItems.length > 0 || changedItems.length > 0,
      newItems,
      removedItems,
      changedItems,
      unchangedItems
    };
  }
} 