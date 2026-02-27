# Agent Knowledge Base

This folder contains notes and documentation for the AI agent to remember key preferences and project-specific details.

## About

This site belongs to **Ole Kristensen**, a software artist who also runs a small design technology consultancy called **Den Frie Vilje**.

- **Artist name**: Ole Kristensen
- **Artist website**: ole.kristensen.name (this site)
- **Consultancy name**: Den Frie Vilje
- **Consultancy website**: denfrievilje.dk (this site)
- **Consultancy logos**: SVG assets in `images/logos/`

The site serves as both a portfolio for Ole's artwork and a showcase for the consultancy's projects.

## Preferences & Requirements

- Use `pnpm` as the package manager, invoked through `pkgx`.
  - Always prefix pnpm commands with `pkgx` (e.g. `pkgx pnpm dev`, `pkgx pnpm build`).
  - `pkgx` is used to manage pnpm itself.
- The project is a Svelte 5 application using SvelteKit and the static adapter.
- TypeScript is enabled throughout the project, with all configuration and component files written in `.ts` or `.svelte` with `lang="ts"`.
- Configuration files (`svelte.config.ts`, `vite.config.ts`) use TypeScript for type safety.
- ESLint and Prettier are used for linting and formatting; ESLint config remains in CommonJS format.

## Workspace Structure

```
src/
  app.html        # HTML entry template
  routes/
    +layout.svelte
    +page.svelte
svelte.config.ts
vite.config.ts
```

## Key Commands

- `pkgx pnpm dev` - start development server
- `pkgx pnpm build` - build static output
- `pkgx pnpm preview` - preview build
- `pkgx pnpm check` / `check:watch` - type checking
- `pkgx pnpm lint` / `format` - lint/format code

## Additional Notes

- Remember to update README when changing build or tool instructions.
- Preferences saved in `/memories/repo/project-preferences.md`.

## Design System: "Gallery Neon"

### Vision & Tone

The site is served from both **denfrievilje.dk** and **ole.kristensen.name**. It conveys quality, attention to detail, playfulness, elegance, and frontend skilfulness — showing off, but with style. Modern European/Scandinavian aesthetic, mobile-first but stunning on large screens.

### Two-Flavour Identity

The same underlying design language splits into two distinct palettes:

- **Works (Artist)** — "White Room Gallery": clean near-white surfaces, generous whitespace, museum-like presentation. **Neon green** accent color for highlights, links, and interactive elements.
- **Consultancies (Bureau)** — "Warm Bureau": medium-dark warm grays as background, professional and structured. **Neon yellow** accent color for highlights, links, and interactive elements.

Both flavours share typography, layout grid, animation system, and interaction patterns — only palette differs.

### Palette

- All colours defined in OKLCH color space — leveraging the extended P3 gamut to make neon accent colors truly pop on wide-gamut displays
- **Works palette**: near-white surface, near-black ink, neon green accent (high chroma OKLCH, beyond sRGB)
- **Consultancies palette**: medium-dark warm gray surface, light ink, neon yellow accent (high chroma OKLCH, beyond sRGB)
- Each palette defines: `--color-accent`, `--color-accent-hover`, `--color-accent-subtle`
- `.page-dark` class on wrapper div toggles to bureau palette, with CSS `:has()` selector to auto-adapt footer

### Typography

- Elegant yet super-contemporary — variable fonts with subtly animated weight
- Display font: Outfit Variable (wght 100–900) — clean, geometric, wide weight range for smooth scroll animations
- Body font: Source Serif 4 Variable (wght 200–900, opsz) — elegant modern serif, deliberate contrast with geometric Outfit headings
- Loaded via Google Fonts
- Massive display headings using `clamp()` for responsive fluid sizing
- Variable font weight animation on scroll (`weight-scroll` class) — subtle, refined showing-off
- Typography is a key part of the site's identity and must feel considered and intentional

### Scroll-Driven Animations

- CSS-only using `animation-timeline: view()` and `animation-timeline: scroll()`, wrapped in `@supports` for progressive enhancement
- Classes: `animate-fade-up`, `animate-fade-in`, `animate-scale-reveal`, `weight-scroll`
- Smooth, considered, never gratuitous — they serve the content and add polish

### Gallery & Lightbox

- Smooth lightbox image galleries for artwork — elegant transitions, keyboard/swipe navigation
- Works use staggered grid (first item spans full width), generous whitespace, museum-like
- Bureau layout uses structured horizontal lists/grids, professional typography, bordered cards

### Interactions & Components

- `hover-line` underline animation (uses `currentColor`)
- `card-hover` left-border reveal
- Grayscale-to-color images on hover (consultancies)
- `.section-label` utility with accent dash marker
- All components use Tailwind utility classes inline, no scoped `<style>` blocks

### Technical

- **CSS**: Tailwind CSS v4 with `@tailwindcss/vite` plugin, configured via `@theme` in `src/app.css`
- **Layout utilities**: `content-width` (72rem max) and `narrow-width` (44rem max) with fluid inline padding
- **Prose**: Global prose styles in `app.css` (no scoped `<style>` blocks), with `.page-dark .prose` dark variants
- **Mobile**: Fullscreen overlay menu with animated hamburger, responsive grid breakpoints, mobile-first approach throughout
