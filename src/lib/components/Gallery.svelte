<script lang="ts">
	interface Props {
		images: string[];
		title?: string;
		photocredits?: string;
	}

	let { images, title = '', photocredits }: Props = $props();
	let lightboxIndex = $state(-1);
	let overlayEl: HTMLDivElement | undefined = $state();

	// Touch slide state
	let touchStartX = 0;
	let touchStartY = 0;
	let touchDeltaX = $state(0);
	let isSwiping = false;
	let isAnimating = $state(false);
	const SWIPE_THRESHOLD = 0.2; // fraction of viewport width to commit

	function handleTouchStart(e: TouchEvent) {
		if (isAnimating) return;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		touchDeltaX = 0;
		isSwiping = false;
	}

	function handleTouchMove(e: TouchEvent) {
		if (isAnimating) return;
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;
		// Lock to horizontal once direction is established
		if (!isSwiping && Math.abs(dy) > Math.abs(dx)) return;
		isSwiping = true;
		// Clamp at edges with rubber-band resistance
		if ((lightboxIndex === 0 && dx > 0) || (lightboxIndex === images.length - 1 && dx < 0)) {
			touchDeltaX = dx * 0.25;
		} else {
			touchDeltaX = dx;
		}
	}

	function handleTouchEnd() {
		if (!isSwiping) return;
		const vw = window.innerWidth;
		const fraction = Math.abs(touchDeltaX) / vw;
		if (fraction > SWIPE_THRESHOLD) {
			// Commit to slide
			const direction = touchDeltaX < 0 ? 1 : -1;
			const targetIdx = lightboxIndex + direction;
			if (targetIdx >= 0 && targetIdx < images.length) {
				animateSlide(direction === 1 ? -vw : vw, targetIdx);
				return;
			}
		}
		// Snap back
		animateSlide(0, lightboxIndex);
	}

	function animateSlide(targetX: number, targetIdx: number) {
		isAnimating = true;
		const startX = touchDeltaX;
		const startTime = performance.now();
		const duration = 250;

		function tick(now: number) {
			const t = Math.min(1, (now - startTime) / duration);
			const eased = t * (2 - t); // ease-out quad
			touchDeltaX = startX + (targetX - startX) * eased;
			if (t < 1) {
				requestAnimationFrame(tick);
			} else {
				lightboxIndex = targetIdx;
				touchDeltaX = 0;
				isAnimating = false;
			}
		}
		requestAnimationFrame(tick);
	}

	function goTo(idx: number) {
		if (isAnimating) return;
		const direction = idx > lightboxIndex ? 1 : -1;
		animateSlide(direction === 1 ? -window.innerWidth : window.innerWidth, idx);
	}

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
		onclick={() => { if (!isSwiping) lightboxIndex = -1; }}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		onkeydown={(e) => {
			if (e.key === 'Escape') lightboxIndex = -1;
			if (e.key === 'ArrowRight' && lightboxIndex < images.length - 1) goTo(lightboxIndex + 1);
			if (e.key === 'ArrowLeft' && lightboxIndex > 0) goTo(lightboxIndex - 1);
		}}
	>
		<button
			class="absolute right-4 top-4 z-20 text-3xl text-white/70 hover:text-white"
			onclick={() => lightboxIndex = -1}
			aria-label="Close"
		>&times;</button>
		{#if lightboxIndex > 0}
			<button
				class="group/nav absolute left-0 top-0 z-10 flex h-full w-1/5 cursor-pointer items-center justify-start pl-4"
				onclick={(e) => { e.stopPropagation(); goTo(lightboxIndex - 1); }}
				aria-label="Previous"
			><span class="text-4xl text-white/50 group-hover/nav:text-white">&lsaquo;</span></button>
		{/if}
		{#if lightboxIndex < images.length - 1}
			<button
				class="group/nav absolute right-0 top-0 z-10 flex h-full w-1/5 cursor-pointer items-center justify-end pr-4"
				onclick={(e) => { e.stopPropagation(); goTo(lightboxIndex + 1); }}
				aria-label="Next"
			><span class="text-4xl text-white/50 group-hover/nav:text-white">&rsaquo;</span></button>
		{/if}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="lightbox-strip"
			style="transform: translateX({touchDeltaX}px)"
			onclick={(e) => e.stopPropagation()}
		>
			{#if lightboxIndex > 0}
				<div class="lightbox-slide lightbox-slide-prev">
					<img
						src={images[lightboxIndex - 1]}
						alt="{title} — image {lightboxIndex}"
						class="max-h-[85vh] max-w-[90vw] object-contain"
					/>
				</div>
			{/if}
			<div class="lightbox-slide lightbox-slide-current">
				<img
					src={images[lightboxIndex]}
					alt="{title} — image {lightboxIndex + 1}"
					class="max-h-[85vh] max-w-[90vw] object-contain"
				/>
			</div>
			{#if lightboxIndex < images.length - 1}
				<div class="lightbox-slide lightbox-slide-next">
					<img
						src={images[lightboxIndex + 1]}
						alt="{title} — image {lightboxIndex + 2}"
						class="max-h-[85vh] max-w-[90vw] object-contain"
					/>
				</div>
			{/if}
		</div>
		<p class="absolute bottom-6 left-1/2 -translate-x-1/2 font-heading text-[0.72rem] tracking-wider text-white/50">{lightboxIndex + 1} / {images.length}</p>
	</div>
{/if}
