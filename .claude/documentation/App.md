# App Component Documentation

## Purpose
The App component serves as the main entry point for the application UI. It handles theme management and view rendering based on the current navigation state. It applies the appropriate theme class to the document and renders the correct view component within the Layout component.

## Schema

### State
- **theme**: String from useThemeStore - Current theme ('dark' or 'light')
- **currentView**: String from useNavigationStore - Current navigation view ('calls', 'dial', 'messages', 'contacts', 'settings')

### Component Structure
```
App
└── Layout
    └── CurrentView (based on navigation state)
        ├── Dial (for 'calls' or 'dial' views)
        ├── Home (for 'messages' view or default)
        ├── Contacts placeholder (for 'contacts' view)
        └── Settings placeholder (for 'settings' view)
```

### Data Flow
1. App retrieves theme and currentView from global stores
2. useEffect applies theme class to document when theme changes
3. renderContent determines which view to render based on currentView
4. App renders the Layout component with the appropriate view content

## Patterns

### Theme Management
The App component uses the useThemeStore to get the current theme and applies it to the document using a useEffect hook. This ensures the theme is consistently applied across the entire application.

```tsx
// Theme application pattern
React.useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

### View Rendering
The App component uses a switch statement to determine which view to render based on the currentView state from useNavigationStore. This pattern centralizes the routing logic in one place.

```tsx
// View rendering pattern
const renderContent = () => {
  switch (currentView) {
    case 'calls':
    case 'dial':
      return <Dial />;
    case 'messages':
      return <Home />;
    // Other cases...
    default:
      return <Home />;
  }
};
```

## Interfaces

### Props
The App component does not accept any props.

### Exported Values
The App component is exported as the default export.

### Dependencies
- useThemeStore: Provides the current theme state
- useNavigationStore: Provides the current navigation view
- Layout: Wrapper component for consistent layout
- Home: Component for the messages view
- Dial: Component for the calls/dial view

## Invariants
- The App component must always render a Layout component
- The Layout component must always have a child component
- The theme must always be either 'dark' or 'light'
- The currentView must be one of the defined navigation views

## Error States
- If useThemeStore or useNavigationStore fail, the component may not render correctly
- If the theme is invalid, the document may not have the correct theme class
- If the currentView is invalid, the default Home view will be rendered

## Memory Anchors
- **app-component-start** [uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890]: Beginning of the App component
- **theme-effect-start** [uuid:b2c3d4e5-f6a7-8901-bcde-f12345678901]: Theme effect hook
- **view-renderer-start** [uuid:c3d4e5f6-a7b8-9012-cdef-123456789012]: View rendering function
- **app-render-start** [uuid:d4e5f6a7-b8c9-0123-defg-4567890123]: Main render function
- **app-component-end**: End of the App component 