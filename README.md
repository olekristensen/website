# Den Frie Vilje Website

A Svelte 5 static site built with SvelteKit, TypeScript, and the static adapter.

## Getting Started

### Prerequisites
- [pkgx](https://pkgx.sh/) (manages Node.js and pnpm)

### Installation

```bash
pkgx pnpm install
```

### Development

Start the development server:

```bash
pkgx pnpm dev
```

The app will be available at `http://localhost:5173`

### Building

Build the static site for production:

```bash
pkgx pnpm build
```

The static files will be generated in the `build/` directory.

### Preview

Preview the production build locally:

```bash
pkgx pnpm preview
```

### Type Checking

Run TypeScript and Svelte type checking:

```bash
pkgx pnpm check
```

Watch mode:

```bash
pkgx pnpm check:watch
```

### Linting & Formatting

Check code with ESLint and Prettier:

```bash
pkgx pnpm lint
```

Auto-format code:

```bash
pkgx pnpm format
```

## Project Structure

```
src/
├── app.html                  # App HTML shell
└── routes/
    ├── +layout.svelte        # Base layout
    └── +page.svelte          # Home page
```

## Technology Stack

- **Svelte 5** - Latest reactive framework
- **SvelteKit** - Full-featured framework with routing
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Static Adapter** - Pre-renders to fully static HTML/CSS/JS

## Static Adapter

This project uses `@sveltejs/adapter-static` to generate a fully static site with no server-side requirements. Perfect for hosting on any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Compile to static site
- `pnpm preview` - Preview production build
- `pnpm check` - Run type checking
- `pnpm check:watch` - Watch mode for type checking
- `pnpm lint` - Lint code
- `pnpm format` - Format code
