import React, { useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Bot } from 'lucide-react';
import { cn } from '../utils/cn';
import { useCallHistory, CallHistoryItem } from '../contexts/CallHistoryContext';
import { useNavigationStore } from '../store/useNavigationStore';

/**
 * Formats a duration in seconds to a readable format (mm:ss)
 */
const formatDuration = (seconds: number): string => {
  if (seconds === 0) return 'Missed';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a timestamp to a readable format
 */
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    // Today, show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    // Yesterday
    return 'Yesterday';
  } else {
    // Show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

/**
 * CallHistory component displays a list of recent calls
 */
export const CallHistory: React.FC = () => {
  const { callHistory, loading, fetchCallHistory } = useCallHistory();
  const { navigateToDial } = useNavigationStore();

  // Refresh call history when component mounts
  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);
  
  const getCallIcon = (type: CallHistoryItem['type']) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing':
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case 'ai':
        return <Bot className="h-4 w-4 text-purple-500" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  // Handle call back - navigate to dial pad with the number
  const handleCallBack = (phoneNumber: string) => {
    navigateToDial(phoneNumber);
  };
  
  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto flex max-w-md flex-col items-center w-full px-4 py-8 sm:px-6 sm:py-12">
        <div className="h-24 flex flex-col justify-end w-full mb-8">
          <div className="w-full text-center">
            <h1 className="text-3xl font-medium text-gray-400 dark:text-gray-600 sm:text-4xl">
              Call History
            </h1>
          </div>
        </div>
      
        <div className="w-full overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-wise-green"></div>
            </div>
          ) : callHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Clock className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-center text-gray-500 dark:text-gray-400">
                Your call history will appear here
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {callHistory.map((call) => (
                <li 
                  key={call.id}
                  className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn(
                        "mr-3 flex h-10 w-10 items-center justify-center rounded-full",
                        call.type === 'incoming' && "bg-green-100 dark:bg-green-900/30",
                        call.type === 'outgoing' && "bg-blue-100 dark:bg-blue-900/30",
                        call.type === 'missed' && "bg-red-100 dark:bg-red-900/30",
                        call.type === 'ai' && "bg-purple-100 dark:bg-purple-900/30"
                      )}>
                        {getCallIcon(call.type)}
                      </div>
                      <div>
                        <p className="font-medium">{call.phoneNumber}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {getCallIcon(call.type)}
                          <span className="ml-1">
                            {call.type.charAt(0).toUpperCase() + call.type.slice(1)} • {formatTimestamp(call.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDuration(call.duration)}
                      </p>
                      <button 
                        className="mt-1 rounded-full bg-green-100 p-2 text-green-600 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900"
                        aria-label="Call back"
                        onClick={() => handleCallBack(call.phoneNumber)}
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}; 