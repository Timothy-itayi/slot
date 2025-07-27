<script lang="ts">
	import type { Symbol } from '../types.js';
	import { GAME_CONFIG } from '../config.js';

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

<style>
	.debugger-container {
		position: fixed;
		bottom: 60px;
		left: 60px;
		z-index: 1000;
		font-family: monospace;
	}

	.debug-toggle {
		background: #333;
		color: white;
		border: none;
		padding: 10px 15px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		z-index: 1001;
		position: relative;
	}

	.debug-toggle:hover {
		background: #555;
	}

	/* Debug Layout */
	.debug-layout {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 60%;
		pointer-events: none;
		z-index: 50;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 140px 20px 20px 20px;
	}

	/* Info Box - Positioned to the right */
	.info-box {
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 60px;
		border-radius: 8px;
		max-width: 350px;
		pointer-events: auto;
		border: 2px solid #22c55e;
		position: absolute;
		top: 0;
		left: 0;
		
		
	}

	.info-box h3 {
		margin: 0 0 15px 0;
		color: #22c55e;
		font-size: 1.1rem;
	}

	.info-box p {
		margin: 0 0 20px 0;
		font-size: 0.9rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.9);
	}

	.spin-info h4 {
		margin: 0 0 10px 0;
		color: #22c55e;
		font-size: 1rem;
	}

	.spin-info p {
		margin: 0 0 15px 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.reel-status-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.reel-status {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.reel-label {
		font-weight: bold;
		color: #22c55e;
		min-width: 60px;
	}

	.status-indicator {
		font-size: 0.9rem;
	}

	.spin-count {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
	}

	/* Reels overlay - Positioned over slot machine */
	.reels-overlay {
		display: flex;
		justify-content: center;
		gap: 11px;
		padding-top: 190px;
		pointer-events: auto;
		align-self: center;
	}

	.reel-debug {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80px;
		height: 240px;
		border: 2px solid rgba(51, 51, 51, 0.5);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
		position: relative;
	}

	.index-display {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 60px;
		border-bottom: 1px solid rgba(238, 238, 238, 0.2);
		position: relative;
		background-color: rgb(35, 35, 35);
	}

	.index-display:last-child {
		border-bottom: none;
	}

	.index-number {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.95);
		background: rgba(0, 0, 0, 0.8);
		padding: 4px 8px;
		border-radius: 4px;
		font-weight: bold;
		font-family: monospace;
	}

	/* Reel info */
	.reel-info {
		position: absolute;
		top: 3px;
		right: 3px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 3px 6px;
		border-radius: 3px;
		font-size: 0.7rem;
		line-height: 1.1;
		pointer-events: auto;
	}

	.info-line {
		margin: 1px 0;
		font-family: monospace;
	}

	/* Responsive adjustments */
	@media (max-width: 1200px) {
		.debug-layout {
			flex-direction: column;
			align-items: center;
		}

		.info-box {
			margin-left: 0;
			margin-bottom: 20px;
			max-width: 500px;
		}
	}

	@media (max-width: 768px) {
		.reel-debug {
			width: 60px;
			height: 180px;
		}

		.index-display {
			height: 45px;
		}

		.index-number {
			font-size: 1rem;
			padding: 3px 6px;
		}

		.info-box {
			max-width: 400px;
			padding: 15px;
		}

		.info-box h3 {
			font-size: 1rem;
		}

		.info-box p {
			font-size: 0.8rem;
		}

		.reel-status {
			font-size: 0.8rem;
			padding: 4px 6px;
		}
	}

	@media (max-width: 480px) {
		.reel-debug {
			width: 50px;
			height: 150px;
		}

		.index-display {
			height: 37.5px;
		}

		.index-number {
			font-size: 0.9rem;
			padding: 2px 4px;
		}

		.reel-info {
			font-size: 0.6rem;
			padding: 2px 4px;
		}

		.info-box {
			max-width: 300px;
			padding: 12px;
		}

		.reel-status {
			font-size: 0.75rem;
			gap: 6px;
		}
	}
</style> 