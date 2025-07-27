<script lang="ts">
	import { onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import type { Symbol } from '../types.js';
	

	export let symbols: Symbol[] = [];
	export let isSpinning = false;
	export let reelIndex = 0;
	export let winningSymbols: string[] = [];
	
	// Callback props for events
	export let onArrayUpdate: (data: { reelIndex: number; array: Symbol[]; length: number; originalLength: number }) => void;
	export let onDebugUpdate: (data: any) => void;
	export let onPositionUpdate: (data: { reelIndex: number; position: number }) => void;

	// Simple array-based reel system
	let container: HTMLElement;
	let reelFrame: HTMLElement;
	let animation: gsap.core.Tween;
	
	// Create a large pre-allocated array for infinite scroll
	// This prevents DOM re-renders during extension
	let reelArray: Symbol[] = [];
	let originalSymbolCount = symbols.length;
	
	// Track current position for debugging
	let currentPosition = 0;
	let spinCount = 0;

	// Function to shuffle an array (Fisher-Yates algorithm)
	function shuffleArray(array: Symbol[]): Symbol[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Function to generate a randomized set of symbols
	function generateRandomizedSet(): Symbol[] {
		return shuffleArray(symbols);
	}

	// Initialize with a large array (100 sets of randomized symbols)
	$: if (symbols.length > 0 && reelArray.length === 0) {
		// Generate 100 sets of randomized symbols
		const randomizedSets: Symbol[] = [];
		for (let i = 0; i < 100; i++) {
			const randomizedSet = generateRandomizedSet();
			randomizedSets.push(...randomizedSet);
		}
		reelArray = randomizedSets;
		console.log(`🎰 REEL ${reelIndex + 1}: Initialized with ${reelArray.length} randomized symbols`);
	}

	// No need for array extension with pre-allocated large array
	// The array is large enough for many spins without running out

	// Function to get current symbol height based on screen size
	function getSymbolHeight(): number {
		const width = window.innerWidth;
		if (width <= 480) {
			return 40; // Mobile
		} else if (width <= 768) {
			return 50; // Tablet
		} else {
			return 60; // Desktop
		}
	}

	// Simple animation function
	function animateReel() {
		if (!reelFrame || reelArray.length === 0) return;
		
		console.log(`🎰 REEL ${reelIndex + 1}: Starting animation, spin count: ${++spinCount}`);
		
		// Kill any existing animation
		if (animation) {
			animation.kill();
		}
		
		// Reset position to 0 for consistent starting point
		gsap.set(reelFrame, { y: 0 });
		currentPosition = 0;
		
		// Get responsive symbol height
		const symbolHeight = getSymbolHeight();
		console.log(`🎰 REEL ${reelIndex + 1}: Using symbol height: ${symbolHeight}px for screen width: ${window.innerWidth}px`);
		
		// Calculate animation distance (just slightly more than original symbols)
		const setsToSpin = 1 + Math.floor(Math.random() * 2); // 1-2 sets
		const extraSymbols = Math.floor(Math.random() * symbols.length); // 0-19 extra symbols
		const totalDistance = (symbols.length * setsToSpin + extraSymbols) * symbolHeight;
		
		// Slower animation duration for better position tracking
		const baseDuration = 8; // 8 seconds
		const randomOffset = (Math.random() - 0.5) * 1; // ±0.5 second variation
		const duration = baseDuration + randomOffset;
		
		// Create simple animation
		animation = gsap.to(reelFrame, {
			y: -totalDistance,
			duration: duration,
			ease: "power2.out",
			onUpdate: () => {
				// Update current position based on animation with responsive height
				const newY = Number(gsap.getProperty(reelFrame, "y")) || 0;
				const currentSymbolHeight = getSymbolHeight();
				currentPosition = Math.floor(Math.abs(newY) / currentSymbolHeight) % reelArray.length;
			},
			onComplete: () => {
				console.log(`🎰 REEL ${reelIndex + 1}: Animation completed`);
				// Final position update with responsive height
				const finalY = Number(gsap.getProperty(reelFrame, "y")) || 0;
				const finalSymbolHeight = getSymbolHeight();
				currentPosition = Math.floor(Math.abs(finalY) / finalSymbolHeight) % reelArray.length;
				
				// Ensure position is within bounds
				currentPosition = currentPosition % reelArray.length;
				console.log(`🎰 REEL ${reelIndex + 1}: Final position: ${currentPosition} (symbol height: ${finalSymbolHeight}px)`);
				
				// Snap to exact position to ensure even spacing
				const snapY = -(currentPosition * finalSymbolHeight);
				gsap.set(reelFrame, { y: snapY });
			}
		});
	}

	// Watch for spin trigger
	$: if (isSpinning) {
		animateReel();
	}

	// Don't kill animation when isSpinning becomes false - let it complete naturally
	// The game store will handle stopping the reels at the right time

	// Call array update callback for debugger
	$: if (reelArray.length > 0) {
		onArrayUpdate({
			reelIndex,
			array: reelArray,
			length: reelArray.length,
			originalLength: originalSymbolCount
		});
	}

	// Call debug update callback for debugger
	$: {
		onDebugUpdate({
			reelIndex,
			isSpinning,
			spinCount,
			totalSymbols: reelArray.length,
			originalSymbolCount,
			preAllocatedSets: Math.floor(reelArray.length / originalSymbolCount),
			currentPosition
		});
		
		// Also call position update callback for win detection
		onPositionUpdate({
			reelIndex,
			position: currentPosition
		});
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
			<div 
				class="symbol" 
				class:winning-symbol={winningSymbols.includes(symbol.id)}
				style="color: {symbol.color}"
			>
				{symbol.emoji}
			</div>
		{/each}
	</div>
</div>

<style>
	.reel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80px;
		height: 240px; /* 4 levels × 60px each = 240px */
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
		height: 240px; /* Exactly 4 levels */
		position: relative;
		transform: translateY(0);
	}

	.symbol {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 60px; /* Fixed height for exactly 4 levels */
		font-size: 2rem;
		border-bottom: 1px solid #eee;
		background: #fff;
		position: relative;
		flex-shrink: 0; /* Prevent shrinking */
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

	/* Highlight winning symbols */
	.winning-symbol {
		background: linear-gradient(45deg, #ffd700, #ffed4e) !important;
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
		animation: winning-pulse 1s ease-in-out infinite;
		border: 2px solid #ff6b35;
		transform: scale(1.05);
	}

	@keyframes winning-pulse {
		0%, 100% { 
			box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
			transform: scale(1.05);
		}
		50% { 
			box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
			transform: scale(1.1);
		}
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

	@media (max-width: 768px) {
		.reel-container {
			width: 60px;
			height: 200px; /* 4 levels × 50px each = 200px */
		}

		.reel-frame {
			height: 200px; /* Match container height */
		}

		.symbol {
			height: 50px; /* Fixed height for exactly 4 levels */
			font-size: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.reel-container {
			width: 50px;
			height: 160px; /* 4 levels × 40px each = 160px */
		}

		.reel-frame {
			height: 160px; /* Match container height */
		}

		.symbol {
			height: 40px; /* Fixed height for exactly 4 levels */
			font-size: 1.2rem;
		}
	}
</style> 