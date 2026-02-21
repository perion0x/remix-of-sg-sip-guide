import { Star, MapPin, Clock, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const FeaturedBars = () => {
  const { data: bars, isLoading } = useQuery({
    queryKey: ["featured-bars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .in("category", ["Cocktail Bar", "Speakeasy", "Speakeasy Bar", "Gin Bar", "Whisky Bar"])
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title animate-fade-in-up">Featured Bars</h2>
          <p className="section-subtitle animate-fade-in-up animate-stagger-1">
            Discover Singapore's most acclaimed cocktail destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bar-card">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : bars?.map((bar, index) => (
                <Link
                  to={`/bars/${bar.slug}`}
                  key={bar.id}
                  className={`bar-card animate-fade-in-up animate-stagger-${index + 1} block`}
                >
                  {/* Header with category badge */}
                  <div className="relative h-48 bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-accent/30">{bar.name.charAt(0)}</span>
                    {bar.category && (
                      <div className="absolute top-4 left-4">
                        <div className="ranking-badge">{bar.category}</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground">{bar.name}</h3>
                      <Award className="w-5 h-5 text-accent flex-shrink-0" />
                    </div>

                    {bar.address && (
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{bar.address}</span>
                      </div>
                    )}

                    {bar.operating_hours && (
                      <div className="flex items-center text-muted-foreground text-sm mb-4">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{bar.operating_hours}</span>
                      </div>
                    )}

                    <span className="w-full btn-primary block text-center">View Details</span>
                  </div>
                </Link>
              ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-gold">
            <Award className="w-5 h-5 mr-2" />
            View All Bars
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBars;
