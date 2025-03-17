import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationStore } from '../store/useNavigationStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const { setView, currentView } = useNavigationStore();

  useEffect(() => {
    if (!loading && !currentUser) {
      setView('login');
    }
  }, [currentUser, loading, setView, currentView]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-wise-green border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, don't render anything
  // The useEffect above will redirect to login
  if (!currentUser) {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}; 