import React from 'react';
import { Layout } from './components/Layout';
import { useThemeStore } from './store/useThemeStore';
import { useNavigationStore } from './store/useNavigationStore';
import { Home } from './components/Home';
import { Dial } from './components/Dial';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// CLAUDE-ANCHOR: app-component-start [uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890]
// Purpose: Main application component that handles view rendering and theme application
function App() {
  const { theme } = useThemeStore();
  const { currentView } = useNavigationStore();

  // CLAUDE-ANCHOR: theme-effect-start [uuid:b2c3d4e5-f6a7-8901-bcde-f12345678901]
  // Purpose: Apply theme class to document based on current theme state
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  // CLAUDE-ANCHOR: theme-effect-end

  // CLAUDE-ANCHOR: view-renderer-start [uuid:c3d4e5f6-a7b8-9012-cdef-123456789012]
  // Purpose: Render the appropriate view based on navigation state
  const renderContent = () => {
    // Handle login separately (no protection needed)
    if (currentView === 'login') {
      return <Login />;
    }

    // For all other views, wrap with ProtectedRoute
    switch (currentView) {
      case 'calls':
      case 'dial':
        return (
          <ProtectedRoute>
            <Dial />
          </ProtectedRoute>
        );
      case 'messages':
        return (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        );
      case 'contacts':
        return (
          <ProtectedRoute>
            <div className="h-full flex items-center justify-center">
              <p>Contacts view coming soon</p>
            </div>
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        );
    }
  };
  // CLAUDE-ANCHOR: view-renderer-end

  // CLAUDE-ANCHOR: app-render-start [uuid:d4e5f6a7-b8c9-0123-defg-4567890123]
  // Purpose: Main render function that applies layout to the current view
  return (
    <AuthProvider>
      <Layout>
        {renderContent()}
      </Layout>
    </AuthProvider>
  );
  // CLAUDE-ANCHOR: app-render-end
}
// CLAUDE-ANCHOR: app-component-end

export default App;