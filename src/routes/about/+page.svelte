<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>About — Ole Kristensen</title>
	<meta property="og:title" content="About" />
</svelte:head>

<article>
	<header>
		<div>
			<p>About</p>
			<h1>{data.item.meta.title || 'About'}</h1>
		</div>
	</header>

	<section>
		<div>
			{@html data.item.html}
		</div>
	</section>
</article>
