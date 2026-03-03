<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<h1 class="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[0.92] tracking-tight {className}">
	{@render children()}
</h1>
