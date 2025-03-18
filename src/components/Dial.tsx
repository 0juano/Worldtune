import React, { useState, useRef, useEffect } from 'react';
import { Phone, MessageSquare, Coins, Delete, PhoneOff, Mic, MicOff } from 'lucide-react';
import { cn } from '../utils/cn';
import { AICallAssistant } from './AICallAssistant';
import { AddCredits } from './AddCredits';
import { useCreditsStore } from '../store/useCreditsStore';
import { CallingAnimation } from './CallingAnimation';
import { useCallHistory } from '../contexts/CallHistoryContext';
import { useNavigationStore } from '../store/useNavigationStore';
import { useDialStore } from '../store/useDialStore';

// Create a single AudioContext instance
// Using type assertion to handle the webkitAudioContext
const AudioContextClass = window.AudioContext || 
  ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
const audioContext = new AudioContextClass();

// DTMF frequency pairs for each key
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
  '+': [697, 1633], // Special case for the plus symbol
};

// Create DTMF tone
const createDTMFTone = (key: string) => {
  const frequencies = DTMF_FREQUENCIES[key];
  if (!frequencies) return null;

  const duration = 0.1;
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate dual-tone signal
  for (let i = 0; i < bufferSize; i++) {
    // Combine both frequencies with equal amplitude
    data[i] = 0.3 * (
      Math.sin(2 * Math.PI * frequencies[0] * i / sampleRate) +
      Math.sin(2 * Math.PI * frequencies[1] * i / sampleRate)
    );
  }

  // Apply a simple envelope to avoid clicks
  const fadeLength = sampleRate * 0.005; // 5ms fade
  for (let i = 0; i < fadeLength; i++) {
    // Fade in
    data[i] *= i / fadeLength;
    // Fade out
    data[bufferSize - 1 - i] *= i / fadeLength;
  }

  return buffer;
};

