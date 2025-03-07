# Audio Playback Issues

## Problem
Audio playback can be interrupted during component unmount or when switching between components, leading to errors:

```
Error playing audio: The play() request was interrupted by a call to pause()
```

## Solution
1. Track component mounting state
2. Clean up audio resources properly
3. Handle playback state

### Implementation
```typescript
const isUnmounting = useRef(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  audioRef.current = new Audio(source);
  
  const playAudio = async () => {
    try {
      if (!isUnmounting.current && audioRef.current) {
        await audioRef.current.load();
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };
  
  playAudio();

  return () => {
    isUnmounting.current = true;
    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      audio.pause();
      audio.src = '';
      audio.load();
    }
  };
}, []);
```

## Prevention
- Always track component mounting state
- Clean up audio resources in useEffect cleanup
- Handle async operations properly
- Consider user interactions that might interrupt playback