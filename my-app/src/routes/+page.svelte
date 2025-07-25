<script lang="ts">
	import SlotMachine from '$lib/components/SlotMachine.svelte';
</script>

<svelte:head>
	<title>SpinCycle - Slot Machine Demo</title>
	<meta name="description" content="A minimal slot machine demo built with Svelte + TypeScript + PixiJS" />
</svelte:head>

<main class="app">
	<SlotMachine />
</main>

<style>
	.app {
		min-height: 100vh;
		background: #f5f5f5;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.app {
			padding: 10px;
		}
	}

	@media (max-width: 480px) {
		.app {
			padding: 5px;
		}
	}
</style>
