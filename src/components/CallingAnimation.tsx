import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface CallingAnimationProps {
  phoneNumber: string;
  onClose: () => void;
}

export const CallingAnimation: React.FC<CallingAnimationProps> = ({ phoneNumber, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hangupAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUnmounting = useRef(false);

  useEffect(() => {
    // Ringtone audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
    // Hang up sound
    hangupAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2309/2309-preview.mp3');
    
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
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
    }

    // Handle escape key
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hangupAudioRef.current) {
          try {
            await hangupAudioRef.current.play();
            // Wait for the hang-up sound to finish before closing
            setTimeout(onClose, 500);
          } catch (error) {
            console.error('Error playing hang-up sound:', error);
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isUnmounting.current = true;
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up audio resources
      if (audioRef.current) {
        const audio = audioRef.current;
        audioRef.current = null;
        audio.pause();
        audio.src = '';
        audio.load();
      }
      
      if (hangupAudioRef.current) {
        const hangupAudio = hangupAudioRef.current;
        hangupAudioRef.current = null;
        hangupAudio.pause();
        hangupAudio.src = '';
        hangupAudio.load();
      }
    };
  }, [onClose]);

  const handleEndCall = async () => {
    if (hangupAudioRef.current) {
      try {
        await hangupAudioRef.current.play();
        // Wait for the hang-up sound to finish before closing
        setTimeout(onClose, 500);
      } catch (error) {
        console.error('Error playing hang-up sound:', error);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[480px] space-y-8 rounded-3xl bg-white p-8 dark:bg-gray-800 flex flex-col justify-between" style={{ minHeight: '500px' }}>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* Logo at the top */}
          <div className="mb-4">
            <img 
              src="/logos/Worldtune_Icon.png" 
              alt="WorldTune Logo" 
              className="h-20 w-auto"
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                console.error("Image failed to load");
                const target = e.target as HTMLImageElement;
                target.src = "/logos/favicon.png"; // Fallback
              }}
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