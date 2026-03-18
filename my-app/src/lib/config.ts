import type { GameConfig, Symbol, PayLine } from './types.js';

// Symbol values tuned for ~95% combined RTP (4 row matches + reel matches)
export const SYMBOLS: Symbol[] = [
	{ id: 'seven', name: 'Seven', value: 625, color: '#FFD700', emoji: '7️⃣' },
	{ id: 'wild', name: 'Wild', value: 400, color: '#00E5FF', emoji: '⭐', isWild: true },
	{ id: 'bell', name: 'Bell', value: 310, color: '#FFA500', emoji: '🔔' },
	{ id: 'cherry', name: 'Cherry', value: 155, color: '#FF0000', emoji: '🍒' },
	{ id: 'lemon', name: 'Lemon', value: 100, color: '#FFFF00', emoji: '🍋' },
	{ id: 'orange', name: 'Orange', value: 68, color: '#FF8C00', emoji: '🍊' },
	{ id: 'plum', name: 'Plum', value: 38, color: '#800080', emoji: '🫐' }
];

// Weight table controls symbol frequency on reels.
// Lower weight = rarer symbol.
export const SYMBOL_WEIGHTS: Record<string, number> = {
	wild: 1,
	seven: 2,
	bell: 5,
	cherry: 10,
	lemon: 20,
	orange: 25,
	plum: 30,
};

// Reel match payout multipliers (applied to symbol.value)
export const REEL_MATCH_3X = 0.06;
export const REEL_MATCH_4X = 0.35;

// Row matches: same symbol across all reels at the same row.
// One per visible row, all equal weight.
export const PAY_LINES: PayLine[] = [
	{ id: 1, name: 'Row 1', positions: [0, 0, 0], multiplier: 1 },
	{ id: 2, name: 'Row 2', positions: [1, 1, 1], multiplier: 1 },
	{ id: 3, name: 'Row 3', positions: [2, 2, 2], multiplier: 1 },
	{ id: 4, name: 'Row 4', positions: [3, 3, 3], multiplier: 1 },
];

export const GAME_CONFIG: GameConfig = {
	reels: 3,
	visibleSymbols: 4,
	minBet: 20,
	maxBet: 500,
	payLines: PAY_LINES,
	symbols: SYMBOLS
};

export const INITIAL_BALANCE = 500;
export const REEL_START_DELAY = 500;
