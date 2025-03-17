import React, { useState, useEffect } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationStore } from '../store/useNavigationStore';
import { cn } from '../utils/cn';

export const Login: React.FC = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const { setView } = useNavigationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dial if already authenticated
  useEffect(() => {
    if (currentUser) {
      console.log("Login: User already authenticated, redirecting to dial view");
      setView('dial');
    }
  }, [currentUser, setView]);

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in process...");
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      console.log("Google sign-in successful, redirecting to dial view...");
      
      // Force a small delay to ensure Firebase auth state has updated
      setTimeout(() => {
        setView('dial');
        console.log("View should be set to dial now");
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action button component (reused similar to Dial.tsx)
  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    color: string;
    label: string;
    isLoading?: boolean;
  }> = ({ onClick, icon, color, label, isLoading }) => {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          "flex h-20 w-full flex-row items-center justify-center gap-3 rounded-full transition-all active:scale-95 focus-ring select-none touch-manipulation",
          color,
          isLoading && "opacity-70"
        )}
        aria-label={label}
      >
        {isLoading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
        ) : (
          icon
        )}
        <span className="text-lg font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Fixed height container for title and welcome message */}
      <div className="h-24 flex flex-col justify-end w-full mb-8">
        <div className="w-full text-center">
          <div className="text-3xl font-medium text-wise-forest dark:text-wise-green sm:text-4xl">
            Welcome to Worldtune
          </div>
          <div className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to continue
          </div>
        </div>
      </div>

      {/* Logo or illustration - similar position to where dial pad would be */}
      <div className="mb-8 flex justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-wise-green/20 text-wise-forest dark:bg-wise-green/10 dark:text-wise-green">
          <Lock className="h-16 w-16" />
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="mb-4 w-full rounded-lg bg-red-100 p-3 text-center text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Google Sign In button - styled like the action buttons in Dial.tsx */}
      <div className="mb-4 w-full">
        <ActionButton
          onClick={handleGoogleSignIn}
          icon={<LogIn className="h-6 w-6" />}
          color="bg-wise-blue text-wise-forest hover:bg-wise-blue/90 dark:bg-wise-blue/80 dark:text-wise-forest dark:hover:bg-wise-blue/70"
          label="Sign in with Google"
          isLoading={isLoading}
        />
      </div>

      {/* Footer message */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        By signing in, you agree to our Terms and Privacy Policy
      </div>
    </div>
  );
}; 