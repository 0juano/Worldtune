import React from 'react';
import { AlertCircle, Headphones, Loader, MessageSquare, PhoneOff } from 'lucide-react';
import { cn } from '../utils/cn';

type AICallStatus = 'waiting' | 'connected' | 'ready-to-join' | 'ended';

interface AICallAssistantProps {
  phoneNumber: string;
  onJoin: () => void;
  onEnd: () => void;
}

export const AICallAssistant: React.FC<AICallAssistantProps> = ({
  phoneNumber,
  onJoin,
  onEnd,
}) => {
  const [status, setStatus] = React.useState<AICallStatus>('waiting');
  const [timeElapsed, setTimeElapsed] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
      // Simulate AI detecting human voice after 5 seconds
      if (timeElapsed === 5) {
        setStatus('ready-to-join');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                status === 'waiting' && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
                status === 'connected' && "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
                status === 'ready-to-join' && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
              )}
            >
              {status === 'waiting' && <Loader className="h-5 w-5 animate-spin" />}
              {status === 'connected' && <MessageSquare className="h-5 w-5" />}
              {status === 'ready-to-join' && <AlertCircle className="h-5 w-5 animate-pulse" />}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {status === 'waiting' && 'AI Assistant is waiting on the line...'}
                {status === 'connected' && 'Connected to service'}
                {status === 'ready-to-join' && 'Human detected - Ready to join!'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {phoneNumber} • {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {status === 'ready-to-join' && (
              <button
                onClick={onJoin}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 active:scale-95 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                <Headphones className="h-4 w-4" />
                Join Now
              </button>
            )}
            <button
              onClick={onEnd}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 active:scale-95"
            >
              <PhoneOff className="h-4 w-4" />
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};