import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BarRating = { rating: number | null; rating_count: number | null };

export function useBarRatings(barIds: string[] | undefined) {
  const key = (barIds ?? []).slice().sort().join(",");
  return useQuery({
    queryKey: ["bar-ratings", key],
    enabled: !!barIds && barIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("bar_places_runs")
        .select("bar_id, rating, rating_count")
        .in("bar_id", barIds!);
      const map = new Map<string, BarRating>();
      for (const r of data ?? []) {
        map.set(r.bar_id, { rating: r.rating, rating_count: r.rating_count });
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllRatings() {
  return useQuery({
    queryKey: ["all-bar-ratings"],
    queryFn: async () => {
      const map = new Map<string, BarRating>();
      const pageSize = 1000;
      let from = 0;
      // paginate through everything (~503 rows)
      while (true) {
        const { data, error } = await supabase
          .from("bar_places_runs")
          .select("bar_id, rating, rating_count")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        for (const r of data ?? []) {
          map.set(r.bar_id, { rating: r.rating, rating_count: r.rating_count });
        }
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return map;
    },
    staleTime: 10 * 60 * 1000,
  });
}