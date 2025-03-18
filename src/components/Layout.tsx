import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { History, Menu, Phone, Settings, X, User } from 'lucide-react';
import { useNavigationStore } from '../store/useNavigationStore';
import { useThemeStore } from '../store/useThemeStore';
import { UserProfile } from './UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentView, setView } = useNavigationStore();
  const { theme } = useThemeStore();
  const { currentUser } = useAuth();
  const isLightMode = theme === 'light';
  const isLoginPage = currentView === 'login';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Set sidebar width as a CSS variable
  useEffect(() => {
    const updateSidebarWidth = () => {
      if (sidebarRef.current) {
        const sidebarWidth = sidebarRef.current.offsetWidth;
        document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
      }
    };
    
    // Update immediately and on resize
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    
    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    view: 'dial' | 'history' | 'settings';
  }> = ({ icon, label, view }) => (
    <button
      onClick={() => {
        setView(view);
        if (isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
        }
      }}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:bg-wise-green/10 active:scale-95 dark:hover:bg-wise-green/20 focus-ring",
        currentView === view && "bg-wise-green/20 text-wise-forest dark:bg-wise-green/10 dark:text-wise-green"
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-wise-forest dark:bg-gray-900 dark:text-wise-green">
      {/* Mobile Header - Only show if not on login page */}
      {!isLoginPage && (
        <header className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center">
            <img 
              src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
              alt="WorldTune" 
              className="h-8 w-8" 
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex items-center gap-2">
            {currentUser && <UserProfile mini />}
            <button
              onClick={toggleMobileSidebar}
              className="rounded-lg p-2 hover:bg-wise-green/10 active:scale-95 dark:hover:bg-wise-green/20 focus-ring mr-2"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {/* Mobile Sidebar - Only show if not on login page and mobile sidebar is open */}
        {!isLoginPage && isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={toggleMobileSidebar}>
            <div 
              className="absolute right-0 h-full w-64 bg-gray-100 dark:bg-gray-900 shadow-xl transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full flex-col p-4">
                <div className="flex items-center justify-between mb-6">
                  <img 
                    src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
                    alt="WorldTune" 
                    className="h-8 w-8" 
                    style={{ objectFit: 'contain' }}
                  />
                  <button
                    onClick={toggleMobileSidebar}
                    className="rounded-lg p-2 hover:bg-wise-green/10 active:scale-95 dark:hover:bg-wise-green/20 focus-ring"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setView('dial');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-wise-green/10 dark:hover:bg-wise-green/20",
                        currentView === 'dial' && "bg-wise-green/20 text-wise-forest dark:bg-wise-green/10 dark:text-wise-green"
                      )}
                    >
                      <Phone className="h-5 w-5" />
                      <span>Dial Pad</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setView('history');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-wise-green/10 dark:hover:bg-wise-green/20",
                        currentView === 'history' && "bg-wise-green/20 text-wise-forest dark:bg-wise-green/10 dark:text-wise-green"
                      )}
                    >
                      <History className="h-5 w-5" />
                      <span>Call History</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setView('settings');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-wise-green/10 dark:hover:bg-wise-green/20",
                        currentView === 'settings' && "bg-wise-green/20 text-wise-forest dark:bg-wise-green/10 dark:text-wise-green"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
                
                {currentUser && (
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-wise-green/20 dark:bg-wise-green/10">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt={currentUser.displayName || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wise-forest dark:text-wise-green" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate text-wise-forest dark:text-wise-green">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar - Only show if not on login page */}
        {!isLoginPage && (
          <nav 
            ref={sidebarRef}
            className="hidden border-r border-gray-200 bg-gray-100 px-3 py-6 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:fixed lg:h-full lg:w-20 lg:flex-col lg:justify-between"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="mb-6">
                <img 
                  src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
                  alt="WorldTune" 
                  className="h-10 w-10" 
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <NavButton
                icon={<Phone className="h-5 w-5" />}
                label="Dial Pad"
                view="dial"
              />
              <NavButton
                icon={<History className="h-5 w-5" />}
                label="Call History"
                view="history"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              {currentUser && <UserProfile mini />}
              <ThemeToggle />
              <NavButton
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                view="settings"
              />
            </div>
          </nav>
        )}

        {/* Main Content - Add left padding for sidebar space on desktop */}
        <main className={cn(
          "flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900",
          isLoginPage && "max-w-screen", // Full width on login page
          !isLoginPage && "lg:pl-20" // Add padding on desktop to account for fixed sidebar
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};