<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Contact — Ole Kristensen</title>
	<meta property="og:title" content="Contact" />
</svelte:head>

<article>
	<header>
		<div>
			<p>Contact</p>
			<h1>{data.item.meta.title || 'Contact'}</h1>
		</div>
	</header>

	<section>
		<div>
			{@html data.item.html}
		</div>
	</section>
</article>
