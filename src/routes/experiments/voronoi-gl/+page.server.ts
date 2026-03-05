import { getContentList } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const works = await getContentList('works');

	const featured = works.filter((w) => w.meta.tags?.includes('Featured'));

	const heroImages = featured
		.filter((w) => w.images.thumb)
		.map((w) => {
			const base = w.images.thumb!.replace('thumb-480.jpg', '');
			return {
				sizes: [
					{ width: 480, url: `${base}thumb-480.jpg` },
					{ width: 960, url: `${base}thumb-960.jpg` },
					{ width: 1920, url: `${base}thumb-1920.jpg` }
				]
			};
		});

	return { heroImages };
};
