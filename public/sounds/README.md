# Sound Assets

This directory contains sound assets used in the application.

## Sound Files

- `cash-register.mp3` - Cash register sound effect played when a transaction is confirmed
  - Source: [Mixkit](https://mixkit.co/free-sound-effects/cash-register/)
  - License: Free to use in any project

## Usage

Sounds are played using the audio utility functions in `src/utils/audio.ts`:

```typescript
import { playSound } from '../utils/audio';

// Play a sound
await playSound('cash-register');
```

## Adding New Sounds

1. Add the sound file to this directory
2. Update this README with the source and license information
3. Use the `playSound` function to play the sound in your components 