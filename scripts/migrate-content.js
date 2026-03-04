#!/usr/bin/env node
/**
 * Migration script: Kirby CMS (ole.kristensen.name) → SvelteKit (denfrievilje.dk)
 * - Converts project.yml → .md with frontmatter
 * - Copies assets while preserving Git LFS pointers
 * - Maps directory structure to URL routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LEGACY_ROOT = '/Users/drexolek/git/ole.kristensen.name';

// Ensure yaml module is available
let jsYaml;
try {
	jsYaml = yaml;
} catch (e) {
	console.error('Please install js-yaml: npm install js-yaml');
	process.exit(1);
}

/**
 * Extract slug and sort order from Stacey directory name
 * e.g., "17.oresund" → { slug: "oresund", sort: 17 }
 */
function parseDir(dirname) {
	const parts = dirname.split('.');
	const sort = parseInt(parts[0], 10);
	const slug = isNaN(sort) ? dirname : parts.slice(1).join('.');

	return {
		slug,
		sort: isNaN(sort) ? null : sort
	};
}

/**
 * Convert YAML project metadata to Markdown frontmatter
 * Preserves sort order in asset filenames, not in frontmatter
 */
function yamlToMarkdown(yamlData) {
	const frontmatter = {};

	// Map YAML keys to simplified frontmatter
	if (yamlData.title) frontmatter.title = yamlData.title;
	if (yamlData.date) frontmatter.date = yamlData.date;
	if (yamlData.lead) frontmatter.lead = yamlData.lead;
	if (yamlData.tags) frontmatter.tags = yamlData.tags.split(',').map((t) => t.trim());
	if (yamlData.materials) frontmatter.materials = yamlData.materials;
	if (yamlData.partners) frontmatter.partners = yamlData.partners;
	if (yamlData.client) frontmatter.client = yamlData.client;
	if (yamlData.github) frontmatter.github = yamlData.github;
	if (yamlData.photocredits) frontmatter.photocredits = yamlData.photocredits;
	if (yamlData.appearances) frontmatter.appearances = yamlData.appearances;

	// Build the markdown file with frontmatter
	let markdown = '---\n';
	markdown += Object.entries(frontmatter)
		.map(([key, value]) => {
			if (typeof value === 'object') {
				return `${key}: ${JSON.stringify(value).replace(/"/g, "'")}`;
			}
			return `${key}: "${value}"`;
		})
		.join('\n');
	markdown += '\n---\n\n';

	// Add content body
	if (yamlData.content) {
		markdown += yamlData.content.trim();
	}

	return markdown;
}

/**
 * Copy files, preserving Git LFS pointers
 */
function copyAssets(srcDir, destDir) {
	if (!fs.existsSync(srcDir)) return;

	fs.mkdirSync(destDir, { recursive: true });

	const files = fs.readdirSync(srcDir);
	for (const file of files) {
		if (file === 'project.yml' || file === 'vimeo-embed.html') continue; // Skip metadata files

		const srcPath = path.join(srcDir, file);
		const destPath = path.join(destDir, file);
		const stat = fs.statSync(srcPath);

		if (stat.isDirectory()) {
			copyAssets(srcPath, destPath);
		} else {
			// Check if file is an LFS pointer
			const content = fs.readFileSync(srcPath);
			const isLfsPointer = content.toString('utf8').includes('oid sha256:');

			if (isLfsPointer) {
				// Copy LFS pointer file as-is
				fs.copyFileSync(srcPath, destPath);
			} else {
				// Copy regular file
				fs.copyFileSync(srcPath, destPath);
			}
		}
	}
}

/**
 * Migrate a section (works, consultancies, etc.)
 * Uses folder-per-entry structure with sort order prefix: src/content/works/17.oresund/index.md + assets
 */
