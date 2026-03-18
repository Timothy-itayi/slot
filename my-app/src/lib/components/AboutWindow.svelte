<script lang="ts">
	import '../styles/components/AboutWindow.css';
	
	export let isVisible = false;
	
	function toggleVisibility() {
		isVisible = !isVisible;
	}
</script>

<div class="about-container">
	<button class="about-toggle" on:click={toggleVisibility}>
		{#if isVisible}
			✕
		{:else}
			<img src="/images/who.png" alt="About" class="toggle-icon" />
		{/if}
	</button>
	
	{#if isVisible}
		<div class="about-window">
			<h3>About</h3>
			
			<div class="about-section">
				<h4>SpinCycle</h4>
				<p>Built with Svelte 5, TypeScript, GSAP and CSS.</p>
				
				<div class="developer-info">
					<p>Want to see more of my work?</p>
					<div class="developer-links">
						<a 
							href="https://timothyitayi.com" 
							target="_blank" 
							rel="noopener noreferrer"
							class="portfolio-link"
						>
							<img src="/images/icon.png" alt="Visit my portfolio" class="portfolio-image">
						</a>
						<a 
							href="https://github.com/Timothy-itayi/slot" 
							target="_blank" 
							rel="noopener noreferrer"
							class="github-link"
						>
							<img src="/puzzle.png" alt="View on GitHub" class="github-image">
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
