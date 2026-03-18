<script lang="ts">
	import { gameStore } from '../gameStore.js';
	import { gameLoop } from '../gameLoop.js';
	import Reel from './Reel.svelte';
	import Debugger from './Debugger.svelte';
	import DebugOverlay from './DebugOverlay.svelte';
	import RulesWindow from './RulesWindow.svelte';
	import AboutWindow from './AboutWindow.svelte';
	import PaytableWindow from './PaytableWindow.svelte';
	import WinCelebration from './WinCelebration.svelte';
	import { GAME_CONFIG } from '../config.js';
	import type { ReelState, Symbol } from '../types.js';
	import '../styles/components/SlotMachine.css';

	let reels: ReelState[] = [];
	let gameState: any = {};
	let gameLoopState: any = {};

	let debuggerVisible = false;
	let debugInfo: any[] = [];

	let winningRowsByReel: number[][] = Array.from({ length: GAME_CONFIG.reels }, () => []);
	let completedReels = new Set<number>();
	let stoppedReels: boolean[] = Array(GAME_CONFIG.reels).fill(false);
	let showDots = false;
	let dotsTimeout: ReturnType<typeof setTimeout>;
	let showCelebration = false;
	let celebrationTimeout: ReturnType<typeof setTimeout>;

	let resetTimeout: ReturnType<typeof setTimeout>;

	interface ConfettiPiece {
		id: number;
		x: number;
		y: number;
		rot: number;
		size: number;
		color: string;
		duration: number;
		delay: number;
	}

	let confetti: ConfettiPiece[] = [];
	let confettiId = 0;

	const TIER_COLORS: Record<string, string[]> = {
		small:   ['#999', '#bbb', '#ddd'],
		medium:  ['#ffd700', '#ffe766', '#aaa', '#ddd'],
		big:     ['#ffd700', '#ffe766', '#ff6b35', '#fff', '#333'],
		jackpot: ['#ffd700', '#ffe766', '#ff6b35', '#ff4444', '#00e5ff', '#fff', '#111'],
	};

	function getWinTier(total: number, winCount: number): string {
		if (winCount >= 3 || total >= 500) return 'jackpot';
		if (total >= 100) return 'big';
		if (total >= 30) return 'medium';
		return 'small';
	}

	function spawnConfetti(total: number, winCount: number) {
		const tier = getWinTier(total, winCount);
		const counts: Record<string, number> = { small: 12, medium: 22, big: 36, jackpot: 50 };
		const count = counts[tier];
		const colors = TIER_COLORS[tier];
		const pieces: ConfettiPiece[] = [];

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const dist = 40 + Math.random() * 100;
			pieces.push({
				id: confettiId++,
				x: Math.cos(angle) * dist,
				y: Math.sin(angle) * dist - 30,
				rot: Math.random() * 720 - 360,
				size: 4 + Math.random() * 4,
				color: colors[Math.floor(Math.random() * colors.length)],
				duration: 0.8 + Math.random() * 0.6,
				delay: Math.random() * 0.25,
			});
		}

		confetti = pieces;
	}

	function spawnLossConfetti() {
		const colors = ['#ccc', '#ddd', '#bbb', '#aaa', '#e0e0e0'];
		const count = 18;
		const pieces: ConfettiPiece[] = [];

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const dist = 30 + Math.random() * 70;
			pieces.push({
				id: confettiId++,
				x: Math.cos(angle) * dist,
				y: Math.sin(angle) * dist - 20,
				rot: Math.random() * 720 - 360,
				size: 3 + Math.random() * 3,
				color: colors[Math.floor(Math.random() * colors.length)],
				duration: 0.6 + Math.random() * 0.4,
				delay: Math.random() * 0.15,
			});
		}

		confetti = pieces;
	}

	function clearConfetti() {
		confetti = [];
	}

	function getBalanceColor(balance: number): string {
		if (balance < 50) return '#ef4444';
		if (balance < 100) return '#f97316';
		return '#000';
	}

	function computeWinningPositions(wins: import('../types.js').WinResult[]): number[][] {
		const positions: number[][] = Array.from({ length: GAME_CONFIG.reels }, () => []);
		const outcome = gameStore.getOutcome();

		for (const win of wins) {
			if (win.winType === 'payline') {
				win.payLine.positions.forEach((rowIndex, reelIdx) => {
					if (!positions[reelIdx].includes(rowIndex)) {
						positions[reelIdx].push(rowIndex);
					}
				});
			} else if (win.winType === 'reel' && win.reelIndex !== undefined) {
				const reelSymbols = outcome[win.reelIndex];
				reelSymbols.forEach((s, rowIndex) => {
					if ((s.id === win.symbol.id || s.isWild) && !positions[win.reelIndex!].includes(rowIndex)) {
						positions[win.reelIndex!].push(rowIndex);
					}
				});
			}
		}

		return positions;
	}

	gameStore.subscribe(state => {
		gameState = state;

		if (state.lastWins.length > 0) {
			winningRowsByReel = computeWinningPositions(state.lastWins);
		} else {
			winningRowsByReel = Array.from({ length: GAME_CONFIG.reels }, () => []);
			showCelebration = false;
			if (celebrationTimeout) clearTimeout(celebrationTimeout);
		}

		if (state.isSpinning) {
			showCelebration = false;
			if (celebrationTimeout) clearTimeout(celebrationTimeout);
			if (resetTimeout) clearTimeout(resetTimeout);
		} else {
			if (state.winAmount > 0 && state.lastWins.length > 0) {
				if (celebrationTimeout) clearTimeout(celebrationTimeout);
				celebrationTimeout = setTimeout(() => {
					showCelebration = true;
				}, 2500);
			}

			if (resetTimeout) clearTimeout(resetTimeout);
			resetTimeout = setTimeout(() => {
				if (gameLoopState.isRunning) {
					gameLoop.resetState();
				}
			}, 10000);
		}
	});

	gameStore.reels.subscribe(state => {
		reels = state;
	});

	gameLoop.subscribe(state => {
		gameLoopState = state;
	});

	function handleSpin() {
		completedReels = new Set();
		stoppedReels = Array(GAME_CONFIG.reels).fill(false);
		showDots = true;
		clearConfetti();
		if (dotsTimeout) clearTimeout(dotsTimeout);
		if (gameLoopState.isRunning && !gameState.isSpinning) {
			gameLoop.resetState();
		}
		gameLoop.startSpin();
	}

	function handleSpinComplete(reelIndex: number) {
		stoppedReels[reelIndex] = true;
		stoppedReels = [...stoppedReels];
		completedReels.add(reelIndex);
		if (completedReels.size === GAME_CONFIG.reels) {
			completedReels = new Set();
			gameStore.resolveWins();

			if (gameState.winAmount > 0) {
				spawnConfetti(gameState.winAmount, gameState.lastWins.length);
				dotsTimeout = setTimeout(() => {
					showDots = false;
				}, 700);
			} else {
				spawnLossConfetti();
				dotsTimeout = setTimeout(() => {
					showDots = false;
					clearConfetti();
				}, 1000);
			}
		}
	}

	const BET_PRESETS = [20, 50, 100];

	function selectBet(amount: number) {
		gameStore.setBet(amount);
	}

	function handleDebugUpdate(debugData: any) {
		const existingIndex = debugInfo.findIndex(info => info.reelIndex === debugData.reelIndex);

		if (existingIndex >= 0) {
			debugInfo[existingIndex] = debugData;
		} else {
			debugInfo.push(debugData);
		}

		debugInfo = [...debugInfo];
	}

	function handleDebuggerVisibility(data: { isVisible: boolean }) {
		debuggerVisible = data.isVisible;
	}
