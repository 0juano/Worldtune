import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface CallingAnimationProps {
  phoneNumber: string;
  onClose: () => void;
  onPickup: () => void;
}

// Create a global variable outside the component to track if pickup has happened
// This will persist even if the component remounts
let hasGlobalPickupOccurred = false;
let pickupTimeoutId: NodeJS.Timeout | null = null;
// Track if hangup is in progress to avoid double calls
let isHangingUp = false;

export const CallingAnimation: React.FC<CallingAnimationProps> = ({ phoneNumber, onClose, onPickup }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hangupAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUnmounting = useRef(false);
  const { theme } = useThemeStore();
  const isLightMode = theme === 'light';
  
  // Use state for countdown display
  const [countdown, setCountdown] = useState(3);

  // Function to handle pickup (defined outside useEffect)
  const handlePickup = () => {
    // Only proceed if we haven't already picked up and we're not hanging up
    if (hasGlobalPickupOccurred || isHangingUp) {
      return;
    }
    
    // Mark as picked up globally
    hasGlobalPickupOccurred = true;
    
    // Stop audio if it's playing
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // Error handling is silent
      }
    }
    
    // Call the onPickup callback
    onPickup();
  };

  // Handle clean hangup with enough time for the sound to play
  const cleanHangup = async () => {
    // If already hanging up, don't do it again
    if (isHangingUp) return;
    
    // Set hanging up flag
    isHangingUp = true;
    
    // Clear the pickup timeout
    if (pickupTimeoutId) {
      clearTimeout(pickupTimeoutId);
      pickupTimeoutId = null;
    }
    
    // Play hang-up sound
    if (hangupAudioRef.current) {
      try {
        // Get the audio duration
        await hangupAudioRef.current.load();
        const duration = hangupAudioRef.current.duration || 1;
        
        // Start playing
        await hangupAudioRef.current.play();
        
        // Wait for the sound to finish (add a small buffer)
        const waitTime = Math.max(1000, duration * 1000 + 200);
        
        // Set a timeout for the duration of the audio plus a buffer
        setTimeout(() => {
          // Reset the hanging up flag
          isHangingUp = false;
          
          // Close the component
          onClose();
        }, waitTime);
      } catch {
        // If there's an error, just close
        isHangingUp = false;
        onClose();
      }
    } else {
      // No sound, just close
      isHangingUp = false;
      onClose();
    }
  };

  // Reset the global pickup flag when the component mounts for the first time
  useEffect(() => {
    hasGlobalPickupOccurred = false;
    isHangingUp = false;
    
    // Clear any existing timeout from previous instances
    if (pickupTimeoutId) {
      clearTimeout(pickupTimeoutId);
    }
    
    // Set the pickup timeout that will run regardless of component remounting
    pickupTimeoutId = setTimeout(() => {
      handlePickup();
    }, 3000);
    
    return () => {
      // Just clean up timers
      if (pickupTimeoutId) {
        clearTimeout(pickupTimeoutId);
        pickupTimeoutId = null;
      }
    };
  }, []);

  // Update countdown timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Audio setup in separate useEffect
  useEffect(() => {
    // Ringtone audio
    try {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
      // Futuristic hang up sound
      hangupAudioRef.current = new Audio('/sounds/call-end.mp3');
      
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        
        const playAudio = async () => {
          try {
            if (!isUnmounting.current && audioRef.current) {
              await audioRef.current.load();
              await audioRef.current.play();
            }
          } catch {
            // Error handling is silent, simulation continues
          }
        };
        
        playAudio();
      }
    } catch {
      // Error handling is silent
    }

    // Handle escape key
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Use the clean hangup function
        cleanHangup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up audio resources, but don't stop playing hangup sound
      if (audioRef.current) {
        try {
          const audio = audioRef.current;
          audioRef.current = null;
          audio.pause();
          audio.src = '';
          audio.load();
        } catch {
          // Silent error handling
        }
      }
      
      // Don't clean up hangup audio here as it needs to continue playing
      // The next component will handle creating a new audio instance
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[480px] space-y-8 rounded-3xl bg-gray-100 p-8 dark:bg-gray-800 flex flex-col justify-between" style={{ minHeight: '500px' }}>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* Logo at the top */}
          <div className="mb-4">
            <img 
              src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
              alt="WorldTune Logo" 
              className="h-16 w-16" 
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-4 animate-ping rounded-full bg-wise-green/50" />
              <div className="relative rounded-full bg-wise-green p-6">
                <Phone className="h-8 w-8 text-wise-forest" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-semibold text-wise-forest dark:text-wise-green">
              Calling...
            </p>
            <p className="mt-2 text-2xl font-medium text-wise-green">{phoneNumber}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Call will be answered in {countdown} {countdown === 1 ? 'second' : 'seconds'}
            </p>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={cleanHangup}
              className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-white transition-colors hover:bg-red-600 active:scale-95"
            >
              <PhoneOff className="h-6 w-6" />
              <span className="font-medium">End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};