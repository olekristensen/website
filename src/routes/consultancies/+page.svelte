<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Consultancies — Ole Kristensen</title>
</svelte:head>

<div>
	<section>
		<div>
			<p>Consultancies</p>
			<h1>Design<br /> Technology</h1>
			<p>For broadcasters, stages, museums and cultural institutions.</p>
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
							<a href="/consultancies/{item.slug}">
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
									{#if item.meta.lead}
										<p>{item.meta.lead}</p>
									{/if}
									<div>
										{#if item.meta.client}
											<span>{item.meta.client}</span>
										{/if}
										{#if item.meta.date}
											<span>{item.meta.date}</span>
										{/if}
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
