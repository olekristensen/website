#!/usr/bin/env node

/**
 * Image processing script: copies content images to static/ and generates thumbnails using sharp.
 * Run before dev/build: `node scripts/process-images.js`
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const OUTPUT_DIR = path.join(process.cwd(), 'static', 'content');
const THUMB_WIDTHS = [480, 960, 1920];
const THUMB_QUALITY = 75;
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;
const STATIC_FILE_RE = /\.(pdf|svg|mp4|mp3|zip|doc|docx)$/i;
const THUMB_RE = /^(thumb|00\.thumb)\.(jpg|jpeg|png|gif|webp)$/i;

function extractSlug(dirname) {
	const parts = dirname.split('.');
	const num = parseInt(parts[0], 10);
	return isNaN(num) ? dirname : parts.slice(1).join('.');
}

async function processSection(section) {
	const sectionDir = path.join(CONTENT_DIR, section);
	if (!fs.existsSync(sectionDir)) return;

	const entries = fs.readdirSync(sectionDir).filter((name) => {
		return fs.statSync(path.join(sectionDir, name)).isDirectory();
	});

	for (const entry of entries) {
		const slug = extractSlug(entry);
		const srcDir = path.join(sectionDir, entry);
		const destDir = path.join(OUTPUT_DIR, section, slug);

		const files = fs.readdirSync(srcDir).filter((f) => IMAGE_RE.test(f));
		if (files.length === 0) continue;

		fs.mkdirSync(destDir, { recursive: true });

		for (const file of files) {
			const srcPath = path.join(srcDir, file);
			const destPath = path.join(destDir, file);

			// Copy original if not already up to date
			const srcStat = fs.statSync(srcPath);
			if (!fs.existsSync(destPath) || fs.statSync(destPath).mtimeMs < srcStat.mtimeMs) {
				fs.copyFileSync(srcPath, destPath);
			}

			// Generate scaled thumbnails for thumb images
			if (THUMB_RE.test(file)) {
				for (const width of THUMB_WIDTHS) {
					const thumbDest = path.join(destDir, `thumb-${width}.jpg`);
					if (!fs.existsSync(thumbDest) || fs.statSync(thumbDest).mtimeMs < srcStat.mtimeMs) {
						try {
							await sharp(srcPath)
								.resize(width, null, { withoutEnlargement: true })
								.jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
								.toFile(thumbDest);
						} catch (err) {
							console.warn(
								`  ⚠ Failed to generate thumb-${width} for ${section}/${slug}/${file}:`,
								err.message
							);
						}
					}
				}
			}
		}
	}
}

async function main() {
	console.log('Processing content images...');
	const start = Date.now();

	// Clean stale output (but re-create dir)
	// Don't remove — incremental updates are faster

	await processSection('works');
	await processSection('consultancies');

	// Copy about images too
	const aboutDir = path.join(CONTENT_DIR, 'about');
	if (fs.existsSync(aboutDir)) {
		const aboutDest = path.join(OUTPUT_DIR, 'about');
		fs.mkdirSync(aboutDest, { recursive: true });
		for (const f of fs
			.readdirSync(aboutDir)
			.filter((f) => IMAGE_RE.test(f) || STATIC_FILE_RE.test(f))) {
			const src = path.join(aboutDir, f);
			const dest = path.join(aboutDest, f);
			const srcStat = fs.statSync(src);
			if (!fs.existsSync(dest) || fs.statSync(dest).mtimeMs < srcStat.mtimeMs) {
				fs.copyFileSync(src, dest);
			}
		}
	}

	const elapsed = Date.now() - start;
	console.log(`✓ Images processed in ${elapsed}ms`);
}

main().catch((err) => {
	console.error('Image processing failed:', err);
	process.exit(1);
});
