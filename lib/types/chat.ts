/**
 * Chat types for the application
 */

/**
 * Enum for message roles - replaces string literals for better type safety
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * Enum for message types - replaces string literals for better type safety
 */
export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  ORDER = 'order',
  PRODUCT = 'product',
  FORM = 'form',
  DASHBOARD = 'dashboard'
}

/**
 * Interface for chat file attachments
 */
export interface ChatFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

/**
 * Interface for rich message data
 */
export interface RichMessageData {
  type: MessageType.ORDER | MessageType.PRODUCT | MessageType.FORM | MessageType.DASHBOARD;
  content: any; // This could be further typed based on the message type
}

/**
 * Interface for chat messages
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  files?: ChatFile[];
  richData?: RichMessageData;
  messageType: MessageType;
}

/**
 * Type for API responses to chat messages
 */
export interface ChatResponse {
  message: string;
  richData?: RichMessageData;
}

/**
 * Helper function to get message styling information based on role
 */
export function getMessageStyles(role: MessageRole): {
  containerClass: string;
  textClass: string;
  name: string;
  color: string;
} {
  switch (role) {
    case MessageRole.USER:
      return {
        containerClass: 'bg-blue-100 ml-auto',
        textClass: 'text-blue-800',
        name: 'You',
        color: 'blue'
      };
    case MessageRole.ASSISTANT:
      return {
        containerClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        name: 'Assistant',
        color: 'gray'
      };
    case MessageRole.SYSTEM:
      return {
        containerClass: 'bg-yellow-100',
        textClass: 'text-yellow-800',
        name: 'System',
        color: 'yellow'
      };
    default:
      return {
        containerClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        name: 'Unknown',
        color: 'gray'
      };
  }
} 