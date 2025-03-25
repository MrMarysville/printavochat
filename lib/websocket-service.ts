/**
 * WebSocket Service for Real-time Updates
 * 
 * This service provides real-time updates for Printavo data using WebSockets.
 * It manages the connection, reconnection, and event handling for WebSocket events.
 */

import { logger } from './logger';

// Types for the WebSocket service
type WebSocketCallback = (data: any) => void;
type WebSocketEvent = 'orders_updated' | 'connection_status' | 'error';
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Mock implementation for development (will be replaced with actual WebSocket integration)
// When integrating with a real WebSocket server, replace this implementation
export class WebSocketService {
  private listeners: Record<WebSocketEvent, WebSocketCallback[]> = {
    orders_updated: [],
    connection_status: [],
    error: []
  };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private connectionStatus: ConnectionStatus = 'disconnected';
  private mockUpdateInterval: NodeJS.Timeout | null = null;
  
  // For development purposes, we're simulating WebSocket behavior
  // In production, this would connect to a real WebSocket server
  constructor(private apiUrl: string = '/api/websocket') {
    logger.info('Initializing WebSocket service');
    this.simulateConnection();
  }

  /**
   * Add an event listener for WebSocket events
   */
  public addEventListener(event: WebSocketEvent, callback: WebSocketCallback): () => void {
    this.listeners[event].push(callback);
    
    // Return a function to remove this specific listener
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Connect to the WebSocket server
   * For now, this simulates a connection
   */
  public connect(): void {
    if (this.connectionStatus === 'connected') return;
    
    logger.info('Connecting to WebSocket server...');
    this.connectionStatus = 'connecting';
    this.notifyStatusListeners(this.connectionStatus);
    
    // Simulate connection delay
    setTimeout(() => {
      this.connectionStatus = 'connected';
      logger.info('WebSocket connected successfully');
      this.notifyStatusListeners(this.connectionStatus);
      
      // Start the mock update interval for development
      this.startMockUpdates();
    }, 1000);
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.connectionStatus === 'disconnected') return;
    
    logger.info('Disconnecting from WebSocket server...');
    if (this.mockUpdateInterval) {
      clearInterval(this.mockUpdateInterval);
      this.mockUpdateInterval = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.notifyStatusListeners(this.connectionStatus);
  }

  /**
   * Get the current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Private methods for internal use

  /**
   * Simulate a WebSocket connection for development
   */
  private simulateConnection(): void {
    // In production, this would be replaced with actual WebSocket connection logic
    this.connect();
  }

  /**
   * Start sending mock updates for development purposes
   */
  private startMockUpdates(): void {
    if (this.mockUpdateInterval) {
      clearInterval(this.mockUpdateInterval);
    }
    
    // Send mock updates every 30-60 seconds
    this.mockUpdateInterval = setInterval(() => {
      if (this.connectionStatus === 'connected') {
        // Simulate a 20% chance of getting an order update
        if (Math.random() < 0.2) {
          this.simulateOrderUpdate();
        }
      }
    }, 30000 + Math.random() * 30000);
  }

  /**
   * Simulate an order update for development purposes
   */
  private simulateOrderUpdate(): void {
    const mockOrderUpdate = {
      type: 'orders_updated',
      timestamp: new Date().toISOString(),
      message: 'New order update available',
      orderId: `order_${Math.floor(Math.random() * 10000)}`
    };
    
    logger.info('Received mock WebSocket update:', mockOrderUpdate);
    this.notifyOrderListeners(mockOrderUpdate);
  }

  /**
   * Notify all order update listeners
   */
  private notifyOrderListeners(data: any): void {
    this.listeners.orders_updated.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in WebSocket orders_updated listener:', error);
      }
    });
  }

  /**
   * Notify all connection status listeners
   */
  private notifyStatusListeners(status: ConnectionStatus): void {
    this.listeners.connection_status.forEach(callback => {
      try {
        callback({ status });
      } catch (error) {
        logger.error('Error in WebSocket connection_status listener:', error);
      }
    });
  }

  /**
   * Notify all error listeners
   */
  private notifyErrorListeners(error: any): void {
    this.listeners.error.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        logger.error('Error in WebSocket error listener:', err);
      }
    });
  }
}

// Create a singleton instance for use throughout the application
export const websocketService = new WebSocketService(); 