# Responsive Design Patterns

This document outlines canonical patterns for creating responsive designs with Tailwind CSS.

## Mobile-First Approach

Always start with mobile layouts and then enhance for larger screens:

```tsx
const ResponsiveCard = ({ title, content, image }) => {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 transition-colors">
      {/* Full width on mobile, constrained on larger screens */}
      <div className="md:flex">
        {/* Image takes full width on mobile, fixed width on larger screens */}
        <div className="w-full md:w-1/3">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        
        {/* Content area */}
        <div className="p-4 md:p-6 md:w-2/3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};
```

## Responsive Grid Layout

Use Tailwind's grid utilities for responsive layouts:

```tsx
const ResponsiveGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## Responsive Navigation

Pattern for a responsive navigation bar with mobile menu:

```tsx
import { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

const ResponsiveNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">Logo</span>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                Home
              </a>
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
                Features
              </a>
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
                Pricing
              </a>
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
                About
              </a>
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center">
            {/* Dark mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800">
              Home
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
              Features
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
              Pricing
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
              About
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
```

## Responsive Typography

Pattern for responsive typography:

```tsx
const ResponsiveTypography = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
        Responsive Heading
      </h1>
      
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-6">
        Subheading that adapts to screen size
      </h2>
      
      <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
        This paragraph uses responsive text sizing to ensure readability across devices.
        The font size increases slightly on larger screens for better readability,
        while staying compact on mobile devices to maximize screen space.
      </p>
      
      <div className="mt-8">
        <span className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          Even smaller text can be responsive
        </span>
      </div>
    </div>
  );
};
```

## Responsive Form

Pattern for a responsive form:

```tsx
const ResponsiveForm = () => {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
      
      <form>
        <div className="space-y-4">
          {/* Responsive form layout - single column on mobile, two columns on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
```

## Responsive Images

Pattern for responsive images:

```tsx
const ResponsiveImage = ({ src, alt, caption }) => {
  return (
    <figure className="w-full">
      {/* Responsive image container with aspect ratio */}
      <div className="relative h-0 overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      {/* Optional caption */}
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Usage
const ImageGallery = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ResponsiveImage 
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" 
        alt="Mountain landscape" 
        caption="Beautiful mountain landscape"
      />
      <ResponsiveImage 
        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" 
        alt="Seascape" 
        caption="Sunset over the ocean"
      />
      <ResponsiveImage 
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05" 
        alt="Forest" 
        caption="Misty forest at dawn"
      />
    </div>
  );
};
``` 