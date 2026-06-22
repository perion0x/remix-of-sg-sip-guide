import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBarRatings } from "@/hooks/useBarRatings";
import { RatingBadge } from "@/components/RatingBadge";

const NOTABLE_NAMES = [
  "Jigger & Pony",
  "Nutmeg & Clove",
  "Native",
  "Employees Only",
  "28 HongKong Street",
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
      return data?.sort(
        (a, b) => NOTABLE_NAMES.indexOf(a.name) - NOTABLE_NAMES.indexOf(b.name)
      );
    },
  });
  const ratings = useBarRatings(bars?.map((b) => b.id));

  return (
    <section className="py-28 bg-background relative">
      {/* Subtle accent glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(42 78% 60% / 0.03) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-3xl relative">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent/60 mb-3 font-medium">
              Selection
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Notable Bars
            </h2>
          </div>
          <Link
            to="/bars"
            className="text-sm font-medium text-muted-foreground hover:text-accent flex items-center gap-2 transition-colors duration-300 group"
          >
            View all{" "}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 py-6 border-b border-border/30 animate-pulse"
                >
                  <div className="w-8 h-5 bg-secondary rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-1/4" />
                  </div>
                </div>
              ))
            : bars?.map((bar, index) => (
                <motion.div
                  key={bar.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={`/bars/${bar.slug}`}
                    className="group flex items-start gap-6 py-7 border-b border-border/30 hover:border-accent/20 transition-all duration-500"
                  >
                    <span className="text-2xl font-display font-bold text-muted-foreground/20 w-8 shrink-0 text-right leading-tight mt-0.5 group-hover:text-accent/40 transition-colors duration-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                          {bar.name}
                        </h3>
                        <RatingBadge
                          rating={ratings.data?.get(bar.id)?.rating ?? null}
                          count={ratings.data?.get(bar.id)?.rating_count}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {bar.category && (
                          <span className="uppercase tracking-wider text-xs font-medium text-accent/50">
                            {bar.category}
                          </span>
                        )}
                        {bar.category && bar.address && (
                          <span className="text-border">·</span>
                        )}
                        {bar.address && (
                          <span className="truncate">{bar.address}</span>
                        )}
                      </div>
                      {bar.description && (
                        <p className="mt-2 text-sm text-muted-foreground/70 leading-relaxed line-clamp-2">
                          {bar.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-border group-hover:text-accent shrink-0 mt-1.5 transition-all duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBars;
