import type { GameConfig, Symbol, PayLine } from './types.js';

export const SYMBOLS: Symbol[] = [
	{ id: 'seven', name: 'Seven', value: 100, color: '#FFD700', emoji: '7️⃣' },
	{ id: 'bell', name: 'Bell', value: 50, color: '#FFA500', emoji: '🔔' },
	{ id: 'cherry', name: 'Cherry', value: 25, color: '#FF0000', emoji: '🍒' },
	{ id: 'lemon', name: 'Lemon', value: 15, color: '#FFFF00', emoji: '🍋' },
	{ id: 'orange', name: 'Orange', value: 10, color: '#FF8C00', emoji: '🍊' },
	{ id: 'plum', name: 'Plum', value: 5, color: '#800080', emoji: '🫐' }
];

export const PAY_LINES: PayLine[] = [
	{ positions: [0, 1, 2], multiplier: 1 }, // Horizontal top
	{ positions: [3, 4, 5], multiplier: 1 }, // Horizontal middle
	{ positions: [6, 7, 8], multiplier: 1 }, // Horizontal bottom
	{ positions: [0, 4, 8], multiplier: 2 }, // Diagonal left to right
	{ positions: [2, 4, 6], multiplier: 2 }  // Diagonal right to left
];

export const GAME_CONFIG: GameConfig = {
	reels: 3,
	symbolsPerReel: 20,
	visibleSymbols: 3,
	minBet: 1,
	maxBet: 100,
	payLines: PAY_LINES,
	symbols: SYMBOLS
};

export const INITIAL_BALANCE = 1000;
export const SPIN_DURATION = 8000; // milliseconds
export const REEL_START_DELAY = 500; // delay between reels starting (ms)
export const REEL_STOP_DELAY = 500; // delay between reels stopping (ms)
export const WIN_CHECK_DELAY = 100; // delay before checking wins (ms) 