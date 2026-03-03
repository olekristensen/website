<script lang="ts">
	interface Props {
		images: string[];
		title?: string;
		photocredits?: string;
	}

	let { images, title = '', photocredits }: Props = $props();
	let lightboxIndex = $state(-1);
	let overlayEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (lightboxIndex >= 0 && overlayEl) {
			overlayEl.focus();
		}
	});
</script>

{#if images.length > 0}
	<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
		{#each images as src, i}
			<button
				type="button"
				class="group cursor-pointer overflow-hidden bg-[var(--color-accent-subtle)]"
				onclick={() => lightboxIndex = i}
			>
				<img
					{src}
					alt="{title} — image {i + 1}"
					loading="lazy"
					class="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
				/>
			</button>
		{/each}
	</div>
	{#if photocredits}
		<p class="mt-3 text-[0.72rem] text-[var(--color-ink-secondary)]">Photos: {photocredits}</p>
	{/if}
{/if}

{#if lightboxIndex >= 0}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={overlayEl}
		class="lightbox-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={() => lightboxIndex = -1}
		onkeydown={(e) => {
			if (e.key === 'Escape') lightboxIndex = -1;
			if (e.key === 'ArrowRight' && lightboxIndex < images.length - 1) lightboxIndex++;
			if (e.key === 'ArrowLeft' && lightboxIndex > 0) lightboxIndex--;
		}}
	>
		<button
			class="absolute right-4 top-4 z-10 text-3xl text-white/70 hover:text-white"
			onclick={() => lightboxIndex = -1}
			aria-label="Close"
		>&times;</button>
		{#if lightboxIndex > 0}
			<button
				class="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-4xl text-white/50 hover:text-white"
				onclick={(e) => { e.stopPropagation(); lightboxIndex--; }}
				aria-label="Previous"
			>&lsaquo;</button>
		{/if}
		{#if lightboxIndex < images.length - 1}
			<button
				class="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-4xl text-white/50 hover:text-white"
				onclick={(e) => { e.stopPropagation(); lightboxIndex++; }}
				aria-label="Next"
			>&rsaquo;</button>
		{/if}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div onclick={(e) => e.stopPropagation()}>
			<img
				src={images[lightboxIndex]}
				alt="{title} — image {lightboxIndex + 1}"
				class="max-h-[85vh] max-w-[90vw] object-contain"
			/>
		</div>
		<p class="absolute bottom-6 left-1/2 -translate-x-1/2 font-heading text-[0.72rem] tracking-wider text-white/50">{lightboxIndex + 1} / {images.length}</p>
	</div>
{/if}
