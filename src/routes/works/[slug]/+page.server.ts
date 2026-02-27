import { getContent } from '$lib/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const item = await getContent('works', params.slug);

	if (!item) {
		throw error(404, 'Work not found');
	}

	return {
		item,
		slug: params.slug
	};
};
