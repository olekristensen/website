<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Contact — Ole Kristensen</title>
	<meta property="og:title" content="Contact" />
</svelte:head>

<article>
	<header class="pt-32 pb-16 md:pb-20">
		<div class="narrow-width">
			<p class="mb-4 text-xs font-medium tracking-widest text-[var(--color-ink-subtle)] uppercase">Contact</p>
			<h1 class="font-display text-[clamp(2.5rem,6vw,5rem)]">{data.item.meta.title || 'Contact'}</h1>
		</div>
	</header>

	<section class="pb-20 md:pb-28">
		<div class="narrow-width prose">
			{@html data.item.html}
		</div>
	</section>
</article>

<style>
	.prose :global(p) {
		font-size: 1rem;
		line-height: 1.8;
		color: var(--color-ink-muted);
		margin-bottom: 1.5rem;
	}
	.prose :global(h1) {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3rem);
		margin: 2.5rem 0 1rem;
	}
	.prose :global(h2) {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2rem);
		margin: 2.5rem 0 1rem;
	}
	.prose :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-border);
		text-underline-offset: 3px;
		transition: text-decoration-color 0.3s;
	}
	.prose :global(a:hover) {
		text-decoration-color: var(--color-ink);
	}
	.prose :global(small) {
		font-size: 0.85rem;
		color: var(--color-ink-subtle);
	}
	.prose :global(.page-header) {
		margin-bottom: 2rem;
	}
	.prose :global(.row) {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
	@media (min-width: 768px) {
		.prose :global(.row) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.prose :global(dl) {
		margin: 1rem 0;
	}
	.prose :global(dt) {
		font-weight: 600;
		margin-top: 1.25rem;
		color: var(--color-ink);
	}
	.prose :global(dd) {
		margin-left: 0;
		color: var(--color-ink-muted);
	}
	.prose :global(address) {
		font-style: normal;
		line-height: 1.7;
	}
	.prose :global(.muted) {
		color: var(--color-ink-subtle);
	}
	.prose :global(.lead) {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--color-ink-muted);
	}
</style>
