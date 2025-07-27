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
			<h3> About SpinCycle</h3>
			
			<div class="about-section">
				<h4>🎮 Game Developer</h4>
				<p>This slot machine game was built using modern web technologies including Svelte 5, TypeScript, and CSS animations.</p>
				
				<div class="developer-info">
					<p>Want to see more of my work?</p>
					<a 
						href="https://timothyitayi.com" 
						target="_blank" 
						rel="noopener noreferrer"
						class="portfolio-link"
					>
						<img src="/images/icon.png" alt="Visit my portfolio" class="portfolio-image">
					</a>
					<a 
						href="https://github.com/timothyitayi/spincycle-slot" 
						target="_blank" 
						rel="noopener noreferrer"
						class="github-link"
						style="margin-left: 1rem;"
					>
						<img src="/images/puzzle.png" alt="View on GitHub" class="github-image" style="width:32px;height:32px;">
					</a>
				</div>
		
			</div>
		</div>
	{/if}
</div> 