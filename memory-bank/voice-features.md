# Voice Features Documentation

This document provides detailed information about the voice features implemented in the Printavo Chat Assistant.

## Overview

The application implements two different voice control mechanisms:

1. **Standard Voice Control** - Uses Whisper for transcription
2. **Realtime Voice Control** - Uses cutting-edge realtime models

Both approaches use a wake word detection system to activate voice input, making the interface more natural and intuitive to use.

## Components

### VoiceControl Component

The standard voice control component (`VoiceControl.tsx`) works as follows:

1. **Wake Word Detection**:
   - Uses the browser's SpeechRecognition API to listen for a wake word
   - When the wake word is detected, stops the wake word recognition
   - Default wake word is "printavo" but can be customized

2. **Audio Recording**:
   - After wake word detection, begins recording audio from the microphone
   - Uses the MediaRecorder API to capture audio data
   - Automatically stops recording after 10 seconds of silence

3. **Transcription**:
   - Sends recorded audio to the `/api/transcribe` endpoint
   - The backend uses OpenAI's Whisper-1 model for transcription
   - Returns the transcribed text to be processed by the chat interface

### RealtimeVoiceControl Component

The realtime voice control component (`RealtimeVoiceControl.tsx`) provides a more sophisticated experience:

1. **Wake Word Detection**:
   - Uses the same SpeechRecognition API to detect the wake word
   - Works identically to the standard component in this phase

2. **Realtime Session**:
   - After wake word detection, creates a realtime session with OpenAI
   - Establishes a WebSocket connection for bidirectional communication
   - Enables streaming of audio data and immediate responses

3. **Audio Streaming**:
   - Continuously captures audio data from the microphone
   - Processes and sends the audio in real-time over the WebSocket
   - Uses the Web Audio API for advanced audio processing

4. **Response Handling**:
   - Receives and plays audio responses from the model
   - Updates the transcript as text responses come in
   - Maintains the connection until the user stops or a timeout occurs

## Backend APIs

### Transcription API

Endpoint: `/api/transcribe`

This API handles audio transcription for the standard voice control:

- Accepts audio files (WebM format) via POST requests
- Uses OpenAI's Whisper-1 model for transcription
- Returns the transcribed text as JSON

### Realtime Voice APIs

Two endpoints support the realtime voice functionality:

1. **Create Session** - `/api/voice/create-session`
   - Creates a new realtime session with OpenAI
   - Returns session details including ID, token, and WebSocket URL

2. **Check Session** - `/api/voice/check-session`
   - Verifies if an existing session is still valid
   - Returns updated session information or an error

## Client-Side Utilities

### RealtimeVoiceClient

The `RealtimeVoiceClient` class (`lib/voice/realtime-client.ts`) manages the WebSocket connection:

- Handles session creation and authentication
- Manages audio data streaming
- Processes incoming audio and text responses
- Implements reconnection logic and error handling

## Browser Compatibility

Voice features have the following browser requirements:

- **SpeechRecognition API** (for wake word detection):
  - Chrome/Edge: Fully supported
  - Firefox: Requires enabling flags
  - Safari: Limited support

- **MediaRecorder API** (for audio recording):
  - Supported in all modern browsers
  - Some older browsers may have limitations

- **WebSockets** (for realtime communication):
  - Supported in all modern browsers

## Configuration

### Environment Variables

Configure the voice features in your `.env` file:

```
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional (defaults shown)
OPENAI_MODEL=gpt-4o
OPENAI_VOICE_MODEL=gpt-4o-realtime-preview
OPENAI_TRANSCRIPTION_MODEL=whisper-1
```

### Component Props

Both voice components accept the following props:

```typescript
{
  onSpeechInput: (text: string) => void;  // Handler for transcribed speech
  isListening?: boolean;                  // External control of listening state
  wakeWord?: string;                      // Custom wake word (default: "printavo")
  disabled?: boolean;                     // Disable the control
}
```

The `RealtimeVoiceControl` component also accepts a `className` prop for custom styling.

## Demo Page

A demo page is available at `/voice-demo` to showcase and compare both voice control implementations.

## Implementation Considerations

### Privacy and Security

- Audio data is only processed after wake word detection
- Audio is not stored permanently, only processed for transcription
- All communication with OpenAI is secured via HTTPS/WSS

### Performance

- Wake word detection runs locally in the browser
- Audio processing is optimized to minimize CPU usage
- The realtime client implements efficient buffering mechanisms

### Accessibility

- Visual indicators show the current state (listening, processing, etc.)
- Error messages are displayed when issues occur
- The voice interface complements rather than replaces text input

## Extending the Voice Features

### Custom Wake Words

To use a custom wake word:

```tsx
<VoiceControl 
  onSpeechInput={handleSpeechInput}
  wakeWord="customword"
/>
```

### Multiple Languages

The underlying OpenAI models support multiple languages. No special configuration is needed - users can speak in their preferred language.

### Advanced Audio Processing

For applications requiring more sophisticated audio processing:

1. Modify the `startAudioCapture` method in `RealtimeVoiceControl.tsx`
2. Implement custom audio processing using the Web Audio API
3. Adjust the audio data format sent to the OpenAI API as needed 