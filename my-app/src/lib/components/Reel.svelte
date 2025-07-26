<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import type { Symbol } from '../types.js';
	import { GAME_CONFIG, SYMBOLS } from '../config.js';

	// Each reel maintains independent position tracking while sharing the same infinite scroll logic
	// This ensures all reels display symbols correctly without interfering with each other

	export let symbols: Symbol[] = [];


	export let isSpinning = false;
	export let position = 0;
	export let reelIndex = 0;

	// Each reel maintains its own internal position for independent infinite scroll
	let internalPosition = position;
	let container: HTMLElement;
	let reelFrame: HTMLElement;
	let spinning = false;
	let spinDuration = 8000;
	let animation: gsap.core.Timeline;
	interface DebugSymbol {
		index: number;
		symbol: string;
		position: number;
	}

	interface DebugInfo {
		currentPosition: number;
		visibleSymbols: DebugSymbol[];
		scrollProgress: number;
		totalDistance: number;
		symbolIndex: number;
		duplicatedSymbolsLength: number;
		maxSymbolIndex: number;
	}

	let debugInfo: DebugInfo = {
		currentPosition: 0,
		visibleSymbols: [],
		scrollProgress: 0,
		totalDistance: 0,
		symbolIndex: 0,
		duplicatedSymbolsLength: 0,
		maxSymbolIndex: 0
	};

	// Create duplicated symbols for infinite scroll effect - much larger array for continuous spinning
	// Each reel has 50 repetitions of the original symbols for very long spin distances
	$: duplicatedSymbols = symbols.length > 0 ? Array(50).fill(symbols).flat() : [];

	function updateSymbols() {
		if (!container) return;

		const symbolElements = container.querySelectorAll('.symbol');
		const visibleSymbols: DebugSymbol[] = [];

		symbolElements.forEach((element, index) => {
			// Use internal position for independent reel behavior
			// Ensure we never go out of bounds
			const symbolIndex = duplicatedSymbols.length > 0 ? 
				((internalPosition + index) % duplicatedSymbols.length + duplicatedSymbols.length) % duplicatedSymbols.length : 0;
			const symbol = duplicatedSymbols[symbolIndex];
			
			if (symbol && element instanceof HTMLElement) {
				// Never update symbol text - keep symbols completely static
				element.style.color = symbol.color;
				visibleSymbols.push({
					index: symbolIndex,
					symbol: symbol.emoji,
					position: internalPosition + index
				});
			}
		});

		// Update debug info
		debugInfo.visibleSymbols = visibleSymbols;
		debugInfo.symbolIndex = internalPosition;
		debugInfo.duplicatedSymbolsLength = duplicatedSymbols.length;
		debugInfo.maxSymbolIndex = Math.max(...visibleSymbols.map(s => s.index));
	}

	function startSpin() {
		if (!reelFrame) return;

		// Always kill any existing animation first
		if (animation) {
			animation.kill();
		}

		// Don't reset position - let it continue from where it is
		// Get current position to continue from there
		const currentY = Number(gsap.getProperty(reelFrame, "y")) || 0;

		spinning = true;
		
		// Calculate spin distance based on revolutions
		// Don't set a specific target - just spin for the duration
		const revolutions = reelIndex === 0 ? 1 : 2; // 1, 2, 2 revolutions
		const totalDistance = revolutions * symbols.length * 60; // 60px per symbol
		
		// Update debug info
		debugInfo.totalDistance = totalDistance;
		
		// Create GSAP timeline for smooth scroll animation
		animation = gsap.timeline({
			onComplete: () => {
				spinning = false;
				// Animation complete - reel has physically scrolled
			}
		});

		// Animate the reel frame with infinite scroll effect
		// Start from current position and animate to new position
		animation.to(reelFrame, {
			y: currentY - totalDistance,
			duration: spinDuration / 1000, // Convert to seconds
			ease: "power2.out", // Smooth deceleration
			onUpdate: () => {
				// Calculate current position based on animation progress
				const progress = animation.progress();
				const currentDistance = totalDistance * progress;
				
				// Update debug info
				debugInfo.scrollProgress = progress;
				debugInfo.currentPosition = currentDistance;
			}
		});
	}

	// Initialize internal position when position prop changes (only on first load)
	$: if (position !== undefined && !spinning && internalPosition === 0) {
		internalPosition = position;
	}

	// Watch for changes in isSpinning prop
	$: if (isSpinning && !spinning) {
		// Start spin immediately when isSpinning becomes true
		// The cascading effect is now handled by the game store
		startSpin();
	}

	// Reset internal spinning state when isSpinning becomes false
	$: if (!isSpinning && spinning) {
		spinning = false;
		if (animation) {
			animation.kill();
		}
	}

	// Force reset internal state when isSpinning changes to false
	$: if (!isSpinning) {
		spinning = false;
		if (animation) {
			animation.kill();
		}
	}

	onDestroy(() => {
		if (animation) {
			animation.kill();
		}
	});
