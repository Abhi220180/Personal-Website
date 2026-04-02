# Abhinav Gummadi Personal Website

Single-page editorial portfolio built with Next.js, TypeScript, Tailwind CSS, Framer Motion, react-three-fiber/drei, and `@chenglou/pretext`.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- three + @react-three/fiber + @react-three/drei
- @chenglou/pretext

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

4. Optional production build check:

```bash
npm run build
```

## Content You Can Edit Quickly

- Hero, bio text, and what-I-like text:
  - `lib/content.ts`
- Sphere node labels/categories/links:
  - `lib/content.ts` (`sphereNodes`)
- Contact email and location:
  - `lib/content.ts` (`contactInfo`)

## Contact Form Behavior

- Default behavior: `mailto:` fallback (opens visitor email client with prefilled fields).
- Optional Formspree:
  - add `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in `.env.local`
  - form submits via `fetch` to that endpoint

Example:

```bash
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-id
```

## How Pretext Is Used

`@chenglou/pretext` is used to compute line breaks and manual line placement without relying on normal DOM flow measurements:

- Hero section:
  - custom line routing around an editorial aside block
- Bio section:
  - text lines are laid out around a circular exclusion zone where the embedded 3D sphere sits

This creates a dynamic, spatial text-flow composition inspired by Pretext dynamic-layout patterns, while keeping the page readable and lightweight.
