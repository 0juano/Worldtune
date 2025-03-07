import React from 'react';
import { Layout } from './components/Layout';
import { useThemeStore } from './store/useThemeStore';
import { useNavigationStore } from './store/useNavigationStore';
import { Home } from './components/Home';
import { Dial } from './components/Dial';

function App() {
  const { theme } = useThemeStore();
  const { currentView } = useNavigationStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderContent = () => {
    switch (currentView) {
      case 'calls':
      case 'dial':
        return <Dial />;
      case 'messages':
        return <Home />;
      case 'contacts':
        return <div className="h-full flex items-center justify-center"><p>Contacts view coming soon</p></div>;
      case 'settings':
        return <div className="h-full flex items-center justify-center"><p>Settings view coming soon</p></div>;
      default:
        return <Home />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;