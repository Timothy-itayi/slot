<script lang="ts">
	import { SYMBOLS, GAME_CONFIG, REEL_MATCH_3X, REEL_MATCH_4X } from '../config.js';
	import '../styles/components/PaytableWindow.css';

	export let isVisible = false;

	function toggleVisibility() {
		isVisible = !isVisible;
	}
</script>

<div class="paytable-container">
	<button class="paytable-toggle" on:click={toggleVisibility}>
		{#if isVisible}
			✕
		{:else}
			$
		{/if}
	</button>

	{#if isVisible}
		<div class="paytable-window">
			<h3>Paytable</h3>

			<div class="symbols-list">
				{#each SYMBOLS as symbol}
					<div class="symbol-row" class:wild-row={symbol.isWild}>
						<span class="symbol-emoji">{symbol.emoji}</span>
						<span class="symbol-name">
							{symbol.name}
							{#if symbol.isWild}
								<span class="wild-badge">SUBS ALL</span>
							{/if}
						</span>
						<div class="symbol-payouts">
							<span class="payout">Row ${symbol.value}</span>
							<span class="payout reel-payout">3x ${Math.round(symbol.value * REEL_MATCH_3X)}</span>
							<span class="payout reel-payout">4x ${Math.round(symbol.value * REEL_MATCH_4X)}</span>
						</div>
					</div>
				{/each}
			</div>

			<p class="paytable-note">Wild substitutes for any symbol.<br/>Values at min bet (${GAME_CONFIG.minBet}). Payouts scale with bet.</p>
		</div>
	{/if}
</div>
