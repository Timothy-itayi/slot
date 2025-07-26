import { writable, derived } from 'svelte/store';
import { gameStore } from './gameStore.js';

export interface GameLoopState {
	isRunning: boolean;
	spinCount: number;
}

function createGameLoop() {
	const { subscribe, set, update } = writable<GameLoopState>({
		isRunning: false,
		spinCount: 0
	});

	// Watch gameStore.isSpinning changes
	const gameState = derived(gameStore, ($gameStore) => $gameStore.isSpinning);

	gameState.subscribe((isSpinning) => {
		console.log('🎰 GAME LOOP: gameStore.isSpinning changed to:', isSpinning);
		
		update(state => {
			if (!isSpinning && state.isRunning) {
				console.log('🎰 GAME LOOP: Spin cycle completed');
				return {
					...state,
					isRunning: false
				};
			}
			return state;
		});
	});

	function startSpin() {
		console.log('🎰 GAME LOOP: startSpin() called - User initiated spin');
		
		update(state => {
			if (state.isRunning) {
				console.log('🎰 GAME LOOP: Spin already running, ignoring request');
				return state;
			}
			
			console.log('🎰 GAME LOOP: Starting new spin cycle');
			
			// Trigger the game store spin
			gameStore.spin();
			
			return {
				...state,
				isRunning: true,
				spinCount: state.spinCount + 1
			};
		});
	}

	return {
		subscribe,
		startSpin
	};
}

export const gameLoop = createGameLoop(); 