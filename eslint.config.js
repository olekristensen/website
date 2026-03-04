import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		rules: {
			// Trusted markdown content rendered via {@html} from filesystem
			'svelte/no-at-html-tags': 'off',
			// Static adapter — all routes prerendered, no need for resolve()
			'svelte/no-navigation-without-resolve': 'off',
			// Simple array iterations throughout — keys not needed for static content
			'svelte/require-each-key': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'.agents/',
			'pnpm-lock.yaml',
			'scripts/migrate-content.js'
		]
	}
);
