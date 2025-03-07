# Q&A: Dark Mode Implementation

## Question
How should I implement dark mode in my React application with Tailwind CSS that persists user preferences?

## Answer
To implement a persistent dark mode toggle with Tailwind CSS in a React application, follow these steps:

### 1. Configure Tailwind for Dark Mode

First, ensure your `tailwind.config.js` is set up for dark mode:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // This enables class-based dark mode
  // ... rest of your config
}
```

### 2. Create Theme Toggle Logic in React

```tsx
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

function App() {
  // Initialize state from localStorage or default to dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark mode
  });

  // Toggle function that updates state and localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  // Effect to apply/remove dark class on document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My App</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
      <main className="container mx-auto p-4">
        {/* Your app content */}
      </main>
    </div>
  );
}
```

### 3. Prevent Flash of Wrong Theme

To prevent a flash of the wrong theme on page load, add this script to your HTML head:

```html
<!-- In index.html, before your app bundle -->
<script>
  // Immediately set the theme before any rendering occurs
  const savedTheme = localStorage.getItem('theme');
  
  // If theme is saved in localStorage, use that
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no saved preference, default to dark mode
    document.documentElement.classList.add('dark');
  }
</script>
```

### 4. Create a Theme Context (Optional)

For larger applications, create a theme context to avoid prop drilling:

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Usage in App.tsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// Usage in any component
import { useTheme } from './contexts/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

### 5. Styling Components for Dark Mode

When styling components, always include both light and dark mode variants:

```tsx
// Button component example
const Button = ({ children, ...props }) => {
  return (
    <button
      className="px-4 py-2 rounded-md font-medium 
                 bg-blue-600 hover:bg-blue-700 text-white
                 dark:bg-blue-500 dark:hover:bg-blue-600
                 transition-colors"
      {...props}
    >
      {children}
    </button>
  );
};

// Card component example
const Card = ({ title, content }) => {
  return (
    <div className="p-6 rounded-lg shadow-md 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-100
                    border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-700 dark:text-gray-300">{content}</p>
    </div>
  );
};
```

### 6. Testing Dark Mode

Make sure to test your dark mode implementation in different scenarios:
- Initial page load
- Refreshing the page
- Navigating between routes
- Browser with JavaScript disabled (should default to a usable theme)
- Mobile devices

## Context
This solution was provided in response to a question about implementing dark mode in a React application with Tailwind CSS. The implementation includes:

- Setting up Tailwind CSS for dark mode
- Creating a theme toggle with localStorage persistence
- Preventing flash of wrong theme on page load
- Using a theme context for larger applications
- Styling components for both light and dark modes
- Testing considerations

## Reasoning
The solution uses Tailwind's class-based dark mode approach because:
1. It provides better control over dark mode styles
2. It allows for manual toggling rather than just system preference
3. It can be persisted in localStorage for better user experience
4. The transition between modes can be animated

The implementation uses React hooks (useState, useEffect) for state management and side effects, and optionally provides a context-based solution for larger applications to avoid prop drilling.

The script in the HTML head prevents the flash of wrong theme by applying the correct theme class before React hydrates, which is a common issue with theme implementations.

## Related Questions
- How do I implement system preference detection for dark mode?
- How can I add transition animations when switching between light and dark mode?
- What's the best way to handle images that need different versions for dark mode?
- How do I test dark mode with automated testing tools? 