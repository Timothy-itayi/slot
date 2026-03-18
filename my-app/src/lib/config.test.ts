import { describe, it, expect } from 'vitest';
import { SYMBOLS, SYMBOL_WEIGHTS, PAY_LINES, GAME_CONFIG, INITIAL_BALANCE, REEL_START_DELAY, REEL_MATCH_3X, REEL_MATCH_4X } from './config.js';
import type { Symbol, PayLine, GameConfig } from './types.js';

describe('Game Configuration', () => {
	describe('SYMBOLS', () => {
		it('should have the correct number of symbols', () => {
			expect(SYMBOLS.length).toBe(7);
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
			expect(sevenSymbol?.value).toBe(625);
		});
	});

	describe('SYMBOL_WEIGHTS', () => {
		it('should have a weight for every symbol', () => {
			SYMBOLS.forEach(symbol => {
				expect(SYMBOL_WEIGHTS[symbol.id]).toBeDefined();
				expect(SYMBOL_WEIGHTS[symbol.id]).toBeGreaterThan(0);
			});
		});

		it('should have higher weights for lower-value symbols', () => {
			expect(SYMBOL_WEIGHTS.plum).toBeGreaterThan(SYMBOL_WEIGHTS.seven);
			expect(SYMBOL_WEIGHTS.orange).toBeGreaterThan(SYMBOL_WEIGHTS.bell);
		});
	});

	describe('PAY_LINES', () => {
		it('should have one row match per visible row', () => {
			expect(PAY_LINES.length).toBe(GAME_CONFIG.visibleSymbols);
		});

		it('should have valid pay line properties', () => {
			PAY_LINES.forEach(payLine => {
				expect(payLine.id).toBeDefined();
				expect(payLine.name).toBeDefined();
				expect(payLine.positions).toBeDefined();
				expect(payLine.positions.length).toBe(GAME_CONFIG.reels);
				expect(payLine.multiplier).toBeGreaterThan(0);
			});
		});

		it('should all be straight row matches with multiplier 1', () => {
			PAY_LINES.forEach(line => {
				expect(line.multiplier).toBe(1);
				const row = line.positions[0];
				expect(line.positions.every(p => p === row)).toBe(true);
			});
		});

		it('should cover every visible row exactly once', () => {
			const coveredRows = PAY_LINES.map(l => l.positions[0]).sort();
			const expectedRows = Array.from({ length: GAME_CONFIG.visibleSymbols }, (_, i) => i);
			expect(coveredRows).toEqual(expectedRows);
		});

		it('should have positions within visible row bounds', () => {
			PAY_LINES.forEach(payLine => {
				payLine.positions.forEach(position => {
					expect(position).toBeGreaterThanOrEqual(0);
					expect(position).toBeLessThan(GAME_CONFIG.visibleSymbols);
				});
			});
		});

		it('should have unique IDs', () => {
			const ids = PAY_LINES.map(l => l.id);
			expect(new Set(ids).size).toBe(PAY_LINES.length);
		});
	});

	describe('GAME_CONFIG', () => {
		it('should have valid game configuration', () => {
			expect(GAME_CONFIG.reels).toBe(3);
			expect(GAME_CONFIG.visibleSymbols).toBe(4);
			expect(GAME_CONFIG.minBet).toBe(20);
			expect(GAME_CONFIG.maxBet).toBe(500);
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

		it('should have valid reel count', () => {
			expect(GAME_CONFIG.reels).toBeGreaterThan(0);
		});
	});

	describe('Game Constants', () => {
		it('should have reasonable initial balance', () => {
			expect(INITIAL_BALANCE).toBeGreaterThan(0);
			expect(INITIAL_BALANCE).toBeGreaterThanOrEqual(GAME_CONFIG.maxBet);
		});

		it('should have reasonable reel start delay', () => {
			expect(REEL_START_DELAY).toBeGreaterThan(0);
		});

		it('should have valid reel match multipliers', () => {
			expect(REEL_MATCH_3X).toBeGreaterThan(0);
			expect(REEL_MATCH_3X).toBeLessThan(1);
			expect(REEL_MATCH_4X).toBeGreaterThan(REEL_MATCH_3X);
			expect(REEL_MATCH_4X).toBeLessThan(1);
		});
	});

	describe('Configuration Consistency', () => {
		it('should have pay line positions within visible symbol bounds', () => {
			PAY_LINES.forEach(payLine => {
				payLine.positions.forEach(position => {
					expect(position).toBeGreaterThanOrEqual(0);
					expect(position).toBeLessThan(GAME_CONFIG.visibleSymbols);
				});
			});
		});

		it('should have pay line length matching reel count', () => {
			PAY_LINES.forEach(payLine => {
				expect(payLine.positions.length).toBe(GAME_CONFIG.reels);
			});
		});
	});
});
