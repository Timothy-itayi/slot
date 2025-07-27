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
		{#if isVisible}
			✕
		{:else}
			<img src="/images/rule-book.png" alt="About" class="toggle-icon" />
		{/if}
	</button>
	
	{#if isVisible}
		<div class="rules-window">
			<h3>🎰 How to Play</h3>
			
			<div class="rule-section">
				<h4>💰 Winning Conditions</h4>
				
				<div class="winning-condition">
					<h5>1. Reel Matches</h5>
					<p>Match 3 or more of the same symbol on any reel to win!</p>
					<div class="example">
						<div class="reel-example">
							<div class="reel-column">
								<div class="symbol-slot">🍒</div>
								<div class="symbol-slot">🍒</div>
								<div class="symbol-slot">🍒</div>
								<div class="symbol-slot">🔔</div>
							</div>
						</div>
						<span class="prize">= ${(SYMBOLS.find(s => s.id === 'cherry')?.value || 25) * 3}</span>
					</div>
					<p class="example-note">3 cherries in a row = Win!</p>
				</div>
				
				<div class="winning-condition">
					<h5>2. Horizontal Matches</h5>
					<p>2 or more of the same symbol across reels at the same level!</p>
					<div class="example">
						<div class="horizontal-example">
							<div class="reel-row">
								<div class="reel-column">
									<div class="symbol-slot">🍋</div>
									<div class="symbol-slot winning-symbol">🍒</div>
									<div class="symbol-slot">🔔</div>
									<div class="symbol-slot">7️⃣</div>
								</div>
								<div class="reel-column">
									<div class="symbol-slot">🍊</div>
									<div class="symbol-slot winning-symbol">🍒</div>
									<div class="symbol-slot">🫐</div>
									<div class="symbol-slot">🔔</div>
								</div>
								<div class="reel-column">
									<div class="symbol-slot">7️⃣</div>
									<div class="symbol-slot">🔔</div>
									<div class="symbol-slot">🍋</div>
									<div class="symbol-slot">🍊</div>
								</div>
							</div>
						</div>
						<span class="prize">= ${(SYMBOLS.find(s => s.id === 'cherry')?.value || 25) * 2 * 2}</span>
					</div>
					<p class="example-note">2 cherries in a row = Win! (2× bonus)</p>
					
					<div class="example">
						<div class="horizontal-example">
							<div class="reel-row">
								<div class="reel-column">
									<div class="symbol-slot">🍋</div>
									<div class="symbol-slot winning-symbol">🔔</div>
									<div class="symbol-slot">🔔</div>
									<div class="symbol-slot">7️⃣</div>
								</div>
								<div class="reel-column">
									<div class="symbol-slot">🍊</div>
									<div class="symbol-slot winning-symbol">🔔</div>
									<div class="symbol-slot">🫐</div>
									<div class="symbol-slot">🔔</div>
								</div>
								<div class="reel-column">
									<div class="symbol-slot">7️⃣</div>
									<div class="symbol-slot winning-symbol">🔔</div>
									<div class="symbol-slot">🍋</div>
									<div class="symbol-slot">🍊</div>
								</div>
							</div>
						</div>
						<span class="prize">= ${(SYMBOLS.find(s => s.id === 'bell')?.value || 50) * 3 * 2}</span>
					</div>
					<p class="example-note">3 bells in a row = Bigger Win! (2× bonus)</p>
					<p class="bonus-note">✨ 2x bonus for ALL horizontal matches! More symbols = More money!</p>
				</div>
				

			</div>
			

	
		</div>
	{/if}
</div> 