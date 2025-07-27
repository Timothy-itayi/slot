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
		spinCount: 0,
		lastWins: [],
		totalWinnings: 0
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

	// Store full reel arrays from Reel components
	let reelArrays: Symbol[][] = [];
	let reelPositions: number[] = [];

	function updateReelData(reelIndex: number, array: Symbol[], position: number) {
		console.log(`🎰 GAME STORE: updateReelData called for reel ${reelIndex + 1}, position: ${position}, array length: ${array.length}`);
		reelArrays[reelIndex] = array;
		reelPositions[reelIndex] = position;
	}

	function getVisibleSymbols(reelIndex: number): Symbol[] {
		if (!reelArrays[reelIndex] || reelArrays[reelIndex].length === 0) {
			console.warn(`🎰 GAME STORE: Reel ${reelIndex + 1} - FALLBACK: No reel array available, using original method`);
			// Fallback to original method if reel array not available
			let currentReels: ReelState[] = [];
			reels.subscribe(value => currentReels = value)();
			
			const reel = currentReels[reelIndex];
			const visible: Symbol[] = [];
			
			for (let i = 0; i < GAME_CONFIG.visibleSymbols; i++) {
				const index = (reel.position + i) % reel.symbols.length;
				visible.push(reel.symbols[index]);
			}
			
			console.warn(`🎰 GAME STORE: Reel ${reelIndex + 1} fallback visible symbols:`, visible.map(s => s.emoji).join(' '));
			return visible;
		}

		// Use the full reel array and current position
		const reelArray = reelArrays[reelIndex];
		const position = reelPositions[reelIndex] || 0;
		const visible: Symbol[] = [];
		
		console.log(`🎰 GAME STORE: Reel ${reelIndex + 1} - Using array method, position: ${position}, array length: ${reelArray.length}`);
		
		for (let i = 0; i < GAME_CONFIG.visibleSymbols; i++) {
			const index = (position + i) % reelArray.length;
			visible.push(reelArray[index]);
		}
		
		console.log(`🎰 GAME STORE: Reel ${reelIndex + 1} visible symbols:`, visible.map(s => s.emoji).join(' '));
		return visible;
	}

	// Function to check for matching symbols within each reel (3 or more symbols)
	function checkReelMatches(): WinResult[] {
		const results: WinResult[] = [];
		
		console.log('🎰 GAME STORE: Checking reel matches...');
		console.log('🎰 GAME STORE: reelArrays:', reelArrays.length);
		console.log('🎰 GAME STORE: reelPositions:', reelPositions);
		
		for (let reelIndex = 0; reelIndex < GAME_CONFIG.reels; reelIndex++) {
			const visibleSymbols = getVisibleSymbols(reelIndex);
			
			console.log(`🎰 REEL ${reelIndex + 1} visible symbols:`, visibleSymbols.map(s => s.emoji).join(' '));
			
			// Count occurrences of each symbol
			const symbolCounts = new Map<string, { symbol: Symbol; count: number }>();
			
			visibleSymbols.forEach(symbol => {
				const existing = symbolCounts.get(symbol.id);
				if (existing) {
					existing.count++;
				} else {
					symbolCounts.set(symbol.id, { symbol, count: 1 });
				}
			});
			
			// Check for 3 or more symbols on the same reel
			symbolCounts.forEach(({ symbol, count }) => {
				if (count >= 3) {
					console.log(`🎰 REEL ${reelIndex + 1} WIN: ${count}× ${symbol.emoji} (${symbol.name})`);
					// Calculate prize: symbol value * count
					const prizeAmount = symbol.value * count;
					
					results.push({
						payLine: { positions: [], multiplier: count },
						symbol: symbol,
						multiplier: count,
						amount: prizeAmount,
						reelIndex: reelIndex,
						matchCount: count,
						winType: 'reel'
					});
				}
			});
		}
		
		console.log('🎰 GAME STORE: Reel matches found:', results.length);
		return results;
	}

	// Function to check for horizontal wins (same symbol across all reels at same level)
	function checkHorizontalWins(): WinResult[] {
		const results: WinResult[] = [];
		
		console.log('🎰 GAME STORE: Checking horizontal wins...');
		
		// Get visible symbols from all reels
		const visibleSymbols: Symbol[][] = [];
		for (let i = 0; i < GAME_CONFIG.reels; i++) {
			visibleSymbols.push(getVisibleSymbols(i));
		}
		
		console.log('🎰 HORIZONTAL CHECK:');
		for (let level = 0; level < GAME_CONFIG.visibleSymbols; level++) {
			const symbolsAtLevel = visibleSymbols.map(reel => reel[level]);
			console.log(`Level ${level}:`, symbolsAtLevel.map(s => s.emoji).join(' | '));
		}
		
		// Check each level (top, middle, bottom) across all reels
		for (let level = 0; level < GAME_CONFIG.visibleSymbols; level++) {
			const symbolsAtLevel = visibleSymbols.map(reel => reel[level]);
			
			// Count occurrences of each symbol at this level
			const symbolCounts = new Map<string, { symbol: Symbol; count: number }>();
			
			symbolsAtLevel.forEach(symbol => {
				const existing = symbolCounts.get(symbol.id);
				if (existing) {
					existing.count++;
				} else {
					symbolCounts.set(symbol.id, { symbol, count: 1 });
				}
			});
			
			// Check for symbols that appear 2 or more times at this level
			symbolCounts.forEach(({ symbol, count }) => {
				if (count >= 2) {
					console.log(`🎰 HORIZONTAL WIN at level ${level}: ${count}× ${symbol.emoji} (${symbol.name})`);
					// Calculate prize: symbol value * matching count * bonus multiplier
					const prizeAmount = symbol.value * count * 2; // 2x bonus for horizontal match
					
					results.push({
						payLine: { positions: [], multiplier: count * 2 },
						symbol: symbol,
						multiplier: count * 2,
						amount: prizeAmount,
						reelIndex: -1, // -1 indicates horizontal win (not reel-specific)
						matchCount: count,
						winType: 'horizontal' // Add win type for display
					});
				}
			});
		}
		
		console.log('🎰 GAME STORE: Horizontal wins found:', results.length);
		return results;
	}

	// Removed payline wins - only checking reel matches and index matches

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
						// Wait longer to ensure all position updates are processed
						setTimeout(() => {
							console.log('🎰 GAME STORE: Starting win checking process...');
							console.log('🎰 GAME STORE: Current reel positions:', reelPositions);
							console.log('🎰 GAME STORE: Reel arrays available:', reelArrays.map((arr, i) => `Reel ${i + 1}: ${arr ? arr.length : 'null'} symbols`));
							
							// Validate we have all reel data
							const missingReels = [];
							for (let i = 0; i < GAME_CONFIG.reels; i++) {
								if (!reelArrays[i] || reelArrays[i].length === 0 || reelPositions[i] === undefined) {
									missingReels.push(i + 1);
								}
							}
							
							if (missingReels.length > 0) {
								console.warn(`🎰 GAME STORE: Missing reel data for reels: ${missingReels.join(', ')} - proceeding with fallback`);
							}
							
							// Check for reel matches and horizontal wins only
							const reelMatches = checkReelMatches();
							const horizontalWins = checkHorizontalWins();
							
							// Combine all wins
							const allWins = [...reelMatches, ...horizontalWins];
							const totalWin = allWins.reduce((sum, win) => sum + win.amount, 0);

							console.log('🎰 GAME STORE: Spin cycle completed');
							console.log('🎰 GAME STORE: Reel matches:', reelMatches.length);
							console.log('🎰 GAME STORE: Horizontal wins:', horizontalWins.length);
							console.log('🎰 GAME STORE: Total win amount:', totalWin);
							console.log('🎰 GAME STORE: All wins:', allWins);
							
							update(state => ({
								...state,
								isSpinning: false,
								winAmount: totalWin,
								lastWin: totalWin,
								balance: state.balance + totalWin,
								lastWins: allWins, // Store detailed win information
								totalWinnings: state.totalWinnings + totalWin // Accumulate total winnings
							}));
						}, 1000); // Increased delay to 1 second to ensure position updates are processed
					}
				}, index * 500); // 500ms delay between each reel stopping
			}
		}, 8000); // 8 seconds total spin duration
	}

	function setBet(amount: number) {
		update(state => ({
			...state,
			bet: Math.max(GAME_CONFIG.minBet, Math.min(state.balance, amount))
		}));
	}

	function reset() {
		set({
			balance: INITIAL_BALANCE,
			bet: 1,
			isSpinning: false,
			winAmount: 0,
			lastWin: 0,
			spinCount: 0,
			lastWins: [],
			totalWinnings: 0
		});

		reels.set(
			Array.from({ length: GAME_CONFIG.reels }, (_, index) => ({
				symbols: generateReelSymbols(),
				position: index * 2, // Give each reel a different starting position
				isSpinning: false
			}))
		);
	}

	function clearWins() {
		update(state => ({
			...state,
			winAmount: 0,
			lastWins: []
		}));
	}

	return {
		subscribe,
		reels: { subscribe: reels.subscribe },
		spin,
		setBet,
		reset,
		clearWins,
		getVisibleSymbols,
		updateReelData,
		checkReelMatches,
		checkHorizontalWins
	};
}

export const gameStore = createGameStore(); 