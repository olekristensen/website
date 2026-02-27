<script lang="ts">
	let menuOpen = $state(false);
</script>

<nav>
	<div>
		<a href="/">
			Ole Kristensen
		</a>

		<!-- Desktop nav -->
		<ul>
			<li><a href="/works">Works</a></li>
			<li><a href="/consultancies">Consultancies</a></li>
			<li><a href="/about">About</a></li>
			<li><a href="/contact">Contact</a></li>
		</ul>

		<!-- Mobile toggle -->
		<button
			aria-label="Toggle menu"
			onclick={() => menuOpen = !menuOpen}
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
</nav>

<!-- Mobile overlay -->
{#if menuOpen}
<div
	role="dialog"
	aria-modal="true"
>
	<a href="/works" onclick={() => menuOpen = false}>Works</a>
	<a href="/consultancies" onclick={() => menuOpen = false}>Consultancies</a>
	<a href="/about" onclick={() => menuOpen = false}>About</a>
	<a href="/contact" onclick={() => menuOpen = false}>Contact</a>
</div>
{/if}