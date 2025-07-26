export interface Symbol {
	id: string;
	name: string;
	value: number;
	color: string;
	emoji: string;
}

export interface GameState {
	balance: number;
	bet: number;
	isSpinning: boolean;
	winAmount: number;
	lastWin: number;
	spinCount: number;
	lastWins: WinResult[]; // Detailed win information for celebrations
}

export interface ReelState {
	symbols: Symbol[];
	position: number;
	isSpinning: boolean;
}

export interface PayLine {
	positions: number[];
	multiplier: number;
}

export interface GameConfig {
	reels: number;
	symbolsPerReel: number;
	visibleSymbols: number;
	minBet: number;
	maxBet: number;
	payLines: PayLine[];
	symbols: Symbol[];
}

export interface WinResult {
	payLine: PayLine;
	symbol: Symbol;
	multiplier: number;
	amount: number;
	reelIndex?: number; // Optional: for reel-specific wins
	matchCount?: number; // Optional: number of matching symbols
	winType?: 'payline' | 'reel' | 'horizontal'; // Type of win for display purposes
} 