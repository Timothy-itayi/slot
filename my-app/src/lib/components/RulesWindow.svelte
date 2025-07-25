<script lang="ts">
	import { SYMBOLS, GAME_CONFIG } from '../config.js';
	
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

<style>
	.rules-container {
		position: relative;
	}

	.rules-toggle {
		position: fixed;
		top: 20px;
		right: 20px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #000;
		color: #fff;
		border: none;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		z-index: 1000;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.rules-toggle:hover {
		background: #333;
		transform: scale(1.1);
	}

	.rules-window {
		position: fixed;
		top: 70px;
		right: 20px;
		width: 280px;
		max-height: 80vh;
		background: #fff;
		border: 2px solid #000;
		border-radius: 8px;
		padding: 15px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		z-index: 999;
		overflow-y: auto;
		font-size: 0.85rem;
	}

	.rules-window h3 {
		margin: 0 0 15px 0;
		color: #000;
		font-size: 1.1rem;
		text-align: center;
		border-bottom: 1px solid #ddd;
		padding-bottom: 8px;
	}

	.rule-section {
		margin-bottom: 20px;
	}

	.rule-section h4 {
		margin: 0 0 10px 0;
		color: #000;
		font-size: 0.95rem;
		font-weight: bold;
	}

	.winning-condition {
		margin-bottom: 15px;
		padding: 10px;
		background: #f8f8f8;
		border-radius: 6px;
		border-left: 3px solid #000;
	}

	.winning-condition h5 {
		margin: 0 0 5px 0;
		color: #000;
		font-size: 0.9rem;
		font-weight: bold;
	}

	.winning-condition p {
		margin: 0 0 8px 0;
		color: #666;
		font-size: 0.8rem;
		line-height: 1.3;
	}

	.example {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 5px;
	}

	.symbol-example {
		font-size: 1.2rem;
		background: #fff;
		padding: 4px 8px;
		border-radius: 4px;
		border: 1px solid #ddd;
	}

	.prize {
		color: #000;
		font-weight: bold;
		font-size: 0.85rem;
	}

	.bonus-note {
		color: #ff6b35;
		font-weight: bold;
		font-size: 0.75rem;
		margin: 5px 0 0 0;
	}

	.symbols-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 5px;
	}

	.symbol-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px;
		background: #f8f8f8;
		border-radius: 4px;
		border: 1px solid #eee;
	}

	.symbol-emoji {
		font-size: 1.1rem;
	}

	.symbol-name {
		flex: 1;
		color: #000;
		font-size: 0.8rem;
	}

	.symbol-value {
		color: #000;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.instructions {
		margin: 0;
		padding-left: 20px;
		color: #666;
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.instructions li {
		margin-bottom: 5px;
	}

	@media (max-width: 768px) {
		.rules-window {
			width: 250px;
			right: 10px;
			top: 60px;
		}
		
		.rules-toggle {
			right: 10px;
			top: 10px;
		}
	}

	@media (max-width: 480px) {
		.rules-window {
			width: 220px;
			font-size: 0.8rem;
		}
	}
</style> 