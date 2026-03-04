import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: ['build', '.svelte-kit', 'dist']
	},
	{
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2020,
				...globals.node
			}
		}
	}
];
