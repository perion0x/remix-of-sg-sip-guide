
ALTER TABLE public.bar_places_runs
  ADD COLUMN IF NOT EXISTS rating numeric,
  ADD COLUMN IF NOT EXISTS rating_count integer,
  ADD COLUMN IF NOT EXISTS reviews_json jsonb,
  ADD COLUMN IF NOT EXISTS maps_url text,
  ADD COLUMN IF NOT EXISTS reviews_fetched_at timestamp with time zone;
