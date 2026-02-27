import { getContent } from '$lib/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const item = await getContent('about', '');

	if (!item) {
		throw error(404, 'About page not found');
	}

	return {
		item
	};
};