</script>

<div class="reel-container" bind:this={container} class:spinning>
	<!-- Green movement indicator -->
	{#if spinning}
		<div class="movement-indicator">
			<div class="indicator-dot"></div>
		</div>
	{/if}
	
	<div class="reel-frame" bind:this={reelFrame}>
		{#each Array(GAME_CONFIG.visibleSymbols + 40) as _, index}
			<div class="symbol">
				{duplicatedSymbols.length > 0 ? duplicatedSymbols[index % duplicatedSymbols.length]?.emoji : '?'}
			</div>
		{/each}
	</div>
</div>

<!-- Debug Panel -->
<div class="debug-panel">
	<h4>Reel {reelIndex + 1} Debug</h4>
	<div class="debug-info">
		<p><strong>Spin Status:</strong> 
			<span class="status-indicator {spinning ? 'spinning' : 'stopped'}">
				{spinning ? '🟢 SPINNING' : '🔴 STOPPED'}
			</span>
		</p>
		<p><strong>Is Spinning Prop:</strong> 
			<span class="status-indicator {isSpinning ? 'spinning' : 'stopped'}">
				{isSpinning ? '🟢 TRUE' : '🔴 FALSE'}
			</span>
		</p>
		<p><strong>Internal Position:</strong> {internalPosition}</p>
		<p><strong>Scroll Progress:</strong> {(debugInfo.scrollProgress * 100).toFixed(1)}%</p>
		<p><strong>Current Distance:</strong> {debugInfo.currentPosition.toFixed(0)}px</p>
		<p><strong>Total Distance:</strong> {debugInfo.totalDistance}px</p>
		<p><strong>Symbol Index:</strong> {debugInfo.symbolIndex}</p>
		<p><strong>Duplicated Symbols:</strong> {debugInfo.duplicatedSymbolsLength}</p>
		<p><strong>Max Symbol Index:</strong> {debugInfo.maxSymbolIndex}</p>
		<p><strong>Visible Symbols:</strong></p>
		<div class="symbol-list">
			{#each debugInfo.visibleSymbols.slice(0, 5) as symbol}
				<span class="debug-symbol">{symbol.symbol}</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.reel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80px;
		height: 240px;
		border: 2px solid #333;
		border-radius: 8px;
		background: #fff;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.reel-frame {
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
		transform: translateY(0);
	}

	.symbol {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 80px;
		font-size: 2rem;
		border-bottom: 1px solid #eee;
		background: #fff;
		position: relative;
	}

	.symbol:last-child {
		border-bottom: none;
	}

	
	/* Highlight the center symbol when not spinning */
	.reel-container:not(.spinning) .symbol:nth-child(2) {
		background: #f8f8f8;
		border-left: 3px solid #333;
		border-right: 3px solid #333;
	}

	/* Performance optimization */
	.symbol {
		will-change: transform;
	}

	/* Debug Panel Styles */
	.debug-panel {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 10px;
		border-radius: 5px;
		font-size: 12px;
		font-family: monospace;
		z-index: 1000;
		min-width: 200px;
	}

	.debug-panel h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		color: #ffd700;
	}

	.debug-info p {
		margin: 2px 0;
		line-height: 1.2;
	}

	.status-indicator {
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 11px;
	}

	.status-indicator.spinning {
		background: #22c55e;
		color: white;
	}

	.status-indicator.stopped {
		background: #ef4444;
		color: white;
	}

	.symbol-list {
		display: flex;
		gap: 5px;
		margin-top: 5px;
	}

	.debug-symbol {
		background: #333;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 14px;
	}

	/* Movement Indicator Styles */
	.movement-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 100;
		pointer-events: none;
	}

	.indicator-dot {
		width: 12px;
		height: 12px;
		background: #22c55e;
		border-radius: 50%;
		box-shadow: 0 0 10px #22c55e;
		animation: pulse-green 0.5s ease-in-out infinite alternate;
	}

	@keyframes pulse-green {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.2);
			opacity: 0.7;
		}
	}

	@media (max-width: 768px) {
		.reel-container {
			width: 60px;
			height: 180px;
		}

		.symbol {
			height: 60px;
			font-size: 1.5rem;
		}

		.debug-panel {
			font-size: 10px;
			min-width: 150px;
		}
	}

	@media (max-width: 480px) {
		.reel-container {
			width: 50px;
			height: 150px;
		}

		.symbol {
			height: 50px;
			font-size: 1.2rem;
		}
	}
</style> 