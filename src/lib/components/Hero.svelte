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

	let bottomBrightness = $state(0.5);
	let isDark = $derived(bottomBrightness < 0.45);
	let textColor = $derived(isDark ? 'color(display-p3 1 1 1)' : 'color(display-p3 0 0 0)');

	let mdUp = $state(false);
	$effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		mdUp = mq.matches;
		const onChange = (e: MediaQueryListEvent) => { mdUp = e.matches; };
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
	let gridCellCount = $derived(mdUp ? 64 : 32);
</script>

<!-- Artist hero: full viewport with overlaid text -->
{#if !bureau}
<section class="relative -mt-[var(--nav-h)] h-[100svh]">
	{#if images.length > 0}
		<div class="absolute inset-0">
			<VoronoiGlass {images} bind:bottomBrightness />
		</div>
	{/if}
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[55%] transition-opacity duration-[2.5s] ease-in-out"
		style="background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%); opacity: {isDark ? 1 : 0}"
	></div>
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[55%] transition-opacity duration-[2.5s] ease-in-out"
		style="background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%); opacity: {isDark ? 0 : 1}"
	></div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[var(--gutter)] pb-[clamp(2rem,5vh,5rem)] transition-colors duration-[2.5s] ease-in-out" style="color: {textColor}">
		<div class="mx-auto grid max-w-[var(--max-w)] grid-cols-1 items-end md:grid-cols-2">
			<div class="pt-[clamp(1.5rem,3vh,3rem)] pb-[clamp(1.5rem,3vh,3rem)]">
				<h1
					class="font-heading text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.92] tracking-[-0.04em]"
				>
					Ole<br />Kristensen
				</h1>
			</div>
			<div class="flex flex-col justify-end pb-[clamp(1.5rem,3vh,3rem)] md:pl-12 md:pt-[clamp(1.5rem,3vh,3rem)]">
				<div class="mb-6 h-[3px] w-16 bg-[var(--color-accent)]"></div>
				<p
					class="mb-8 max-w-[35ch] text-[1rem] leading-[1.7]"
				>
					Software artist &amp; design technologist — interactive installations, live performances and bespoke systems.
				</p>
				<p
					class="font-heading text-[0.72rem] uppercase tracking-[0.12em]"
				>
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
		<VoronoiGlass images={[]} showGrid gridColor="var(--color-accent)" cellCount={gridCellCount} relaxationIterations={0.2} gridRadius={300} />
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
