
# Firecrawl bar enrichment

Scrape every bar's website for: hero image, image gallery (up to 10), menu page (markdown + PDF links), and structured menu items via Firecrawl JSON extract. Mirror images into Lovable Cloud storage. Triggered from an admin page, processed by an edge function, resumable.

## Cost / scale estimate (503 bars w/ website)

| Step | Firecrawl calls | Credits / bar | Notes |
|---|---|---|---|
| Homepage scrape (`markdown`, `links`, `screenshot`) | 1 | ~1 | yields og/twitter image, gallery candidates, menu link |
| Menu page scrape (`markdown` + `links`) | 1 | ~1 | resolves PDF URLs |
| Menu JSON extract (`{ type:'json', schema }`) | 1 | ~5 (LLM) | structured `{name, price, description, section}` |
| **Per-bar total** | **3** | **~7** | |
| **503 bars** | **~1,500** | **~3,500** | one-time backfill |

Plus image bandwidth: ~10 imgs × 503 ≈ 5,000 image downloads → ~1-2 GB in `bar-media` bucket. Free tier handles this.

Runtime: edge function processes ~5 bars in parallel with rate-limit backoff. Full run ≈ 30-45 min, resumable from `enrichment_status`.

## Schema changes (one migration)

1. New `bar_images` table:
   - `id uuid pk`, `bar_id uuid fk bars(id) on delete cascade`
   - `storage_path text`, `source_url text`, `kind text` (`hero|gallery|menu_pdf`)
   - `width int`, `height int`, `position int`, `created_at`
   - RLS: public SELECT, service_role ALL
2. New `bar_menus` table:
   - `id uuid pk`, `bar_id uuid fk`, `source_url text`, `markdown text`, `pdf_storage_path text`, `scraped_at`
   - public SELECT
3. New `bar_menu_items` table:
   - `id uuid pk`, `bar_id uuid fk`, `section text`, `name text`, `description text`, `price_text text`, `position int`
   - public SELECT
4. New `bar_enrichment_runs` table to track job state:
   - `id`, `bar_id`, `status` (`pending|done|failed|skipped`), `error text`, `updated_at`
   - service_role only
5. Storage bucket `bar-media` (public).

All tables get explicit `GRANT SELECT TO anon, authenticated; GRANT ALL TO service_role`.

## Edge function `enrich-bar`

`POST /functions/v1/enrich-bar { bar_id }` — admin-only (checks a new `is_admin` claim via `user_roles`; for now, gate behind a service-role secret header `X-Enrich-Token` since no auth exists yet).

Flow per bar:
1. Load bar, skip if `enrichment_runs.status='done'` and not `force`.
2. `firecrawl /v2/scrape` on `website` with `formats: ['markdown','links','screenshot', { type:'json', schema: menuLinkSchema }]`.
3. Pick hero = og:image → twitter:image → first content image.
4. Rank gallery candidates (filter logos/icons by size, dedupe domains).
5. If menu link found → scrape menu page; if PDF → fetch bytes; else JSON-extract menu items with `menuItemsSchema`.
6. Stream each image through `fetch` → `supabase.storage.from('bar-media').upload(...)`.
7. Upsert `bars.image_url` (hero), insert into `bar_images`, `bar_menus`, `bar_menu_items`.
8. Write `bar_enrichment_runs` row.

Errors logged, never throw — next bar continues.

## Edge function `enrich-all`

Cursor-based driver. `POST { batch_size=5, offset }`. Pulls pending bars, fans out to `enrich-bar` with `Promise.allSettled`, returns next offset + counts. Client loops until `done`.

## Admin page `/admin/enrich`

Hidden route (not in nav). Gated by typing the `X-Enrich-Token` into a field (kept in session only). UI shows:
- Total bars, pending, done, failed (from `bar_enrichment_runs`)
- "Start" / "Resume" / "Retry failed" buttons
- Live progress bar, last 10 errors

## Bar detail page changes

Render `bar_images` as a gallery (existing `image_url` stays as fallback). Add "Menu" tab: shows `bar_menu_items` grouped by section; falls back to `bar_menus.markdown` or a "View PDF menu" link.

## Files

**New**
- `supabase/migrations/<ts>_bar_enrichment.sql`
- `supabase/functions/enrich-bar/index.ts`
- `supabase/functions/enrich-all/index.ts`
- `src/pages/AdminEnrich.tsx` (+ route in `App.tsx`)
- `src/components/BarGallery.tsx`
- `src/components/BarMenu.tsx`

**Edited**
- `src/App.tsx` — add `/admin/enrich`
- `src/pages/BarDetail.tsx` — render gallery + menu

## Connector + secrets

- Connect Firecrawl via `standard_connectors--connect` (`firecrawl`) → injects `FIRECRAWL_API_KEY`.
- Add `ENRICH_ADMIN_TOKEN` secret for the admin gate.
- Create public storage bucket `bar-media`.

## Out of scope

- Per-user auth (kept token-gated for now)
- Auto re-scrape on schedule (can add `pg_cron` later)
- Image optimization/resizing (store originals)
