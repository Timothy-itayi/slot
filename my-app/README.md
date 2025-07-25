# 🎰 SpinCycle: Slot Machine Game Demo

A minimal slot machine demo app built with **Svelte + TypeScript**, styled with **CSS**, tested with **Vitest + Playwright**, and deployed on **Vercel**. This project is designed as a technical showcase for web game development with clean animations, reusable logic, and a focus on minimalistic design.

## 🚀 Goal

To create a clean, interactive slot machine demo that highlights:

- **Game UI design** - Modern, responsive interface with smooth animations
- **Animation & timing logic** - CSS-powered reel spinning with smooth transitions
- **Clean rendering** - Pure CSS animations for optimal performance
- **Testable components** - Unit tests for game logic and E2E tests for UI
- **Clean code structure** - Modular architecture with TypeScript types
- **Deployment pipeline** - Ready for Vercel deployment

This is not a full casino engine — it's a simplified prototype focused on visual polish and logic clarity.

## ✨ Features

- **3-Reel Slot Machine** with 6 different symbols
- **5 Pay Lines** including horizontal and diagonal combinations
- **Smooth Animations** powered by CSS with clean transitions
- **Responsive Design** that works on desktop and mobile
- **Game State Management** with Svelte stores
- **Betting System** with min/max limits
- **Win Detection** with visual feedback
- **Paytable Display** showing symbol values
- **Reset Functionality** to start fresh

## 🎮 Game Symbols

| Symbol | Name | Value | Color |
|--------|------|-------|-------|
| 7️⃣ | Seven | $100 | Gold |
| 🔔 | Bell | $50 | Orange |
| 🍒 | Cherry | $25 | Red |
| 🍋 | Lemon | $15 | Yellow |
| 🍊 | Orange | $10 | Orange |
| 🫐 | Plum | $5 | Purple |

## 🏆 Pay Lines

- **Horizontal Top**: Positions 0, 1, 2 (1x multiplier)
- **Horizontal Middle**: Positions 3, 4, 5 (1x multiplier)
- **Horizontal Bottom**: Positions 6, 7, 8 (1x multiplier)
- **Diagonal Left-Right**: Positions 0, 4, 8 (2x multiplier)
- **Diagonal Right-Left**: Positions 2, 4, 6 (2x multiplier)

## 🛠️ Tech Stack

- **Frontend**: Svelte 5 + TypeScript
- **Styling**: Pure CSS
- **Animations**: CSS Transitions
- **Testing**: Vitest + Playwright
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spincycle-slot-machine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Reel.svelte          # PixiJS reel component
│   │   └── SlotMachine.svelte   # Main game component
│   ├── config.ts                # Game configuration
│   ├── gameStore.ts             # Game state management
│   ├── types.ts                 # TypeScript interfaces
│   └── gameStore.test.ts        # Unit tests
├── routes/
│   └── +page.svelte            # Main page
└── test/
    └── setup.ts                # Test configuration
```

## 🎯 Key Components

### Game Store (`gameStore.ts`)
- Manages game state (balance, bet, spinning status)
- Handles reel logic and symbol generation
- Implements win detection algorithms
- Provides betting and reset functionality

### Reel Component (`Reel.svelte`)
- CSS-powered carousel-style reel display
- Smooth spinning animations with transitions
- Symbol rendering with colors and emojis
- Responsive design

### Slot Machine Component (`SlotMachine.svelte`)
- Complete game UI with controls
- Real-time balance and win display
- Betting interface with validation
- Paytable and game statistics

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Deploy automatically**

The project includes:
- `@sveltejs/adapter-vercel` for Vercel optimization
- Proper build configuration
- Environment variable handling

## 🎨 Customization

### Adding New Symbols
Edit `src/lib/config.ts`:
```typescript
export const SYMBOLS: Symbol[] = [
  // Add your new symbols here
  { id: 'new-symbol', name: 'New Symbol', value: 75, color: '#FF5733', emoji: '🆕' }
];
```

### Modifying Pay Lines
Update the `PAY_LINES` array in `src/lib/config.ts`:
```typescript
export const PAY_LINES: PayLine[] = [
  // Add your custom pay lines
  { positions: [0, 1, 2, 3, 4], multiplier: 5 } // 5-symbol line
];
```

### Adjusting Game Settings
Modify constants in `src/lib/config.ts`:
```typescript
export const INITIAL_BALANCE = 2000;  // Starting money
export const SPIN_DURATION = 4000;    // Spin duration in ms
export const REEL_SPIN_DELAY = 300;   // Delay between reels
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Svelte Team** for the amazing reactive framework
- **PixiJS Team** for the powerful 2D rendering engine
- **Tailwind CSS** for the utility-first styling approach
- **Vercel** for seamless deployment platform

---

**Happy Spinning! 🎰✨**
