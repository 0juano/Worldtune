import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

interface UserProfileProps {
  mini?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ mini = false }) => {
  const { currentUser, signOut } = useAuth();

  if (!currentUser) {
    return null;
  }

  // Mini version for the header
  if (mini) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-wise-green/20 dark:bg-wise-green/10">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wise-forest dark:text-wise-green" />
          )}
        </div>
      </div>
    );
  }

  // Full version for settings page
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-wise-green/20 dark:bg-wise-green/10">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wise-forest dark:text-wise-green" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-medium text-wise-forest dark:text-wise-green">
            {currentUser.displayName || 'User'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentUser.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className={cn(
            "flex h-10 items-center gap-2 rounded-full bg-red-100 px-4 text-sm font-medium text-red-700",
            "hover:bg-red-200 transition-colors",
            "dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          )}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}; 