
-- 1) bar_images
CREATE TABLE public.bar_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid NOT NULL REFERENCES public.bars(id) ON DELETE CASCADE,
  storage_path text,
  source_url text,
  kind text NOT NULL DEFAULT 'gallery',
  width int,
  height int,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bar_images_bar_id_idx ON public.bar_images(bar_id);
GRANT SELECT ON public.bar_images TO anon, authenticated;
GRANT ALL ON public.bar_images TO service_role;
ALTER TABLE public.bar_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bar images" ON public.bar_images FOR SELECT USING (true);

-- 2) bar_menus
CREATE TABLE public.bar_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid NOT NULL REFERENCES public.bars(id) ON DELETE CASCADE,
  source_url text,
  markdown text,
  pdf_storage_path text,
  scraped_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bar_menus_bar_id_idx ON public.bar_menus(bar_id);
GRANT SELECT ON public.bar_menus TO anon, authenticated;
GRANT ALL ON public.bar_menus TO service_role;
ALTER TABLE public.bar_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bar menus" ON public.bar_menus FOR SELECT USING (true);

-- 3) bar_menu_items
CREATE TABLE public.bar_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid NOT NULL REFERENCES public.bars(id) ON DELETE CASCADE,
  section text,
  name text NOT NULL,
  description text,
  price_text text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bar_menu_items_bar_id_idx ON public.bar_menu_items(bar_id);
GRANT SELECT ON public.bar_menu_items TO anon, authenticated;
GRANT ALL ON public.bar_menu_items TO service_role;
ALTER TABLE public.bar_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bar menu items" ON public.bar_menu_items FOR SELECT USING (true);

-- 4) bar_enrichment_runs (job state)
CREATE TABLE public.bar_enrichment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id uuid NOT NULL UNIQUE REFERENCES public.bars(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  error text,
  images_count int NOT NULL DEFAULT 0,
  menu_items_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bar_enrichment_runs_status_idx ON public.bar_enrichment_runs(status);
GRANT ALL ON public.bar_enrichment_runs TO service_role;
GRANT SELECT ON public.bar_enrichment_runs TO anon, authenticated;
ALTER TABLE public.bar_enrichment_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view enrichment status" ON public.bar_enrichment_runs FOR SELECT USING (true);

-- 5) Public read on bar-media bucket
CREATE POLICY "Public read bar-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'bar-media');
