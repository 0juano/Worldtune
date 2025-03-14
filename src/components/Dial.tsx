import React, { useState, useRef, useEffect } from 'react';
import { Phone, Bot, MessageSquare, Coins, Delete } from 'lucide-react';
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

export const Dial = () => {
  const [number, setNumber] = useState('');
  const [aiWaiting, setAiWaiting] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const deleteTimer = useRef<NodeJS.Timeout>();
  const numberRef = useRef<HTMLInputElement>(null);
  const dtmfTones = useRef<Record<string, AudioBuffer>>({});
  const [aiPrompt, setAiPrompt] = useState(
    "Please hold on line for me, speak English, tell them I am looking for my airpods"
  );
  const { credits } = useCreditsStore();
  
  useEffect(() => {
    // Initialize DTMF tones for all keys
    Object.keys(DTMF_FREQUENCIES).forEach(key => {
      const buffer = createDTMFTone(key);
      if (buffer) {
        dtmfTones.current[key] = buffer;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (numberRef.current) {
      observer.observe(numberRef.current);
    }

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        handleDelete();
        return;
      }
      
      if (e.key === '+' && number === '') {
        setNumber('+');
        playDTMFTone('+');
        return;
      }

      if (/^[0-9#*]$/.test(e.key)) {
        handleNumberClick(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [number]);

  const playDTMFTone = (key: string) => {
    const buffer = dtmfTones.current[key];
    if (buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      source.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleNumberClick = (digit: string) => {
    playDTMFTone(digit);
    setNumber(prev => {
      // Only allow '+' at the beginning
      if (digit === '+' && prev !== '') {
        return prev;
      }
      
      const newNumber = prev + digit;
      // Add animation class to the container
      const container = numberRef.current;
      if (container) {
        container.classList.remove('number-added');
        // Force reflow
        void container.offsetWidth;
        container.classList.add('number-added');
      }
      return newNumber;
    });
  };

  const handleDelete = () => {
    playDTMFTone('*'); // Use * tone for delete
    setNumber(prev => {
      const container = numberRef.current;
      if (container) {
        container.classList.remove('number-deleted');
        // Force reflow
        void container.offsetWidth;
        container.classList.add('number-deleted');
      }
      return prev.slice(0, -1);
    });
  };

  const handleCall = (type: 'audio' | 'ai') => {
    if (type === 'ai') {
      setShowPromptInput(true);
      return;
    }
    if (type === 'audio') {
      setIsCalling(true);
    }
    console.log(`Initiating ${type} call to ${number}`);
  };

  const handleStartAICall = () => {
    setShowPromptInput(false);
    setAiWaiting(true);
    console.log('AI Prompt:', aiPrompt);
  };

  const handleJoinCall = () => {
    console.log('Joining call...');
    setAiWaiting(false);
  };

  const handleEndCall = () => {
    console.log('Ending call...');
    setAiWaiting(false);
  };

  const handleLongPressStart = (type: 'zero' | 'delete') => {
    if (type === 'zero' && number === '') {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        setNumber('+');
        playDTMFTone('+');
      }, 500);
    } else if (type === 'delete') {
      deleteTimer.current = setTimeout(() => {
        setNumber('');
        playDTMFTone('*');
      }, 500);
    }
  };

  const handleLongPressEnd = (type: 'zero' | 'delete') => {
    if (type === 'zero') {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      setIsLongPressing(false);
    } else {
      if (deleteTimer.current) {
        clearTimeout(deleteTimer.current);
      }
    }
  };

  const DialButton: React.FC<{ digit: string; letters?: string }> = ({ digit, letters }) => (
    <button
      onClick={() => !isLongPressing && handleNumberClick(digit)}
      onMouseDown={digit === '0' ? () => handleLongPressStart('zero') : undefined}
      onMouseUp={digit === '0' ? () => handleLongPressEnd('zero') : undefined}
      onMouseLeave={digit === '0' ? () => handleLongPressEnd('zero') : undefined}
      onTouchStart={digit === '0' ? () => handleLongPressStart('zero') : undefined}
      onTouchEnd={digit === '0' ? () => handleLongPressEnd('zero') : undefined}
      className="relative h-16 w-16 rounded-full bg-white text-center transition-all hover:bg-wise-green/10 active:scale-95 dark:bg-gray-800/50 dark:hover:bg-wise-green/20 sm:h-20 sm:w-20 focus-ring"
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-2xl font-medium text-wise-forest dark:text-wise-green">
          {isLongPressing && digit === '0' ? '+' : digit}
        </span>
        {letters && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {letters}
          </span>
        )}
      </div>
    </button>
  );

  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    color: string;
    label: string;
    onLongPress?: () => void;
  }> = ({ onClick, icon, color, label, onLongPress }) => (
    <button
      onClick={onClick}
      onMouseDown={onLongPress ? () => handleLongPressStart('delete') : undefined}
      onMouseUp={onLongPress ? () => handleLongPressEnd('delete') : undefined}
      onMouseLeave={onLongPress ? () => handleLongPressEnd('delete') : undefined}
      onTouchStart={onLongPress ? () => handleLongPressStart('delete') : undefined}
      onTouchEnd={onLongPress ? () => handleLongPressEnd('delete') : undefined}
      className={cn(
        "relative h-16 w-16 rounded-full transition-all active:scale-95 sm:h-20 sm:w-20 focus-ring",
        number
          ? color
          : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
      )}
      disabled={!number}
      aria-label={label}
    >
      <div className="flex items-center justify-center">
        {icon}
      </div>
    </button>
  );

  return (
    <>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 w-full">
          <div 
            ref={numberRef}
            className="animated-number-container w-full text-center"
          >
            {number.split('').map((digit, index) => (
              <span 
                key={index} 
                className="animated-number inline-block text-3xl font-medium text-wise-forest dark:text-wise-green sm:text-4xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {digit}
              </span>
            ))}
            {!number && (
              <span className="text-3xl font-medium text-gray-400 dark:text-gray-600 sm:text-4xl">
                Enter a number
              </span>
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4 sm:gap-6">
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
          <ActionButton
            onClick={() => handleCall('audio')}
            icon={<Phone className="h-6 w-6" />}
            color="bg-wise-green text-wise-forest hover:bg-wise-green/90 dark:bg-wise-green/80 dark:text-wise-forest dark:hover:bg-wise-green/70"
            label="Audio call"
          />
          <ActionButton
            onClick={handleDelete}
            icon={<Delete className="h-6 w-6" />}
            color="bg-wise-pink/20 text-wise-forest hover:bg-wise-pink/30 dark:bg-wise-pink/10 dark:text-wise-pink dark:hover:bg-wise-pink/20"
            label="Delete"
            onLongPress={() => true}
          />
        </div>

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