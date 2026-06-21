import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, ExternalLink } from "lucide-react";

type Review = {
  author: string;
  avatar: string | null;
  rating: number | null;
  text: string;
  relativeTime: string;
  publishTime: string | null;
};

type ReviewsResponse = {
  reviews: Review[];
  rating: number | null;
  total: number;
  mapsUrl: string | null;
};

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= full ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function BarReviews({ slug, barName }: { slug: string; barName: string }) {
  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ["bar-reviews", slug],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("bar-reviews", {
        body: { slug },
      });
      if (error) throw error;
      return data as ReviewsResponse;
    },
    staleTime: 1000 * 60 * 60 * 12,
    retry: false,
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
        <div className="text-sm text-muted-foreground">Loading reviews from Google…</div>
      </div>
    );
  }

  if (error || !data || data.reviews.length === 0) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
          {data.rating !== null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-semibold text-foreground">{data.rating.toFixed(1)}</span>
              <Stars value={data.rating} />
              <span className="text-sm text-muted-foreground">
                ({data.total.toLocaleString()} Google reviews)
              </span>
            </div>
          )}
        </div>
        {data.mapsUrl && (
          <a
            href={data.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline inline-flex items-center gap-1"
          >
            See all on Google <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {data.reviews.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              {r.avatar ? (
                <img
                  src={r.avatar}
                  alt={r.author}
                  loading="lazy"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  {r.author.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{r.author}</div>
                <div className="flex items-center gap-2">
                  {r.rating !== null && <Stars value={r.rating} />}
                  <span className="text-xs text-muted-foreground">{r.relativeTime}</span>
                </div>
              </div>
            </div>
            {r.text && (
              <p className="text-sm text-foreground/85 leading-relaxed line-clamp-6 whitespace-pre-line">
                {r.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Reviews via Google for <span className="font-medium">{barName}</span>.
      </p>
    </div>
  );
}