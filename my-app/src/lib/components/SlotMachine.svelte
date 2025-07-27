<script lang="ts">
	import { gameStore } from '../gameStore.js';
	import { gameLoop } from '../gameLoop.js';
	import Reel from './Reel.svelte';
	import Debugger from './Debugger.svelte';
	import RulesWindow from './RulesWindow.svelte';
	import WinCelebration from './WinCelebration.svelte';
	import { GAME_CONFIG, SYMBOLS } from '../config.js';
	import type { ReelState, Symbol } from '../types.js';

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
		<h1 class="game-title">SpinCycle</h1>
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

	<!-- Debug info for win celebration -->
	{#if gameState.winAmount > 0}
		<div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;">
			Debug: Win detected!<br>
			Win Amount: ${gameState.winAmount}<br>
			Last Wins Count: {gameState.lastWins.length}<br>
			Wins: {JSON.stringify(gameState.lastWins.map((w: any) => `${w.matchCount}× ${w.symbol.emoji} (${w.winType})`))}
		</div>
	{/if}

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

<style>
	.slot-machine {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		background: #fff;
		border: 2px solid #000;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.game-header {
		text-align: center;
		margin-bottom: 20px;
	}

	.game-title {
		font-size: 1.8rem;
		font-weight: bold;
		color: #000;
		margin: 0 0 15px 0;
		letter-spacing: 1px;
	}

	.game-stats {
		display: flex;
		justify-content: space-around;
		gap: 15px;
		flex-wrap: wrap;
	}

	.stat {
		background: #f8f8f8;
		padding: 8px 12px;
		border-radius: 6px;
		border: 1px solid #ddd;
		min-width: 80px;
	}

	.label {
		color: #666;
		font-size: 0.75rem;
		display: block;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		color: #000;
		font-size: 1rem;
		font-weight: bold;
		display: block;
	}

	.win-amount {
		color: #000;
	}

	.total-winnings {
		color: #22c55e;
		font-weight: bold;
	}

	.reels-container {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin: 20px 0;
		padding: 15px;
		background: #f8f8f8;
		border-radius: 8px;
		border: 1px solid #ddd;
		position: relative;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
		align-items: center;
		margin: 20px 0;
	}

	.bet-controls {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.bet-controls label {
		color: #000;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.bet-input-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.bet-btn {
		width: 32px;
		height: 32px;
		border: 1px solid #000;
		background: #fff;
		color: #000;
		font-size: 1.2rem;
		font-weight: bold;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bet-btn:hover:not(:disabled) {
		background: #000;
		color: #fff;
	}

	.bet-btn:disabled {
		background: #f0f0f0;
		color: #ccc;
		border-color: #ccc;
		cursor: not-allowed;
	}

	.bet-input {
		width: 60px;
		height: 32px;
		text-align: center;
		border: 1px solid #000;
		border-radius: 4px;
		background: #fff;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.action-buttons {
		display: flex;
		gap: 10px;
	}

	.spin-btn {
		padding: 10px 20px;
		font-size: 1rem;
		font-weight: bold;
		background: #000;
		color: #fff;
		border: 1px solid #000;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.spin-btn:hover:not(:disabled) {
		background: #fff;
		color: #000;
	}

	.spin-btn:disabled {
		background: #ccc;
		color: #666;
		border-color: #ccc;
		cursor: not-allowed;
	}



	.win-notification {
		text-align: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: #000;
		background: #f8f8f8;
		padding: 10px;
		border-radius: 6px;
		margin: 15px 0;
		border: 1px solid #000;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	.paytable {
		margin-top: 20px;
		padding: 15px;
		background: #f8f8f8;
		border-radius: 8px;
		border: 1px solid #ddd;
	}

	.paytable h3 {
		color: #000;
		text-align: center;
		margin: 0 0 10px 0;
		font-size: 1rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.prize-info {
		text-align: center;
		margin-bottom: 15px;
		padding: 10px;
		background: #e0e0e0;
		border-radius: 6px;
		border: 1px solid #ccc;
	}

	.prize-description {
		color: #666;
		font-size: 0.8rem;
		margin: 0;
	}

	.winning-types {
		display: flex;
		gap: 15px;
		margin-bottom: 15px;
		justify-content: center;
	}

	.win-type {
		text-align: center;
		padding: 10px;
		background: #e8f4fd;
		border-radius: 6px;
		border: 1px solid #b3d9ff;
		flex: 1;
		max-width: 200px;
	}

	.win-type h4 {
		margin: 0 0 5px 0;
		color: #000;
		font-size: 0.85rem;
		font-weight: bold;
	}

	.win-type p {
		margin: 0;
		color: #666;
		font-size: 0.75rem;
		line-height: 1.2;
	}

	.symbols-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 8px;
	}

	.symbol-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px;
		background: #fff;
		border-radius: 4px;
		border: 1px solid #ddd;
		text-align: center;
	}

	.symbol-emoji {
		font-size: 1.5rem;
		margin-bottom: 4px;
	}

	.symbol-value {
		color: #000;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.symbol-matches {
		margin-top: 5px;
		font-size: 0.7rem;
		color: #666;
	}

	.match-3 {
		display: block;
	}

	.horizontal-match {
		display: block;
		color: #9c27b0;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.slot-machine {
			padding: 15px;
			margin: 10px;
		}

		.game-title {
			font-size: 1.5rem;
		}

		.game-stats {
			flex-direction: column;
			align-items: center;
			gap: 8px;
		}

		.stat {
			min-width: 120px;
		}

		.reels-container {
			flex-direction: column;
			align-items: center;
			gap: 4px;
		}

		.bet-controls {
			flex-direction: column;
			gap: 8px;
		}

		.action-buttons {
			flex-direction: column;
			width: 100%;
		}

		.spin-btn {
			width: 100%;
		}

		.symbols-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Debugger positioning */
	.debugger-wrapper {
		position: relative;
	}

	@media (max-width: 480px) {
		.slot-machine {
			padding: 10px;
		}

		.game-title {
			font-size: 1.3rem;
		}

		.symbols-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style> 