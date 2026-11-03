# Abhinav Gummadi Personal Website

Interactive multi-page portfolio built with Next.js App Router, TypeScript, Tailwind CSS, React Three Fiber, Drei, Three.js, and `@chenglou/pretext`.

## Requirements

- Node.js 22 (`.nvmrc`)
- npm

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run check
npm run build
```

`npm run check` runs ESLint, TypeScript, and public-asset validation. The production build also validates referenced assets before compiling.

## Content and routes

- `/` — hero and navigation planets
- `/who-i-am` — biography and draggable RB16 model
- `/projects` — interactive project isosphere
- `/experience` — interactive experience isosphere and company models
- `lib/content.ts` — copy, links, model references, and isosphere entries
- `lib/types.ts` — shared content types

## 3D assets

Company models are generated from code and then optimized with Meshopt:

```bash
npm run generate:company-logos
```

To optimize every GLB currently referenced by `lib/content.ts` without regenerating the company models:

```bash
npm run optimize:models
```

Keep only models referenced by `lib/content.ts` in `public/models`. When changing an immutable model in production, update its versioned filename and the corresponding content reference so returning visitors receive the new file.

## Project structure

```text
app/                 Routes, metadata, and global styles
components/layout/   Shared page shell
components/sections/ Page-level sections and content explorers
components/three/    React Three Fiber scenes and graphics preferences
components/ui/       Navigation and detail panels
lib/                 Content and shared types
public/              Images, fonts, and GLB assets
scripts/             Build locking, validation, generation, and optimization
```
