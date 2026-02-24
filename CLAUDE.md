# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test suite is configured.

## Architecture

This is a **React SPA** (Vite + React Router DOM) — not Remix, despite the repo name. It is a Singapore bar directory with search, filtering, and cocktail recommendations.

### Routing

Client-side routing via React Router DOM in `src/App.tsx`:
- `/` — Home (hero, featured bars, questionnaire trigger)
- `/bars` — Full listing with search, category filter, pagination
- `/bars/:slug` — Bar detail page
- `*` — 404

### Data Layer

**Supabase** is the only backend. Client is initialized in `src/integrations/supabase/client.ts` using:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

All queries go through **TanStack React Query** (`useQuery`). Data is never fetched directly in components — always through query hooks defined inline in page files.

Key tables:
- `bars` — id, name, address, category, operating_hours, social_media_links, phone, email, slug, created_at. Public read-only via RLS.
- `cocktail_questionnaire_responses` — stores multi-step questionnaire submissions. Public insert.

Query patterns used: `.ilike()` for search, `.eq()` for category filter, `.range()` for pagination.

### Component Structure

- `src/pages/` — Route-level page components (Index, Bars, BarDetail, NotFound)
- `src/components/ui/` — shadcn/ui primitives (48 components, do not edit directly)
- `src/components/` — App-specific components (Header, Footer, FeaturedBars, SearchFilters, CocktailQuestionnaire, BarSchema)
- `src/hooks/` — `use-toast.ts`, `use-mobile.tsx`
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Styling

Tailwind CSS with custom CSS variables defined in `src/index.css`. Use `cn()` from `src/lib/utils.ts` for conditional class composition. Dark mode is class-based (`next-themes`). Custom tokens include gold accent colors, card shadows, and sidebar-specific variables.

### SEO

Every page uses `react-helmet-async` for meta tags. Bar detail pages include Schema.org JSON-LD structured data via `src/components/BarSchema.tsx` (supports BarOrPub, NightClub, Brewery types).

### Path Alias

`@/*` maps to `src/*` — use this for all imports.
