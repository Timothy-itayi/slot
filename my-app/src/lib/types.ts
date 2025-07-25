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
} 