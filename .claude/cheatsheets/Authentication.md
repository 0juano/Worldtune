# Authentication System Cheatsheet

## Overview
The authentication system uses Firebase Authentication with Google sign-in. It provides a clean, user-friendly interface that matches the existing dial pad design.

## Files and Components

### Core Authentication Files
- `src/contexts/AuthContext.tsx`: Main authentication context provider 
- `src/components/Login.tsx`: Login page styled to match dial pad
- `src/components/UserProfile.tsx`: User profile display (mini and full versions)
- `src/components/ProtectedRoute.tsx`: Route protection wrapper

### Integration Files
- `src/App.tsx`: Main app with auth provider and protected routes
- `src/components/Layout.tsx`: Updated to conditionally show navigation and user profile
- `src/components/Settings.tsx`: Settings page with user account section

## Configuration

### Environment Variables
Required in `.env` file:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Authentication Flow
1. User lands on any page
2. `ProtectedRoute` checks if user is authenticated
3. If not authenticated, redirects to login page
4. User clicks "Sign in with Google" button
5. Firebase opens Google sign-in popup
6. Upon successful sign-in, user is redirected to intended page

## Common Patterns

### Checking if User is Logged In
```tsx
import { useAuth } from '../contexts/AuthContext';

const Component = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <p>Please log in</p>;
  }
  
  return <p>Hello, {currentUser.displayName}!</p>;
};
```

### Accessing User Data
```tsx
import { useAuth } from '../contexts/AuthContext';

const UserInfo = () => {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <img src={currentUser?.photoURL || ''} alt="User" />
      <p>{currentUser?.displayName}</p>
      <p>{currentUser?.email}</p>
    </div>
  );
};
```

### Sign Out
```tsx
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = () => {
  const { signOut } = useAuth();
  
  return (
    <button onClick={signOut}>
      Sign Out
    </button>
  );
};
```

## Common Pitfalls

1. **Authentication State Timing**: Always check `loading` state before assuming user is not logged in
2. **Firebase Config**: Ensure all Firebase config values are correctly set in `.env`
3. **Protected Routes**: Always wrap private content with `<ProtectedRoute>` component
4. **User Profile Display**: Handle the case where user has no photo URL

## Styling Guidelines

- Login page mimics dial pad layout with central content
- Action buttons use the same rounded style (`rounded-full`)
- Same color scheme (wise-green, wise-blue, wise-forest)
- Dark mode compatibility built-in 