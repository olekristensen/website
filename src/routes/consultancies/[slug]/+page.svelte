<script lang="ts">
	import type { PageData } from './$types';
	import VimeoPlayer from '$lib/components/VimeoPlayer.svelte';

	let { data }: { data: PageData } = $props();
	let lightboxIndex = $state(-1);
</script>

<svelte:head>
	<title>{data.item.meta.title || data.slug} — Ole Kristensen</title>
	{#if data.item.meta.title}
		<meta property="og:title" content={data.item.meta.title} />
	{/if}
</svelte:head>

<article>
	<header class="pt-32 pb-16 md:pb-20">
		<div class="narrow-width">
			<a href="/consultancies" class="hover-line section-label mb-8">Consultancies</a>
			<h1 class="font-display text-[clamp(2rem,5vw,4rem)]">{data.item.meta.title}</h1>
			{#if data.item.meta.date}
				<p class="mt-4 text-sm text-[var(--color-ink-subtle)]">{data.item.meta.date}</p>
			{/if}
		</div>
	</header>

	<!-- Videos -->
	{#if data.item.meta.videos?.length}
		<section class="pb-16 md:pb-20">
			<div class="narrow-width">
				<div class="space-y-8">
					{#each data.item.meta.videos as video}
						<VimeoPlayer id={video.id} title={video.title} />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Image Gallery -->
	{#if data.item.images.gallery.length > 0}
		<section class="pb-16 md:pb-20">
			<div class="content-width">
				<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.item.images.gallery as src, i}
						<button
							type="button"
							class="group aspect-[4/3] cursor-zoom-in overflow-hidden bg-[var(--color-surface-warm)]"
							onclick={() => lightboxIndex = i}
						>
							<img
								{src}
								alt="{data.item.meta.title} — image {i + 1}"
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Lightbox -->
	{#if lightboxIndex >= 0}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={() => lightboxIndex = -1}
			onkeydown={(e) => {
				if (e.key === 'Escape') lightboxIndex = -1;
				if (e.key === 'ArrowRight' && lightboxIndex < data.item.images.gallery.length - 1) lightboxIndex++;
				if (e.key === 'ArrowLeft' && lightboxIndex > 0) lightboxIndex--;
			}}
		>
			<button
				class="absolute top-6 right-6 text-2xl text-white/70 transition-colors hover:text-white"
				onclick={() => lightboxIndex = -1}
				aria-label="Close"
			>&times;</button>
			{#if lightboxIndex > 0}
				<button
					class="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-white/50 transition-colors hover:text-white md:left-8"
					onclick={(e) => { e.stopPropagation(); lightboxIndex--; }}
					aria-label="Previous"
				>&lsaquo;</button>
			{/if}
			{#if lightboxIndex < data.item.images.gallery.length - 1}
				<button
					class="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-white/50 transition-colors hover:text-white md:right-8"
					onclick={(e) => { e.stopPropagation(); lightboxIndex++; }}
					aria-label="Next"
				>&rsaquo;</button>
			{/if}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div onclick={(e) => e.stopPropagation()}>
				<img
					src={data.item.images.gallery[lightboxIndex]}
					alt="{data.item.meta.title} — image {lightboxIndex + 1}"
					class="max-h-[90vh] max-w-[90vw] object-contain"
				/>
			</div>
			<p class="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50">{lightboxIndex + 1} / {data.item.images.gallery.length}</p>
		</div>
	{/if}

	<section class="pb-20 md:pb-28">
		<div class="narrow-width">
			<div class="prose">
				{@html data.item.html}
			</div>

			{#if data.item.meta.client}
				<aside class="mt-16 border-t border-[var(--color-border-subtle)] pt-8">
					<h4 class="mb-2 text-xs font-medium tracking-widest text-[var(--color-ink-subtle)] uppercase">Client</h4>
					<p class="text-sm leading-relaxed text-[var(--color-ink-muted)]">{data.item.meta.client}</p>
				</aside>
			{/if}
		</div>
	</section>

	<nav class="border-t border-[var(--color-border-subtle)] py-8">
		<div class="narrow-width">
			<a href="/consultancies" class="hover-line text-sm font-medium tracking-wide text-[var(--color-ink-muted)] uppercase transition-colors hover:text-[var(--color-ink)]">Back to Consultancies</a>
		</div>
	</nav>
</article>

<style>
	.prose :global(p) {
		font-size: 1rem;
		line-height: 1.8;
		color: var(--color-ink-muted);
		margin-bottom: 1.5rem;
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
	.prose :global(img) {
		max-width: 100%;
		height: auto;
		margin: 2rem 0;
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
</style>
