# App Component Cheatsheet

## Purpose
The App component is the root component of the application that serves as the entry point for the UI. It handles theme management, routing, and the overall layout structure.

## Common Operations

### Adding a New Route
To add a new route to the application:

```tsx
// In App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewPage from './components/NewPage';

function App() {
  // ... existing code ...
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <BrowserRouter>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* Add new route here */}
            <Route path="/new-page" element={<NewPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
```

### Modifying Theme Toggle
To modify the theme toggle behavior:

```tsx
// In App.tsx
const [darkMode, setDarkMode] = useState(() => {
  // Get saved theme or use system preference as fallback
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  // Use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

const toggleDarkMode = () => {
  const newDarkMode = !darkMode;
  setDarkMode(newDarkMode);
  localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
};

useEffect(() => {
  // Apply theme class to document
  document.documentElement.classList.toggle('dark', darkMode);
}, [darkMode]);
```

### Adding Global Context
To add a global context to the App component:

```tsx
// In a separate context file (e.g., src/contexts/AppContext.tsx)
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  // Define your context properties here
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// In App.tsx
import { AppProvider } from './contexts/AppContext';

function App() {
  // ... existing code ...
  
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* Rest of your app */}
      </div>
    </AppProvider>
  );
}
```

## Pitfalls and Edge Cases

### Theme Flickering on Load
**Problem**: Users may experience a flash of incorrect theme when the app loads.

**Solution**: Use a script in the HTML head to set the theme before React loads:

```html
<!-- In index.html -->
<script>
  // Immediately set the theme before any rendering occurs
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
</script>
```

### Mobile Responsiveness Issues
**Problem**: Layout breaks on certain mobile devices.

**Solution**: Ensure proper viewport meta tag and use mobile-first approach:

```html
<!-- In index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

```tsx
// In App.tsx - Use mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

### Route Change Not Scrolling to Top
**Problem**: When navigating between routes, the scroll position is maintained.

**Solution**: Implement a scroll-to-top effect on route changes:

```tsx
// Create a ScrollToTop component
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// In App.tsx
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Rest of your app */}
    </BrowserRouter>
  );
}
```

### Context Performance Issues
**Problem**: Re-renders throughout the app when any context value changes.

**Solution**: Split contexts by concern and use memoization:

```tsx
// Split into multiple contexts
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const UserContext = createContext<UserContextType | undefined>(undefined);

// Use memoization
const App = () => {
  // ... other code ...
  
  const themeValue = useMemo(() => ({
    darkMode,
    toggleDarkMode
  }), [darkMode]);
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {/* App content */}
    </ThemeContext.Provider>
  );
};
```

## Gotchas

### Environment Variables
Environment variables in Vite must be prefixed with `VITE_` to be accessible in the client code:

```tsx
// Correct way to access environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Won't work - missing VITE_ prefix
const apiKey = import.meta.env.API_KEY; // undefined in client code
```

### CSS Modules with Tailwind
When using CSS modules alongside Tailwind, be careful with naming conflicts:

```tsx
// In YourComponent.module.css
.container {
  /* Custom styles */
}

// In YourComponent.tsx
import styles from './YourComponent.module.css';

// This will apply both the CSS module style and Tailwind classes
<div className={`${styles.container} flex items-center`}>
  {/* Content */}
</div>
```

### React Router v6 Changes
If upgrading from React Router v5 to v6, be aware of these changes:

- `Switch` is replaced with `Routes`
- `component={Component}` is replaced with `element={<Component />}`
- `useHistory` is replaced with `useNavigate`
- Nested routes work differently

```tsx
// React Router v6 syntax
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="users" element={<Users />}>
    <Route path=":id" element={<UserDetail />} />
  </Route>
</Routes>
```

### Dark Mode with Third-Party Components
Some third-party components may not respect the dark mode classes. You'll need to create wrapper components:

```tsx
// Example wrapper for a third-party date picker
const ThemeDatePicker = (props) => {
  const { darkMode } = useTheme();
  
  return (
    <DatePicker
      {...props}
      className={darkMode ? 'date-picker-dark' : 'date-picker-light'}
      calendarClassName={darkMode ? 'calendar-dark' : 'calendar-light'}
    />
  );
};
``` 