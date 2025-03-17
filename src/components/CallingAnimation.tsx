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
    // Only proceed if we haven't already picked up
    if (hasGlobalPickupOccurred) {
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

  // Reset the global pickup flag when the component mounts for the first time
  useEffect(() => {
    hasGlobalPickupOccurred = false;
    
    // Clear any existing timeout from previous instances
    if (pickupTimeoutId) {
      clearTimeout(pickupTimeoutId);
    }
    
    // Set the pickup timeout that will run regardless of component remounting
    pickupTimeoutId = setTimeout(() => {
      handlePickup();
    }, 3000);
    
    return () => {
      // Do not set isUnmounting to true as it was causing issues
      // Just clean up timers
      if (pickupTimeoutId) {
        clearTimeout(pickupTimeoutId);
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
        if (hangupAudioRef.current) {
          try {
            await hangupAudioRef.current.play();
            // Wait for the hang-up sound to finish before closing
            setTimeout(onClose, 500);
          } catch {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up audio resources
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
      
      if (hangupAudioRef.current) {
        try {
          const hangupAudio = hangupAudioRef.current;
          hangupAudioRef.current = null;
          hangupAudio.pause();
          hangupAudio.src = '';
          hangupAudio.load();
        } catch {
          // Silent error handling
        }
      }
    };
  }, [onClose]);

  const handleEndCall = async () => {
    // Clear the pickup timeout when call is ended manually
    if (pickupTimeoutId) {
      clearTimeout(pickupTimeoutId);
      pickupTimeoutId = null;
    }
    
    if (hangupAudioRef.current) {
      try {
        await hangupAudioRef.current.play();
        // Wait for the hang-up sound to finish before closing
        setTimeout(onClose, 500);
      } catch {
        onClose();
      }
    } else {
      onClose();
    }
  };

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
              onClick={handleEndCall}
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