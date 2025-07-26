import { writable, derived } from 'svelte/store';
import type { GameState, ReelState, Symbol, WinResult } from './types.js';
import { GAME_CONFIG, SYMBOLS, INITIAL_BALANCE } from './config.js';

function createGameStore() {
	const { subscribe, set, update } = writable<GameState>({
		balance: INITIAL_BALANCE,
		bet: 1,
		isSpinning: false,
		winAmount: 0,
		lastWin: 0,
		spinCount: 0
	});

	const reels = writable<ReelState[]>(
		Array.from({ length: GAME_CONFIG.reels }, (_, index) => ({
			symbols: generateReelSymbols(),
			position: index * 2, // Give each reel a different starting position
			isSpinning: false
		}))
	);

	// Track timeouts to clear them on new spins
	let spinTimeouts: number[] = [];

	function generateReelSymbols(): Symbol[] {
		return Array.from({ length: GAME_CONFIG.symbolsPerReel }, () => {
			const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
			return SYMBOLS[randomIndex];
		});
	}

	function getVisibleSymbols(reelIndex: number): Symbol[] {
		let currentReels: ReelState[] = [];
		reels.subscribe(value => currentReels = value)();
		
		const reel = currentReels[reelIndex];
		const visible: Symbol[] = [];
		
		for (let i = 0; i < GAME_CONFIG.visibleSymbols; i++) {
			const index = (reel.position + i) % reel.symbols.length;
			visible.push(reel.symbols[index]);
		}
		
		return visible;
	}

	function checkWinningLines(): WinResult[] {
		const visibleSymbols: Symbol[][] = [];
		
		for (let i = 0; i < GAME_CONFIG.reels; i++) {
			visibleSymbols.push(getVisibleSymbols(i));
		}
		
		const results: WinResult[] = [];
		
		GAME_CONFIG.payLines.forEach(payLine => {
			const lineSymbols = payLine.positions.map(pos => {
				const reelIndex = Math.floor(pos / GAME_CONFIG.visibleSymbols);
				const symbolIndex = pos % GAME_CONFIG.visibleSymbols;
				return visibleSymbols[reelIndex][symbolIndex];
			});
			
			// Check if all symbols in the line are the same
			const firstSymbol = lineSymbols[0];
			const isWinningLine = lineSymbols.every(symbol => symbol.id === firstSymbol.id);
			
			if (isWinningLine) {
				results.push({
					payLine,
					symbol: firstSymbol,
					multiplier: payLine.multiplier,
					amount: firstSymbol.value * payLine.multiplier
				});
			}
		});
		
		return results;
	}

	function spin() {
		// Clear any existing timeouts from previous spins
		spinTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
		spinTimeouts = [];

		update(state => {
			if (state.balance < state.bet) return state;
			
			return {
				...state,
				balance: state.balance - state.bet,
				isSpinning: true,
				winAmount: 0,
				spinCount: state.spinCount + 1
			};
		});

		// Start spinning reels with cascading delays
		// Each reel starts 500ms after the previous one
		// Don't reset positions - let reels continue from where they are
		reels.update(currentReels => {
			return currentReels.map((reel, index) => ({
				...reel,
				isSpinning: false // Start with all reels not spinning, but keep current positions
			}));
		});

		// Start each reel with a delay
		for (let index = 0; index < GAME_CONFIG.reels; index++) {
			const timeoutId = setTimeout(() => {
				reels.update(currentReels => {
					const updatedReels = [...currentReels];
					updatedReels[index] = {
						...updatedReels[index],
						isSpinning: true
					};
					return updatedReels;
				});
			}, index * 500); // 500ms delay between each reel starting
			spinTimeouts.push(timeoutId);
		}

		// Stop reels with cascading delays and check for wins
		// Total spin duration: 8000ms + (reel count - 1) * 500ms for start delays
		const totalSpinDuration = 8000 + (GAME_CONFIG.reels - 1) * 500;
		
		const mainTimeoutId = setTimeout(() => {
			// Stop reels one by one with 500ms delays
			for (let index = 0; index < GAME_CONFIG.reels; index++) {
				const stopTimeoutId = setTimeout(() => {
					reels.update(currentReels => {
						const updatedReels = [...currentReels];
						updatedReels[index] = {
							...updatedReels[index],
							isSpinning: false
							// Don't set random position - let reel continue from where it stopped
						};
						return updatedReels;
					});

					// Check for wins after the last reel stops
					if (index === GAME_CONFIG.reels - 1) {
						const winTimeoutId = setTimeout(() => {
							const wins = checkWinningLines();
							const totalWin = wins.reduce((sum, win) => sum + win.amount, 0);

							update(state => ({
								...state,
								isSpinning: false,
								winAmount: totalWin,
								lastWin: totalWin,
								balance: state.balance + totalWin
							}));
						}, 100); // Small delay to ensure all reels have stopped
						spinTimeouts.push(winTimeoutId);
					}
				}, index * 500); // 500ms delay between each reel stopping
				spinTimeouts.push(stopTimeoutId);
			}
		}, totalSpinDuration);
		spinTimeouts.push(mainTimeoutId);
	}

	function setBet(amount: number) {
		update(state => ({
			...state,
			bet: Math.max(GAME_CONFIG.minBet, Math.min(GAME_CONFIG.maxBet, amount))
		}));
	}

	function reset() {
		set({
			balance: INITIAL_BALANCE,
			bet: 1,
			isSpinning: false,
			winAmount: 0,
			lastWin: 0,
			spinCount: 0
		});

		reels.set(
			Array.from({ length: GAME_CONFIG.reels }, (_, index) => ({
				symbols: generateReelSymbols(),
				position: index * 2, // Give each reel a different starting position
				isSpinning: false
			}))
		);
	}

	return {
		subscribe,
		reels: { subscribe: reels.subscribe },
		spin,
		setBet,
		reset,
		getVisibleSymbols,
		checkWinningLines
	};
}

export const gameStore = createGameStore(); 