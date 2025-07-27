<script lang="ts">
	import { gameStore } from '../gameStore.js';
	import { gameLoop } from '../gameLoop.js';
	import Reel from './Reel.svelte';
	import Debugger from './Debugger.svelte';
	import RulesWindow from './RulesWindow.svelte';
	import AboutWindow from './AboutWindow.svelte';
	import WinCelebration from './WinCelebration.svelte';
	import { GAME_CONFIG, SYMBOLS } from '../config.js';
	import type { ReelState, Symbol } from '../types.js';
	import '../styles/components/SlotMachine.css';
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

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
	
	// Particle effect variables
	let spinButtonRef: HTMLButtonElement;
	let particleContainer: HTMLDivElement;
	let spinningAnimation: gsap.core.Timeline | null = null;

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
		
		// Handle spinning animation
		if (state.isRunning && spinButtonRef) {
			startSpinningAnimation();
		} else if (spinningAnimation) {
			stopSpinningAnimation();
		}
	});

	function handleSpin(event: MouseEvent) {
		// Check if gameLoop is stuck and reset if needed
		if (gameLoopState.isRunning && !gameState.isSpinning) {
			console.log('🎰 SLOT MACHINE: Detected stuck gameLoop state, resetting...');
			gameLoop.resetState();
		}
		
		// Trigger particle effect with click position
		createParticles(event);
		
		gameLoop.startSpin();
	}
	
	function createParticles(event: MouseEvent) {
		if (!spinButtonRef || !particleContainer) return;
		
		const buttonRect = spinButtonRef.getBoundingClientRect();
		const containerRect = particleContainer.getBoundingClientRect();
		
		// Get click position relative to the button
		const clickX = event.clientX - buttonRect.left;
		const clickY = event.clientY - buttonRect.top;
		
		// Position relative to container
		const startX = buttonRect.left + clickX - containerRect.left;
		const startY = buttonRect.top + clickY - containerRect.top;
		
		// Create multiple particles
		for (let i = 0; i < 15; i++) {
			const particle = document.createElement('div');
			particle.className = 'spin-particle';
			
			// Set random color for each particle
			const colors = [
				'#ff6b9d', // Pink
				'#ff9500', // Orange
				'#ffdd00', // Yellow
				'#00d4aa', // Teal
				'#6b73ff', // Blue
				'#ff3333', // Red
				'#33ff88', // Green
				'#8b5cf6', // Purple
				'#ff69b4', // Hot Pink
				'#00ffff'  // Cyan
			];
			const randomColor = colors[Math.floor(Math.random() * colors.length)];
			particle.style.background = randomColor;
			particle.style.boxShadow = `0 0 6px ${randomColor}`;
			
			particle.style.left = `${startX}px`;
			particle.style.top = `${startY}px`;
			
			particleContainer.appendChild(particle);
			
			// Random direction and distance
			const angle = (Math.PI * 2 * i) / 15;
			const distance = 80 + Math.random() * 40;
			const endX = startX + Math.cos(angle) * distance;
			const endY = startY + Math.sin(angle) * distance;
			
			// GSAP animation
			gsap.fromTo(particle, 
				{
					scale: 0,
					opacity: 1,
					rotation: 0
				},
				{
					x: endX - startX,
					y: endY - startY,
					scale: 1,
					opacity: 0,
					rotation: 360,
					duration: 0.8,
					ease: "power2.out",
					onComplete: () => {
						particle.remove();
					}
				}
			);
		}
	}
	
	function startSpinningAnimation() {
		if (!spinButtonRef || spinningAnimation) return;
		
		// Create a timeline for the spinning animation
		spinningAnimation = gsap.timeline({ repeat: -1 });
		
		const spinningText = spinButtonRef.querySelector('.spinning-text');
		
		// Gentle pulsing effect on button
		spinningAnimation
			.to(spinButtonRef, {
				scale: 1.02,
				duration: 1.2,
				ease: "power2.inOut"
			})
			.to(spinButtonRef, {
				scale: 1,
				duration: 1.2,
				ease: "power2.inOut"
			})
			// Subtle glow effect
			.to(spinButtonRef, {
				boxShadow: "0 6px 16px rgba(108, 117, 125, 0.4), 0 0 12px rgba(108, 117, 125, 0.3)",
				duration: 1.5,
				ease: "power2.inOut"
			}, 0)
			.to(spinButtonRef, {
				boxShadow: "0 4px 12px rgba(73, 80, 87, 0.3), 0 0 8px rgba(73, 80, 87, 0.2)",
				duration: 1.5,
				ease: "power2.inOut"
			}, 1.2);
			
		// Enhanced metallic shine effect on text
		if (spinningText) {
			spinningAnimation.to(spinningText, {
				backgroundPosition: "300% 0",
				duration: 2.5,
				ease: "power2.inOut",
				repeat: -1,
				yoyo: true
			}, 0);
		}
	}
	
	function stopSpinningAnimation() {
		if (spinningAnimation) {
			spinningAnimation.kill();
			spinningAnimation = null;
			
			// Reset button to normal state
			if (spinButtonRef) {
				gsap.set(spinButtonRef, {
					scale: 1,
					boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
				});
			}
		}
	}

	function handleBetChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newBet = parseInt(target.value) || 1;
		gameStore.setBet(newBet);
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
	<!-- Particle container for effects -->
	<div class="particle-container" bind:this={particleContainer}></div>
	
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
			<input
				id="bet-amount"
				type="number"
				min={GAME_CONFIG.minBet}
				max={gameState.balance}
				value={gameState.bet}
				on:input={handleBetChange}
				disabled={gameLoopState.isRunning}
				class="bet-input-solo"
			/>
		</div>

		<div class="action-buttons">
			<button
				class="spin-btn"
				bind:this={spinButtonRef}
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
	<AboutWindow />
</div> 