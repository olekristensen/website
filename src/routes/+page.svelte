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

<!-- Works -->
<section>
	<div>
		<p>Selected Works</p>
		<h2>Projects &amp; Installations</h2>

		<div>
			{#each data.featured as work, i (work.slug)}
				<a href="/works/{work.slug}">
					{#if work.images.thumb}
						<div>
							<img
								src={work.images.thumb}
								alt={work.meta.title}
								loading="lazy"
							/>
						</div>
					{/if}
					<div>
						<h3>{work.meta.title}</h3>
						{#if work.meta.date}
							<span>{work.meta.date}</span>
						{/if}
					</div>
					{#if work.meta.lead && i === 0}
						<p>{work.meta.lead}</p>
					{/if}
				</a>
			{/each}
		</div>

		<div>
			<a href="/works">View all works</a>
		</div>
	</div>
</section>

<!-- Consultancies -->
<section>
	<div>
		<p>Consultancies</p>
		<h2>Design Technology</h2>

		<div>
			{#each data.consultancies.slice(0, 4) as consultancy (consultancy.slug)}
				<a href="/consultancies/{consultancy.slug}">
					<div>
						<h3>{consultancy.meta.title}</h3>
						{#if consultancy.meta.lead}
							<p>{consultancy.meta.lead}</p>
						{/if}
					</div>
					<div>
						{#if consultancy.meta.client}
							<span>{consultancy.meta.client}</span>
						{/if}
						{#if consultancy.meta.date}
							<span>{consultancy.meta.date}</span>
						{/if}
						<span>&rarr;</span>
					</div>
				</a>
			{/each}
		</div>

		<div>
			<a href="/consultancies">View all consultancies</a>
		</div>
	</div>
</section>

<!-- About -->
<section>
	<div>
		<div>
			<p>About</p>
			<p>
				Ole Kristensen is a visual artist, programmer and scenographer — developing and appropriating new technology, creating works with software at the core.
			</p>
			<div>
				<a href="/about">Read more</a>
			</div>
		</div>
	</div>
</section>
