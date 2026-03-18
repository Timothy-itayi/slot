<script lang="ts">
	import type { Symbol } from '../types.js';
	import { GAME_CONFIG } from '../config.js';

	export let outcome: Symbol[][] = [];
	export let isVisible = false;
</script>

{#if isVisible && outcome.length > 0}
	<div class="array-overlay">
		{#each outcome as reelSymbols, reelIndex}
			<div class="overlay-reel">
				{#each reelSymbols as symbol, row}
					<div class="overlay-slot">
						<span class="idx">{symbol.id.slice(0, 3)}</span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.array-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 15px;
		pointer-events: none;
		z-index: 50;
	}

	.overlay-reel {
		display: flex;
		flex-direction: column;
		width: 80px;
		height: 240px;
		flex-shrink: 0;
	}

	.overlay-slot {
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding-left: 4px;
	}

	.idx {
		font-family: monospace;
		font-size: 0.65rem;
		font-weight: 700;
		color: #4ade80;
		background: rgba(0, 0, 0, 0.6);
		padding: 1px 5px;
		border-radius: 3px;
		line-height: 1;
	}

	@media (max-width: 768px) {
		.overlay-reel {
			width: 60px;
			height: 200px;
		}

		.overlay-slot {
			height: 50px;
		}

		.idx {
			font-size: 0.6rem;
		}
	}

	@media (max-width: 480px) {
		.overlay-reel {
			width: 50px;
			height: 160px;
		}

		.overlay-slot {
			height: 40px;
		}

		.idx {
			font-size: 0.55rem;
		}
	}
</style>
