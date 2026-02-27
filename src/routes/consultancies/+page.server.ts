import { getContentList } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const items = await getContentList('consultancies');
	return {
		items,
		title: 'Consultancies'
	};
};
