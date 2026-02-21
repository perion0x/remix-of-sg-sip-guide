
CREATE OR REPLACE FUNCTION get_bar_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM public.bars),
    'categories', (SELECT COUNT(DISTINCT category) FROM public.bars WHERE category IS NOT NULL),
    'rooftop', (SELECT COUNT(*) FROM public.bars WHERE category = 'Rooftop Bar')
  );
$$;
