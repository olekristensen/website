# Content folder structure (Stacey-derived)

This document describes how the site's `src/content` folder is structured. The layout and naming conventions follow the legacy CMS "Stacey" pattern used by this project.


Overview
- The content root is `src/content/`.
- Top-level entries are either single-page sections (e.g. `about/`, `contact/`) or collections (e.g. `works/`, `consultancies/`).



Directory and file conventions
- Ordering and slugs: collection item directories often use a numeric prefix (e.g. `1.body-navigation`) for manual ordering, but top-level folders are now named by section (e.g. `about`, `contact`).
- Per-section files: a section directory contains an `index.md` (Markdown + YAML frontmatter). Example: [src/content/about/index.md](src/content/about/index.md).
- Collection entries: collections like `works/` and `consultancies/` contain many item folders. Each item folder usually follows the same pattern: a numbered folder name and inside an `index.md` with frontmatter describing the item. Example: [src/content/works/1.body-navigation/index.md](src/content/works/1.body-navigation/index.md).


Files and fields (observed patterns)
- `index.md`: Markdown document with YAML frontmatter. Frontmatter commonly contains `title`, `date`, `lead`, `tags`, and other item-specific fields such as `materials`, `partners`, `client`, `photocredits`, `appearances`.
- Static assets (images) are referenced from within frontmatter values and are typically stored in `static/images/` or within `src/content` alongside items (check individual folders).



How the site uses this structure
- The site code imports and processes `src/content` to build routes and pages. The project contains parsing utilities under `lib/` (for example, `lib/content.ts`) which read `index.md` files and expose site data to Svelte routes.



Guidance for contributors
- To add a new visible item in a collection, create a new folder under the collection (e.g. `works/`, `consultancies/`) with a numeric prefix for ordering (optional) and add an `index.md` with appropriate frontmatter.
- For single-page sections, keep `index.md` in the section folder (e.g. `about/`, `contact/`).
- Keep image references consistent and place large assets in `static/images/` when they should be served statically.


Notes and caveats
- All content is now stored in Markdown files with YAML frontmatter. Numeric prefixes are a human convention for ordering; check any site code that may rely on them if you plan automated changes.

If you want, I can:
- Add examples of common frontmatter keys and a template `index.md` for new items.
- Run a scan of `src/content` and produce a manifest (CSV/JSON) of all items.



Document created from existing repository files (examples referenced above).
Updated February 2026 to reflect renamed top-level folders and removal of `page.yml` files.
