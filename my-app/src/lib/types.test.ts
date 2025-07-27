import { describe, it, expect } from 'vitest';
import type { Symbol, PayLine, GameConfig, GameState, ReelState, WinResult } from './types.js';

describe('Type Definitions', () => {
	describe('Symbol Type', () => {
		it('should have correct structure', () => {
			const testSymbol: Symbol = {
				id: 'test',
				name: 'Test Symbol',
				value: 50,
				color: '#FF0000',
				emoji: '🎯'
			};

			expect(testSymbol.id).toBe('test');
			expect(testSymbol.name).toBe('Test Symbol');
			expect(testSymbol.value).toBe(50);
			expect(testSymbol.color).toBe('#FF0000');
			expect(testSymbol.emoji).toBe('🎯');
		});

		it('should allow valid symbol properties', () => {
			const validSymbol: Symbol = {
				id: 'seven',
				name: 'Seven',
				value: 100,
				color: '#FFD700',
				emoji: '7️⃣'
			};

			expect(validSymbol).toBeDefined();
		});
	});

	describe('PayLine Type', () => {
		it('should have correct structure', () => {
			const testPayLine: PayLine = {
				positions: [0, 1, 2],
				multiplier: 1
			};

			expect(testPayLine.positions).toEqual([0, 1, 2]);
			expect(testPayLine.multiplier).toBe(1);
		});

		it('should allow valid pay line properties', () => {
			const validPayLine: PayLine = {
				positions: [0, 4, 8],
				multiplier: 2
			};

			expect(validPayLine).toBeDefined();
		});
	});

	describe('GameConfig Type', () => {
		it('should have correct structure', () => {
			const testConfig: GameConfig = {
				reels: 3,
				symbolsPerReel: 20,
				visibleSymbols: 4,
				minBet: 1,
				maxBet: 100,
				payLines: [],
				symbols: []
			};

			expect(testConfig.reels).toBe(3);
			expect(testConfig.symbolsPerReel).toBe(20);
			expect(testConfig.visibleSymbols).toBe(4);
			expect(testConfig.minBet).toBe(1);
			expect(testConfig.maxBet).toBe(100);
			expect(testConfig.payLines).toEqual([]);
			expect(testConfig.symbols).toEqual([]);
		});
	});

	describe('GameState Type', () => {
		it('should have correct structure', () => {
			const testState: GameState = {
				balance: 1000,
				bet: 10,
				isSpinning: false,
				winAmount: 0,
				lastWin: 0,
				spinCount: 5,
				lastWins: [],
				totalWinnings: 250
			};

			expect(testState.balance).toBe(1000);
			expect(testState.bet).toBe(10);
			expect(testState.isSpinning).toBe(false);
			expect(testState.winAmount).toBe(0);
			expect(testState.lastWin).toBe(0);
			expect(testState.spinCount).toBe(5);
			expect(testState.lastWins).toEqual([]);
			expect(testState.totalWinnings).toBe(250);
		});
	});

	describe('ReelState Type', () => {
		it('should have correct structure', () => {
			const testReelState: ReelState = {
				symbols: [
					{ id: 'seven', name: 'Seven', value: 100, color: '#FFD700', emoji: '7️⃣' },
					{ id: 'bell', name: 'Bell', value: 50, color: '#FFA500', emoji: '🔔' }
				],
				position: 5,
				isSpinning: true
			};

			expect(testReelState.symbols).toHaveLength(2);
			expect(testReelState.position).toBe(5);
			expect(testReelState.isSpinning).toBe(true);
		});
	});

	describe('WinResult Type', () => {
		it('should have correct structure', () => {
			const testPayLine: PayLine = { positions: [0, 1, 2], multiplier: 1 };
			const testWinResult: WinResult = {
				payLine: testPayLine,
				symbol: { id: 'seven', name: 'Seven', value: 100, color: '#FFD700', emoji: '7️⃣' },
				multiplier: 1,
				amount: 300,
				reelIndex: 0,
				matchCount: 3,
				winType: 'horizontal'
			};

			expect(testWinResult.symbol.id).toBe('seven');
			expect(testWinResult.multiplier).toBe(1);
			expect(testWinResult.amount).toBe(300);
			expect(testWinResult.payLine).toBe(testPayLine);
			expect(testWinResult.reelIndex).toBe(0);
			expect(testWinResult.matchCount).toBe(3);
			expect(testWinResult.winType).toBe('horizontal');
		});
	});

	describe('Type Compatibility', () => {
		it('should allow arrays of types', () => {
			const symbols: Symbol[] = [
				{ id: 'seven', name: 'Seven', value: 100, color: '#FFD700', emoji: '7️⃣' },
				{ id: 'bell', name: 'Bell', value: 50, color: '#FFA500', emoji: '🔔' }
			];

			const payLines: PayLine[] = [
				{ positions: [0, 1, 2], multiplier: 1 },
				{ positions: [3, 4, 5], multiplier: 1 }
			];

			expect(symbols).toHaveLength(2);
			expect(payLines).toHaveLength(2);
		});

		it('should allow optional properties', () => {
			const partialWinResult = {
				symbol: { id: 'seven', name: 'Seven', value: 100, color: '#FFD700', emoji: '7️⃣' },
				count: 3,
				amount: 300
			};

			expect(partialWinResult).toBeDefined();
		});
	});

	describe('Type Validation', () => {
		it('should validate symbol value is positive', () => {
			const validSymbol: Symbol = {
				id: 'test',
				name: 'Test',
				value: 10,
				color: '#000000',
				emoji: '🎯'
			};

			expect(validSymbol.value).toBeGreaterThan(0);
		});

		it('should validate pay line positions are non-negative', () => {
			const validPayLine: PayLine = {
				positions: [0, 1, 2],
				multiplier: 1
			};

			validPayLine.positions.forEach(position => {
				expect(position).toBeGreaterThanOrEqual(0);
			});
		});

		it('should validate multiplier is positive', () => {
			const validPayLine: PayLine = {
				positions: [0, 1, 2],
				multiplier: 2
			};

			expect(validPayLine.multiplier).toBeGreaterThan(0);
		});
	});
}); 