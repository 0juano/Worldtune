import React, { useEffect, useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Number of items per page
const ITEMS_PER_PAGE = 5;

/**
 * CallHistory component displays a list of recent calls
 */
export const CallHistory: React.FC = () => {
  const { callHistory, loading, fetchCallHistory } = useCallHistory();
  const { navigateToDial } = useNavigationStore();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(callHistory.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return callHistory.slice(startIndex, endIndex);
  };

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Refresh call history when component mounts
  useEffect(() => {
    fetchCallHistory();
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

  // Handle call back - navigate to dial pad with the number
  const handleCallBack = (phoneNumber: string) => {
    navigateToDial(phoneNumber);
  };
  
  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-900">
      {/* Fixed header */}
      <div className="bg-gray-100 dark:bg-gray-900 pt-8 pb-4 px-4 sm:px-6 sm:pt-12 sticky top-0 z-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-medium text-wise-forest dark:text-wise-green text-center mb-2">
            Call History
          </h1>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
        <div className="mx-auto max-w-md">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-wise-green"></div>
            </div>
          ) : callHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12">
              <Clock className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-center text-gray-500 dark:text-gray-400">
                Your call history will appear here
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {getCurrentPageItems().map((call) => (
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
                          aria-label="Copy number to dial pad"
                          title="Copy number to dial pad"
                          onClick={() => handleCallBack(call.phoneNumber)}
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={cn(
                      "p-2 rounded-full",
                      currentPage === 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-wise-forest dark:text-wise-green hover:bg-gray-200 dark:hover:bg-gray-800"
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "p-2 rounded-full",
                      currentPage === totalPages 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-wise-forest dark:text-wise-green hover:bg-gray-200 dark:hover:bg-gray-800"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 