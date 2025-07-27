<script lang="ts">
	import type { Symbol } from '../types.js';
	import { GAME_CONFIG } from '../config.js';
	import '../styles/components/Debugger.css';

	export let reelArrays: Symbol[][] = [];
	export let reelIndexes: number[] = [];
	export let isVisible = false;
	export let debugInfo: any[] = [];
	export let onVisibilityChanged: (data: { isVisible: boolean }) => void; // Callback prop

	// Store current positions and indices to prevent reset
	let currentPositions: number[] = [];
	let currentIndices: number[][] = [];

	function toggleVisibility() {
		isVisible = !isVisible;
		onVisibilityChanged({ isVisible }); // Call callback prop directly
	}

	function getDebugInfo(reelIndex: number) {
		return debugInfo.find(info => info.reelIndex === reelIndex) || null;
	}

	// Calculate current array position based on spin state
	function getCurrentArrayPosition(debug: any, arrayLength: number) {
		if (!debug || !debug.isSpinning) return 0;
		// Calculate position based on spin count and array length
		const originalLength = debug.originalSymbolCount || 5;
		const spinOffset = (debug.spinCount || 0) * originalLength;
		return spinOffset % arrayLength;
	}

	// Get the 4 visible array indices for a reel
	function getVisibleIndices(currentPosition: number, arrayLength: number) {
		const indices = [];
		for (let i = 0; i < GAME_CONFIG.visibleSymbols; i++) {
			const index = (currentPosition + i) % arrayLength;
			indices.push(index);
		}
		return indices;
	}

	// Get reel status for display
	function getReelStatus(debug: any) {
		if (!debug) return '🔴 Not Ready';
		if (debug.isSpinning) return '🟢 Spinning';
		return '🔴 Stopped';
	}

	// Always calculate and track indices even when hidden
	$: {
		// This reactive statement ensures index tracking continues even when overlay is hidden
		if (reelArrays.length > 0 && debugInfo.length > 0) {
			// Update current positions and indices for all reels
			currentPositions = reelArrays.map((array, reelIndex) => {
				const debug = getDebugInfo(reelIndexes[reelIndex]);
				return getCurrentArrayPosition(debug, array.length);
			});

			currentIndices = reelArrays.map((array, reelIndex) => {
				const debug = getDebugInfo(reelIndexes[reelIndex]);
				const position = getCurrentArrayPosition(debug, array.length);
				return getVisibleIndices(position, array.length);
			});
		}
	}

	// Get current position for a specific reel (uses stored value)
	function getCurrentPositionForReel(reelIndex: number) {
		return currentPositions[reelIndex] || 0;
	}

	// Get current indices for a specific reel (uses stored value)
	function getCurrentIndicesForReel(reelIndex: number) {
		return currentIndices[reelIndex] || [0, 1, 2, 3];
	}
</script>

<div class="debugger-container">
	<button class="debug-toggle" on:click={toggleVisibility}>
		{isVisible ? '🔽 Hide Debug' : '🔼 Show Debug'}
	</button>

	{#if isVisible}
		<!-- Debug Layout -->
		<div class="debug-layout">
			<!-- Info Box - Positioned to the right -->
			<div class="info-box">
				<h3>How the Reel Works</h3>
				<p>Each reel has 2000 symbols (100 sets of 20). The numbers show which array indices are currently visible. As the reel spins, these indices change to create the scrolling effect.</p>
				
				<div class="spin-info">
					<h4>Spin Sequence</h4>
					<p>Reels start spinning with 500ms delays between each. Each reel spins for 8 seconds with cascading stop delays.</p>
					
					<div class="reel-status-list">
						{#each debugInfo as debug, index}
							<div class="reel-status">
								<span class="reel-label">Reel {debug.reelIndex + 1}:</span>
								<span class="status-indicator">{getReelStatus(debug)}</span>
								<span class="spin-count">Spins: {debug.spinCount || 0}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Reels container - Overlay on slot machine -->
			<div class="reels-overlay">
				{#each reelArrays as array, reelIndex}
					{@const debug = getDebugInfo(reelIndexes[reelIndex])}
					{@const currentPosition = getCurrentPositionForReel(reelIndex)}
					{@const visibleIndices = getCurrentIndicesForReel(reelIndex)}
					<div class="reel-debug">
						<!-- Array indices for visible positions -->
						{#each visibleIndices as index, position}
							<div class="index-display">
								<div class="index-number">[{index}]</div>
							</div>
						{/each}
						
						<!-- Current position info -->
						<div class="reel-info">
							<div class="info-line">Start: {currentPosition}</div>
							{#if debug}
								<div class="info-line">{debug.isSpinning ? '🟢' : '🔴'} {debug.spinCount || 0}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div> 