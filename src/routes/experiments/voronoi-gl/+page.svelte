<script lang="ts">
	import VoronoiGlassGL from '$lib/components/VoronoiGlassGL.svelte';
	import type { ImageSrcSet } from '$lib/components/VoronoiGlassGL.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const images: ImageSrcSet[] = data.heroImages;
</script>

<svelte:head>
	<title>Voronoi Glass GL — Experiment</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-black text-white">
	<header class="px-6 py-4">
		<h1 class="font-heading text-lg font-medium tracking-tight opacity-60">Voronoi Glass GL — Three.js Experiment</h1>
	</header>

	<main class="relative min-h-0 flex-1">
		<VoronoiGlassGL
			{images}
			cellCount={32}
			refractMax={20}
			shadeMaxAlpha={0.4}
		/>
	</main>

	<footer class="px-6 py-4 text-xs opacity-40">
		<p>Click to transition &middot; Move mouse for refraction &middot; WebGL + GLSL shaders</p>
	</footer>
</div>
