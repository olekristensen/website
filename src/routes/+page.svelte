<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Ole Kristensen — Software Artist & Design Technologist</title>
	<meta name="description" content="Interactive installations, live performances and design technology for broadcasters, stages and cultural institutions." />
</svelte:head>

<Hero />

<!-- Featured Works -->
<section class="border-t border-[var(--color-border-subtle)] py-20 md:py-28">
	<div class="content-width">
		<p class="mb-4 text-xs font-medium tracking-widest text-[var(--color-ink-subtle)] uppercase">Selected Works</p>
		<h2 class="font-display text-[clamp(1.75rem,4vw,3rem)]">Projects &amp; Installations</h2>

		<div class="mt-12 grid gap-px bg-[var(--color-border-subtle)] md:grid-cols-3">
			{#each data.featured as work (work.slug)}
				<a href="/works/{work.slug}" class="group flex flex-col bg-[var(--color-surface)] transition-colors duration-300 hover:bg-[var(--color-surface-warm)]">
					{#if work.images.thumb}
						<div class="aspect-[4/3] overflow-hidden">
							<img
								src={work.images.thumb}
								alt={work.meta.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</div>
					{/if}
					<div class="p-6">
						<h3 class="font-display text-xl">{work.meta.title}</h3>
						{#if work.meta.lead}
							<p class="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{work.meta.lead}</p>
						{/if}
						{#if work.meta.date}
							<p class="mt-3 text-xs text-[var(--color-ink-subtle)]">{work.meta.date}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>

		<div class="mt-10">
			<a href="/works" class="hover-line text-sm font-medium tracking-wide text-[var(--color-ink-muted)] uppercase transition-colors hover:text-[var(--color-ink)]">View all works</a>
		</div>
	</div>
</section>

<!-- Consultancies -->
<section class="border-t border-[var(--color-border-subtle)] py-20 md:py-28">
	<div class="content-width">
		<p class="mb-4 text-xs font-medium tracking-widest text-[var(--color-ink-subtle)] uppercase">Consultancies</p>
		<h2 class="font-display text-[clamp(1.75rem,4vw,3rem)]">Design Technology Services</h2>

		<div class="mt-12 grid gap-px bg-[var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
			{#each data.consultancies.slice(0, 3) as consultancy (consultancy.slug)}
				<a href="/consultancies/{consultancy.slug}" class="group flex flex-col bg-[var(--color-surface)] transition-colors duration-300 hover:bg-[var(--color-surface-warm)]">
					{#if consultancy.images.thumb}
						<div class="aspect-[4/3] overflow-hidden">
							<img
								src={consultancy.images.thumb}
								alt={consultancy.meta.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</div>
					{/if}
					<div class="flex items-baseline justify-between gap-4 p-6">
						<h3 class="font-display text-lg">{consultancy.meta.title}</h3>
						{#if consultancy.meta.client}
							<span class="shrink-0 text-xs text-[var(--color-ink-subtle)]">{consultancy.meta.client}</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>

		<div class="mt-10">
			<a href="/consultancies" class="hover-line text-sm font-medium tracking-wide text-[var(--color-ink-muted)] uppercase transition-colors hover:text-[var(--color-ink)]">View all consultancies</a>
		</div>
	</div>
</section>

<!-- About preview -->
<section class="border-t border-[var(--color-border-subtle)] py-20 md:py-28">
	<div class="content-width">
		<div class="max-w-2xl">
			<p class="mb-4 text-xs font-medium tracking-widest text-[var(--color-ink-subtle)] uppercase">About</p>
			<p class="font-display text-2xl leading-snug md:text-3xl">Ole Kristensen is a visual artist, programmer and scenographer — developing and appropriating new technology, creating works with software at the core.</p>
			<div class="mt-8">
				<a href="/about" class="hover-line text-sm font-medium tracking-wide text-[var(--color-ink-muted)] uppercase transition-colors hover:text-[var(--color-ink)]">Read more</a>
			</div>
		</div>
	</div>
</section>
