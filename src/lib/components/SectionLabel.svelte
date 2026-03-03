<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tag?: string;
		class?: string;
		children: Snippet;
	}

	let { tag = 'p', class: className = '', children }: Props = $props();
</script>

<svelte:element this={tag} class="font-heading text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--color-accent)] {className}">
	{@render children()}
</svelte:element>
