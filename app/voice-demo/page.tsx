"use client";

import React, { useState } from 'react';
import { VoiceControl } from '@/components/VoiceControl';
import { RealtimeVoiceControl } from '@/components/RealtimeVoiceControl';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VoiceDemoPage() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "How can I help you today?", isUser: false }
  ]);
  const [activeTab, setActiveTab] = useState<string>('standard');
  
  const handleSpeechInput = (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { text, isUser: true }]);
    
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          text: `I received your voice input: "${text}"`, 
          isUser: false 
        }
      ]);
    }, 1000);
  };
  
  const clearMessages = () => {
    setMessages([{ text: "How can I help you today?", isUser: false }]);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Voice Control Demo</h1>
      <p className="mb-8 text-gray-600">
        This demo showcases two different voice control implementations:
        the standard non-realtime version and the new realtime version using OpenAI&apos;s latest technology.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Voice</TabsTrigger>
          <TabsTrigger value="realtime">Realtime Voice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Voice Control</CardTitle>
              <CardDescription>
                Uses browser&apos;s SpeechRecognition API for wake word detection,
                then sends audio to OpenAI&apos;s Whisper model for transcription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <VoiceControl 
                  onSpeechInput={handleSpeechInput}
                  wakeWord="printavo"
                />
              </div>
              <p className="text-sm text-center text-gray-500 mb-6">
                Say &quot;printavo&quot; to activate voice input.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-gray-500">
                Based on Whisper transcription model
              </p>
              <Button variant="outline" size="sm" onClick={clearMessages}>
                Clear Messages
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="realtime" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Realtime Voice Control</CardTitle>
              <CardDescription>
                Uses browser&apos;s SpeechRecognition API for wake word detection,
                then connects to OpenAI&apos;s realtime voice API for streaming audio processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <RealtimeVoiceControl 
                  onSpeechInput={handleSpeechInput}
                  wakeWord="printavo"
                />
              </div>
              <p className="text-sm text-center text-gray-500 mb-6">
                Say &quot;printavo&quot; to activate voice input.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-gray-500">
                Based on gpt-4o-realtime-preview model
              </p>
              <Button variant="outline" size="sm" onClick={clearMessages}>
                Clear Messages
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            Voice messages and responses will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-md">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.isUser 
                    ? 'bg-blue-100 ml-auto text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 