<script lang="ts">
	let menuOpen = $state(false);
</script>

<nav class="fixed top-0 z-50 w-full mix-blend-difference">
	<div class="content-width flex items-center justify-between py-5">
		<a href="/" class="font-display text-lg tracking-tight text-white">
			ole kristensen
		</a>

		<!-- Desktop nav -->
		<ul class="hidden gap-8 md:flex">
			<li><a href="/works" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-white">Works</a></li>
			<li><a href="/consultancies" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-white">Consultancies</a></li>
			<li><a href="/about" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-white">About</a></li>
			<li><a href="/contact" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-white">Contact</a></li>
		</ul>

		<!-- Mobile toggle -->
		<button
			class="flex flex-col gap-1.5 md:hidden"
			aria-label="Toggle menu"
			onclick={() => menuOpen = !menuOpen}
		>
			<span class="block h-px w-6 bg-white transition-all duration-300" class:translate-y-[3.5px]={menuOpen} class:rotate-45={menuOpen}></span>
			<span class="block h-px w-6 bg-white transition-all duration-300" class:opacity-0={menuOpen}></span>
			<span class="block h-px w-6 bg-white transition-all duration-300" class:-translate-y-[3.5px]={menuOpen} class:-rotate-45={menuOpen}></span>
		</button>
	</div>
</nav>

<!-- Mobile overlay -->
{#if menuOpen}
<div
	class="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[var(--color-ink)] md:hidden"
	role="dialog"
	aria-modal="true"
>
	<a href="/works" onclick={() => menuOpen = false} class="font-display text-3xl text-white/80 transition-colors hover:text-white">Works</a>
	<a href="/consultancies" onclick={() => menuOpen = false} class="font-display text-3xl text-white/80 transition-colors hover:text-white">Consultancies</a>
	<a href="/about" onclick={() => menuOpen = false} class="font-display text-3xl text-white/80 transition-colors hover:text-white">About</a>
	<a href="/contact" onclick={() => menuOpen = false} class="font-display text-3xl text-white/80 transition-colors hover:text-white">Contact</a>
</div>
{/if}