# Sonar

**AI-powered deep-ocean pollution & biodiversity monitoring — HackOcean 2026, PS 03.**

> Most entries show the ocean's data. This one **ranks the ocean's decisions.**

Sonar is an operations console for deep-ocean health. It ingests five
simulated sensor feeds (AUV/ROV video, sonar, satellite, IoT buoys, citizen reports),
runs a *simulated* AI layer over them (detection, classification, forecast), and presents
one ranked, auditable action queue. Every AI claim shows its **confidence**, its **source
frame** and its **model version** — trust the AI, and audit it.

📦 **Repo:** https://github.com/NidhiiMaru/Sonar
🧭 **Team:** Sonar Team
🚀 **Run it:** `pnpm install && pnpm dev` → http://localhost:3000

---

## Routes

| Route | What it is |
|---|---|
| `/` | Landing — the problem, the product, the proof. |
| `/dashboard` | Operating picture: KPIs, live threat map, AI triage queue, detection trends. |
| `/map` | Full threat map (React-Leaflet) with URL-synced filters, incident drawer, and an accessible table equivalent. |
| `/species` | Biodiversity explorer — searchable, filterable species grid + field-guide detail pages. |
| `/forecast` | 7/30-day predictive risk per zone, with the drivers behind every forecast. |
| `/alerts` | Triage queue → dispatch nearest vessel → export an evidence pack. |
| `/about` | Method, data sources, and an honest statement of what's real vs simulated. |

## The one idea that runs through it

Every incident is ordered by a single, visible formula:

```
rank = severity × confidence × ecological value
```

The same function (`src/lib/ranking.ts`) sorts the triage queue **and** is shown in the
"How this is ranked" popover — so what a judge reads always matches how the list is ordered.
Confidence is never 1.0; incidents below 70% are surfaced as **"needs human review."**

## Tech stack

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS v4 · Radix UI primitives ·
Framer Motion · Recharts (dynamic import) · React-Leaflet + CARTO dark_matter ·
Zustand · Zod · `next/font` · `next/image` · `next/og`.

No backend, no database — all data is hardcoded/simulated (permitted by the Round 2 rules)
and validated through typed **zod adapters** shaped to match the real open APIs they stand
in for, so the interface is wired for live data on day one.

## Run locally

```bash
pnpm install
pnpm dev            # http://localhost:3000
# regenerate assets/data (already committed):
node scripts/optimize-images.mjs
node scripts/generate-fixtures.mjs
pnpm build
```

## Accessibility & performance

- Dark, high-contrast palette (WCAG AA+); severity encoded by **shape + label**, never
  colour alone (survives greyscale).
- Visible focus rings, keyboard-operable dialogs (Radix focus-trap), skip-to-content link.
- The map ships an accessible `<table>` of the same filtered incidents beneath it.
- `prefers-reduced-motion` honoured on every animation.
- Recharts and Leaflet are `dynamic(..., { ssr: false })` with box-reserving skeletons, so
  they never land in the initial bundle. `next/image` with explicit dimensions everywhere.
- Per-route metadata, canonical URLs, per-route OG images, JSON-LD, `sitemap.xml`, `robots.txt`.

---

## AI Tools Disclosure

Per the HackOcean 2026 rules (AI tools permitted, usage must be disclosed): this project was
built with AI assistance — **Claude Code (Claude Opus 4.8)** for implementation, and Claude
for planning, copy and design-system specification. All code in this repository was generated
and committed during the official Round 2 window (24 July 2026); commit timestamps reflect the
real build. Architecture, scope, design decisions and every review were directed by the team.

## Pre-existing Code Disclosure

Per the rule permitting template codebases for non-functional UI skeletons:
- Project scaffolded with `create-next-app` (official Next.js template) at the start of the
  Round 2 window.
- Unstyled accessible primitives from **Radix UI** (`dialog`, `tabs`, `tooltip`, `select`,
  `popover`), restyled entirely to our own design system.

No other pre-existing or pre-written application code was used.

## Planning Artefacts

Problem research, the design system, wireframes, the data contract and the build plan were
prepared before the event as part of our Round 1 submission (which required a proposed
solution, wireframes, tech stack and architecture). These are **specifications and assets —
no application code.**

## Data

All data is hardcoded/simulated, as permitted ("Hardcoded/dummy data is fine — no backend
required"). The AI detection layer is **simulated from fixtures**, not a trained model — see
`/about`. Fixtures are shaped to match the real open APIs they stand in for (Argo, GBIF,
Copernicus Marine, Global Fishing Watch) via typed adapters in `src/adapters/`.

## Image Credits

Deep-sea and marine imagery courtesy of **NOAA** (public domain), **Pexels/Coverr** (free
licence) and one **CC0** image. Full manifest: [`CREDITS.md`](./CREDITS.md).

## Licence

MIT.
