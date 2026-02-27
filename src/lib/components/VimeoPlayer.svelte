<script lang="ts">
	interface Props {
		id: string;
		title?: string;
	}

	let { id, title }: Props = $props();
</script>

<figure>
	<div>
		<iframe
			src="https://player.vimeo.com/video/{id}?byline=0&portrait=0&title=0&color=ffffff&dnt=1"
			{title}
			frameborder="0"
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
		></iframe>
	</div>
	{#if title}
		<figcaption>{title}</figcaption>
	{/if}
</figure>
