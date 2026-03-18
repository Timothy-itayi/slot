import { writable } from 'svelte/store';
import type { GameState, ReelState, Symbol, WinResult } from './types.js';
import { GAME_CONFIG, SYMBOLS, SYMBOL_WEIGHTS, INITIAL_BALANCE, REEL_START_DELAY, REEL_MATCH_3X, REEL_MATCH_4X } from './config.js';

const STORAGE_KEY = 'spincycle-game-state';
const isBrowser = typeof window !== 'undefined';

function loadState(): Partial<GameState> | null {
	if (!isBrowser) return null;
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return null;
		const parsed = JSON.parse(data);
		if (typeof parsed.balance !== 'number' || parsed.balance < 0) return null;
		if (typeof parsed.bet !== 'number') return null;
		return parsed;
	} catch {
		return null;
	}
}

function saveState(state: GameState) {
	if (!isBrowser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			balance: state.balance,
			bet: state.bet,
			totalWinnings: state.totalWinnings,
			spinCount: state.spinCount
		}));
	} catch { /* storage full or unavailable */ }
}

function clearSavedState() {
	if (!isBrowser) return;
	try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

function createGameStore() {
	function weightedRandomSymbol(): Symbol {
		const totalWeight = SYMBOLS.reduce((sum, s) => sum + (SYMBOL_WEIGHTS[s.id] || 1), 0);
		let r = Math.random() * totalWeight;
		for (const s of SYMBOLS) {
			r -= SYMBOL_WEIGHTS[s.id] || 1;
			if (r <= 0) return s;
		}
		return SYMBOLS[SYMBOLS.length - 1];
	}

	function determineOutcome(): Symbol[][] {
		return Array.from({ length: GAME_CONFIG.reels }, () =>
			Array.from({ length: GAME_CONFIG.visibleSymbols }, () => weightedRandomSymbol())
		);
	}

	let currentOutcome = determineOutcome();

	let saved = loadState();
	if (saved && (saved.balance ?? 0) < GAME_CONFIG.minBet) {
		clearSavedState();
		saved = null;
	}

	const { subscribe, set, update } = writable<GameState>({
		balance: saved?.balance ?? INITIAL_BALANCE,
		bet: Math.max(GAME_CONFIG.minBet, Math.min(saved?.bet ?? GAME_CONFIG.minBet, saved?.balance ?? INITIAL_BALANCE)),
		isSpinning: false,
		winAmount: 0,
		lastWin: 0,
		spinCount: saved?.spinCount ?? 0,
		lastWins: [],
		totalWinnings: saved?.totalWinnings ?? 0
	});

	let saveTimeout: ReturnType<typeof setTimeout>;
	subscribe(state => {
		if (!state.isSpinning) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => saveState(state), 500);
		}
	});

	const reels = writable<ReelState[]>(
		Array.from({ length: GAME_CONFIG.reels }, (_, i) => ({
			targetSymbols: currentOutcome[i],
			isSpinning: false
		}))
	);

	function getCurrentBet(): number {
		let currentBet = GAME_CONFIG.minBet;
		subscribe(state => { currentBet = state.bet; })();
		return currentBet;
	}

	function checkPayLineWins(): WinResult[] {
		if (!currentOutcome) return [];

		const results: WinResult[] = [];
		const bet = getCurrentBet();
		const betMultiplier = bet / GAME_CONFIG.minBet;

		for (const payLine of GAME_CONFIG.payLines) {
			const symbolsOnLine = payLine.positions.map(
				(row, reelIndex) => currentOutcome[reelIndex][row]
			);

			const nonWild = symbolsOnLine.filter(s => !s.isWild);

			if (nonWild.length === 0) {
				const wildSymbol = symbolsOnLine[0];
				results.push({
					payLine,
					symbol: wildSymbol,
					multiplier: payLine.multiplier,
					amount: Math.round(wildSymbol.value * payLine.multiplier * betMultiplier),
					matchCount: GAME_CONFIG.reels,
					winType: 'payline'
				});
			} else {
				const anchor = nonWild[0];
				if (nonWild.every(s => s.id === anchor.id)) {
					results.push({
						payLine,
						symbol: anchor,
						multiplier: payLine.multiplier,
						amount: Math.round(anchor.value * payLine.multiplier * betMultiplier),
						matchCount: GAME_CONFIG.reels,
						winType: 'payline'
					});
				}
			}
		}

		return results;
	}

	function checkReelMatches(): WinResult[] {
		if (!currentOutcome) return [];

		const results: WinResult[] = [];
		const bet = getCurrentBet();
		const betMultiplier = bet / GAME_CONFIG.minBet;

		for (let reelIndex = 0; reelIndex < GAME_CONFIG.reels; reelIndex++) {
			const reelSymbols = currentOutcome[reelIndex];
			const wildCount = reelSymbols.filter(s => s.isWild).length;
			const counts = new Map<string, { symbol: Symbol; count: number }>();

			for (const symbol of reelSymbols) {
				if (symbol.isWild) continue;
				const existing = counts.get(symbol.id);
				if (existing) {
					existing.count++;
				} else {
					counts.set(symbol.id, { symbol, count: 1 });
				}
			}

			counts.forEach(({ symbol, count }) => {
				const total = count + wildCount;
				if (total >= 3) {
					const matchMultiplier = total >= 4 ? REEL_MATCH_4X : REEL_MATCH_3X;
					results.push({
						payLine: { id: 0, name: `Reel ${reelIndex + 1}`, positions: [], multiplier: matchMultiplier },
						symbol,
						multiplier: matchMultiplier,
						amount: Math.round(symbol.value * matchMultiplier * betMultiplier),
						matchCount: total,
						winType: 'reel',
						reelIndex
					});
				}
			});
		}

		return results;
	}

	function spin() {
		update(state => {
			if (state.balance < state.bet) return state;

			return {
				...state,
				balance: state.balance - state.bet,
				isSpinning: true,
				winAmount: 0,
				lastWin: 0,
				lastWins: [],
				spinCount: state.spinCount + 1
			};
		});

		currentOutcome = determineOutcome();

		reels.update(currentReels =>
			currentReels.map((reel, i) => ({
				...reel,
				targetSymbols: currentOutcome[i]
			}))
		);

		for (let index = 0; index < GAME_CONFIG.reels; index++) {
			setTimeout(() => {
				reels.update(currentReels => {
					const updated = [...currentReels];
					updated[index] = { ...updated[index], isSpinning: true };
					return updated;
				});
			}, index * REEL_START_DELAY);
		}
	}

	function resolveWins() {
		const payLineWins = checkPayLineWins();
		const reelMatchWins = checkReelMatches();
		const wins = [...payLineWins, ...reelMatchWins];
		const totalWin = wins.reduce((sum, w) => sum + w.amount, 0);

		reels.update(currentReels =>
			currentReels.map(reel => ({ ...reel, isSpinning: false }))
		);

		update(state => ({
			...state,
			isSpinning: false,
			winAmount: totalWin,
			lastWin: totalWin,
			balance: state.balance + totalWin,
			lastWins: wins,
			totalWinnings: state.totalWinnings + totalWin
		}));
	}

	function setBet(amount: number) {
		update(state => ({
			...state,
			bet: Math.max(GAME_CONFIG.minBet, Math.min(state.balance, amount))
		}));
	}

	function reset() {
		clearSavedState();
		currentOutcome = determineOutcome();

		set({
			balance: INITIAL_BALANCE,
			bet: GAME_CONFIG.minBet,
			isSpinning: false,
			winAmount: 0,
			lastWin: 0,
			spinCount: 0,
			lastWins: [],
			totalWinnings: 0
		});

		reels.set(
			Array.from({ length: GAME_CONFIG.reels }, (_, i) => ({
				targetSymbols: currentOutcome[i],
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

	function getOutcome(): Symbol[][] {
		return currentOutcome;
	}

	return {
		subscribe,
		reels: { subscribe: reels.subscribe },
		spin,
		resolveWins,
		setBet,
		reset,
		clearWins,
		getOutcome
	};
}

export const gameStore = createGameStore();
