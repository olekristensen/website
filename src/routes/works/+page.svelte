<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Works — Ole Kristensen</title>
</svelte:head>

<section class="pt-32 pb-20 md:pb-28">
	<div class="content-width">
		<p class="section-label mb-4">Works</p>
		<h1 class="font-display text-[clamp(2.5rem,6vw,5rem)]">Projects &amp; Installations</h1>
		<p class="mt-4 max-w-xl text-[var(--color-ink-muted)]">A selection of projects spanning interactive installations, live performances, and commissioned work.</p>
	</div>
</section>

<section class="pb-20 md:pb-28">
	<div class="content-width space-y-16">
		{#each data.grouped as group (group.year)}
			<div>
				<h2 class="section-label mb-6 text-base font-600">{group.year || 'Undated'}</h2>
				<div class="grid gap-px bg-[var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
					{#each group.items as item (item.slug)}
						<a href="/works/{item.slug}" class="card-hover group flex flex-col bg-[var(--color-surface)] hover:bg-[var(--color-surface-warm)]">
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
								<h3 class="font-display text-xl">{item.meta.title || item.slug}</h3>
								{#if item.meta.date}
									<p class="mt-2 text-xs text-[var(--color-ink-subtle)]">{item.meta.date}</p>
								{/if}
								{#if item.meta.lead}
									<p class="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.meta.lead}</p>
								{/if}
								{#if item.meta.tags}
									<div class="mt-4 flex flex-wrap gap-2">
										{#each item.meta.tags as tag}
											<span class="text-[0.7rem] tracking-wide text-[var(--color-ink-subtle)] uppercase">{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
