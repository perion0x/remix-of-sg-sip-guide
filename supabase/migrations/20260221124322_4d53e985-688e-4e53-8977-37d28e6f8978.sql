
-- Add slug column
ALTER TABLE public.bars ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_bars_slug ON public.bars (slug);

-- Populate slugs from existing names
UPDATE public.bars
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
);

-- Make slug NOT NULL after populating
ALTER TABLE public.bars ALTER COLUMN slug SET NOT NULL;
