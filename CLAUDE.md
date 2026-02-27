# Den Frie Vilje — Project Guidelines

See [AGENTS.md](AGENTS.md) for full project conventions.

## Quick Reference

- All commands: `pkgx pnpm {dev,build,check,lint,format,test}`
- Svelte 5 runes only (`$props()`, `$state()`) — no legacy syntax
- Content: `src/content/{section}/{N.slug}/index.md` with YAML frontmatter
- Tailwind v4 inline utilities — design tokens in `src/app.css`
- Server-only data loading in `+page.server.ts` via `src/lib/content.ts`
- Record design decisions in `./docs`

## Svelte MCP Tools

1. **list-sections** — discover available docs sections (use FIRST)
2. **get-documentation** — fetch full docs for relevant sections
3. **svelte-autofixer** — analyze Svelte code for issues (use before finalizing any Svelte code)
4. **playground-link** — generate playground link (only after user confirms, never when writing to project files)