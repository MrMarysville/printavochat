/**
 * Realtime voice client for OpenAI integration
 * This utility handles realtime audio streaming to and from OpenAI
 */

import { logger } from '../logger';

// These types represent the Realtime WebSocket API from OpenAI
export interface RealtimeSession {
  sessionId: string;
  token: string;
  expiresAt: string;
  url: string;
}

export interface RealtimeMessage {
  type: string;
  role?: string;
  content?: string;
  audio_data?: Uint8Array;
  part_index?: number;
}

export interface RealtimeError {
  type: 'error';
  message: string;
  code?: string;
}

export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// Events that can be emitted by the realtime client
export type RealtimeEvent = 
  | { type: 'connecting' }
  | { type: 'connected' }
  | { type: 'message'; data: RealtimeMessage }
  | { type: 'transcript'; text: string }
  | { type: 'audio'; audioData: Uint8Array }
  | { type: 'error'; error: Error | string }
  | { type: 'disconnected' }
  | { type: 'connectionState'; state: ConnectionState };

// Event handler type
export type RealtimeEventHandler = (event: RealtimeEvent) => void;

/**
 * RealtimeVoiceClient - Manages realtime voice communication with OpenAI's API
 */
export class RealtimeVoiceClient {
  private socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private eventHandlers: RealtimeEventHandler[] = [];
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private audioContext: AudioContext | null = null;
  private audioQueue: Uint8Array[] = [];
  private isPlaying = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // Start with 1 second delay
  
  /**
   * Create a new realtime session
   * @returns Promise with session details
   */
  public async createSession(): Promise<RealtimeSession> {
    try {
      const response = await fetch('/api/voice/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create session: ${errorText}`);
      }
      
      const sessionData = await response.json();
      this.sessionId = sessionData.sessionId;
      return sessionData;
    } catch (error) {
      logger.error('Error creating realtime session:', error);
      throw error;
    }
  }
  
  /**
   * Connect to the websocket with the session information
   * @param session Session details from createSession
   */
  public async connect(session: RealtimeSession): Promise<void> {
    this.updateConnectionState(ConnectionState.CONNECTING);
    
    try {
      // Initialize audio context for playback
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Create WebSocket connection
      this.socket = new WebSocket(session.url);
      
      // Set up WebSocket event handlers
      this.socket.onopen = this.handleSocketOpen.bind(this, session);
      this.socket.onmessage = this.handleSocketMessage.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
      this.socket.onclose = this.handleSocketClose.bind(this);
    } catch (error) {
      this.updateConnectionState(ConnectionState.ERROR);
      this.emitEvent({ type: 'error', error: error instanceof Error ? error : String(error) });
      throw error;
    }
  }
  
