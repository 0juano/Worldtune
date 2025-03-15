import React, { useState, useRef, useEffect } from 'react';
import { Phone, Bot, MessageSquare, Coins, Delete, PhoneOff } from 'lucide-react';
import { cn } from '../utils/cn';
import { AICallAssistant } from './AICallAssistant';
import { AddCredits } from './AddCredits';
import { useCreditsStore } from '../store/useCreditsStore';
import { CallingAnimation } from './CallingAnimation';

// Create a single AudioContext instance
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

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
  const { credits, decrementCredits } = useCreditsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const justAddedPlusRef = useRef(false);

  // Call timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isCallActive && callStartTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - callStartTime.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffSec / 60).toString().padStart(2, '0');
        const seconds = (diffSec % 60).toString().padStart(2, '0');
        setCallDuration(`${minutes}:${seconds}`);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCallActive, callStartTime]);

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

  const playDTMFTone = (key: string) => {
    const buffer = createDTMFTone(key);
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const handleDigitPress = (digit: string) => {
    // Skip if we just added a plus sign (to prevent 0 from being added after +)
    if (justAddedPlusRef.current && digit === '0') {
      justAddedPlusRef.current = false;
      return;
    }
    
    playDTMFTone(digit);
    setNumber(prev => prev + digit);
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
      
      // Simulate call being answered after 3 seconds
      setTimeout(() => {
        setIsCalling(false);
        setIsCallActive(true);
        setCallStartTime(new Date());
        decrementCredits();
      }, 3000);
    }
  };

  const handleStartAICall = () => {
    if (credits <= 0) {
      setShowAddCredits(true);
      setShowPromptInput(false);
      return;
    }

    setShowPromptInput(false);
    setAiWaiting(true);
    decrementCredits();
  };

  const handleJoinCall = () => {
    setAiWaiting(false);
    setIsCallActive(true);
    setCallStartTime(new Date());
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallStartTime(null);
    setCallDuration('00:00');
    setIsCalling(false);
    setAiWaiting(false);
    setNumber(''); // Reset the number when hanging up
  };

  const DialButton: React.FC<{ digit: string; letters?: string }> = ({ digit, letters }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);

    const handleMouseDown = () => {
      if (digit !== '0' || !letters || letters !== '+') return;
      
      isLongPressRef.current = false;
      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        playDTMFTone('+');
        setNumber(prev => prev + '+');
        justAddedPlusRef.current = true;
        
        // Reset the flag after a delay
        setTimeout(() => {
          justAddedPlusRef.current = false;
        }, 500);
      }, 800); // 800ms for long press
    };

    const handleMouseUp = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (!isLongPressRef.current && digit === '0') {
        handleDigitPress(digit);
      }
    };

    return (
      <button
        ref={buttonRef}
        onMouseDown={digit === '0' && letters === '+' ? handleMouseDown : undefined}
        onMouseUp={digit === '0' && letters === '+' ? handleMouseUp : undefined}
        onTouchStart={digit === '0' && letters === '+' ? handleMouseDown : undefined}
        onTouchEnd={digit === '0' && letters === '+' ? handleMouseUp : undefined}
        onClick={digit === '0' && letters === '+' ? undefined : () => handleDigitPress(digit)}
        className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white text-wise-forest shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:bg-gray-800 dark:text-wise-green dark:hover:bg-gray-700 focus-ring"
      >
        <span className="text-2xl font-medium">{digit}</span>
        {letters && <span className="text-xs text-gray-500 dark:text-gray-400">{letters}</span>}
      </button>
    );
  };

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

    return (
      <button
        ref={buttonRef}
        onClick={onLongPress ? undefined : onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={cn(
          "flex h-16 w-16 flex-col items-center justify-center rounded-full transition-all active:scale-95 focus-ring",
          color
        )}
        aria-label={label}
      >
        {icon}
      </button>
    );
  };

  return (
    <>
      <div ref={containerRef} className="mx-auto flex max-w-md flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        {/* Fixed height container for timer and number display */}
        <div className="h-24 flex flex-col justify-end w-full mb-8">
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

        <div className="mb-4 grid grid-cols-3 gap-4 sm:gap-6">
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

        <div className="mb-8 grid grid-cols-3 gap-4 sm:gap-6">
          <ActionButton
            onClick={() => handleCall('ai')}
            icon={<Bot className="h-6 w-6" />}
            color="bg-wise-blue text-wise-forest hover:bg-wise-blue/90 dark:bg-wise-blue/80 dark:text-wise-forest dark:hover:bg-wise-blue/70"
            label="AI Assistant call"
          />
          {isCallActive ? (
            <ActionButton
              onClick={handleEndCall}
              icon={<PhoneOff className="h-6 w-6" />}
              color="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
              label="End call"
            />
          ) : (
            <ActionButton
              onClick={() => handleCall('audio')}
              icon={<Phone className="h-6 w-6" />}
              color="bg-wise-green text-wise-forest hover:bg-wise-green/90 dark:bg-wise-green/80 dark:text-wise-forest dark:hover:bg-wise-green/70"
              label="Audio call"
            />
          )}
          <ActionButton
            onClick={handleDelete}
            icon={<Delete className="h-6 w-6" />}
            color="bg-wise-pink/20 text-wise-forest hover:bg-wise-pink/30 dark:bg-wise-pink/10 dark:text-wise-pink dark:hover:bg-wise-pink/20"
            label="Delete"
            onLongPress={() => true}
          />
        </div>

        {/* Credits pill centered below all buttons */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAddCredits(true)}
            className="flex items-center gap-2 rounded-full bg-wise-green/20 px-4 py-2 text-sm font-medium text-wise-forest transition-colors hover:bg-wise-green/30 dark:bg-wise-green/10 dark:text-wise-green dark:hover:bg-wise-green/20"
          >
            <Coins className="h-4 w-4" />
            {credits} Credits
          </button>
        </div>
      </div>

      {showPromptInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-4xl bg-white p-6 shadow-xl dark:bg-gray-800">
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
      )}

      {showAddCredits && <AddCredits onClose={() => setShowAddCredits(false)} />}

      {aiWaiting && (
        <AICallAssistant
          phoneNumber={number}
          onJoin={handleJoinCall}
          onEnd={handleEndCall}
        />
      )}

      {isCalling && (
        <CallingAnimation
          phoneNumber={number}
          onClose={() => setIsCalling(false)}
        />
      )}
    </>
  );
};