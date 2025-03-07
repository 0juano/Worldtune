# Keyboard Input Pattern

## Implementation
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      handleDelete();
      return;
    }
    
    if (e.key === '+' && number === '') {
      setNumber('+');
      return;
    }

    if (/^[0-9#*]$/.test(e.key)) {
      handleNumberClick(e.key);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [number]);
```

## Usage
- Add keyboard support to input components
- Handle special characters appropriately
- Clean up event listeners on unmount
- Consider component state in handlers

## Gotchas
- Remember to include dependencies in useEffect
- Clean up event listeners to prevent memory leaks
- Handle modifier keys appropriately
- Consider focus management