export const Dial: React.FC = () => {
  const [number, setNumber] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiWaiting, setAiWaiting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState('00:00');
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { credits, decrementCredits, getUSDValue } = useCreditsStore();
  const { addCall } = useCallHistory();
  const { dialInitialNumber } = useNavigationStore();
  const { centerOffset, setCenterOffset } = useDialStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const endCallSoundRef = useRef<HTMLAudioElement | null>(null);

  // Calculate the precise offset needed for the modal to match the numpad
  useEffect(() => {
    const updateOffset = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Calculate centers
        const numpadCenterX = rect.left + rect.width / 2;
        const viewportCenterX = viewportWidth / 2;
        
        // Calculate the offset - this is how much we need to shift modals to match numpad center
        const offset = numpadCenterX - viewportCenterX;
        
        setCenterOffset({
          left: offset,
          width: rect.width
        });
      }
    };
    
    // Update immediately, on resize, and after a short delay to ensure layout is complete
    updateOffset();
    
    // Schedule another update after layout is fully complete
    const timeoutId = setTimeout(updateOffset, 500);
    
    // Add resize listener
    window.addEventListener('resize', updateOffset);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateOffset);
    };
  }, [setCenterOffset]);

  // Call timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let lastMinutes = '00';
    let lastSeconds = '00';
    
    if (isCallActive && callStartTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - callStartTime.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffSec / 60).toString().padStart(2, '0');
        const seconds = (diffSec % 60).toString().padStart(2, '0');
        
        // Only update the state if the time has actually changed
        // This prevents unnecessary re-renders
        if (minutes !== lastMinutes || seconds !== lastSeconds) {
          lastMinutes = minutes;
          lastSeconds = seconds;
          setCallDuration(`${minutes}:${seconds}`);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCallActive, callStartTime]);
  
  // Set initial number from navigation (when returning from call history)
  useEffect(() => {
    if (dialInitialNumber && !isCallActive) {
      // Set the number from navigation but don't auto-start the call
      setNumber(dialInitialNumber);
    }
  }, [dialInitialNumber, isCallActive]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we're not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle numeric keys, *, #
      if (/^[0-9*#]$/.test(e.key)) {
        handleDigitPress(e.key);
      } 
      // Handle + (Shift + =)
      else if (e.key === '+') {
        handleDigitPress('+');
      }
      // Handle backspace/delete
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      }
      // Handle Enter key for making a call
      else if (e.key === 'Enter' && number.length > 0 && !isCallActive) {
        handleCall('audio');
      }
      // Handle Escape key for ending a call
      else if (e.key === 'Escape' && isCallActive) {
        handleEndCall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [number, isCallActive]); // Re-add event listener when these dependencies change

  // Set up microphone functionality when call is active
  useEffect(() => {
    // Only request microphone access when a call is active
    if (isCallActive) {
      const setupMicrophone = async () => {
        try {
          // Request microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          
          // Get the audio track
          audioTrackRef.current = stream.getAudioTracks()[0];
          
          // Apply initial mute state
          if (audioTrackRef.current) {
            audioTrackRef.current.enabled = !isMuted;
          }
        } catch (error) {
          console.error('Error accessing microphone:', error);
        }
      };
      
      setupMicrophone();
    }
    
    // Clean up when call ends
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
        audioTrackRef.current = null;
      }
    };
  }, [isCallActive]);

  // Initialize the end call sound
  useEffect(() => {
    // Create audio element for the end call sound
    endCallSoundRef.current = new Audio('/sounds/call-end.mp3');
    
    // Clean up when component unmounts
    return () => {
      if (endCallSoundRef.current) {
        endCallSoundRef.current.pause();
        endCallSoundRef.current.src = '';
        endCallSoundRef.current = null;
      }
    };
  }, []);

  const playDTMFTone = (key: string) => {
    const buffer = createDTMFTone(key);
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const handleDigitPress = (digit: string) => {
    playDTMFTone(digit);
    
    setNumber(prev => {
      // Check if adding this digit would create or continue a number starting with '00'
      const newNumber = prev + digit;
      
      // If the number starts with '00', replace it with '+'
      if (newNumber.startsWith('00')) {
        return '+' + newNumber.substring(2);
      }
      
      return newNumber;
    });
  };

  const handleDelete = () => {
    if (number.length > 0) {
      setNumber(prev => prev.slice(0, -1));
    }
  };

  const handleCall = (type: 'audio' | 'ai') => {
    if (number.length === 0) return;
    
    if (isCallActive) {
      // End the call
      handleEndCall();
      return;
    }

    if (type === 'ai') {
      setShowPromptInput(true);
    } else {
      // Check if we have enough credits
      if (credits <= 0) {
        setShowAddCredits(true);
        return;
      }
      
      // Start the call
      setIsCalling(true);
      
      // Record the outgoing call in history immediately
      addCall(number, 0, 'outgoing');
    }
  };

  const handleStartAICall = () => {
    // Check if we have enough credits
    if (credits <= 0) {
      setShowAddCredits(true);
      setShowPromptInput(false);
      return;
    }
    
    setShowPromptInput(false);
    setAiWaiting(true);
    
    // Record the AI call in history immediately
    addCall('AI Assistant', 0, 'ai');
  };

  const handleJoinCall = () => {
    decrementCredits();
    setIsCallActive(true);
    setCallStartTime(new Date());
    
    // For AI calls, record immediately
    if (aiWaiting) {
      // Record AI call in history
      addCall('AI Assistant', 0, 'ai');
    }
  };

  const handleEndCall = async () => {
    // Play the futuristic end call sound
    if (endCallSoundRef.current) {
      try {
        endCallSoundRef.current.currentTime = 0;
        await endCallSoundRef.current.play();
      } catch (error) {
        console.error('Error playing end call sound:', error);
      }
    }
    
    // Calculate call duration in seconds
    let durationInSeconds = 0;
    if (callStartTime) {
      const now = new Date();
      durationInSeconds = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
    }
    
    // Add the call to history only if it was active and lasted more than 0 seconds
    // This avoids duplicate entries since we're now recording calls at the start too
    if (isCallActive && durationInSeconds > 0) {
      // Determine call type based on internal state
      const callType = aiWaiting ? 'ai' : 'outgoing'; // We only support outgoing calls for now
      
      // Only record if there's a number or if it's an AI call
      if (number || callType === 'ai') {
        addCall(number || 'Unknown', durationInSeconds, callType);
      }
    }
    
    setIsCallActive(false);
    setCallStartTime(null);
    setCallDuration('00:00');
    setIsCalling(false);
    setAiWaiting(false);
    setNumber(''); // Reset the number when hanging up
    
    // Clean up microphone when call ends
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
      audioTrackRef.current = null;
    }
  };

  const handleCallPickup = () => {
    // First hide the calling animation to ensure it's gone
    setIsCalling(false);
    
    // Immediately set the call to active to avoid timing issues
    setIsCallActive(true);
    setCallStartTime(new Date());
    
    // Decrement credits for the call
    decrementCredits();
    
    // Record the call in history
    addCall(number, 0, 'outgoing');
  };

  // Toggle microphone mute/unmute
  const toggleMute = () => {
    // Get the next mute state (opposite of current)
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    
    // Actually mute/unmute the microphone if we have access to it
    if (audioTrackRef.current) {
      // Enable the track when NOT muted
      audioTrackRef.current.enabled = !nextMuteState;
    } else if (isCallActive) {
      // If the call is active but we don't have the audio track, try to get it again
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micStreamRef.current = stream;
          audioTrackRef.current = stream.getAudioTracks()[0];
          if (audioTrackRef.current) {
            audioTrackRef.current.enabled = !nextMuteState;
          }
        })
        .catch(() => {
          // Handle error silently
        });
    }
  };

  // Dial button component
  const DialButton: React.FC<{ digit: string; letters?: string }> = ({ digit, letters }) => {
    const [isLongPress, setIsLongPress] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault(); // Prevent default to stop text selection
      
      if (digit === '0' && letters === '+') {
        longPressTimer.current = setTimeout(() => {
          setIsLongPress(true);
          playDTMFTone('+');
          setNumber(prev => prev + '+');
        }, 800);
      }
    };
    
    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (!isLongPress && digit === '0') {
        handleDigitPress('0');
      }
      
      setIsLongPress(false);
    };
    
    const handleClick = () => {
      // Only handle click for non-zero buttons or if not on mobile
      if (digit !== '0' || !('ontouchstart' in window)) {
        handleDigitPress(digit);
      }
    };

    return (
      <button
        className="flex h-20 w-20 select-none flex-col items-center justify-center rounded-full bg-white text-wise-forest shadow-sm dark:bg-gray-800 dark:text-wise-green focus-ring touch-manipulation"
        style={{ transform: 'scale(1)' }}
        onClick={handleClick}
        onTouchStart={digit === '0' && letters === '+' ? handleTouchStart : undefined}
        onTouchEnd={digit === '0' && letters === '+' ? handleTouchEnd : undefined}
      >
        <span className="text-2xl font-medium">{digit}</span>
        {letters && <span className="text-xs text-gray-500 dark:text-gray-400">{letters}</span>}
      </button>
    );
  };

  // Action button component
  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    color: string;
    label: string;
    onLongPress?: () => boolean;
  }> = ({ onClick, icon, color, label, onLongPress }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);
    const touchActivatedRef = useRef(false);

    const handleMouseDown = () => {
      if (!onLongPress) return;
      
      isLongPressRef.current = false;
      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        setNumber('');
      }, 1000);
    };

    const handleMouseUp = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (!isLongPressRef.current) {
        onClick();
      }
    };
    
    const handleTouchStart = () => {
      // Mark that the button was activated by touch
      touchActivatedRef.current = true;
      
      // Call the existing handler
      handleMouseDown();
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
      // Prevent the click event from firing
      e.preventDefault();
      
      // Call the existing handler
      handleMouseUp();
      
      // Reset the touch activated flag after a short delay
      setTimeout(() => {
        touchActivatedRef.current = false;
      }, 300);
    };
    
    const handleClick = (e: React.MouseEvent) => {
      // If the button was activated by touch, prevent the click handler from firing
      if (touchActivatedRef.current) {
        e.preventDefault();
        return;
      }
      
      // Only execute onClick if onLongPress isn't defined
      // (matching the original behavior)
      if (!onLongPress) {
        onClick();
      }
    };

    // Extract base color classes without hover effects
    const baseClasses = color.split(' ').filter(cls => !cls.startsWith('hover:') && !cls.startsWith('dark:hover:')).join(' ');

    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseDown={onLongPress ? handleMouseDown : undefined}
        onMouseUp={onLongPress ? handleMouseUp : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "flex h-20 w-20 flex-col items-center justify-center rounded-full focus-ring select-none touch-manipulation",
          baseClasses
        )}
        style={{ 
          transform: 'scale(1)',
          transformOrigin: 'center',
          willChange: 'transform'
        }}
        aria-label={label}
      >
        {icon}
      </button>
    );
  };

  return (
    <>
      <div ref={containerRef} className="mx-auto flex max-w-md flex-col items-center px-4 pt-2 pb-6 sm:px-6 sm:pt-4 sm:pb-8 relative -top-4 sm:-top-6">
        {/* Fixed height container for timer and number display */}
        <div className="h-24 flex flex-col justify-end w-full mb-5">
          {/* Call timer display when call is active */}
          {isCallActive && (
            <div className="mb-4 flex items-center justify-center rounded-full bg-wise-green/20 px-4 py-2 w-fit mx-auto">
              <span className="text-lg font-medium text-wise-forest dark:text-wise-green">
                {callDuration}
              </span>
            </div>
          )}
          
          {/* Number display */}
          <div className="w-full text-center">
            {number ? (
              <div className="text-3xl font-medium text-wise-forest dark:text-wise-green sm:text-4xl">
                {number}
              </div>
            ) : (
              <div className="text-3xl font-medium text-gray-400 dark:text-gray-600 sm:text-4xl">
                Enter a number
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-4 sm:gap-6">
          <DialButton digit="1" />
          <DialButton digit="2" letters="ABC" />
          <DialButton digit="3" letters="DEF" />
          <DialButton digit="4" letters="GHI" />
          <DialButton digit="5" letters="JKL" />
          <DialButton digit="6" letters="MNO" />
          <DialButton digit="7" letters="PQRS" />
          <DialButton digit="8" letters="TUV" />
          <DialButton digit="9" letters="WXYZ" />
          <DialButton digit="*" />
          <DialButton digit="0" letters="+" />
          <DialButton digit="#" />
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4 sm:gap-6">
          {isCallActive && (
            <ActionButton
              onClick={toggleMute}
              icon={isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              color={isMuted 
                ? "bg-blue-700 text-white dark:bg-wise-blue/60 dark:text-white"
                : "bg-wise-blue text-wise-forest dark:bg-wise-blue/80 dark:text-wise-forest"
              }
              label={isMuted ? "Unmute microphone" : "Mute microphone"}
            />
          )}
          {!isCallActive && (
            <div></div> // Empty placeholder when mute button is not shown
          )}
          {isCallActive ? (
            <ActionButton
              onClick={handleEndCall}
              icon={<PhoneOff className="h-6 w-6" />}
              color="bg-red-500 text-white dark:bg-red-600 dark:text-white"
              label="End call"
            />
          ) : (
            <ActionButton
              onClick={() => handleCall('audio')}
              icon={<Phone className="h-6 w-6" />}
              color="bg-wise-green text-wise-forest dark:bg-wise-green/80 dark:text-wise-forest"
              label="Audio call"
            />
          )}
          {number.length > 0 && (
            <ActionButton
              onClick={handleDelete}
              icon={<Delete className="h-6 w-6" />}
              color="bg-red-200 text-red-700 dark:bg-wise-pink/10 dark:text-wise-pink"
              label="Delete"
              onLongPress={() => true}
            />
          )}
          {number.length === 0 && (
            <div></div> // Empty placeholder when delete button is not shown
          )}
        </div>

        {/* Credits pill centered below all buttons */}
        <div className="flex justify-center mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event from bubbling up to parent elements
              setShowAddCredits(true);
            }}
            className="flex items-center gap-2 rounded-full bg-wise-green/20 px-4 py-2 text-sm font-medium text-wise-forest transition-colors hover:bg-wise-green/30 dark:bg-wise-green/10 dark:text-wise-green dark:hover:bg-wise-green/20 select-none relative z-10"
          >
            <Coins className="h-4 w-4" />
            USD {getUSDValue()}
          </button>
        </div>
      </div>

      {showPromptInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            className="px-4 sm:px-6"
            style={{
              transform: `translateX(${centerOffset.left}px)`,
              width: centerOffset.width > 0 ? centerOffset.width : '100%',
              maxWidth: '480px'
            }}
          >
            <div className="w-full overflow-hidden rounded-4xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-wise-forest dark:text-wise-green">
                <MessageSquare className="h-5 w-5" />
                AI Assistant Instructions
              </h2>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mb-4 h-32 w-full rounded-2xl border border-gray-200 bg-white p-3 text-wise-forest focus:border-wise-green focus:outline-none focus:ring-1 focus:ring-wise-green dark:border-gray-700 dark:bg-gray-700 dark:text-wise-green"
                placeholder="Enter instructions for the AI assistant..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPromptInput(false)}
                  className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-wise-forest hover:bg-gray-200 dark:bg-gray-700 dark:text-wise-green dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAICall}
                  className="rounded-2xl bg-wise-green px-4 py-2 text-sm font-medium text-wise-forest hover:bg-wise-green/90 dark:bg-wise-green/80 dark:hover:bg-wise-green/70"
                >
                  Start AI Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCredits && (
        <AddCredits onClose={() => setShowAddCredits(false)} />
      )}

      {aiWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            className="px-4 sm:px-6"
            style={{
              transform: `translateX(${centerOffset.left}px)`,
              width: centerOffset.width > 0 ? centerOffset.width : '100%',
              maxWidth: '480px'
            }}
          >
            <AICallAssistant
              phoneNumber={number}
              onJoin={handleJoinCall}
              onEnd={handleEndCall}
            />
          </div>
        </div>
      )}

      {isCalling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            className="px-4 sm:px-6"
            style={{
              transform: `translateX(${centerOffset.left}px)`,
              width: centerOffset.width > 0 ? centerOffset.width : '100%',
              maxWidth: '480px'
            }}
          >
            <CallingAnimation
              phoneNumber={number}
              onClose={() => {
                setIsCalling(false);
              }}
              onPickup={() => {
                handleCallPickup();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};