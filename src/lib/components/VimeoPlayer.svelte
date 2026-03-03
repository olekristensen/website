<script lang="ts">
	interface Props {
		id: string;
		title?: string;
	}

	let { id, title }: Props = $props();
</script>

<figure class="not-prose">
	<div class="relative aspect-video w-full overflow-hidden rounded-sm bg-black">
		<iframe
			src="https://player.vimeo.com/video/{id}?byline=0&portrait=0&title=0&color=ffffff&dnt=1"
			title={title || 'Video'}
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
			class="absolute inset-0 h-full w-full border-0"
		></iframe>
	</div>
	{#if title}
		<figcaption class="mt-3 font-heading text-[0.75rem] text-[var(--color-ink-secondary)]">{title}</figcaption>
	{/if}
</figure>
