/**
 * Audio utility functions for playing sounds in the application
 */

// Cache for preloaded audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Preload an audio file to improve playback performance
 * @param soundName - The name of the sound file (without extension)
 * @param extension - The file extension (default: 'mp3')
 */
export const preloadSound = (soundName: string, extension: string = 'mp3'): void => {
  if (audioCache[soundName]) return;
  
  const audio = new Audio(`/sounds/${soundName}.${extension}`);
  audio.load();
  audioCache[soundName] = audio;
};

/**
 * Play a sound by name
 * @param soundName - The name of the sound file (without extension)
 * @param extension - The file extension (default: 'mp3')
 * @param volume - Volume level from 0 to 1 (default: 0.7)
 * @param audioContext - Optional AudioContext for better mobile compatibility
 * @returns Promise that resolves when the sound finishes playing
 */
export const playSound = (
  soundName: string, 
  extension: string = 'mp3',
  volume: number = 0.7,
  audioContext?: AudioContext | null
): Promise<void> => {
  return new Promise((resolve) => {
    // Use cached audio if available, otherwise create a new Audio element
    let audio = audioCache[soundName];
    
    if (!audio) {
      audio = new Audio(`/sounds/${soundName}.${extension}`);
      audioCache[soundName] = audio;
    }
    
    // Reset audio to beginning in case it was played before
    audio.currentTime = 0;
    audio.volume = volume;
    
    // If we have an AudioContext, use it for better mobile compatibility
    if (audioContext) {
      try {
        // Create a media element source from our audio element
        const source = audioContext.createMediaElementSource(audio);
        // Connect to the destination (speakers)
        source.connect(audioContext.destination);
        
        // Make sure the context is running (important for mobile)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      } catch (err) {
        // If we've already connected this audio element to the context,
        // it will throw an error, which we can safely ignore
        console.debug('Audio element already connected to context:', err);
      }
    }
    
    // Resolve promise when audio finishes playing
    audio.onended = () => resolve();
    
    // Play the sound
    audio.play().catch(error => {
      console.error(`Error playing sound ${soundName}:`, error);
      resolve(); // Resolve anyway to prevent hanging promises
    });
  });
}; 