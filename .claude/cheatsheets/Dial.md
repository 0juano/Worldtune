# Dial Component Cheatsheet

## State Management
- `number`: Current dialed number
- `aiWaiting`: AI call assistant status
- `showPromptInput`: AI prompt input visibility
- `showAddCredits`: Credits modal visibility
- `isLongPressing`: Long press state for '+'
- `isCalling`: Calling animation state

## Key Operations
1. Number Input
   - Via keypad buttons
   - Via keyboard
   - Special characters ('+', '#', '*')

2. Animations
   - Number addition/deletion
   - Calling animation
   - AI assistant transitions

3. Audio Handling
   - Ringtone playback
   - Proper cleanup on unmount

## Common Pitfalls
1. Audio Playback
   - Always clean up audio resources
   - Handle interruptions gracefully
   - Track component mounting state

2. Input Handling
   - '+' only at start of number
   - Proper keyboard event cleanup
   - Animation state management

3. State Management
   - Modal state conflicts
   - Animation timing
   - Cleanup on unmount

## Best Practices
1. Use refs for cleanup flags
2. Handle all input methods consistently
3. Maintain proper animation states
4. Clean up resources and listeners