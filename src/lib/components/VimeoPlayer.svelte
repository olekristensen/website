<script lang="ts">
	interface Props {
		id: string;
		title?: string;
	}

	let { id, title }: Props = $props();
</script>

<figure class="vimeo-player">
	<div class="aspect-video">
		<iframe
			src="https://player.vimeo.com/video/{id}?byline=0&portrait=0&title=0&color=ffffff&dnt=1"
			{title}
			frameborder="0"
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
		></iframe>
	</div>
	{#if title}
		<figcaption class="mt-2 text-xs text-[var(--color-ink-subtle)]">{title}</figcaption>
	{/if}
</figure>

<style>
	.aspect-video {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
	}
	.aspect-video iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}
</style>
