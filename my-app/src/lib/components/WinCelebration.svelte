<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { gsap } from 'gsap';
	import type { WinResult } from '../types.js';

	export let wins: WinResult[] = [];
	export let isVisible = false;

	const dispatch = createEventDispatcher();

	function closeCelebration() {
		dispatch('close');
	}

	let container: HTMLElement;
	let celebrationElements: HTMLElement[] = [];

	// Animation timeline
	let tl: gsap.core.Timeline;

	// Watch for wins and trigger celebration
	$: if (wins.length > 0 && isVisible) {
		// Initialize celebrationElements array with the correct size
		celebrationElements = new Array(wins.length);
		
		// Wait for DOM to update, then start celebration
		setTimeout(() => {
			startCelebration();
		}, 50);
		
		// Auto-dismiss after 5 seconds
		setTimeout(() => {
			if (isVisible) {
				closeCelebration();
			}
		}, 5000);
	}

	function startCelebration() {
		if (tl) {
			tl.kill();
		}

		// Wait for next tick to ensure DOM elements are rendered
		setTimeout(() => {
			// Filter out any undefined elements
			let validElements = celebrationElements.filter(el => el);
			
			// Fallback: if binding failed, get elements directly from DOM
			if (validElements.length === 0 && container) {
				validElements = Array.from(container.querySelectorAll('.win-item'));
				console.log('🎉 WIN CELEBRATION: Using fallback DOM query, found', validElements.length, 'elements');
			}
			
			if (validElements.length === 0) {
				console.log('🎉 WIN CELEBRATION: No valid elements to animate');
				return;
			}

			console.log(`🎉 WIN CELEBRATION: Starting animation with ${validElements.length} elements`);

			tl = gsap.timeline();

			// Initial setup - hide all elements
			gsap.set(validElements, { 
				opacity: 0, 
				scale: 0.5, 
				y: 50 
			});

			// Stagger in the celebration elements
			tl.to(validElements, {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: "back.out(1.7)"
			});

			// Add some bounce and sparkle effects
			tl.to(validElements, {
				scale: 1.05,
				duration: 0.2,
				yoyo: true,
				repeat: 2,
				ease: "power2.inOut"
			}, "-=0.3");

			// Continuous subtle animation
			tl.to(validElements, {
				y: -5,
				duration: 1,
				yoyo: true,
				repeat: -1,
				ease: "power2.inOut"
			}, "-=0.5");
		}, 100); // Small delay to ensure DOM is ready
	}

	function getWinTypeLabel(win: WinResult): string {
		switch (win.winType) {
			case 'reel':
				return `Reel ${(win.reelIndex || 0) + 1} Match`;
			case 'horizontal':
				return 'Horizontal Match ✨';
			default:
				return 'Win';
		}
	}

	function getWinTypeColor(win: WinResult): string {
		switch (win.winType) {
			case 'reel':
				return '#ff6b35';
			case 'horizontal':
				return '#9c27b0';
			default:
				return '#000';
		}
	}

	function getWinDescription(win: WinResult): string {
		switch (win.winType) {
			case 'reel':
				return `${win.matchCount}× ${win.symbol.name}`;
			case 'horizontal':
				return `${win.symbol.name} across all reels`;
			default:
				return win.symbol.name;
		}
	}

	onDestroy(() => {
		if (tl) {
			tl.kill();
		}
	});
</script>

{#if isVisible && wins.length > 0}
	<div class="celebration-overlay" bind:this={container}>
		<div class="celebration-container">
			<button class="close-button" on:click={closeCelebration}>✕</button>
			<div class="celebration-header">
				<h2 class="celebration-title">🎉 WINNER! 🎉</h2>
				<div class="total-win">Total Win: ${wins.reduce((sum, win) => sum + win.amount, 0)}</div>
			</div>

			<div class="wins-list">
				{#each wins as win, index}
					<div 
						class="win-item"
						style="border-left-color: {getWinTypeColor(win)}"
						bind:this={celebrationElements[index]}
					>
						<div class="win-header">
							<span class="win-type" style="color: {getWinTypeColor(win)}">
								{getWinTypeLabel(win)}
							</span>
							<span class="win-amount">+${win.amount}</span>
						</div>
						
						<div class="win-details">
							<div class="win-symbol">
								<span class="symbol-emoji">{win.symbol.emoji}</span>
								<span class="symbol-name">{win.symbol.name}</span>
							</div>
							<div class="win-description">
								{getWinDescription(win)}
							</div>
							{#if win.multiplier > 1}
								<div class="win-multiplier">
									{win.multiplier}× multiplier
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="celebration-footer">
				<div class="sparkles">
					<span>✨</span>
					<span>🎰</span>
					<span>✨</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.celebration-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(4px);
	}

	.celebration-container {
		background: #fff;
		border-radius: 16px;
		padding: 30px;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		border: 3px solid #ffd700;
		position: relative;
	}

	.close-button {
		position: absolute;
		top: 15px;
		right: 15px;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: #ff6b35;
		color: #fff;
		border: none;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.close-button:hover {
		background: #e55a2b;
		transform: scale(1.1);
	}

	.celebration-header {
		text-align: center;
		margin-bottom: 25px;
	}

	.celebration-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000;
		margin: 0 0 10px 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}

	.total-win {
		font-size: 1.5rem;
		font-weight: bold;
		color: #ff6b35;
		background: linear-gradient(45deg, #ff6b35, #f7931e);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.wins-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 20px;
	}

	.win-item {
		background: #f8f8f8;
		border-radius: 12px;
		padding: 15px;
		border-left: 4px solid;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.win-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	}

	.win-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.win-type {
		font-weight: bold;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.win-amount {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000;
	}

	.win-details {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.win-symbol {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.symbol-emoji {
		font-size: 1.5rem;
	}

	.symbol-name {
		font-weight: bold;
		color: #000;
		font-size: 1rem;
	}

	.win-description {
		color: #666;
		font-size: 0.85rem;
	}

	.win-multiplier {
		color: #ff6b35;
		font-weight: bold;
		font-size: 0.8rem;
		background: #fff3e0;
		padding: 2px 6px;
		border-radius: 4px;
		display: inline-block;
	}

	.celebration-footer {
		text-align: center;
		margin-top: 20px;
	}

	.sparkles {
		display: flex;
		justify-content: center;
		gap: 15px;
		font-size: 1.5rem;
	}

	.sparkles span {
		animation: sparkle 2s ease-in-out infinite;
	}

	.sparkles span:nth-child(2) {
		animation-delay: 0.5s;
	}

	.sparkles span:nth-child(3) {
		animation-delay: 1s;
	}

	@keyframes sparkle {
		0%, 100% { 
			transform: scale(1) rotate(0deg); 
			opacity: 1;
		}
		50% { 
			transform: scale(1.2) rotate(180deg); 
			opacity: 0.8;
		}
	}

	@media (max-width: 768px) {
		.celebration-container {
			padding: 20px;
			margin: 20px;
		}

		.celebration-title {
			font-size: 1.5rem;
		}

		.total-win {
			font-size: 1.2rem;
		}

		.win-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}
	}

	@media (max-width: 480px) {
		.celebration-container {
			padding: 15px;
		}

		.celebration-title {
			font-size: 1.3rem;
		}

		.win-item {
			padding: 12px;
		}
	}
</style> 