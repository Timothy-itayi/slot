<script lang="ts">
	import '../styles/components/TitleScreen.css';
</script>

<div class="title-screen">
	<h1 class="title-name">SPIN CYCLE</h1>
	<p class="title-sub">Spin to Win</p>

	<div class="instructions">
		<div class="instruction-item">
			<span class="instruction-num">1</span>
			<span class="instruction-text">Choose your <strong>bet</strong> amount before each spin.</span>
		</div>
		<div class="instruction-item">
			<span class="instruction-num">2</span>
			<span class="instruction-text">Match <strong>3 symbols</strong> across a row to win that symbol's payout.</span>
		</div>
		<div class="instruction-item">
			<span class="instruction-num">3</span>
			<span class="instruction-text">Match <strong>3 or 4</strong> of the same symbol on a single reel for a bonus win.</span>
		</div>
		<div class="instruction-item">
			<span class="instruction-num">4</span>
			<span class="instruction-text">The <strong>Wild ⭐</strong> substitutes for any symbol.</span>
		</div>
	</div>

	<a href="/game" class="start-btn" data-sveltekit-preload-data="hover">START</a>
</div>
