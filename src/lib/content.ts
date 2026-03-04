import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import yaml from 'js-yaml';

export interface ContentMeta {
	title?: string;
	date?: string;
	lead?: string;
	tags?: string[];
	materials?: string;
	partners?: string;
	client?: string;
	github?: Record<string, string>;
	photocredits?: string;
	technologies?: string[];
	appearances?: Array<{ date: string; occasion: string; place: string; url: string }>;
	videos?: Array<{ id: string; title: string }>;
	[key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ContentImages {
	/** Gallery images (excludes thumbs) */
	gallery: string[];
	/** Scaled thumbnail URL (thumb-480.jpg), or null */
	thumb: string | null;
}

export interface Content {
	meta: ContentMeta;
	html: string;
	slug: string;
	images: ContentImages;
}

/**
 * Parse markdown with YAML frontmatter
 */
function parseFrontmatter(content: string): { meta: ContentMeta; body: string } {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		return { meta: {}, body: content };
	}

	const [, frontmatter, body] = match;
	const meta = (yaml.load(frontmatter) as ContentMeta) || {};
	return { meta, body };
}

/**
 * Extract slug from folder name (removes numeric prefix)
 * e.g., "17.oresund" → "oresund"
 */
function extractSlug(dirname: string): string {
	const parts = dirname.split('.');
	const num = parseInt(parts[0], 10);
	return isNaN(num) ? dirname : parts.slice(1).join('.');
}

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;
const THUMB_RE = /^(thumb|00\.thumb)\.(jpg|jpeg|png|gif|webp)$/i;

/**
 * Resolve image URLs for a content item folder.
 */
function resolveImages(section: string, slug: string, folder: string): ContentImages {
	const itemDir = path.join(process.cwd(), 'src', 'content', section, folder);
	const publicBase = `/content/${section}/${slug}`;

	const allFiles = fs
		.readdirSync(itemDir)
		.filter((f) => IMAGE_RE.test(f))
		.sort();

	// Gallery = everything that isn't a thumb
	const gallery = allFiles.filter((f) => !THUMB_RE.test(f)).map((f) => `${publicBase}/${f}`);

	// Thumb: check for generated thumb-480.jpg in static/content
	const thumbPath = path.join(process.cwd(), 'static', 'content', section, slug, 'thumb-480.jpg');
	const thumb = fs.existsSync(thumbPath) ? `${publicBase}/thumb-480.jpg` : null;

	return { gallery, thumb };
}

/**
 * Get all items in a section (works, consultancies, etc.)
 */
export async function getContentList(section: string): Promise<Content[]> {
	const contentDir = path.join(process.cwd(), 'src', 'content', section);

	if (!fs.existsSync(contentDir)) {
		return [];
	}

	const items = fs
		.readdirSync(contentDir)
		.filter((name) => {
			const stat = fs.statSync(path.join(contentDir, name));
			return stat.isDirectory();
		})
		.sort(); // Numeric prefixes sort naturally

	const results: Content[] = [];
	for (const item of items) {
		const mdPath = path.join(contentDir, item, 'index.md');
		if (fs.existsSync(mdPath)) {
			const slug = extractSlug(item);
			const content = fs.readFileSync(mdPath, 'utf8');
			const { meta, body } = parseFrontmatter(content);
			const html = await marked(body);
			const images = resolveImages(section, slug, item);

			results.push({
				meta,
				html,
				slug,
				images
			});
		}
	}

	return results;
}

/**
 * Get a single content item by slug
 */
export async function getContent(section: string, slug: string): Promise<Content | null> {
	const contentDir = path.join(process.cwd(), 'src', 'content', section);

	if (!fs.existsSync(contentDir)) {
		return null;
	}

	// If slug is empty or matches section (for single pages like "about"), load directly
	if (!slug || slug === section || slug === extractSlug(section)) {
		const mdPath = path.join(contentDir, 'index.md');

		if (!fs.existsSync(mdPath)) {
			return null;
		}

		const content = fs.readFileSync(mdPath, 'utf8');
		const { meta, body } = parseFrontmatter(content);
		const html = await marked(body);

		return {
			meta,
			html,
			slug: extractSlug(section),
			images: { gallery: [], thumb: null }
		};
	}

	// Otherwise find folder that matches slug (after removing numeric prefix)
	const dirs = fs.readdirSync(contentDir).filter((name) => {
		const stat = fs.statSync(path.join(contentDir, name));
		return stat.isDirectory() && extractSlug(name) === slug;
	});

	if (dirs.length === 0) {
		return null;
	}

	const folder = dirs[0];
	const mdPath = path.join(contentDir, folder, 'index.md');

	if (!fs.existsSync(mdPath)) {
		return null;
	}

	const content = fs.readFileSync(mdPath, 'utf8');
	const { meta, body } = parseFrontmatter(content);
	const html = await marked(body);
	const images = resolveImages(section, slug, folder);

	return {
		meta,
		html,
		slug,
		images
	};
}
