<script lang="ts">
	import { gameStore } from '../gameStore.js';
	import { gameLoop } from '../gameLoop.js';
	import Reel from './Reel.svelte';
	import Debugger from './Debugger.svelte';
	import DebugOverlay from './DebugOverlay.svelte';
	import RulesWindow from './RulesWindow.svelte';
	import AboutWindow from './AboutWindow.svelte';
	import PaytableWindow from './PaytableWindow.svelte';
	import WinCelebration from './WinCelebration.svelte';
	import { GAME_CONFIG } from '../config.js';
	import type { ReelState, Symbol } from '../types.js';
	import '../styles/components/SlotMachine.css';

	let reels: ReelState[] = [];
	let gameState: any = {};
	let gameLoopState: any = {};

	let debuggerVisible = false;
	let debugInfo: any[] = [];

	let winningRowsByReel: number[][] = Array.from({ length: GAME_CONFIG.reels }, () => []);
	let completedReels = new Set<number>();
	let showCelebration = false;
	let celebrationTimeout: ReturnType<typeof setTimeout>;

	let resetTimeout: ReturnType<typeof setTimeout>;

	function computeWinningPositions(wins: import('../types.js').WinResult[]): number[][] {
		const positions: number[][] = Array.from({ length: GAME_CONFIG.reels }, () => []);
		const outcome = gameStore.getOutcome();

		for (const win of wins) {
			if (win.winType === 'payline') {
				win.payLine.positions.forEach((rowIndex, reelIdx) => {
					if (!positions[reelIdx].includes(rowIndex)) {
						positions[reelIdx].push(rowIndex);
					}
				});
			} else if (win.winType === 'reel' && win.reelIndex !== undefined) {
				const reelSymbols = outcome[win.reelIndex];
				reelSymbols.forEach((s, rowIndex) => {
					if ((s.id === win.symbol.id || s.isWild) && !positions[win.reelIndex!].includes(rowIndex)) {
						positions[win.reelIndex!].push(rowIndex);
					}
				});
			}
		}

		return positions;
	}

	gameStore.subscribe(state => {
		gameState = state;

		if (state.lastWins.length > 0) {
			winningRowsByReel = computeWinningPositions(state.lastWins);
		} else {
			winningRowsByReel = Array.from({ length: GAME_CONFIG.reels }, () => []);
			showCelebration = false;
			if (celebrationTimeout) clearTimeout(celebrationTimeout);
		}

		if (state.isSpinning) {
			showCelebration = false;
			if (celebrationTimeout) clearTimeout(celebrationTimeout);
			if (resetTimeout) clearTimeout(resetTimeout);
		} else {
			if (state.winAmount > 0 && state.lastWins.length > 0) {
				if (celebrationTimeout) clearTimeout(celebrationTimeout);
				celebrationTimeout = setTimeout(() => {
					showCelebration = true;
				}, 2500);
			}

			if (resetTimeout) clearTimeout(resetTimeout);
			resetTimeout = setTimeout(() => {
				if (gameLoopState.isRunning) {
					gameLoop.resetState();
				}
			}, 10000);
		}
	});

	gameStore.reels.subscribe(state => {
		reels = state;
	});

	gameLoop.subscribe(state => {
		gameLoopState = state;
	});

	function handleSpin() {
		completedReels = new Set();
		if (gameLoopState.isRunning && !gameState.isSpinning) {
			gameLoop.resetState();
		}
		gameLoop.startSpin();
	}

	function handleSpinComplete(reelIndex: number) {
		completedReels.add(reelIndex);
		if (completedReels.size === GAME_CONFIG.reels) {
			completedReels = new Set();
			gameStore.resolveWins();
		}
	}

	const BET_PRESETS = [20, 50, 100];

	function selectBet(amount: number) {
		gameStore.setBet(amount);
	}

	function handleDebugUpdate(debugData: any) {
		const existingIndex = debugInfo.findIndex(info => info.reelIndex === debugData.reelIndex);

		if (existingIndex >= 0) {
			debugInfo[existingIndex] = debugData;
		} else {
			debugInfo.push(debugData);
		}

		debugInfo = [...debugInfo];
	}

	function handleDebuggerVisibility(data: { isVisible: boolean }) {
		debuggerVisible = data.isVisible;
	}
</script>

<div class="slot-machine">
	<header class="game-header">
		<h1 class="game-title">SPIN TO WIN</h1>
		<div class="game-stats">
			<div class="stat">
				<span class="label">Balance</span>
				<span class="value">${gameState.balance}</span>
			</div>
			<div class="stat">
				<span class="label">Last Win</span>
				<span class="value win-amount">${gameState.lastWin}</span>
			</div>
			<div class="stat">
				<span class="label">Total Won</span>
				<span class="value total-winnings">${gameState.totalWinnings}</span>
			</div>
			<div class="stat">
				<span class="label">Spins</span>
				<span class="value">{gameLoopState.spinCount}</span>
			</div>
		</div>
	</header>

	<div class="reels-container">
		{#each reels as reel, index}
			<Reel
				targetSymbols={reel.targetSymbols}
				isSpinning={reel.isSpinning}
				reelIndex={index}
				winningRows={winningRowsByReel[index] || []}
				onSpinComplete={handleSpinComplete}
				onDebugUpdate={handleDebugUpdate}
			/>
		{/each}
		<DebugOverlay
			outcome={gameStore.getOutcome()}
			isVisible={debuggerVisible}
		/>
	</div>

	<div class="controls">
		<div class="bet-controls">
			<span class="bet-label">Bet</span>
			<div class="bet-presets">
				{#each BET_PRESETS as amount}
					<button
						class="bet-preset"
						class:active={gameState.bet === amount}
						on:click={() => selectBet(amount)}
						disabled={gameLoopState.isRunning || gameState.balance < amount}
					>
						${amount}
					</button>
				{/each}
			</div>
		</div>

		<div class="action-buttons">
			<button
				class="spin-btn"
				on:click={handleSpin}
				disabled={gameLoopState.isRunning || gameState.balance < gameState.bet}
			>
				{#if gameLoopState.isRunning}
					<span class="spinning-text">Spinning...</span>
				{:else}
					SPIN
				{/if}
			</button>
		</div>
	</div>

	<WinCelebration
		wins={gameState.lastWins}
		isVisible={showCelebration}
		onClose={() => {
			showCelebration = false;
			gameStore.clearWins();
		}}
	/>

	<RulesWindow />
	<PaytableWindow />
	<AboutWindow />
</div>

<Debugger
	debugInfo={debugInfo}
	isVisible={debuggerVisible}
	onVisibilityChanged={handleDebuggerVisibility}
/>
