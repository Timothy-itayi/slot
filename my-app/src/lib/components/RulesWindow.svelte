<script lang="ts">
	import { SYMBOLS, GAME_CONFIG } from '../config.js';
	import '../styles/components/RulesWindow.css';
	
	export let isVisible = false;
	
	function toggleVisibility() {
		isVisible = !isVisible;
	}
</script>

<div class="rules-container">
	<button class="rules-toggle" on:click={toggleVisibility}>
		{isVisible ? '✕' : '?'}
	</button>
	
	{#if isVisible}
		<div class="rules-window">
			<h3>🎰 Game Rules</h3>
			
			<div class="rule-section">
				<h4>💰 Winning Conditions</h4>
				
				<div class="winning-condition">
					<h5>1. Reel Matches</h5>
					<p>Match 3 or more of the same symbol on any reel to win!</p>
					<div class="example">
						<span class="symbol-example">🍒 🍒 🍒</span>
						<span class="prize">= ${(SYMBOLS.find(s => s.id === 'cherry')?.value || 25) * 3}</span>
					</div>
				</div>
				
				<div class="winning-condition">
					<h5>2. Horizontal Matches</h5>
					<p>Same symbol across all reels at the same level (top, middle, or bottom)!</p>
					<div class="example">
						<span class="symbol-example">🍒 | 🍒 | 🍒</span>
						<span class="prize">= ${(SYMBOLS.find(s => s.id === 'cherry')?.value || 25) * GAME_CONFIG.reels * 2}</span>
					</div>
					<p class="bonus-note">✨ 2x bonus for horizontal matches!</p>
				</div>
				

			</div>
			
			<div class="rule-section">
				<h4>🎯 Symbol Values</h4>
				<div class="symbols-list">
					{#each SYMBOLS as symbol}
						<div class="symbol-item">
							<span class="symbol-emoji">{symbol.emoji}</span>
							<span class="symbol-name">{symbol.name}</span>
							<span class="symbol-value">${symbol.value}</span>
						</div>
					{/each}
				</div>
			</div>
			
			<div class="rule-section">
				<h4>🎮 How to Play</h4>
				<ol class="instructions">
					<li>Set your bet amount</li>
					<li>Click SPIN to start the reels</li>
					<li>Watch for matching symbols!</li>
					<li>Wins are automatically calculated</li>
				</ol>
			</div>
		</div>
	{/if}
</div> 