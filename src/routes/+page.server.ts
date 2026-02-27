import { getContentList } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const works = await getContentList('works');
	const consultancies = await getContentList('consultancies');

	// Get featured items (those with 'Featured' tag or limit to first few)
	const featured = works.slice(0, 3);

	return {
		featured,
		allWorks: works,
		consultancies
	};
};
