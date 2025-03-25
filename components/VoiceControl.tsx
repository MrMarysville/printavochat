"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

// Define the SpeechRecognition interfaces for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceControlProps {
  onSpeechInput: (text: string) => void;
  isListening?: boolean;
  wakeWord?: string;
  disabled?: boolean;
}

export function VoiceControl({
  onSpeechInput,
  isListening: externalIsListening,
  wakeWord = "printavo",
  disabled = false
}: VoiceControlProps) {
  // State for controlling voice input
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  // References to maintain state across renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const processingAudioRef = useRef(false);
  
  // Manage external control of listening state
  useEffect(() => {
    if (externalIsListening !== undefined) {
      setIsListening(externalIsListening);
    }
  }, [externalIsListening]);
  
  // Setup speech recognition for wake word detection
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    try {
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Handle speech recognition results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript.toLowerCase().trim();
        setTranscript(text);
        
        // Check for wake word
        if (text.includes(wakeWord.toLowerCase()) && !wakeWordDetected) {
          logger.debug('Wake word detected:', wakeWord);
          setWakeWordDetected(true);
          
          // Stop the wake word recognition and start full recording
          stopWakeWordRecognition();
          startFullRecording();
        }
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event: Event) => {
        logger.error('Speech recognition error:', event);
        setError(`Error with speech recognition`);
        restartWakeWordRecognition();
      };
      
      // Automatically restart when it stops
      recognitionRef.current.onend = () => {
        if (isListening && !wakeWordDetected) {
          restartWakeWordRecognition();
        }
      };
    } catch (err) {
      logger.error('Error initializing speech recognition:', err);
      setError(`Failed to initialize speech recognition: ${err}`);
    }
    
    return () => {
      stopWakeWordRecognition();
    };
  }, [wakeWord, isListening, wakeWordDetected]);
  
  // Start wake word recognition
  const startWakeWordRecognition = () => {
    if (recognitionRef.current && !wakeWordDetected) {
      try {
        recognitionRef.current.start();
        logger.debug('Wake word recognition started');
      } catch (err) {
        logger.error('Error starting wake word recognition:', err);
      }
    }
  };
  
  // Stop wake word recognition
  const stopWakeWordRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        logger.debug('Wake word recognition stopped');
      } catch (err) {
        logger.error('Error stopping wake word recognition:', err);
      }
    }
  };
  
  // Restart wake word recognition
  const restartWakeWordRecognition = () => {
    if (isListening && !wakeWordDetected) {
      setTimeout(() => {
        startWakeWordRecognition();
      }, 300);
    }
  };
  
  // Start full audio recording to send to OpenAI
  const startFullRecording = async () => {
    try {
      processingAudioRef.current = true;
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Process audio when recording stops
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        try {
          await processAudio();
        } catch (err) {
          logger.error('Error processing audio:', err);
          setError('Failed to process your voice input');
        } finally {
          // Reset for next input
          setWakeWordDetected(false);
          processingAudioRef.current = false;
          
          // If still listening, restart wake word detection
          if (isListening) {
            restartWakeWordRecognition();
          }
        }
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Automatically stop recording after 10 seconds of no response
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopFullRecording();
        }
      }, 10000);
      
      // Notify user
      showNotification('Listening...');
      
    } catch (err) {
      logger.error('Error starting recording:', err);
      setError('Could not access microphone');
      setWakeWordDetected(false);
      processingAudioRef.current = false;
      
      // If still listening, restart wake word detection
      if (isListening) {
        restartWakeWordRecognition();
      }
    }
  };
  
  // Stop full recording
  const stopFullRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      showNotification('Processing...');
    }
  };
  
  // Process recorded audio with OpenAI API
  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    // Create audio blob from chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    
    try {
      // Send to our server endpoint that will forward to OpenAI
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.text) {
        // Send transcribed text to parent component
        onSpeechInput(data.text);
        showNotification('Voice input sent!');
      }
      
    } catch (err) {
      logger.error('Error transcribing audio:', err);
      setError('Failed to transcribe audio');
      showNotification('Error transcribing audio', true);
    }
  };
  
  // Show notification to user
  const showNotification = (message: string, isError = false) => {
    // Implementation depends on your UI components
    // Here we're just setting a message, but you could use a toast
    logger.debug(`Voice notification: ${message}`);
    
    if (isError) {
      setError(message);
    } else {
      setError(null);
    }
  };
  
  // Toggle listening state
  const toggleListening = () => {
    const newState = !isListening;
    setIsListening(newState);
    
    if (newState) {
      // Start listening for wake word
      setError(null);
      startWakeWordRecognition();
      showNotification(`Listening for wake word: "${wakeWord}"`);
    } else {
      // Stop all listening
      stopWakeWordRecognition();
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopFullRecording();
      }
      
      setWakeWordDetected(false);
      showNotification('Voice input disabled');
    }
  };
  
  return (
    <div className="voice-control">
      <Button
        variant="outline"
        size="icon"
        disabled={disabled || processingAudioRef.current}
        onClick={toggleListening}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isListening ? (
          wakeWordDetected ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>
      
      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
      
      {isListening && !wakeWordDetected && (
        <div className="text-xs text-gray-500 mt-1">
          Say &quot;{wakeWord}&quot; to start
        </div>
      )}
    </div>
  );
} 