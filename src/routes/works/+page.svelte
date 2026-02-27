<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Works — Ole Kristensen</title>
</svelte:head>

<section>
	<div>
		<p>Works</p>
		<h1>Projects &amp;<br /> Installations</h1>
		<p>A selection spanning interactive installations, live performances, and commissioned work.</p>
	</div>
</section>

<section>
	<div>
		{#each data.grouped as group, gi (group.year)}
			<div>
				<div>
					<span>{group.year || 'Undated'}</span>
					<span></span>
				</div>

				<div>
					{#each group.items as item (item.slug)}
						<a href="/works/{item.slug}">
							{#if item.images.thumb}
								<div>
									<img
										src={item.images.thumb}
										alt={item.meta.title || item.slug}
										loading="lazy"
									/>
								</div>
							{/if}
							<div>
								<h3>{item.meta.title || item.slug}</h3>
								{#if item.meta.date}
									<span>{item.meta.date}</span>
								{/if}
							</div>
							{#if item.meta.lead}
								<p>{item.meta.lead}</p>
							{/if}
							{#if item.meta.tags}
								<div>
									{#each item.meta.tags as tag}
										<span>{tag}</span>
									{/each}
								</div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
