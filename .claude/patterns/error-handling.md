# Error Handling Patterns

This document outlines canonical patterns for handling errors in the application with context preservation.

## React Error Boundary Pattern

Use this pattern to catch and handle errors in React component trees.

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function' && this.state.error && this.state.errorInfo) {
          return this.props.fallback(this.state.error, this.state.errorInfo);
        }
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary p-4 border border-red-500 rounded bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <details className="text-sm">
            <summary>Error details</summary>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Usage Example

```tsx
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send error to logging service
        logErrorToService(error, errorInfo);
      }}
      fallback={
        <div className="error-container">
          <h1>Oops! Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Refresh the page
          </button>
        </div>
      }
    >
      <YourApplication />
    </ErrorBoundary>
  );
};
```

## Async Error Handling Pattern

For handling errors in async operations with context preservation:

```tsx
const fetchDataWithErrorHandling = async <T,>(
  fetchFn: () => Promise<T>,
  errorContext: string
): Promise<[T | null, Error | null]> => {
  try {
    const data = await fetchFn();
    return [data, null];
  } catch (error) {
    const contextualError = new Error(
      `Error in ${errorContext}: ${error instanceof Error ? error.message : String(error)}`
    );
    
    // Preserve the original stack trace
    if (error instanceof Error && error.stack) {
      contextualError.stack = error.stack;
    }
    
    // Log the error with context
    console.error(contextualError);
    
    return [null, contextualError];
  }
};

// Usage
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const [userData, userError] = await fetchDataWithErrorHandling(
        () => api.getUser(userId),
        'UserProfile.loadUser'
      );
      
      if (userData) {
        setUser(userData);
      }
      
      if (userError) {
        setError(userError);
      }
    };
    
    loadUser();
  }, [userId]);
  
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (!user) {
    return <Loading />;
  }
  
  return <UserProfileView user={user} />;
};
```

## Form Validation Error Pattern

For handling form validation errors:

```tsx
interface ValidationError {
  field: string;
  message: string;
}

const validateForm = (formData: Record<string, any>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Example validation rules
  if (!formData.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }
  
  if (!formData.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (formData.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  return errors;
};

// Usage in a form component
const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      // Submit form
      submitForm(formData);
    }
  };
  
  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={getFieldError('email') ? 'border-red-500' : ''}
        />
        {getFieldError('email') && (
          <p className="text-red-500 text-sm">{getFieldError('email')}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={getFieldError('password') ? 'border-red-500' : ''}
        />
        {getFieldError('password') && (
          <p className="text-red-500 text-sm">{getFieldError('password')}</p>
        )}
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
};
``` 