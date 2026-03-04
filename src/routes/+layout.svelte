<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { Snippet } from 'svelte';
	import { setContext, onMount } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
	let bureau = $state(false);

	setContext('bureau', () => bureau);

	onMount(() => {
		if (window.location.hostname.endsWith('denfrievilje.dk')) {
			handleToggleDomain('bureau');
		}
	});

	function handleToggleDomain(mode: 'artist' | 'bureau') {
		bureau = mode === 'bureau';
		if (typeof document !== 'undefined') {
			document.body.classList.toggle('bureau', bureau);
		}
	}
</script>

<div class="min-h-screen flex flex-col">
	<Header {bureau} onToggleDomain={handleToggleDomain} />
	<main class="flex-1 pt-[var(--nav-h)]">
		{@render children()}
	</main>
	<Footer />
</div>
