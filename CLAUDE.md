# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:3001 (auto-increments port if busy)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test runner is configured — there are no test files to run.

## Architecture

**Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Supabase

**Routing:** None (single-page, scroll-based navigation via `document.getElementById().scrollIntoView()`). All "navigation" is smooth-scroll to section IDs.

**Auth model:** Hardcoded role-switch in `App.tsx` (`useState<'admin' | 'staff' | null>`). No JWT or session persistence — logging out just resets state. Supabase credentials come from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars; the app falls back to placeholder strings so it won't crash without `.env`.

**Role rendering:** `App.tsx` renders one of three trees based on role:
- `null` → public storefront (Header + HeroBanner + QuickAccessBar + two-column layout + Footer)
- `'admin'` → `AdminPanel` (full replacement, no shared chrome)
- `'staff'` → `StaffPanel` (full replacement, no shared chrome)

**Two-column layout (public):**
```
Header
HeroBanner (slideshow)
QuickAccessBar (4 icon shortcuts)
┌─────────────────────────┬──────────────┐
│ SimCatalog              │              │
│ SimPhongThuy            │   Sidebar    │
│ InternetPackages        │  (sticky)    │
│ ViettelPackages         │              │
└─────────────────────────┴──────────────┘
Footer
```
Sidebar is `lg:sticky lg:top-20`. On mobile the sidebar stacks below main content.

**SIM data flow:**
1. User imports an `.xlsx`/`.csv` file via the file input in `SimCatalog`
2. `xlsx` library parses it → rows mapped through `normalizePhone()` + `analyzeSim()` + `getMenhAndColor()` from `src/utils/simLogic.ts`
3. Resulting `SimEntry[]` is held in `SimCatalog` local state — **not lifted to App**
4. `SimPhongThuy` receives the same `sims` prop from `App.tsx` — but currently `App.tsx` holds an empty `useState<SimEntry[]>([])` that is never populated from `SimCatalog`. To wire them together, lift sim state up to `App` and pass a setter down to `SimCatalog`

**SimType classification:** `src/utils/simLogic.ts` exports `analyzeSim(phone: string)` which returns `{ types: SimType[], detail: string }`. Classification logic is purely algorithmic (no API). Over 50 `SimType` enum values covering ngũ quý, tứ quý, phong thủy, gánh, tiến/lùi patterns, etc.

**Styling:** Tailwind CSS v4 (imported via `@tailwindcss/vite` plugin — no `tailwind.config.js`). Primary brand color is `#ee0033`. Uses inline `style={}` for dynamic mệnh colors. Animation library `framer-motion` is installed but not yet used — use it for scroll animations.

**Supabase usage:** `src/lib/supabase.ts` exports a single `supabase` client. Used in `AdminPanel` and `StaffPanel` for orders/promotions CRUD. Public storefront does not query Supabase.

**Key constraints:**
- All sections must be mobile-friendly and have scroll-triggered animations (use `framer-motion` — already installed)
- `sim-number` CSS class applies `font-family: 'Courier New'` for phone number display
- Brand color `#ee0033` / hover `#cc0029` used throughout — do not introduce other primary colors
