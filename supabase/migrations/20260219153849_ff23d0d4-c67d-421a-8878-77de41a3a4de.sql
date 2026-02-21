
-- Create bars table
CREATE TABLE public.bars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT,
  operating_hours TEXT,
  social_media_links TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bars ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view bars"
  ON public.bars
  FOR SELECT
  USING (true);
