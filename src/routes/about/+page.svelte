<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>About — Ole Kristensen</title>
	<meta property="og:title" content="About" />
</svelte:head>

<article>
	<header class="pt-32 pb-16 md:pb-20">
		<div class="narrow-width">
			<p class="section-label mb-4">About</p>
			<h1 class="font-display text-[clamp(2.5rem,6vw,5rem)]">{data.item.meta.title || 'About'}</h1>
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
	.prose :global(h3) {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 2rem 0 0.75rem;
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 1.5rem 0;
		padding-left: 1.5rem;
	}
	.prose :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.7;
		color: var(--color-ink-muted);
	}
	.prose :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-border);
		text-underline-offset: 3px;
		transition: text-decoration-color 0.3s;
	}
	.prose :global(a:hover) {
		text-decoration-color: var(--color-neon);
	}
	.prose :global(blockquote) {
		border-left: 2px solid var(--color-border);
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: var(--color-ink-muted);
	}
	.prose :global(em) {
		font-style: italic;
	}
	.prose :global(img) {
		max-width: 100%;
		height: auto;
		margin: 2rem 0;
	}
	/* Legacy layout classes from content markdown */
	.prose :global(.row) {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
	@media (min-width: 768px) {
		.prose :global(.row) {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.prose :global(.page-header) {
		margin-bottom: 2rem;
	}
	.prose :global(.btn) {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: var(--color-ink);
		color: var(--color-surface);
		text-decoration: none;
		font-size: 0.9rem;
		margin-top: 1rem;
		transition: opacity 0.3s;
	}
	.prose :global(.btn:hover) {
		opacity: 0.8;
	}
	.prose :global(.lead) {
		font-size: 1.15rem;
		line-height: 1.7;
		color: var(--color-ink-muted);
	}
	.prose :global(.muted) {
		color: var(--color-ink-subtle);
	}
	.prose :global(dl) {
		margin: 1rem 0;
	}
	.prose :global(dt) {
		font-weight: 600;
		margin-top: 1rem;
		color: var(--color-ink);
	}
	.prose :global(dd) {
		margin-left: 0;
		color: var(--color-ink-muted);
	}
</style>
