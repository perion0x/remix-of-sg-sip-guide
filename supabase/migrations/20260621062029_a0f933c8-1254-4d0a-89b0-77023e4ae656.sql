
CREATE TABLE IF NOT EXISTS public.bar_places_runs (
  bar_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  place_id text,
  error text,
  got_website boolean NOT NULL DEFAULT false,
  got_image boolean NOT NULL DEFAULT false,
  got_phone boolean NOT NULL DEFAULT false,
  got_hours boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bar_places_runs TO anon, authenticated;
GRANT ALL ON public.bar_places_runs TO service_role;

ALTER TABLE public.bar_places_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view places runs" ON public.bar_places_runs
  FOR SELECT TO public USING (true);
