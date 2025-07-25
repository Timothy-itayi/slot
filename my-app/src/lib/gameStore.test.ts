import { describe, it, expect, beforeEach } from 'vitest';
import { gameStore } from './gameStore.js';
import { GAME_CONFIG, INITIAL_BALANCE } from './config.js';

describe('Game Store', () => {
	beforeEach(() => {
		gameStore.reset();
	});

	it('should initialize with correct default values', () => {
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.balance).toBe(INITIAL_BALANCE);
		expect(state.bet).toBe(1);
		expect(state.isSpinning).toBe(false);
		expect(state.winAmount).toBe(0);
		expect(state.lastWin).toBe(0);
		expect(state.spinCount).toBe(0);
	});

	it('should allow bet changes within valid range', () => {
		gameStore.setBet(10);
		
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.bet).toBe(10);
	});

	it('should clamp bet to minimum value', () => {
		gameStore.setBet(-5);
		
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.bet).toBe(GAME_CONFIG.minBet);
	});

	it('should clamp bet to maximum value', () => {
		gameStore.setBet(200);
		
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.bet).toBe(GAME_CONFIG.maxBet);
	});

	it('should not allow spinning when balance is insufficient', () => {
		gameStore.setBet(INITIAL_BALANCE + 100);
		gameStore.spin();
		
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.isSpinning).toBe(false);
		expect(state.balance).toBe(INITIAL_BALANCE);
	});

	it('should reset game state correctly', () => {
		// Modify some state
		gameStore.setBet(10);
		gameStore.spin();
		
		// Reset
		gameStore.reset();
		
		let state: any = {};
		gameStore.subscribe(s => state = s)();
		
		expect(state.balance).toBe(INITIAL_BALANCE);
		expect(state.bet).toBe(1);
		expect(state.isSpinning).toBe(false);
		expect(state.winAmount).toBe(0);
		expect(state.lastWin).toBe(0);
		expect(state.spinCount).toBe(0);
	});
}); 