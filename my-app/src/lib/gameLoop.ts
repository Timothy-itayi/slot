import { writable } from 'svelte/store';
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

	let spinTimeout: number | null = null;

	function startSpin() {
		update(state => {
			// If already running, don't start a new spin
			if (state.isRunning) {
				return state;
			}
			
			
			
			// Trigger the game store spin
			gameStore.spin();
			
			// Mark as complete after a reasonable time
			spinTimeout = setTimeout(() => {
				update(currentState => ({
					...currentState,
					isRunning: false
				}));
				spinTimeout = null;
			}, 12000); // 12 seconds total for complete spin cycle
			
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