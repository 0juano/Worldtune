import { useState, useEffect } from 'react';

// Define the WebKit AudioContext interface
interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

/**
 * Hook to manage audio context for better mobile compatibility
 * Many mobile browsers require user interaction before playing audio
 */
export const useAudioContext = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (audioContext) return;
    
    try {
      // Create new audio context
      const AudioContextClass = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
      const newContext = new AudioContextClass();
      setAudioContext(newContext);
      setIsAudioEnabled(true);
      
      // Resume context if it's suspended (common on mobile)
      if (newContext.state === 'suspended') {
        newContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  };

  // Set up event listeners for user interaction
  useEffect(() => {
    const userInteractionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleUserInteraction = () => {
      initAudioContext();
      
      // Remove event listeners after first interaction
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
    
    // Add event listeners
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });
    
    // Clean up event listeners on unmount
    return () => {
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  return { isAudioEnabled, audioContext };
};

export default useAudioContext; 