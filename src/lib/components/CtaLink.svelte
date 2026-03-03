<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		class?: string;
		children: Snippet;
	}

	let { href, class: className = '', children }: Props = $props();
</script>

<a {href} class="inline-flex items-center gap-2 font-heading text-[0.8rem] font-medium uppercase tracking-wide text-[var(--color-accent)] no-underline transition-[gap] duration-300 hover:gap-3 {className}">
	{@render children()}
</a>
