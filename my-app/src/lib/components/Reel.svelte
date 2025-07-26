<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import type { Symbol } from '../types.js';
	import { GAME_CONFIG, SYMBOLS } from '../config.js';

	export let symbols: Symbol[] = [];
	export let isSpinning = false;
	export let reelIndex = 0;

	// Simple array-based reel system
	let container: HTMLElement;
	let reelFrame: HTMLElement;
	let animation: gsap.core.Tween;
	
	// Create the reel array - duplicate symbols for infinite scroll
	$: reelArray = symbols.length > 0 ? [...symbols, ...symbols, ...symbols] : [];
	
	// Track current position for debugging
	let currentPosition = 0;
	let spinCount = 0;

	// Simple animation function
	function animateReel() {
		if (!reelFrame || reelArray.length === 0) return;
		
		console.log(`🎰 REEL ${reelIndex + 1}: Starting animation, spin count: ${++spinCount}`);
		
		// Kill any existing animation
		if (animation) {
			animation.kill();
		}
		
		// Get current position
		const currentY = Number(gsap.getProperty(reelFrame, "y")) || 0;
		
		// Calculate animation distance (1 full cycle through the array)
		const symbolHeight = 60;
		const totalDistance = symbols.length * symbolHeight;
		
		// Create simple animation
		animation = gsap.to(reelFrame, {
			y: currentY - totalDistance,
			duration: 8, // 8 seconds
			ease: "power2.out",
			onComplete: () => {
				console.log(`🎰 REEL ${reelIndex + 1}: Animation completed`);
			}
		});
	}

	// Watch for spin trigger
	$: if (isSpinning) {
		animateReel();
	}

	// Stop animation when isSpinning becomes false
	$: if (!isSpinning && animation) {
		animation.kill();
		console.log(`🎰 REEL ${reelIndex + 1}: Animation stopped`);
	}

	onDestroy(() => {
		if (animation) {
			animation.kill();
		}
	});
</script>

<div class="reel-container" bind:this={container}>
	<!-- Movement indicator -->
	{#if isSpinning}
		<div class="movement-indicator">
			<div class="indicator-dot"></div>
		</div>
	{/if}
	
	<div class="reel-frame" bind:this={reelFrame}>
		{#each reelArray as symbol, index}
			<div class="symbol" style="color: {symbol.color}">
				{symbol.emoji}
			</div>
		{/each}
	</div>
</div>

<!-- Simple Debug Panel -->
<div class="debug-panel">
	<h4>Reel {reelIndex + 1}</h4>
	<div class="debug-info">
		<p><strong>Spinning:</strong> {isSpinning ? '🟢 YES' : '🔴 NO'}</p>
		<p><strong>Spin Count:</strong> {spinCount}</p>
		<p><strong>Symbols:</strong> {reelArray.length}</p>
		<p><strong>Position:</strong> {currentPosition}px</p>
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
		height: 60px;
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

	/* Movement Indicator */
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

	/* Debug Panel */
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
		min-width: 150px;
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
			min-width: 120px;
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