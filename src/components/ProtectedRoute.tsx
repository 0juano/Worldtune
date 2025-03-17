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
    console.log("ProtectedRoute: Checking authentication", { 
      isAuthenticated: !!currentUser, 
      isLoading: loading,
      currentView 
    });
    
    if (!loading && !currentUser) {
      console.log("ProtectedRoute: User not authenticated, redirecting to login");
      setView('login');
    }
  }, [currentUser, loading, setView, currentView]);

  // Show nothing while checking authentication
  if (loading) {
    console.log("ProtectedRoute: Loading authentication state");
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-wise-green border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, don't render anything
  // The useEffect above will redirect to login
  if (!currentUser) {
    console.log("ProtectedRoute: User not authenticated, not rendering children");
    return null;
  }

  // If authenticated, render the protected content
  console.log("ProtectedRoute: User authenticated, rendering children");
  return <>{children}</>;
}; 