</script>

<div class="slot-machine">
	<header class="game-header">
		<h1 class="game-title">SPIN TO WIN</h1>
		<div class="game-stats">
			<div class="stat">
				<span class="label">Balance</span>
				<span class="value" style="color: {getBalanceColor(gameState.balance)}; transition: color 0.3s ease">${gameState.balance}</span>
			</div>
			<div class="stat">
				<span class="label">Last Win</span>
				<span class="value win-amount">${gameState.lastWin}</span>
			</div>
			<div class="stat">
				<span class="label">Total Won</span>
				<span class="value total-winnings">${gameState.totalWinnings}</span>
			</div>
			<div class="stat">
				<span class="label">Spins</span>
				<span class="value">{gameLoopState.spinCount}</span>
			</div>
		</div>
	</header>

	<div class="reels-container">
		{#each reels as reel, index}
			<Reel
				targetSymbols={reel.targetSymbols}
				isSpinning={reel.isSpinning}
				reelIndex={index}
				winningRows={winningRowsByReel[index] || []}
				onSpinComplete={handleSpinComplete}
				onDebugUpdate={handleDebugUpdate}
			/>
		{/each}
		<DebugOverlay
			outcome={gameStore.getOutcome()}
			isVisible={debuggerVisible}
		/>
	</div>

	<div class="controls">
		<div class="bet-controls">
			<span class="bet-label">Bet</span>
			<div class="bet-presets">
				{#each BET_PRESETS as amount}
					<button
						class="bet-preset"
						class:active={gameState.bet === amount}
						on:click={() => selectBet(amount)}
						disabled={gameLoopState.isRunning || gameState.balance < amount}
					>
						${amount}
					</button>
				{/each}
			</div>
		</div>

		<div class="action-buttons">
			<div class="spin-btn-wrap">
				<button
					class="spin-btn"
					on:click={handleSpin}
					disabled={gameLoopState.isRunning || showDots || gameState.balance < gameState.bet}
				>
					{#if showDots}
						<span class="reel-dots">
							{#each stoppedReels as stopped, i}
								<span class="reel-dot" class:stopped>{i + 1}</span>
							{/each}
						</span>
					{:else}
						SPIN
					{/if}
				</button>

				{#if confetti.length > 0}
					<div class="confetti-container" aria-hidden="true">
						{#each confetti as p (p.id)}
							<span
								class="confetti-piece"
								style="
									--cx: {p.x}px;
									--cy: {p.y}px;
									--cr: {p.rot}deg;
									--cd: {p.duration}s;
									--cdelay: {p.delay}s;
									width: {p.size}px;
									height: {p.size * 1.4}px;
									background: {p.color};
								"
							></span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<WinCelebration
		wins={gameState.lastWins}
		isVisible={showCelebration}
		onClose={() => {
			showCelebration = false;
			clearConfetti();
			gameStore.clearWins();
		}}
	/>

	<RulesWindow />
	<PaytableWindow />
	<AboutWindow />
</div>

<Debugger
	debugInfo={debugInfo}
	isVisible={debuggerVisible}
	onVisibilityChanged={handleDebuggerVisibility}
/>
