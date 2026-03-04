import type { Config } from '@sveltejs/kit';
import adapter from '@sveltejs/adapter-static';

const config: Config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			strict: false
		}),
		paths: {
			relative: false
		},
		prerender: {
			handleHttpError: ({ path }) => {
				if (path === '/favicon.png') return;
				throw new Error(`404 ${path}`);
			}
		}
	}
};

export default config;
