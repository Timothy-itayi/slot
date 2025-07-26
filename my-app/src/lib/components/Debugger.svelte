<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Symbol } from '../types.js';

	export let reelArrays: Symbol[][] = [];
	export let reelIndexes: number[] = [];
	export let isVisible = false;
	export let debugInfo: any[] = [];

	const dispatch = createEventDispatcher();

	function toggleVisibility() {
		isVisible = !isVisible;
		dispatch('visibilityChanged', { isVisible });
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
		for (let i = 0; i < 4; i++) {
			const index = (currentPosition + i) % arrayLength;
			indices.push(index);
		}
		return indices;
	}
</script>

<div class="debugger-container">
	<button class="debug-toggle" on:click={toggleVisibility}>
		{isVisible ? '🔽 Hide Debug Overlay' : '🔼 Show Debug Overlay'}
	</button>

	{#if isVisible}
		<!-- Reel Container Overlay -->
		<div class="reel-overlay">
			<!-- Header -->
			<div class="overlay-header">
				<div class="overlay-title">Array Index Tracker</div>
				<div class="overlay-stats">
					<span class="overlay-stat">Reels: {reelArrays.length}</span>
					<span class="overlay-stat">Spinning: {debugInfo.filter(d => d.isSpinning).length}</span>
				</div>
			</div>

			<!-- Reels container - aligned with actual reel containers -->
			<div class="overlay-reels-container">
				{#each reelArrays as array, reelIndex}
					{@const debug = getDebugInfo(reelIndexes[reelIndex])}
					{@const currentPosition = getCurrentArrayPosition(debug, array.length)}
					{@const visibleIndices = getVisibleIndices(currentPosition, array.length)}
					<div class="overlay-reel">
						<!-- Array indices for 4 visible positions -->
						{#each visibleIndices as index, position}
							<div class="overlay-index">
								<div class="index-number">[{index}]</div>
								<div class="position-label">Pos {position + 1}</div>
							</div>
						{/each}
						
						<!-- Current position info -->
						<div class="position-info">
							<div class="info-line">Start: {currentPosition}</div>
							{#if debug}
								<div class="info-line">{debug.isSpinning ? '🟢' : '🔴'} {debug.spinCount}</div>
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
		left: 20px;
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

	/* Reel Container Overlay */
	.reel-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 60%;
		background: rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(1px);
		pointer-events: none;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 140px;
	}

	/* Header */
	.overlay-header {
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		gap: 15px;
		pointer-events: auto;
	}

	.overlay-title {
		font-size: 0.9rem;
		font-weight: bold;
		color: #22c55e;
		white-space: nowrap;
		top: 10px;
	}

	.overlay-stats {
		display: flex;
		gap: 10px;
	}

	.overlay-stat {
		background: rgba(34, 197, 94, 0.2);
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 0.8rem;
		border: 1px solid rgba(34, 197, 94, 0.3);
		white-space: nowrap;
	}

	/* Reels container - exact alignment with actual reels */
	.overlay-reels-container {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 15px;
		background: rgba(248, 248, 248, 0.05);
		border-radius: 8px;
		border: 1px solid rgba(221, 221, 221, 0.2);
		position: relative;
		pointer-events: auto;
	}

	.overlay-reel {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80px;
		height: 240px;
		border: 2px solid rgba(51, 51, 51, 0.3);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		overflow: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.overlay-index {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 60px;
		border-bottom: 1px solid rgba(238, 238, 238, 0.15);
		background: rgba(255, 255, 255, 0.02);
		position: relative;
	}

	.overlay-index:last-child {
		border-bottom: none;
	}

	.index-number {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.95);
		background: rgba(0, 0, 0, 0.8);
		padding: 3px 8px;
		border-radius: 4px;
		font-weight: bold;
		font-family: monospace;
		margin-bottom: 2px;
	}

	.position-label {
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.7);
		font-family: monospace;
	}

	/* Position info */
	.position-info {
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
	@media (max-width: 768px) {
		.overlay-reel {
			width: 60px;
			height: 180px;
		}

		.overlay-index {
			height: 45px;
		}

		.index-number {
			font-size: 0.9rem;
			padding: 2px 6px;
		}

		.position-label {
			font-size: 0.5rem;
		}

		.overlay-header {
			flex-direction: column;
			gap: 8px;
			text-align: center;
			padding: 6px 10px;
		}

		.overlay-stats {
			flex-direction: column;
			gap: 4px;
		}

		.overlay-stat {
			font-size: 0.7rem;
			padding: 1px 4px;
		}
	}

	@media (max-width: 480px) {
		.overlay-reel {
			width: 50px;
			height: 150px;
		}

		.overlay-index {
			height: 37.5px;
		}

		.index-number {
			font-size: 0.8rem;
			padding: 1px 4px;
		}

		.position-label {
			font-size: 0.4rem;
		}

		.position-info {
			font-size: 0.6rem;
			padding: 2px 4px;
		}
	}
</style> 