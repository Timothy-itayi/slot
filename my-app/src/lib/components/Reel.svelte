<script lang="ts">
	import { tick, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import type { Symbol } from '../types.js';
	import { SYMBOLS, SYMBOL_WEIGHTS, GAME_CONFIG } from '../config.js';
	import '../styles/components/Reel.css';

	export let targetSymbols: Symbol[] = [];
	export let isSpinning = false;
	export let reelIndex = 0;
	export let winningRows: number[] = [];
	export let onSpinComplete: (reelIndex: number) => void;
	export let onDebugUpdate: (data: any) => void;

	let reelFrame: HTMLElement;
	let animation: gsap.core.Animation;
	let displaySymbols: Symbol[] = [];
	let spinCount = 0;
	let initialized = false;

	function weightedRandomSymbol(): Symbol {
		const totalWeight = SYMBOLS.reduce((sum, s) => sum + (SYMBOL_WEIGHTS[s.id] || 1), 0);
		let r = Math.random() * totalWeight;
		for (const s of SYMBOLS) {
			r -= SYMBOL_WEIGHTS[s.id] || 1;
			if (r <= 0) return s;
		}
		return SYMBOLS[SYMBOLS.length - 1];
	}

	function generateFillerSymbols(count: number): Symbol[] {
		return Array.from({ length: count }, () => weightedRandomSymbol());
	}

	function getSymbolHeight(): number {
		const width = window.innerWidth;
		if (width <= 480) return 40;
		if (width <= 768) return 50;
		return 60;
	}

	$: if (targetSymbols.length > 0 && !initialized) {
		displaySymbols = [...targetSymbols];
		initialized = true;
	}

	async function animateReel() {
		if (!reelFrame || targetSymbols.length === 0) return;

		spinCount++;
		if (animation) animation.kill();

		const symbolHeight = getSymbolHeight();
		const fillerCount = 40 + reelIndex * 15 + Math.floor(Math.random() * 10);
		const filler = generateFillerSymbols(fillerCount);

		const currentlyVisible = displaySymbols.length >= GAME_CONFIG.visibleSymbols
			? displaySymbols.slice(-GAME_CONFIG.visibleSymbols)
			: generateFillerSymbols(GAME_CONFIG.visibleSymbols);

		displaySymbols = [...currentlyVisible, ...filler, ...targetSymbols];

		await tick();

		if (!isSpinning) return;

		gsap.set(reelFrame, { y: 0 });

		const scrollDistance = (GAME_CONFIG.visibleSymbols + fillerCount) * symbolHeight;
		const spinDuration = 2 + reelIndex * 0.8 + (Math.random() * 0.3);
		const overshootAmount = symbolHeight * 0.4;

		const tl = gsap.timeline({
			onComplete: () => onSpinComplete(reelIndex)
		});

		tl.to(reelFrame, {
			y: symbolHeight * 0.3,
			duration: 0.12,
			ease: "power2.in"
		});

		tl.to(reelFrame, {
			y: -(scrollDistance + overshootAmount),
			duration: spinDuration,
			ease: "power2.out"
		});

		tl.to(reelFrame, {
			y: -scrollDistance,
			duration: 0.2,
			ease: "power3.out"
		});

		animation = tl;
	}

	$: if (isSpinning) {
		animateReel();
	}

	$: {
		onDebugUpdate({
			reelIndex,
			isSpinning,
			spinCount,
			totalSymbols: displaySymbols.length
		});
	}

	onDestroy(() => {
		if (animation) animation.kill();
	});
</script>

<div class="reel-container">
	{#if isSpinning}
		<div class="movement-indicator">
			<div class="indicator-dot"></div>
		</div>
	{/if}

	<div class="reel-frame" bind:this={reelFrame}>
		{#each displaySymbols as symbol, index}
			{@const rowIndex = index - (displaySymbols.length - GAME_CONFIG.visibleSymbols)}
			<div
				class="symbol"
				class:winning-symbol={!isSpinning && rowIndex >= 0 && winningRows.includes(rowIndex)}
				style="color: {symbol.color}"
			>
				{symbol.emoji}
			</div>
		{/each}
	</div>
</div>
