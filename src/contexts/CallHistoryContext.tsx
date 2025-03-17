import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Call history item type
export interface CallHistoryItem {
  id: string;
  phoneNumber: string;
  timestamp: Date;
  duration: number; // in seconds
  type: 'incoming' | 'outgoing' | 'missed' | 'ai';
  userId: string;
}

// Local storage key
const CALL_HISTORY_STORAGE_KEY = 'worldtune_call_history';

// Generate mock data for initial state
const generateMockData = (userId: string): CallHistoryItem[] => [
  {
    id: '1',
    phoneNumber: '+1 (555) 123-4567',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    duration: 125, // 2 minutes 5 seconds
    type: 'outgoing',
    userId
  },
  {
    id: '2',
    phoneNumber: '+1 (555) 987-6543',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    duration: 45, // 45 seconds
    type: 'incoming',
    userId
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 456-7890',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    duration: 0, // 0 seconds (missed)
    type: 'missed',
    userId
  },
  {
    id: '4',
    phoneNumber: 'AI Assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    duration: 180, // 3 minutes
    type: 'ai',
    userId
  }
];

// Context interface
interface CallHistoryContextType {
  callHistory: CallHistoryItem[];
  loading: boolean;
  addCall: (
    phoneNumber: string, 
    duration: number, 
    type: 'incoming' | 'outgoing' | 'missed' | 'ai'
  ) => void;
  fetchCallHistory: () => void;
}

// Create context with default values
const CallHistoryContext = createContext<CallHistoryContextType>({
  callHistory: [],
  loading: false,
  addCall: () => {},
  fetchCallHistory: () => {}
});

// Custom hook to use call history context
export const useCallHistory = () => useContext(CallHistoryContext);

// Helper function to save to localStorage
const saveToLocalStorage = (userId: string, calls: CallHistoryItem[]) => {
  try {
    // Store call history per user
    const storageData = JSON.parse(localStorage.getItem(CALL_HISTORY_STORAGE_KEY) || '{}');
    storageData[userId] = calls;
    localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Helper function to load from localStorage
const loadFromLocalStorage = (userId: string): CallHistoryItem[] => {
  try {
    const storageData = JSON.parse(localStorage.getItem(CALL_HISTORY_STORAGE_KEY) || '{}');
    const userCalls = storageData[userId] || [];
    
    // If no calls exist yet, use mock data
    if (userCalls.length === 0) {
      const mockData = generateMockData(userId);
      saveToLocalStorage(userId, mockData);
      return mockData;
    }
    
    // Convert string timestamps back to Date objects
    return userCalls.map((call: any) => ({
      ...call,
      timestamp: new Date(call.timestamp)
    }));
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return generateMockData(userId);
  }
};

// Provider component
export const CallHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch call history for the current user
  const fetchCallHistory = () => {
    if (!currentUser) {
      setCallHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const calls = loadFromLocalStorage(currentUser.uid);
    setCallHistory(calls);
    setLoading(false);
  };

  // Add a new call to history
  const addCall = (
    phoneNumber: string, 
    duration: number, 
    type: 'incoming' | 'outgoing' | 'missed' | 'ai'
  ) => {
    if (!currentUser) return;

    // Create the new call
    const newCall: CallHistoryItem = {
      id: `local_${Date.now()}`,
      phoneNumber,
      timestamp: new Date(),
      duration,
      type,
      userId: currentUser.uid
    };

    // Update state and localStorage
    const updatedCalls = [newCall, ...callHistory];
    setCallHistory(updatedCalls);
    saveToLocalStorage(currentUser.uid, updatedCalls);
  };

  // Fetch call history when user changes
  useEffect(() => {
    fetchCallHistory();
  }, [currentUser]);

  const value = {
    callHistory,
    loading,
    addCall,
    fetchCallHistory
  };

  return (
    <CallHistoryContext.Provider value={value}>
      {children}
    </CallHistoryContext.Provider>
  );
}; 