# SpinCycle Styles Directory

This directory contains all the CSS styles for the SpinCycle slot machine game project, organized for better maintainability and separation of concerns.

## Directory Structure

```
styles/
├── components/          # Component-specific styles
│   ├── index.css       # Main import file for all component styles
│   ├── SlotMachine.css # Main slot machine component styles
│   ├── Reel.css        # Individual reel component styles
│   ├── WinCelebration.css # Win celebration modal styles
│   ├── RulesWindow.css # Rules/help window styles
│   └── Debugger.css    # Development debugger styles
└── README.md           # This file
```

## Usage

### Individual Component Styles
Each component imports its own CSS file:

```typescript
// In Svelte components
import '../styles/components/ComponentName.css';
```

### All Component Styles
To import all component styles at once:

```typescript
import '../styles/components/index.css';
```

## Benefits of This Organization

1. **Separation of Concerns**: Each component's styles are isolated
2. **Maintainability**: Easy to find and modify specific component styles
3. **Reusability**: Styles can be shared or modified independently
4. **Performance**: Only load styles for components you need
5. **Clean Components**: Svelte files focus on logic and markup, not styling

## Component Style Breakdown

### SlotMachine.css (5.1KB)
- Main game container and layout
- Statistics display
- Controls and betting interface
- Paytable and symbols grid
- Responsive design for mobile/tablet

### Reel.css (2.2KB)
- Individual reel containers and frames
- Symbol positioning and sizing
- Winning symbol animations
- 4-level responsive layout
- Movement indicators

### WinCelebration.css (5.4KB)
- Modal overlay and celebration card
- Confetti animation effects
- Win details and typography
- Dynamic responsive sizing
- Gradient backgrounds and shadows

### RulesWindow.css (2.5KB)
- Fixed positioning rules window
- Toggle button styling
- Collapsible content layout
- Symbol examples and values
- Mobile responsive design

### Debugger.css (3.8KB)
- Development overlay positioning
- Debug information display
- Reel index visualization
- Responsive debugging layout
- Developer tools styling

## Responsive Design

All component styles include responsive breakpoints:
- **Desktop**: Default styles (>768px)
- **Tablet**: Medium screens (≤768px)
- **Mobile**: Small screens (≤480px)

The responsive design ensures:
- 4-level reel display across all devices
- Proper spacing and proportions
- Touch-friendly interactive elements
- Optimized typography and sizing 