function migrateSection(sectionPath, sectionName) {
	const srcDir = path.join(LEGACY_ROOT, 'content', sectionPath);
	const baseSectionDir = path.join(PROJECT_ROOT, 'src', 'content', sectionName);

	if (!fs.existsSync(srcDir)) {
		console.warn(`⚠️  Section not found: ${srcDir}`);
		return;
	}

	console.log(`\n📁 Migrating ${sectionName}…`);

	// Read all directories, preserving sort order
	const dirs = fs
		.readdirSync(srcDir)
		.filter((f) => fs.statSync(path.join(srcDir, f)).isDirectory() && !f.startsWith('_'))
		.sort((a, b) => {
			const aSort = parseInt(a.split('.')[0], 10);
			const bSort = parseInt(b.split('.')[0], 10);
			// Numeric prefixes: sort numerically; otherwise: alphabetically
			if (!isNaN(aSort) && !isNaN(bSort)) return aSort - bSort;
			return a.localeCompare(b);
		});

	for (const dir of dirs) {
		const { slug, sort } = parseDir(dir);
		const projectPath = path.join(srcDir, dir);
		const ymlPath = path.join(projectPath, 'project.yml');

		if (!fs.existsSync(ymlPath)) continue;

		// Parse YAML
		const ymlContent = fs.readFileSync(ymlPath, 'utf8');
		const meta = jsYaml.load(ymlContent);

		// Convert to Markdown (sort order preserved in asset filenames)
		const markdown = yamlToMarkdown(meta);

		// Create folder per entry with numeric prefix: src/content/works/17.oresund/
		const entryDir = path.join(baseSectionDir, dir);
		fs.mkdirSync(entryDir, { recursive: true });

		// Write index.md with content and frontmatter
		const mdPath = path.join(entryDir, 'index.md');
		fs.writeFileSync(mdPath, markdown);

		console.log(`  ✓ ${dir}/index.md`);

		// Copy all assets into the same folder (preserves numeric prefixes in filenames)
		copyAssets(projectPath, entryDir);
	}
}

/**
 * Migrate index pages (about, contact, home)
 * Keeps numeric prefix from legacy: src/content/3.about/index.md (router handles stripping it)
 */
function migrateIndexPages() {
	const pages = {
		index: path.join(LEGACY_ROOT, 'content', 'index'),
		'3.about': path.join(LEGACY_ROOT, 'content', '3.about'),
		'4.contact': path.join(LEGACY_ROOT, 'content', '4.contact')
	};

	console.log('\n📄 Migrating index pages…');

	for (const [pageName, pagePath] of Object.entries(pages)) {
		const ymlPath = path.join(pagePath, 'page.yml');
		if (!fs.existsSync(ymlPath)) continue;

		const ymlContent = fs.readFileSync(ymlPath, 'utf8');
		const meta = jsYaml.load(ymlContent);

		const markdown = yamlToMarkdown(meta);
		const pageDir = path.join(PROJECT_ROOT, 'src', 'content', pageName);
		fs.mkdirSync(pageDir, { recursive: true });

		const mdPath = path.join(pageDir, 'index.md');
		fs.writeFileSync(mdPath, markdown);

		console.log(`  ✓ ${pageName}/index.md`);

		// Copy assets into the same folder
		copyAssets(pagePath, pageDir);
	}
}

/**
 * Copy public assets
 */
function copyPublicAssets() {
	console.log('\n🖼️  Copying public assets…');

	const srcDir = path.join(LEGACY_ROOT, 'public');
	const destDir = path.join(PROJECT_ROOT, 'static');

	if (fs.existsSync(srcDir)) {
		copyAssets(srcDir, destDir);
		console.log(`  ✓ Assets copied to /static`);
	}
}

/**
 * Main migration
 */
async function main() {
	console.log('🚀 Starting content migration from ole.kristensen.name...\n');

	try {
		migrateSection('1.works', 'works');
		migrateSection('2.consultancies', 'consultancies');
		migrateIndexPages();
		copyPublicAssets();

		console.log('\n✅ Migration complete!\n');
		console.log('Structure created:');
		console.log('  src/content/');
		console.log('  ├─ works/');
		console.log('  │  ├─ oresund/');
		console.log('  │  │  ├─ index.md');
		console.log('  │  │  ├─ image1.jpg');
		console.log('  │  │  └─ image2.jpg');
		console.log('  │  └─ digital-weather/ …');
		console.log('  ├─ consultancies/ …');
		console.log('  ├─ about/');
		console.log('  │  ├─ index.md');
		console.log('  │  └─ assets/');
		console.log('  ├─ contact/');
		console.log('  │  └─ index.md');
		console.log('  └─ index/');
		console.log('     └─ index.md');
		console.log('\nNext steps:');
		console.log('  1. Review migrated content in src/content/');
		console.log('  2. Create route files in src/routes/ that load the markdown');
		console.log('  3. Ensure git lfs is tracking image assets in src/content/');
		console.log(
			'  4. Update routes to match legacy URL structure (/works/<slug>, /consultancies/<slug>, etc)'
		);
		console.log('  5. Test that all URLs work as before');
	} catch (e) {
		console.error('❌ Migration failed:', e.message);
		process.exit(1);
	}
}

main();
