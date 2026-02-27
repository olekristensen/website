# Agent Knowledge Base

This folder contains notes and documentation for the AI agent to remember key preferences and project-specific details.

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

- **Aesthetic**: White room gallery meets digital edge — editorial restraint with surgical neon green accents
- **Fonts**: Instrument Serif (display) + Instrument Sans (body), loaded via Google Fonts
- **Palette**: Warm monochrome using OKLCH color space — near-black ink on near-white surface, with neon green accent (`oklch(0.85 0.30 142)`) used sparingly
- **Accent colors**: `--color-neon` (bright), `--color-neon-dim` (darker), `--color-neon-subtle` (border/bg), `--color-neon-glow` (transparent)
- **CSS**: Tailwind CSS v4 with `@tailwindcss/vite` plugin, configured via `@theme` in `src/app.css`
- **Layout utilities**: `content-width` (68rem max) and `narrow-width` (42rem max) with fluid inline padding
- **Typography**: Editorial type scale using `clamp()` for responsive sizing; display headings use serif
- **Interactions**: `hover-line` neon underline animation, `card-hover` left-border reveal, `mix-blend-difference` nav overlay
- **Section labels**: `.section-label` utility with neon green dash marker
- **Neon touchpoints**: `::selection`, nav hover, section labels, hover-line, tags, footer social links, hero accent lines
- **Mobile**: Fullscreen overlay menu with animated hamburger, responsive grid breakpoints
- **Components**: All use Tailwind utility classes (no scoped `<style>` blocks except for prose `:global()` styles)
