ALTER TABLE public.bar_places_runs
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

CREATE INDEX IF NOT EXISTS bar_places_runs_latlng_idx
  ON public.bar_places_runs (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;