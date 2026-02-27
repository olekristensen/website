<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Consultancies — Ole Kristensen</title>
</svelte:head>

<section class="pt-32 pb-20 md:pb-28">
	<div class="content-width">
		<p class="section-label mb-4">Consultancies</p>
		<h1 class="font-display text-[clamp(2.5rem,6vw,5rem)]">Design Technology Services</h1>
		<p class="mt-4 max-w-xl text-[var(--color-ink-muted)]">For broadcasters, stages, museums and cultural institutions.</p>
	</div>
</section>

<section class="pb-20 md:pb-28">
	<div class="content-width">
		<div class="grid gap-px bg-[var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
			{#each data.items as item (item.slug)}
				<a href="/consultancies/{item.slug}" class="card-hover group flex flex-col bg-[var(--color-surface)] hover:bg-[var(--color-surface-warm)]">
					{#if item.images.thumb}
						<div class="aspect-[4/3] overflow-hidden">
							<img
								src={item.images.thumb}
								alt={item.meta.title || item.slug}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</div>
					{/if}
					<div class="flex flex-1 flex-col p-6">
						<h3 class="font-display text-lg">{item.meta.title || item.slug}</h3>
						{#if item.meta.lead}
							<p class="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.meta.lead}</p>
						{/if}
						<div class="mt-auto flex gap-4 pt-3 text-xs text-[var(--color-ink-subtle)]">
							{#if item.meta.client}<span>{item.meta.client}</span>{/if}
							{#if item.meta.date}<span>{item.meta.date}</span>{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
