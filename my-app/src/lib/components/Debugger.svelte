<script lang="ts">
	import { GAME_CONFIG, SYMBOL_WEIGHTS } from '../config.js';
	import '../styles/components/Debugger.css';

	export let isVisible = false;
	export let debugInfo: any[] = [];
	export let onVisibilityChanged: (data: { isVisible: boolean }) => void;

	function toggleVisibility() {
		isVisible = !isVisible;
		onVisibilityChanged({ isVisible });
	}
</script>

<button class="debug-toggle" on:click={toggleVisibility}>
	{isVisible ? 'Hide Debug' : 'Debug'}
</button>

{#if isVisible}
	<div class="debug-panel">
		<h4>How the Spinner Works</h4>

		<div class="debug-block">
			<h5>Outcome-first model</h5>
			<p>The result of each spin is determined before the animation starts. The reels animate to show a predetermined outcome, not the other way around.</p>
		</div>

		<div class="debug-block">
			<h5>Weighted RNG</h5>
			<p>Symbols appear at different rates. Rare symbols (7️⃣ weight {SYMBOL_WEIGHTS.seven}) show up far less than common ones (🫐 weight {SYMBOL_WEIGHTS.plum}). Tuned for ~95% RTP.</p>
		</div>

		<div class="debug-block">
			<h5>Win detection</h5>
			<p>{GAME_CONFIG.visibleSymbols} row matches (same symbol across all {GAME_CONFIG.reels} reels) plus reel matches (3+ same symbol on one reel). State persists via localStorage.</p>
		</div>

		<div class="debug-block">
			<h5>Reels right now</h5>
			<div class="reel-states">
				{#each debugInfo as debug}
					<div class="reel-state-row">
						<span class="reel-id">R{debug.reelIndex + 1}</span>
						<span class="reel-status" class:active={debug.isSpinning}>{debug.isSpinning ? 'SPINNING' : 'STOPPED'}</span>
						<span class="reel-spins">spins: {debug.spinCount || 0}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