  /**
   * Send audio data to the server
   * @param audioData Audio data as Uint8Array
   */
  public sendAudio(audioData: Uint8Array): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'audio_data',
        audio_data: Array.from(audioData),
        part_index: 0
      }));
    } else {
      logger.warn('Cannot send audio: WebSocket not open');
      this.emitEvent({ 
        type: 'error', 
        error: 'WebSocket connection not established'
      });
    }
  }
  
  /**
   * Send a text message to the server
   * @param text Text to send
   */
  public sendText(text: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        role: 'user',
        content: text
      }));
    } else {
      logger.warn('Cannot send text: WebSocket not open');
      this.emitEvent({ 
        type: 'error', 
        error: 'WebSocket connection not established'
      });
    }
  }
  
  /**
   * Disconnect from the server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.sessionId = null;
    this.updateConnectionState(ConnectionState.DISCONNECTED);
  }
  
  /**
   * Add an event handler
   * @param handler Handler function
   */
  public addEventListener(handler: RealtimeEventHandler): void {
    this.eventHandlers.push(handler);
  }
  
  /**
   * Remove an event handler
   * @param handler Handler function to remove
   */
  public removeEventListener(handler: RealtimeEventHandler): void {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }
  
  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleSocketOpen(session: RealtimeSession): void {
    logger.debug('WebSocket connection established');
    this.updateConnectionState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Send the initial authentication message
    if (this.socket) {
      this.socket.send(JSON.stringify({
        type: 'auth',
        token: session.token
      }));
    }
    
    this.emitEvent({ type: 'connected' });
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleSocketMessage(event: MessageEvent): void {
    try {
      // Parse the message data
      const data = JSON.parse(event.data);
      this.emitEvent({ type: 'message', data });
      
      // Handle different message types
      switch (data.type) {
        case 'message':
          if (data.role === 'assistant' && data.content) {
            this.emitEvent({ type: 'transcript', text: data.content });
          }
          break;
          
        case 'audio_data':
          if (data.audio_data) {
            const audioData = new Uint8Array(data.audio_data);
            this.emitEvent({ type: 'audio', audioData });
            this.queueAudio(audioData);
          }
          break;
          
        case 'error':
          this.emitEvent({ type: 'error', error: data.message || 'Unknown error from server' });
          break;
          
        default:
          logger.debug('Received unhandled message type:', data.type);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      this.emitEvent({ type: 'error', error: error instanceof Error ? error : String(error) });
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleSocketError(event: Event): void {
    logger.error('WebSocket error:', event);
    this.updateConnectionState(ConnectionState.ERROR);
    this.emitEvent({ type: 'error', error: 'WebSocket error' });
    
    // Attempt to reconnect
    this.attemptReconnect();
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleSocketClose(event: CloseEvent): void {
    logger.debug(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
    this.updateConnectionState(ConnectionState.DISCONNECTED);
    this.emitEvent({ type: 'disconnected' });
    
    // Attempt to reconnect if not closed cleanly
    if (event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    }
  }
  
  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        // Only create a new session if we don't have one
        if (!this.sessionId) {
          const session = await this.createSession();
          await this.connect(session);
        } else {
          // Try to reconnect with the existing session
          // If this fails, we'll fall back to creating a new session
          await fetch(`/api/voice/check-session?sessionId=${this.sessionId}`)
            .then(async (response) => {
              if (response.ok) {
                const sessionInfo = await response.json();
                await this.connect(sessionInfo);
              } else {
                // Session expired, create a new one
                const session = await this.createSession();
                await this.connect(session);
              }
            })
            .catch(async () => {
              // Error checking session, create a new one
              const session = await this.createSession();
              await this.connect(session);
            });
        }
      } catch (error) {
        logger.error('Error reconnecting:', error);
        // If we still have attempts left, try again
        this.attemptReconnect();
      }
    }, delay);
  }
  
  /**
   * Queue audio for playback
   */
  private queueAudio(audioData: Uint8Array): void {
    this.audioQueue.push(audioData);
    
    // Start playing if not already playing
    if (!this.isPlaying) {
      this.playNextAudio();
    }
  }
  
  /**
   * Play the next audio in the queue
   */
  private async playNextAudio(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const audioData = this.audioQueue.shift()!;
    
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Decode the audio data (typically MP3 format from OpenAI)
      // Create a new ArrayBuffer from the Uint8Array to avoid SharedArrayBuffer issues
      const buffer = audioData.buffer;
      const newArrayBuffer = buffer.constructor.name === 'SharedArrayBuffer' 
        ? new Uint8Array(audioData).buffer  // Create a new buffer from the Uint8Array
        : buffer;
      
      const audioBuffer = await this.audioContext.decodeAudioData(newArrayBuffer as ArrayBuffer);
      
      // Create a source node and connect it to the audio context
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      // When playback ends, play the next audio in the queue
      source.onended = () => {
        this.playNextAudio();
      };
      
      // Start playback
      source.start(0);
    } catch (error) {
      logger.error('Error playing audio:', error);
      // Skip this audio and try the next one
      this.playNextAudio();
    }
  }
  
  /**
   * Update the connection state and emit an event
   */
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.emitEvent({ type: 'connectionState', state });
  }
  
  /**
   * Emit an event to all registered handlers
   */
  private emitEvent(event: RealtimeEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.error('Error in event handler:', error);
      }
    });
  }
} 