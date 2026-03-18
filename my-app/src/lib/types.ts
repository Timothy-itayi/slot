export interface Symbol {
	id: string;
	name: string;
	value: number;
	color: string;
	emoji: string;
	isWild?: boolean;
}

export interface GameState {
	balance: number;
	bet: number;
	isSpinning: boolean;
	winAmount: number;
	lastWin: number;
	spinCount: number;
	lastWins: WinResult[];
	totalWinnings: number;
}

export interface ReelState {
	targetSymbols: Symbol[];
	isSpinning: boolean;
}

export interface PayLine {
	id: number;
	name: string;
	positions: number[]; // row index per reel (length = number of reels)
	multiplier: number;
}

export interface GameConfig {
	reels: number;
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
	matchCount: number;
	winType: 'payline' | 'reel';
	reelIndex?: number;
}
