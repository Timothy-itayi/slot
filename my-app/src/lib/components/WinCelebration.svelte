<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
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

	function getWinTypeIcon(winType: string | undefined): string {
		switch (winType) {
			case 'horizontal':
				return '→';
			case 'reel':
				return '↓';
			default:
				return '✨';
		}
	}

	function getWinColor(index: number): string {
		const colors = [
			'#ff6b9d', // Pink
			'#6b73ff', // Purple
			'#00d4aa', // Teal  
			'#ff9500', // Orange
			'#ff3333', // Red
			'#33ff88', // Green
			'#ffdd00', // Yellow
			'#8b5cf6'  // Violet
		];
		return colors[index % colors.length];
	}

	let autoCloseTimeout: number;

	// Handle visibility changes
	$: if (isVisible && wins.length > 0) {
		// Clear previous timeout
		if (autoCloseTimeout) {
			clearTimeout(autoCloseTimeout);
		}
		
		// Auto-close after 5 seconds
		autoCloseTimeout = setTimeout(() => {
			if (isVisible) {
				closeCelebration();
			}
		}, 3000);
	}

	onMount(() => {
		console.log('WinCelebration mounted');
	});

	onDestroy(() => {
		if (autoCloseTimeout) {
			clearTimeout(autoCloseTimeout);
		}
	});
</script>

{#if isVisible && wins.length > 0}
	<div 
		class="celebration-overlay" 
		role="dialog" 
		aria-modal="true"
		aria-label="Win celebration"
		on:click={closeCelebration} 
		on:keydown={(e) => e.key === 'Escape' && closeCelebration()}
		tabindex="0"
	>
		<div class="celebration-card" on:click|stopPropagation style="--win-count: {wins.length}">
			<!-- Simple confetti background -->
			<div class="confetti-background">
				{#each Array(20) as _, i}
					<div class="confetti-piece" style="--delay: {i * 0.1}s; --left: {Math.random() * 100}%; --color: {['#ff6b9d', '#6b73ff', '#00d4aa', '#ff9500', '#ffdd00'][Math.floor(Math.random() * 5)]}"></div>
				{/each}
			</div>
			
			<!-- Close Button -->
			<button class="close-btn" on:click={closeCelebration}>×</button>

			<!-- Win Content -->
			<div class="win-content">
				<h2 class="win-title">
					{#if wins.some(win => win.winType === 'horizontal' && (win.matchCount || 0) >= 3)}
						🎯 JACKPOT!
					{:else if wins.some(win => win.winType === 'horizontal')}
						✨ BIG WIN!
					{:else}
						🎉 WIN!
					{/if}
				</h2>

				<div class="total-amount">${getTotalWinAmount()}</div>

				<!-- Show all wins with bright colors -->
				<div class="wins-container">
					{#each wins as win, index}
						<div class="win-detail" style="--win-color: {getWinColor(index)}">
							<span class="win-icon">{win.symbol.emoji}</span>
							<div class="win-info">
								<span class="win-desc">
									{win.matchCount}× {win.symbol.name}
								</span>
								<span class="win-amount">${win.amount}</span>
								<span class="win-type-badge">
									{getWinTypeIcon(win.winType)} {win.winType}
								</span>
							</div>
						</div>
					{/each}
				</div>

				{#if wins.some(win => win.winType === 'horizontal')}
					<div class="bonus-text">2× Horizontal Bonus!</div>
				{/if}
			</div>
		</div>
	</div>
{/if} 