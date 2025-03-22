"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const formatContent = (content: string) => {
    try {
      // Check if the content is JSON
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const parsedJson = JSON.parse(content);
        return JSON.stringify(parsedJson, null, 2);
      }
      return content;
    } catch (e) {
      // If parsing fails, log the error and return the original content
      console.warn('Failed to parse JSON content:', e);
      return content;
    }
  };

  // Process the message content
  const displayContent = formatContent(message.content);

  return (
    <div
      className={cn(
        'flex w-full gap-4 p-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/printavo-logo.png" alt="Printavo" />
          <AvatarFallback className="bg-primary text-primary-foreground">P</AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            'rounded-lg p-3',
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted text-foreground'
          )} 
        >
          <pre className="text-sm whitespace-pre-wrap overflow-auto">{displayContent}</pre>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="User" />
          <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

