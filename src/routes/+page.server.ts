import { getContentList } from '$lib/content';
import type { PageServerLoad } from './$types';

function extractYear(date?: string): number {
	if (!date) return 0;
	const match = date.match(/(\d{4})/);
	return match ? parseInt(match[1], 10) : 0;
}

export const load: PageServerLoad = async () => {
	const works = await getContentList('works');
	const consultancies = await getContentList('consultancies');

	// Sort newest first
	works.sort((a, b) => extractYear(b.meta.date) - extractYear(a.meta.date));
	consultancies.sort((a, b) => extractYear(b.meta.date) - extractYear(a.meta.date));

	// Get featured items (newest 3)
	const featured = works.slice(0, 3);

	return {
		featured,
		allWorks: works,
		consultancies
	};
};
