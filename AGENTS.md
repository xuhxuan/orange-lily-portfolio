# Orange Lily portfolio

Personal portfolio. The home page is a 3D orange lily; each petal opens a section.

## Stack
Next.js (App Router), TypeScript, Tailwind, React Three Fiber + drei, GSAP or Framer Motion. Hosted on Vercel.

## Design
- Accent: lily orange (#F26B1D, to confirm)
- Light: white bg, #1A1A1A text. Dark: #111111 bg, #F2F2F2 text
- Fonts: Fraunces (headings) + Inter (body) — placeholders, may change
- Motion slow and organic; respect prefers-reduced-motion

## Content
All text, links and projects live in `content.ts`. Never hard-code content in components.
If you need new text, add it to content.ts first, then import it. Never type visible words directly into a component.

## Folders
- components/lily/ — 3D lily only
- components/ui/ — menu, toggle, section layouts
- app/ — pages and routes
- public/models/ — .glb files
- public/images/ — photos and project images

## Rules
- Stay inside the folders your brief gives you
- Small commits with clear messages
- Run `npm run build` before saying you're done

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
