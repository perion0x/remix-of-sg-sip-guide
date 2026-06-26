
-- 1. Remove public read on bar_places_runs (contains reviewer PII in reviews_json)
DROP POLICY IF EXISTS "Anyone can view places runs" ON public.bar_places_runs;
REVOKE SELECT ON public.bar_places_runs FROM anon, authenticated;

-- Create a safe public view excluding sensitive review data
CREATE OR REPLACE VIEW public.bar_places_public
WITH (security_invoker = true)
AS SELECT
  bar_id, status, got_website, got_image, got_phone, got_hours,
  updated_at, rating, rating_count, reviews_fetched_at, lat, lng
FROM public.bar_places_runs;

GRANT SELECT ON public.bar_places_public TO anon, authenticated;

-- Re-allow the view's underlying read for the view's invoker
-- security_invoker means the view runs as the calling role, so we need a
-- narrow SELECT policy that exposes only via the view's column projection.
-- Simplest: grant column-level SELECT on safe columns only.
GRANT SELECT (bar_id, status, got_website, got_image, got_phone, got_hours,
              updated_at, rating, rating_count, reviews_fetched_at, lat, lng)
  ON public.bar_places_runs TO anon, authenticated;

-- A SELECT policy is still required for RLS; add one limited to safe access.
CREATE POLICY "Public can read non-sensitive places columns"
ON public.bar_places_runs
FOR SELECT
TO anon, authenticated
USING (true);
-- Note: combined with the column-level GRANT above, queries selecting
-- reviews_json/place_id/maps_url/error will be rejected by the privilege check.

-- 2. Tighten storage policy on bar-media: signed URLs bypass RLS,
-- so no public SELECT policy is needed. Drop the blanket read.
DROP POLICY IF EXISTS "Public read bar-media" ON storage.objects;
