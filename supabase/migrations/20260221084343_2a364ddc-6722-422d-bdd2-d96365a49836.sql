-- Add google_maps_link column to bars table
ALTER TABLE public.bars ADD COLUMN IF NOT EXISTS google_maps_link text;