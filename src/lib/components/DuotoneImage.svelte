<script lang="ts">
	interface Props {
		src: string;
		alt?: string;
		class?: string;
	}

	let { src, alt = '', class: className = '' }: Props = $props();
</script>

<div class="relative {className}">
	<img {src} {alt} loading="lazy" class="h-full w-full object-cover opacity-50 grayscale contrast-110 brightness-70 transition-[filter,opacity] duration-400 group-hover:opacity-100 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100" />
	<div class="pointer-events-none absolute inset-0 bg-[var(--color-accent-duotone)] mix-blend-hard-light transition-opacity duration-400 group-hover:opacity-0"></div>
</div>
