"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { RealtimeVoiceClient, ConnectionState, RealtimeEvent } from '@/lib/voice/realtime-client';

interface RealtimeVoiceControlProps {
  onSpeechInput: (text: string) => void;
  isListening?: boolean;
  wakeWord?: string;
  disabled?: boolean;
  className?: string;
}

export function RealtimeVoiceControl({
  onSpeechInput,
  isListening: externalIsListening,
  wakeWord = "printavo",
  disabled = false,
  className = ""
}: RealtimeVoiceControlProps) {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // References
  const clientRef = useRef<RealtimeVoiceClient | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Handle external listening control
  useEffect(() => {
    if (externalIsListening !== undefined) {
      setIsListening(externalIsListening);
    }
  }, [externalIsListening]);
  
  // Initialize the realtime client
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new RealtimeVoiceClient();
      
      // Add event listener for received speech
      clientRef.current.addEventListener(handleVoiceEvent);
    }
    
    return () => {
      // Clean up event listeners and resources
      if (clientRef.current) {
        clientRef.current.removeEventListener(handleVoiceEvent);
      }
      
      stopListening();
    };
  }, []);
  
  /**
   * Handle events from the voice client
   */
  const handleVoiceEvent = (event: RealtimeEvent) => {
    switch (event.type) {
      case 'connecting':
        setIsConnecting(true);
        break;
        
      case 'connected':
        setIsConnecting(false);
        setError(null);
        break;
        
      case 'transcript':
        setTranscript(event.text);
        onSpeechInput(event.text);
        break;
        
      case 'error':
        setError(typeof event.error === 'string' ? event.error : event.error.message);
        setIsConnecting(false);
        break;
        
      case 'disconnected':
        setWakeWordDetected(false);
        break;
        
      case 'connectionState':
        if (event.state === ConnectionState.ERROR || event.state === ConnectionState.DISCONNECTED) {
          setWakeWordDetected(false);
        }
        break;
    }
  };
  
  /**
   * Start listening for the wake word using the browser's SpeechRecognition API
   */
  const startWakeWordDetection = async () => {
    try {
      // Check if SpeechRecognition is available
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript.toLowerCase().trim();
        
        // Check for wake word
        if (text.includes(wakeWord.toLowerCase()) && !wakeWordDetected) {
          logger.debug('Wake word detected:', wakeWord);
          setWakeWordDetected(true);
          
          // Stop wake word detection and start realtime voice streaming
          recognition.stop();
          startRealtimeVoice();
        }
      };
      
      recognition.onerror = (event: any) => {
        logger.error('Wake word recognition error:', event);
        setError('Error with wake word recognition');
      };
      
      recognition.start();
      logger.debug('Wake word detection started');
      setError(null);
      showNotification(`Listening for wake word: "${wakeWord}"`);
    } catch (error) {
      logger.error('Error starting wake word detection:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };
  
  /**
   * Start the realtime voice session with OpenAI
   */
  const startRealtimeVoice = async () => {
    if (!clientRef.current) return;
    
    setIsConnecting(true);
    showNotification('Connecting to voice service...');
    
    try {
      // Create a new session
      const session = await clientRef.current.createSession();
      
      // Connect to the session
      await clientRef.current.connect(session);
      
      // Start capturing audio
      await startAudioCapture();
      
      showNotification('Connected! Speak now...');
    } catch (error) {
      logger.error('Error starting realtime voice:', error);
      setError(error instanceof Error ? error.message : String(error));
      setWakeWordDetected(false);
      setIsConnecting(false);
    }
  };
  
  /**
   * Start capturing audio from the microphone and sending it to OpenAI
   */
  const startAudioCapture = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create audio source from microphone
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyzer to check audio levels
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 1024;
      
      // Create script processor for audio processing
      // Note: ScriptProcessorNode is deprecated but the replacement AudioWorkletNode
      // requires more setup. Using ScriptProcessorNode for simplicity.
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      // Connect the audio processing pipeline
      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);
      
      // Process audio data
      processor.onaudioprocess = (e) => {
        if (!wakeWordDetected || !clientRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Uint8Array(inputData.length);
        
        // Convert float32 audio data to uint8
        for (let i = 0; i < inputData.length; i++) {
          // Convert from [-1, 1] to [0, 255]
          audioData[i] = (inputData[i] * 128) + 128;
        }
        
        // Send audio data to server
        clientRef.current.sendAudio(audioData);
      };
      
      logger.debug('Audio capture started');
    } catch (error) {
      logger.error('Error starting audio capture:', error);
      setError('Could not access microphone');
      throw error;
    }
  };
  
  /**
   * Stop listening and clean up resources
   */
  const stopListening = () => {
    // Stop realtime connection
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    
    // Stop audio processing
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    // Stop analyzer
    if (analyserRef.current && audioContextRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => logger.error('Error closing audio context:', e));
      audioContextRef.current = null;
    }
    
    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setWakeWordDetected(false);
    showNotification('Voice input disabled');
  };
  
  /**
   * Toggle listening state
   */
  const toggleListening = () => {
    const newState = !isListening;
    setIsListening(newState);
    
    if (newState) {
      startWakeWordDetection();
    } else {
      stopListening();
    }
  };
  
  /**
   * Show a notification message
   */
  const showNotification = (message: string, isError = false) => {
    logger.debug(`Voice notification: ${message}`);
    
    if (isError) {
      setError(message);
    } else {
      setError(null);
    }
  };
  
  return (
    <div className={`voice-control ${className}`}>
      <Button
        variant="outline"
        size="icon"
        disabled={disabled || isConnecting}
        onClick={toggleListening}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isConnecting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
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
      
      {isListening && !wakeWordDetected && !isConnecting && (
        <div className="text-xs text-gray-500 mt-1">
          Say &quot;{wakeWord}&quot; to start
        </div>
      )}
      
      {wakeWordDetected && transcript && (
        <div className="text-xs text-gray-700 mt-1 max-w-[200px] truncate">
          {transcript}
        </div>
      )}
    </div>
  );
} 