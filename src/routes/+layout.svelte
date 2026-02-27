<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<div>
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>
