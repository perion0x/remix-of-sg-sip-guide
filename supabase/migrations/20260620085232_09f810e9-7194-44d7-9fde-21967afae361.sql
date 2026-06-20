REVOKE EXECUTE ON FUNCTION public.get_bar_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bar_stats() TO service_role;