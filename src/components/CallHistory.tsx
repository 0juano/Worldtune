import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Bot } from 'lucide-react';
import { cn } from '../utils/cn';

// Define the call history item type
interface CallHistoryItem {
  id: string;
  phoneNumber: string;
  timestamp: Date;
  duration: number; // in seconds
  type: 'incoming' | 'outgoing' | 'missed' | 'ai';
}

// Mock data for demonstration
const mockCallHistory: CallHistoryItem[] = [
  {
    id: '1',
    phoneNumber: '+1 (555) 123-4567',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    duration: 125, // 2 minutes 5 seconds
    type: 'outgoing',
  },
  {
    id: '2',
    phoneNumber: '+1 (555) 987-6543',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    duration: 45, // 45 seconds
    type: 'incoming',
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 456-7890',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    duration: 0, // 0 seconds (missed)
    type: 'missed',
  },
  {
    id: '4',
    phoneNumber: 'AI Assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    duration: 180, // 3 minutes
    type: 'ai',
  },
];

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
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(mockCallHistory);
  
  // In a real app, you would fetch the call history from an API or local storage
  useEffect(() => {
    // This would be replaced with an actual API call
    setCallHistory(mockCallHistory);
  }, []);
  
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
  
  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
        <h1 className="text-xl font-bold">Call History</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        {callHistory.length === 0 ? (
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
  );
}; 