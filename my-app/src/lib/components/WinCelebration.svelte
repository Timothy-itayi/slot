<script lang="ts">
	import type { WinResult } from '../types.js';
	import '../styles/components/WinCelebration.css';

	export let wins: WinResult[] = [];
	export let isVisible = false;
	export let onClose: () => void;

	function closeCelebration() {
		onClose();
	}

	function getTotalWinAmount(): number {
		return wins.reduce((sum, win) => sum + win.amount, 0);
	}

	function getWinTitle(): string {
		const total = getTotalWinAmount();
		if (wins.length >= 3) return 'JACKPOT!';
		if (total >= 100) return 'BIG WIN!';
		return 'WIN!';
	}

	function getWinIcon(win: WinResult): string {
		return win.winType === 'reel' ? '↓' : '→';
	}

	function getWinLabel(win: WinResult): string {
		if (win.winType === 'reel') return `Reel ${(win.reelIndex ?? 0) + 1}`;
		return win.payLine.name;
	}
</script>

{#if isVisible && wins.length > 0}
	<div
		class="celebration-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Win celebration"
		on:keydown={(e) => e.key === 'Escape' && closeCelebration()}
		tabindex="0"
	>
		<div class="celebration-card">
			<h2 class="win-title">{getWinTitle()}</h2>

			<div class="total-amount">${getTotalWinAmount()}</div>

			<div class="wins-container">
				{#each wins as win}
					<div class="win-detail">
						<span class="win-icon">{win.symbol.emoji}</span>
						<div class="win-info">
							<span class="win-desc">
								{win.matchCount}× {win.symbol.name}
							</span>
							<span class="win-amount">${win.amount}</span>
							<span class="win-type-badge">
								{getWinIcon(win)} {getWinLabel(win)}
							</span>
						</div>
					</div>
				{/each}
			</div>

			<button class="close-btn" on:click={closeCelebration}>COLLECT</button>
		</div>
	</div>
{/if}
