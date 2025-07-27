<script lang="ts">
	import { gameStore } from '../gameStore.js';
	import { gameLoop } from '../gameLoop.js';
	import Reel from './Reel.svelte';
	import Debugger from './Debugger.svelte';
	import RulesWindow from './RulesWindow.svelte';
	import WinCelebration from './WinCelebration.svelte';
	import { GAME_CONFIG, SYMBOLS } from '../config.js';
	import type { ReelState, Symbol } from '../types.js';
	import '../styles/components/SlotMachine.css';

	let reels: ReelState[] = [];
	let gameState: any = {};
	let gameLoopState: any = {};
	
	// Debugger state
	let debuggerVisible = false;
	let reelArrays: Symbol[][] = [];
	let reelIndexes: number[] = [];
	let debugInfo: any[] = [];

	// Win highlighting state
	let winningSymbols: Set<string> = new Set();
	
	// Auto-reset mechanism for stuck gameLoop
	let resetTimeout: number;

	gameStore.subscribe(state => {
		gameState = state;
		
		// Track winning symbols for highlighting
		if (state.lastWins.length > 0) {
			winningSymbols = new Set(state.lastWins.map(win => win.symbol.id));
		} else {
			winningSymbols = new Set();
		}
		
		// Auto-reset mechanism: if gameLoop is stuck for more than 10 seconds, reset it
		if (state.isSpinning) {
			// Clear any existing timeout
			if (resetTimeout) {
				clearTimeout(resetTimeout);
			}
		} else {
			// If not spinning, set a timeout to reset gameLoop if it's still running
			if (resetTimeout) {
				clearTimeout(resetTimeout);
			}
			resetTimeout = setTimeout(() => {
				if (gameLoopState.isRunning) {
					console.log('🎰 SLOT MACHINE: Auto-resetting stuck gameLoop state');
					gameLoop.resetState();
				}
			}, 10000); // 10 seconds
		}
	});

	gameStore.reels.subscribe(state => {
		reels = state;
	});

	gameLoop.subscribe(state => {
		gameLoopState = state;
	});

	function handleSpin() {
		// Check if gameLoop is stuck and reset if needed
		if (gameLoopState.isRunning && !gameState.isSpinning) {
			console.log('🎰 SLOT MACHINE: Detected stuck gameLoop state, resetting...');
			gameLoop.resetState();
		}
		gameLoop.startSpin();
	}

	function handleBetChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newBet = parseInt(target.value) || 1;
		gameStore.setBet(newBet);
	}

	function increaseBet() {
		gameStore.setBet(gameState.bet + 1);
	}

	function decreaseBet() {
		gameStore.setBet(gameState.bet - 1);
	}

	function handleArrayUpdate(data: { reelIndex: number; array: Symbol[]; length: number; originalLength: number }) {
		const { reelIndex, array } = data;
		reelArrays[reelIndex] = array;
		reelIndexes[reelIndex] = reelIndex;
		reelArrays = [...reelArrays]; // Trigger reactivity
		reelIndexes = [...reelIndexes]; // Trigger reactivity
		
		// Update game store with reel data
		gameStore.updateReelData(reelIndex, array, 0); // We'll update position separately
	}

	function handleDebugUpdate(debugData: any) {
		const existingIndex = debugInfo.findIndex(info => info.reelIndex === debugData.reelIndex);
		
		if (existingIndex >= 0) {
			debugInfo[existingIndex] = debugData;
		} else {
			debugInfo.push(debugData);
		}
		
		debugInfo = [...debugInfo]; // Trigger reactivity
	}

	function handlePositionUpdate(data: { reelIndex: number; position: number }) {
		const { reelIndex, position } = data;
		
		// Update game store with current position
		if (reelArrays[reelIndex]) {
			gameStore.updateReelData(reelIndex, reelArrays[reelIndex], position);
		}
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
				symbols={reel.symbols}
				isSpinning={reel.isSpinning}
				reelIndex={index}
				winningSymbols={Array.from(winningSymbols)}
				onArrayUpdate={handleArrayUpdate}
				onDebugUpdate={handleDebugUpdate}
				onPositionUpdate={handlePositionUpdate}
			/>
		{/each}
		
		<!-- Debugger Component -->
		<div class="debugger-wrapper">
			<Debugger 
				reelArrays={reelArrays}
				reelIndexes={reelIndexes}
				debugInfo={debugInfo}
				isVisible={debuggerVisible}
				onVisibilityChanged={handleDebuggerVisibility}
			/>
		</div>
	</div>

	<div class="controls">
		<div class="bet-controls">
			<label for="bet-amount">Bet</label>
			<div class="bet-input-group">
				<button 
					class="bet-btn" 
					on:click={decreaseBet}
					disabled={gameState.bet <= GAME_CONFIG.minBet || gameLoopState.isRunning}
				>
					−
				</button>
				<input
					id="bet-amount"
					type="number"
					min={GAME_CONFIG.minBet}
					max={GAME_CONFIG.maxBet}
					value={gameState.bet}
					on:input={handleBetChange}
					disabled={gameLoopState.isRunning}
					class="bet-input"
				/>
				<button 
					class="bet-btn" 
					on:click={increaseBet}
					disabled={gameState.bet >= GAME_CONFIG.maxBet || gameLoopState.isRunning}
				>
					+
				</button>
			</div>
		</div>

		<div class="action-buttons">
			<button
				class="spin-btn"
				on:click={handleSpin}
				disabled={gameLoopState.isRunning || gameState.balance < gameState.bet}
			>
				{gameLoopState.isRunning ? 'Spinning...' : 'SPIN'}
			</button>
		</div>
	</div>

	{#if gameState.winAmount > 0}
		<div class="win-notification">
			<div class="win-amount">WIN! ${gameState.winAmount}</div>
			<div class="win-details">
				{#if gameState.lastWin > 0}
					<div class="win-breakdown">
						<span class="win-label">Last Win Breakdown:</span>
						<span class="win-value">${gameState.lastWin}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<WinCelebration 
		wins={gameState.lastWins} 
		isVisible={gameState.winAmount > 0}
		onClose={() => {
			gameStore.clearWins();
		}}
	/>



	<div class="paytable">
		<h3>Paytable</h3>
		<div class="prize-info">
			<p class="prize-description">Match 3+ symbols on any reel OR the same symbol across all reels horizontally!</p>
		</div>

	
		<div class="symbols-grid">
			{#each SYMBOLS as symbol}
				<div class="symbol-item">
					<span class="symbol-emoji">{symbol.emoji}</span>
					<span class="symbol-value">${symbol.value}</span>
					<div class="symbol-matches">
						<span class="match-3">3×: ${symbol.value * 3}</span>
						<span class="horizontal-match">Horizontal: ${symbol.value * GAME_CONFIG.reels * 2}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<RulesWindow />
</div> 