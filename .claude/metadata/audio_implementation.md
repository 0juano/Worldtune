# Audio Implementation

This document describes the audio implementation in the application, specifically for transaction confirmation sounds.

## Components

### Audio Utility (`src/utils/audio.ts`)

- **Purpose**: Provides functions for preloading and playing sound effects
- **Key Functions**:
  - `preloadSound`: Preloads audio files for better performance
  - `playSound`: Plays a sound file with configurable volume
- **Features**:
  - Audio caching to improve performance
  - Promise-based API for async/await usage
  - Volume control
  - Error handling for failed playback

### AudioContext Hook (`src/utils/useAudioContext.ts`)

- **Purpose**: Manages the Web Audio API's AudioContext for better mobile compatibility
- **Key Features**:
  - Initializes AudioContext on first user interaction
  - Handles browser compatibility (standard and webkit prefixed)
  - Manages AudioContext state (suspended/running)
- **Usage Pattern**: Import and use in components that play sounds

## Integration Points

### Transaction Confirmation (`src/components/AddCredits.tsx`)

- **Sound Trigger**: Cash register sound plays when a transaction is confirmed
- **Implementation**:
  - Preloads sound on component mount
  - Plays sound after successful card or crypto payment
  - Uses AudioContext for better mobile compatibility
- **User Experience**: Provides audio feedback for successful transactions

## Sound Assets

- **Location**: `public/sounds/`
- **Current Assets**:
  - `cash-register.mp3`: Played on transaction confirmation
- **Documentation**: See `public/sounds/README.md` for sources and licenses

## Mobile Considerations

- Mobile browsers often require user interaction before playing audio
- The AudioContext hook ensures audio can play on mobile devices
- Audio is initialized on first user interaction (click, touch, keypress)

## Future Improvements

- Add volume control in user settings
- Implement different sounds for different transaction types
- Add haptic feedback for mobile devices 