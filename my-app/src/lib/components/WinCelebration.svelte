<script lang="ts">
	import type { WinResult } from '../types.js';
	import '../styles/components/WinCelebration.css';

	export let wins: WinResult[] = [];
	export let isVisible = false;
	export let onClose: () => void;

	const MESSAGES_SMALL = [
		"Hey, money's money.",
		"That'll cover your coffee.",
		"Not bad, not bad at all.",
		"Look at you go, hon.",
		"Little wins add up, trust me.",
		"I've seen worse, keep going.",
		"Told ya it was your lucky seat.",
		"Cha-ching. Small but mighty.",
		"That's rent money... somewhere.",
		"See? The machine likes you.",
	];

	const MESSAGES_MEDIUM = [
		"Now we're cooking, sugar.",
		"Oh she's heating up!",
		"Don't spend it all in one place.",
		"Somebody's buying drinks tonight.",
		"The machine owes you one more.",
		"You're on a roll, don't stop now.",
		"I'd cash out but that's just me.",
		"Well well well, look who showed up.",
		"Keep this up and I'll be jealous.",
		"The table next to you is staring.",
	];

	const MESSAGES_BIG = [
		"Oh honey, YES.",
		"Now THAT'S what I'm talking about.",
		"I'm getting my manager. Just kidding.",
		"You're making the rest of us look bad.",
		"Somebody call security, we got a winner.",
		"You sure you haven't done this before?",
		"The house is not amused. I am though.",
		"Okay, okay, I see you!",
	];

	const MESSAGES_JACKPOT = [
		"I need to sit down and I'm already standing.",
		"Are you KIDDING me right now?!",
		"I'm naming my next break after you.",
		"That's... yeah I'd cash out. Immediately.",
		"The pit boss just looked over. You're fine. Probably.",
		"This doesn't happen. And yet here we are.",
	];

	let currentMessage = '';

	function pickMessage(total: number, winCount: number): string {
		let pool: string[];
		if (winCount >= 3 || total >= 500) pool = MESSAGES_JACKPOT;
		else if (total >= 100) pool = MESSAGES_BIG;
		else if (total >= 30) pool = MESSAGES_MEDIUM;
		else pool = MESSAGES_SMALL;
		return pool[Math.floor(Math.random() * pool.length)];
	}

	$: if (isVisible && wins.length > 0) {
		currentMessage = pickMessage(getTotalWinAmount(), wins.length);
	}

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

			<p class="win-message">{currentMessage}</p>

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
