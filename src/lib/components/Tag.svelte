<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<span class="bg-[var(--color-accent-subtle)] px-2 py-0.5 font-heading text-[0.62rem] uppercase tracking-wider text-[oklch(from_var(--color-accent)_calc(l*0.75)_c_h)] {className}">
	{@render children()}
</span>
