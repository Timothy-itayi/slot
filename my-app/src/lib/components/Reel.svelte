<script lang="ts">
	import { onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import type { Symbol } from '../types.js';
	import '../styles/components/Reel.css';
	

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