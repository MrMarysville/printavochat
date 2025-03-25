import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoiceControl } from '../components/VoiceControl';

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true
});

// Mock the MediaRecorder API
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onstop: jest.fn(),
  onerror: jest.fn(),
  state: 'inactive'
};

window.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);

// Mock the getUserMedia API
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue('mock media stream')
  },
  writable: true
});

// Mock logger to prevent console output during tests
jest.mock('../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('VoiceControl Component', () => {
  const mockOnSpeechInput = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the voice control button', () => {
    render(<VoiceControl onSpeechInput={mockOnSpeechInput} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('shows a microphone off icon when not listening', () => {
    render(<VoiceControl onSpeechInput={mockOnSpeechInput} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Start voice input');
  });
  
  it('toggles listening state when clicked', () => {
    render(<VoiceControl onSpeechInput={mockOnSpeechInput} />);
    const button = screen.getByRole('button');
    
    // Initial state - not listening
    expect(button).toHaveAttribute('aria-label', 'Start voice input');
    
    // Click to start listening
    fireEvent.click(button);
    
    // Now it should be listening
    expect(button).toHaveAttribute('aria-label', 'Stop voice input');
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
    
    // Click again to stop listening
    fireEvent.click(button);
    
    // Now it should not be listening
    expect(button).toHaveAttribute('aria-label', 'Start voice input');
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });
  
  it('shows wake word instruction when listening', () => {
    render(<VoiceControl onSpeechInput={mockOnSpeechInput} wakeWord="printavo" />);
    const button = screen.getByRole('button');
    
    // Click to start listening
    fireEvent.click(button);
    
    // Should show wake word instruction
    expect(screen.getByText(/Say "printavo" to start/i)).toBeInTheDocument();
  });
  
  it('is disabled when the disabled prop is true', () => {
    render(<VoiceControl onSpeechInput={mockOnSpeechInput} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
}); 