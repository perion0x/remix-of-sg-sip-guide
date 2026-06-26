-- Fix 1: Remove permissive SELECT policy on bar_places_runs.
-- The frontend uses the bar_places_public view (security_invoker) which only exposes safe columns.
-- Revoke direct table access from anon/authenticated; service_role retains full access for edge functions.
DROP POLICY IF EXISTS "Public can read non-sensitive places columns" ON public.bar_places_runs;
REVOKE SELECT ON public.bar_places_runs FROM anon, authenticated;

-- Re-grant column-level SELECT on safe columns only, so the security_invoker view continues to work
-- for anon/authenticated callers while reviews_json, place_id, error, maps_url remain hidden.
GRANT SELECT (
  bar_id, status, got_website, got_image, got_phone, got_hours,
  updated_at, rating, rating_count, reviews_fetched_at, lat, lng
) ON public.bar_places_runs TO anon, authenticated;

-- Fix 2: Add explicit RLS policies on storage.objects for the private 'bar-media' bucket.
-- Reads are server-side only via signed URLs (service_role bypasses RLS), so block all
-- anon/authenticated direct access. This guards against accidental future bucket-visibility flips.
DROP POLICY IF EXISTS "bar-media deny anon select" ON storage.objects;
DROP POLICY IF EXISTS "bar-media deny authenticated select" ON storage.objects;
DROP POLICY IF EXISTS "bar-media deny anon writes" ON storage.objects;
DROP POLICY IF EXISTS "bar-media deny authenticated writes" ON storage.objects;

CREATE POLICY "bar-media deny anon select"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'bar-media' AND false);

CREATE POLICY "bar-media deny authenticated select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bar-media' AND false);

CREATE POLICY "bar-media deny anon writes"
  ON storage.objects FOR ALL TO anon
  USING (bucket_id = 'bar-media' AND false)
  WITH CHECK (bucket_id = 'bar-media' AND false);

CREATE POLICY "bar-media deny authenticated writes"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'bar-media' AND false)
  WITH CHECK (bucket_id = 'bar-media' AND false);
