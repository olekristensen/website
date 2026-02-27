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
	<header>
		<div>
			<a href="/works">Works</a>
			<h1>{data.item.meta.title}</h1>
			{#if data.item.meta.lead}
				<p>{data.item.meta.lead}</p>
			{/if}
			<div>
				{#if data.item.meta.date}
					<span>{data.item.meta.date}</span>
				{/if}
				{#if data.item.meta.tags}
					<span></span>
					{#each data.item.meta.tags as tag}
						<span>{tag}</span>
					{/each}
				{/if}
			</div>
		</div>
	</header>

	<!-- Videos -->
	{#if data.item.meta.videos?.length}
		<section>
			<div>
				<div>
					{#each data.item.meta.videos as video}
						<VimeoPlayer id={video.id} title={video.title} />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Image Gallery -->
	{#if data.item.images.gallery.length > 0}
		<section>
			<div>
				<div>
					{#each data.item.images.gallery as src, i}
						<button
							type="button"
							onclick={() => lightboxIndex = i}
						>
							<img
								{src}
								alt="{data.item.meta.title} — image {i + 1}"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
				{#if data.item.meta.photocredits}
					<p>Photos: {data.item.meta.photocredits}</p>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Lightbox -->
	{#if lightboxIndex >= 0}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
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
				onclick={() => lightboxIndex = -1}
				aria-label="Close"
			>&times;</button>
			{#if lightboxIndex > 0}
				<button
					onclick={(e) => { e.stopPropagation(); lightboxIndex--; }}
					aria-label="Previous"
				>&lsaquo;</button>
			{/if}
			{#if lightboxIndex < data.item.images.gallery.length - 1}
				<button
					onclick={(e) => { e.stopPropagation(); lightboxIndex++; }}
					aria-label="Next"
				>&rsaquo;</button>
			{/if}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div onclick={(e) => e.stopPropagation()}>
				<img
					src={data.item.images.gallery[lightboxIndex]}
					alt="{data.item.meta.title} — image {lightboxIndex + 1}"
				/>
			</div>
			<p>{lightboxIndex + 1} / {data.item.images.gallery.length}</p>
		</div>
	{/if}

	<!-- Content -->
	<section>
		<div>
			<div>
				{@html data.item.html}
			</div>

			{#if data.item.meta.materials || data.item.meta.partners || data.item.meta.client}
				<aside>
					<div>
						{#if data.item.meta.materials}
							<div>
								<h4>Materials &amp; Equipment</h4>
								<p>{data.item.meta.materials}</p>
							</div>
						{/if}
						{#if data.item.meta.partners}
							<div>
								<h4>Partners</h4>
								<p>{data.item.meta.partners}</p>
							</div>
						{/if}
						{#if data.item.meta.client}
							<div>
								<h4>Client</h4>
								<p>{data.item.meta.client}</p>
							</div>
						{/if}
					</div>
				</aside>
			{/if}
		</div>
	</section>

	<!-- Appearances -->
	{#if data.item.meta.appearances?.length}
		<section>
			<div>
				<h4>Appearances</h4>
				<div>
					{#each data.item.meta.appearances as appearance}
						<a
							href={appearance.url}
							target="_blank"
							rel="noopener"
						>
							<span>{appearance.occasion}</span>
							<div>
								<span>{appearance.place}</span>
								<span>{appearance.date}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Back nav -->
	<nav>
		<div>
			<a href="/works">&larr; All Works</a>
		</div>
	</nav>
</article>
