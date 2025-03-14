import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Menu, MessageSquare, Phone, Settings, Users } from 'lucide-react';
import { useNavigationStore } from '../store/useNavigationStore';
import { useThemeStore } from '../store/useThemeStore';
import { cn } from '../utils/cn';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentView, setView } = useNavigationStore();
  const { theme } = useThemeStore();
  const isLightMode = theme === 'light';

  const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    view: 'messages' | 'calls' | 'contacts' | 'settings';
  }> = ({ icon, label, view }) => (
    <button
      onClick={() => setView(view)}
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
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center">
          <img 
            src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
            alt="WorldTune" 
            className="h-8 w-8" 
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="flex items-center">
          <button
            className="rounded-lg p-2 hover:bg-wise-green/10 active:scale-95 dark:hover:bg-wise-green/20 focus-ring mr-2"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="hidden border-r border-gray-200 bg-gray-100 px-3 py-6 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:w-20 lg:flex-col">
          <div className="flex flex-1 flex-col items-center gap-4">
            <div className="mb-6">
              <img 
                src={isLightMode ? "/logos/Worldtune_Icon_black.png" : "/logos/Worldtune_Icon.png"} 
                alt="WorldTune" 
                className="h-10 w-10" 
                style={{ objectFit: 'contain' }}
              />
            </div>
            <NavButton
              icon={<MessageSquare className="h-5 w-5" />}
              label="Messages"
              view="messages"
            />
            <NavButton
              icon={<Phone className="h-5 w-5" />}
              label="Calls"
              view="calls"
            />
            <NavButton
              icon={<Users className="h-5 w-5" />}
              label="Contacts"
              view="contacts"
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <ThemeToggle />
            <NavButton
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              view="settings"
            />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};