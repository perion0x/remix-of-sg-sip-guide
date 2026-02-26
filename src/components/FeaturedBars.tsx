import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NOTABLE_NAMES = [
  "Jigger & Pony",
  "Nutmeg & Clove",
  "Native",
  "Employees Only",
  "28 HongKong Street",
  "Smoke & Mirrors",
  "The Cocktail Bar",
  "Manhattan",
  "Origin Bar",
  "Analogue Initiative",
];

const FeaturedBars = () => {
  const { data: bars, isLoading } = useQuery({
    queryKey: ["featured-bars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("id, name, address, category, slug, description")
        .in("name", NOTABLE_NAMES);
      if (error) throw error;
      // Sort to match NOTABLE_NAMES order
      return data?.sort(
        (a, b) => NOTABLE_NAMES.indexOf(a.name) - NOTABLE_NAMES.indexOf(b.name)
      );
    },
  });

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Selection</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Notable Bars</h2>
          </div>
          <Link
            to="/bars"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-5 border-b border-border/50 animate-pulse">
                  <div className="w-8 h-5 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))
            : bars?.map((bar, index) => (
                <Link
                  to={`/bars/${bar.slug}`}
                  key={bar.id}
                  className="group flex items-start gap-6 py-6 border-b border-border/50 hover:border-border transition-colors"
                >
                  <span className="text-2xl font-bold text-muted-foreground/30 w-8 shrink-0 text-right leading-tight mt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {bar.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {bar.category && (
                        <span className="uppercase tracking-wider text-xs font-medium text-accent/80">
                          {bar.category}
                        </span>
                      )}
                      {bar.category && bar.address && (
                        <span className="text-muted-foreground/40">·</span>
                      )}
                      {bar.address && (
                        <span className="truncate">{bar.address}</span>
                      )}
                    </div>
                    {bar.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {bar.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBars;
