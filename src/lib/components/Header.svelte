<script lang="ts">
	let menuOpen = $state(false);
</script>

<nav class="fixed top-0 z-50 w-full mix-blend-difference">
	<div class="content-width flex items-center justify-between py-5">
		<a href="/" class="flex items-center gap-2 font-display text-lg font-600 tracking-tight text-white">
			<span class="neon-dot"></span>
			Ole Kristensen
		</a>

		<!-- Desktop nav -->
		<ul class="hidden gap-8 md:flex">
			<li><a href="/works" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-[var(--color-neon)]">Works</a></li>
			<li><a href="/consultancies" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-[var(--color-neon)]">Consultancies</a></li>
			<li><a href="/about" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-[var(--color-neon)]">About</a></li>
			<li><a href="/contact" class="text-sm tracking-wide text-white/70 uppercase transition-colors duration-300 hover:text-[var(--color-neon)]">Contact</a></li>
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
	<a href="/works" onclick={() => menuOpen = false} class="font-display text-3xl font-600 text-white/80 transition-colors hover:text-[var(--color-neon)]">Works</a>
	<a href="/consultancies" onclick={() => menuOpen = false} class="font-display text-3xl font-600 text-white/80 transition-colors hover:text-[var(--color-neon)]">Consultancies</a>
	<a href="/about" onclick={() => menuOpen = false} class="font-display text-3xl font-600 text-white/80 transition-colors hover:text-[var(--color-neon)]">About</a>
	<a href="/contact" onclick={() => menuOpen = false} class="font-display text-3xl font-600 text-white/80 transition-colors hover:text-[var(--color-neon)]">Contact</a>
</div>
{/if}