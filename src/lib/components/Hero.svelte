<script lang="ts">
	import VoronoiGlass from './VoronoiGlass.svelte';
	import type { ImageSrcSet } from './VoronoiGlass.svelte';
	import { getContext } from 'svelte';

	interface Props {
		images?: ImageSrcSet[];
	}

	let { images = [] }: Props = $props();
	const getBureau = getContext<() => boolean>('bureau');
	let bureau = $derived(getBureau ? getBureau() : false);
</script>

<!-- Artist hero: split layout -->
{#if !bureau}
<section class="flex h-[100svh] flex-col">
	{#if images.length > 0}
		<div class="relative max-h-[60svh] min-h-0 flex-1">
			<div class="absolute inset-0">
				<VoronoiGlass {images} />
			</div>
		</div>
	{/if}
	<div class="shrink-0 bg-[var(--color-surface)] px-[var(--gutter)]">
		<div class="mx-auto grid max-w-[var(--max-w)] grid-cols-1 items-end md:grid-cols-2">
			<div class="pt-[clamp(1.5rem,3vh,3rem)] pb-[clamp(1.5rem,3vh,3rem)]">
				<h1 class="font-heading text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[var(--color-ink)]">
					Ole<br />Kristensen
				</h1>
			</div>
			<div class="flex flex-col justify-end pb-[clamp(1.5rem,3vh,3rem)] md:pl-12 md:pt-[clamp(1.5rem,3vh,3rem)]">
				<div class="mb-6 h-[3px] w-16 bg-[var(--color-accent)]"></div>
				<p class="mb-8 max-w-[35ch] text-[1rem] leading-[1.7] text-[var(--color-ink-secondary)]">
					Software artist &amp; design technologist — interactive installations, live performances and bespoke systems.
				</p>
				<p class="font-heading text-[0.72rem] uppercase tracking-[0.12em] text-[var(--color-ink-secondary)]">
					Copenhagen, DK
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Bureau hero: logo left, tagline right, 2-col grid -->
{:else}
<section class="relative -mt-[var(--nav-h)] min-h-screen overflow-hidden">
	<div class="absolute inset-0">
		<VoronoiGlass images={[]} />
	</div>
	<div class="relative z-10 mx-auto grid min-h-screen max-w-[var(--max-w)] grid-cols-1 items-end px-[var(--gutter)] md:grid-cols-2 md:items-center">
		<div class="flex items-center justify-end pb-12 md:order-none md:justify-end md:pb-0">
		<img
			src="/images/logos/den%20frie%20vilje%20logo%20knockout.svg"
			alt="Den Frie Vilje"
			class="hero-logo-large w-[clamp(160px,22vw,340px)]"
		/>
	</div>
	<div class="flex flex-col items-end justify-center pb-[clamp(4rem,10vh,8rem)] text-right md:items-start md:pb-0 md:pl-12 md:text-left">
		<div class="mb-6 h-[3px] w-16 bg-[var(--color-accent)] md:mr-0"></div>
		<p class="mb-8 max-w-[30ch] text-[1rem] leading-[1.7] text-[var(--color-ink-secondary)]">
			Design technology consultancy — <span class="whitespace-nowrap">mission-critical</span> software for real-time graphics, interactive installations and cloud-native infrastructure.
		</p>
		<p class="font-heading text-[0.72rem] uppercase tracking-[0.12em] text-[var(--color-ink-secondary)]">
			Copenhagen, DK
		</p>
	</div>
	</div>
</section>
{/if}
