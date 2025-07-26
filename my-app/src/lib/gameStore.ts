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
		console.log('🎰 GAME STORE: spin() called at', new Date().toLocaleTimeString());
		
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

		// Start all reels spinning with cascading delays
		for (let index = 0; index < GAME_CONFIG.reels; index++) {
			setTimeout(() => {
				console.log(`🎰 GAME STORE: Starting reel ${index + 1}`);
				reels.update(currentReels => {
					const updatedReels = [...currentReels];
					updatedReels[index] = {
						...updatedReels[index],
						isSpinning: true
					};
					return updatedReels;
				});
			}, index * 500); // 500ms delay between each reel
		}

		// Stop all reels after 8 seconds with cascading delays
		setTimeout(() => {
			console.log('🎰 GAME STORE: Stopping reels');
			for (let index = 0; index < GAME_CONFIG.reels; index++) {
				setTimeout(() => {
					console.log(`🎰 GAME STORE: Stopping reel ${index + 1}`);
					reels.update(currentReels => {
						const updatedReels = [...currentReels];
						updatedReels[index] = {
							...updatedReels[index],
							isSpinning: false
						};
						return updatedReels;
					});

					// Check for wins after the last reel stops
					if (index === GAME_CONFIG.reels - 1) {
						setTimeout(() => {
							const wins = checkWinningLines();
							const totalWin = wins.reduce((sum, win) => sum + win.amount, 0);

							console.log('🎰 GAME STORE: Spin cycle completed');
							update(state => ({
								...state,
								isSpinning: false,
								winAmount: totalWin,
								lastWin: totalWin,
								balance: state.balance + totalWin
							}));
						}, 100);
					}
				}, index * 500); // 500ms delay between each reel stopping
			}
		}, 8000); // 8 seconds total spin duration
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