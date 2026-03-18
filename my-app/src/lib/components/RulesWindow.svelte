<script lang="ts">
	import { GAME_CONFIG } from '../config.js';
	import '../styles/components/RulesWindow.css';

	export let isVisible = false;

	function toggleVisibility() {
		isVisible = !isVisible;
	}
</script>

<div class="rules-container">
	<button class="rules-toggle" on:click={toggleVisibility}>
		{#if isVisible}
			✕
		{:else}
			<img src="/images/rule-book.png" alt="Rules" class="toggle-icon" />
		{/if}
	</button>

	{#if isVisible}
		<div class="rules-window">
			<h3>How to Play</h3>

			<div class="rule-block">
				<h4>Row Matches</h4>
				<p>Same symbol across all {GAME_CONFIG.reels} reels in any row wins. All {GAME_CONFIG.visibleSymbols} rows are checked every spin.</p>

				<div class="horizontal-example-block">
					<div class="example-reels-row">
						<div class="example-reel-vertical">
							<span class="s">🍋</span>
							<span class="s win">🔔</span>
							<span class="s">🍒</span>
							<span class="s">🫐</span>
						</div>
						<div class="example-reel-vertical">
							<span class="s">🍊</span>
							<span class="s win">🔔</span>
							<span class="s">🫐</span>
							<span class="s">🍒</span>
						</div>
						<div class="example-reel-vertical">
							<span class="s">7️⃣</span>
							<span class="s win">🔔</span>
							<span class="s">🍋</span>
							<span class="s">🍊</span>
						</div>
					</div>
					<span class="result">→ Row 2: $310</span>
				</div>
			</div>

			<div class="rule-block">
				<h4>Reel Matches</h4>
				<p>3 or more of the same symbol on a single reel also wins. Position does not matter — only the count.</p>

				<div class="horizontal-example-block">
					<div class="example-reels-row">
						<div class="example-reel-vertical">
							<span class="s win">🍊</span>
							<span class="s">🍋</span>
							<span class="s win">🍊</span>
							<span class="s win">🍊</span>
						</div>
					</div>
					<span class="result">↓ 3× Orange on reel</span>
				</div>

				<p class="hint">Both win types can trigger on the same spin. Payouts scale with your bet.</p>
			</div>
		</div>
	{/if}
</div>
