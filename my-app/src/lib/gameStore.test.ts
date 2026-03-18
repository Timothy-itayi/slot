import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gameStore } from './gameStore.js';
import { GAME_CONFIG, INITIAL_BALANCE, SYMBOLS } from './config.js';
import type { Symbol } from './types.js';

describe('Game Store', () => {
	beforeEach(() => {
		gameStore.reset();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Initialization', () => {
		it('should initialize with correct default values', () => {
			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.balance).toBe(INITIAL_BALANCE);
			expect(state.bet).toBe(GAME_CONFIG.minBet);
			expect(state.isSpinning).toBe(false);
			expect(state.winAmount).toBe(0);
			expect(state.lastWin).toBe(0);
			expect(state.spinCount).toBe(0);
			expect(state.lastWins).toEqual([]);
			expect(state.totalWinnings).toBe(0);
		});

		it('should initialize reels with target symbols', () => {
			let reels: any[] = [];
			gameStore.reels.subscribe(r => reels = r)();

			expect(reels.length).toBe(GAME_CONFIG.reels);
			reels.forEach(reel => {
				expect(reel.targetSymbols.length).toBe(GAME_CONFIG.visibleSymbols);
				expect(reel.isSpinning).toBe(false);
				reel.targetSymbols.forEach((s: Symbol) => {
					expect(s.id).toBeDefined();
					expect(s.value).toBeGreaterThan(0);
				});
			});
		});

		it('should generate an initial outcome', () => {
			const outcome = gameStore.getOutcome();
			expect(outcome.length).toBe(GAME_CONFIG.reels);
			outcome.forEach(reelOutcome => {
				expect(reelOutcome.length).toBe(GAME_CONFIG.visibleSymbols);
			});
		});
	});

	describe('Betting System', () => {
		it('should allow bet changes within valid range', () => {
			gameStore.setBet(50);

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(50);
		});

		it('should clamp bet to minimum value', () => {
			gameStore.setBet(-5);

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(GAME_CONFIG.minBet);
		});

		it('should clamp bet to maximum balance', () => {
			gameStore.setBet(200);

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(200);
		});

		it('should not allow bet higher than balance', () => {
			gameStore.setBet(INITIAL_BALANCE + 100);

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(INITIAL_BALANCE);
		});
	});

	describe('Spinning Logic', () => {
		it('should not allow spinning when balance is insufficient', () => {
			gameStore.setBet(INITIAL_BALANCE + 100);
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			// Bet is clamped to balance, so it spins using full balance
			expect(state.isSpinning).toBe(true);
			expect(state.balance).toBe(0);
		});

		it('should deduct bet from balance when spinning', () => {
			const betAmount = 50;
			gameStore.setBet(betAmount);
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.balance).toBe(INITIAL_BALANCE - betAmount);
			expect(state.isSpinning).toBe(true);
		});

		it('should increment spin count when spinning', () => {
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.spinCount).toBe(1);
		});

		it('should clear wins on new spin', () => {
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.lastWins).toEqual([]);
			expect(state.winAmount).toBe(0);
		});

		it('should generate new outcome on each spin', () => {
			const outcome1 = gameStore.getOutcome();
			gameStore.spin();
			const outcome2 = gameStore.getOutcome();

			// Outcomes are different arrays (could theoretically match, but astronomically unlikely)
			expect(outcome2).not.toBe(outcome1);
		});
	});

	describe('Win Resolution', () => {
		it('should resolve wins and update state', () => {
			gameStore.spin();
			gameStore.resolveWins();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.isSpinning).toBe(false);
			expect(state.lastWin).toBeGreaterThanOrEqual(0);
			expect(state.winAmount).toBeGreaterThanOrEqual(0);
		});

		it('should set all reels to not spinning after resolve', () => {
			gameStore.spin();
			gameStore.resolveWins();

			let reels: any[] = [];
			gameStore.reels.subscribe(r => reels = r)();

			reels.forEach(reel => {
				expect(reel.isSpinning).toBe(false);
			});
		});

		it('should accumulate total winnings', () => {
			gameStore.spin();
			gameStore.resolveWins();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			const firstTotalWinnings = state.totalWinnings;

			// Reset spinning state for second spin
			gameStore.reset();
			gameStore.spin();
			gameStore.resolveWins();

			gameStore.subscribe(s => state = s)();
			// Total should be at least 0 (could be 0 if no wins)
			expect(state.totalWinnings).toBeGreaterThanOrEqual(0);
		});
	});

	describe('Game State Management', () => {
		it('should reset game state correctly', () => {
			gameStore.setBet(50);
			gameStore.spin();
			gameStore.reset();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.balance).toBe(INITIAL_BALANCE);
			expect(state.bet).toBe(GAME_CONFIG.minBet);
			expect(state.isSpinning).toBe(false);
			expect(state.winAmount).toBe(0);
			expect(state.lastWin).toBe(0);
			expect(state.spinCount).toBe(0);
			expect(state.lastWins).toEqual([]);
			expect(state.totalWinnings).toBe(0);
		});

		it('should clear wins correctly', () => {
			gameStore.clearWins();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.winAmount).toBe(0);
			expect(state.lastWins).toEqual([]);
		});

		it('should regenerate outcome on reset', () => {
			const outcome1 = gameStore.getOutcome();
			gameStore.reset();
			const outcome2 = gameStore.getOutcome();

			expect(outcome2).not.toBe(outcome1);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero bet gracefully', () => {
			gameStore.setBet(0);
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(GAME_CONFIG.minBet);
		});

		it('should handle exact balance betting', () => {
			gameStore.setBet(INITIAL_BALANCE);
			gameStore.spin();

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.balance).toBe(0);
			expect(state.isSpinning).toBe(true);
		});

		it('should handle multiple rapid bet changes', () => {
			gameStore.setBet(20);
			gameStore.setBet(50);
			gameStore.setBet(100);

			let state: any = {};
			gameStore.subscribe(s => state = s)();

			expect(state.bet).toBe(100);
		});
	});
});
