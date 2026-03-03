import { getContentList, getContent } from '$lib/content';
import type { PageServerLoad } from './$types';

function extractYear(date?: string): number {
	if (!date) return 0;
	const match = date.match(/(\d{4})/);
	return match ? parseInt(match[1], 10) : 0;
}

export const load: PageServerLoad = async () => {
	const items = await getContentList('consultancies');
	const section = await getContent('consultancies', '');

	// Sort newest first
	items.sort((a, b) => extractYear(b.meta.date) - extractYear(a.meta.date));

	return {
		items,
		section,
		title: 'Consultancies'
	};
};
