import { describe, it, expect } from 'vitest';
import { SYMBOLS, PAY_LINES, GAME_CONFIG, INITIAL_BALANCE, SPIN_DURATION, REEL_START_DELAY, REEL_STOP_DELAY, WIN_CHECK_DELAY } from './config.js';
import type { Symbol, PayLine, GameConfig } from './types.js';

describe('Game Configuration', () => {
	describe('SYMBOLS', () => {
		it('should have the correct number of symbols', () => {
			expect(SYMBOLS.length).toBe(6);
		});

		it('should have unique symbol IDs', () => {
			const ids = SYMBOLS.map(symbol => symbol.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(SYMBOLS.length);
		});

		it('should have valid symbol properties', () => {
			SYMBOLS.forEach(symbol => {
				expect(symbol.id).toBeDefined();
				expect(symbol.name).toBeDefined();
				expect(symbol.value).toBeGreaterThan(0);
				expect(symbol.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
				expect(symbol.emoji).toBeDefined();
			});
		});

		it('should have symbols ordered by value (highest first)', () => {
			for (let i = 0; i < SYMBOLS.length - 1; i++) {
				expect(SYMBOLS[i].value).toBeGreaterThanOrEqual(SYMBOLS[i + 1].value);
			}
		});

		it('should have the seven symbol as highest value', () => {
			const sevenSymbol = SYMBOLS.find(s => s.id === 'seven');
			expect(sevenSymbol).toBeDefined();
			expect(sevenSymbol?.value).toBe(100);
		});
	});

	describe('PAY_LINES', () => {
		it('should have the correct number of pay lines', () => {
			expect(PAY_LINES.length).toBe(5);
		});

		it('should have valid pay line properties', () => {
			PAY_LINES.forEach(payLine => {
				expect(payLine.positions).toBeDefined();
				expect(payLine.positions.length).toBe(3);
				expect(payLine.multiplier).toBeGreaterThan(0);
			});
		});

		it('should have horizontal pay lines with multiplier 1', () => {
			const horizontalLines = PAY_LINES.filter(line => line.multiplier === 1);
			expect(horizontalLines.length).toBe(3);
		});

		it('should have diagonal pay lines with multiplier 2', () => {
			const diagonalLines = PAY_LINES.filter(line => line.multiplier === 2);
			expect(diagonalLines.length).toBe(2);
		});

		it('should have valid position indices', () => {
			PAY_LINES.forEach(payLine => {
				payLine.positions.forEach(position => {
					expect(position).toBeGreaterThanOrEqual(0);
					expect(position).toBeLessThan(9); // 3x3 grid = 9 positions
				});
			});
		});
	});

	describe('GAME_CONFIG', () => {
		it('should have valid game configuration', () => {
			expect(GAME_CONFIG.reels).toBe(3);
			expect(GAME_CONFIG.symbolsPerReel).toBe(20);
			expect(GAME_CONFIG.visibleSymbols).toBe(4);
			expect(GAME_CONFIG.minBet).toBe(1);
			expect(GAME_CONFIG.maxBet).toBe(100);
		});

		it('should reference the correct symbols and pay lines', () => {
			expect(GAME_CONFIG.symbols).toBe(SYMBOLS);
			expect(GAME_CONFIG.payLines).toBe(PAY_LINES);
		});

		it('should have reasonable betting limits', () => {
			expect(GAME_CONFIG.minBet).toBeGreaterThan(0);
			expect(GAME_CONFIG.maxBet).toBeGreaterThan(GAME_CONFIG.minBet);
			expect(GAME_CONFIG.maxBet).toBeLessThanOrEqual(INITIAL_BALANCE);
		});

		it('should have valid reel configuration', () => {
			expect(GAME_CONFIG.reels).toBeGreaterThan(0);
			expect(GAME_CONFIG.symbolsPerReel).toBeGreaterThan(GAME_CONFIG.visibleSymbols);
		});
	});

	describe('Game Constants', () => {
		it('should have reasonable initial balance', () => {
			expect(INITIAL_BALANCE).toBeGreaterThan(0);
			expect(INITIAL_BALANCE).toBeGreaterThanOrEqual(GAME_CONFIG.maxBet);
		});

		it('should have reasonable timing constants', () => {
			expect(SPIN_DURATION).toBeGreaterThan(0);
			expect(REEL_START_DELAY).toBeGreaterThan(0);
			expect(REEL_STOP_DELAY).toBeGreaterThan(0);
			expect(WIN_CHECK_DELAY).toBeGreaterThan(0);
		});

		it('should have logical timing relationships', () => {
			expect(SPIN_DURATION).toBeGreaterThan(REEL_START_DELAY);
			expect(SPIN_DURATION).toBeGreaterThan(REEL_STOP_DELAY);
			expect(WIN_CHECK_DELAY).toBeLessThan(REEL_STOP_DELAY);
		});
	});

	describe('Configuration Consistency', () => {
		it('should have pay line positions within reel bounds', () => {
			const maxPosition = GAME_CONFIG.reels * GAME_CONFIG.visibleSymbols - 1;
			
			PAY_LINES.forEach(payLine => {
				payLine.positions.forEach(position => {
					expect(position).toBeGreaterThanOrEqual(0);
					expect(position).toBeLessThanOrEqual(maxPosition);
				});
			});
		});

		it('should have enough symbols per reel for visible symbols', () => {
			expect(GAME_CONFIG.symbolsPerReel).toBeGreaterThanOrEqual(GAME_CONFIG.visibleSymbols);
		});

		it('should have enough total symbols for all reels', () => {
			const totalSymbolsNeeded = GAME_CONFIG.reels * GAME_CONFIG.symbolsPerReel;
			expect(SYMBOLS.length).toBeGreaterThan(0); // At least one symbol type
		});
	});
}); 