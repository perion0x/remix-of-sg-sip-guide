import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, MapPin, Clock } from "lucide-react";
import { AREAS, findAreaBySlug, getAreaSlug, getOpenStatus } from "@/lib/bar-utils";
import { useAllRatings } from "@/hooks/useBarRatings";
import { RatingBadge, OpenBadge } from "@/components/RatingBadge";

export default function Neighbourhood() {
  const { area: areaSlug } = useParams<{ area: string }>();
  const area = areaSlug ? findAreaBySlug(areaSlug) : null;

  const ratings = useAllRatings();

  const { data: bars, isLoading } = useQuery({
    queryKey: ["area-bars", areaSlug],
    enabled: !!area,
    queryFn: async () => {
      const { data, error } = await supabase.from("bars").select("*");
      if (error) throw error;
      return (data ?? []).filter((b) => getAreaSlug(b.address) === area!.slug);
    },
  });

  if (!area) return <Navigate to="/bars" replace />;

  const sorted = (() => {
    if (!bars || !ratings.data) return bars ?? [];
    return [...bars].sort((a, b) => {
      const ra = ratings.data!.get(a.id)?.rating ?? -1;
      const rb = ratings.data!.get(b.id)?.rating ?? -1;
      if (rb !== ra) return rb - ra;
      return a.name.localeCompare(b.name);
    });
  })();

  const url = `https://bars.sg/bars/area/${area.slug}`;
  const title = `Best Bars in ${area.name}, Singapore — SG Bars`;
  const description = `Discover the best cocktail bars, speakeasies and rooftop venues in ${area.name}, Singapore. ${bars?.length ?? "Many"} curated picks with hours, ratings and reviews.`;

  const jsonLd = sorted.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Bars in ${area.name}, Singapore`,
        numberOfItems: sorted.length,
        itemListElement: sorted.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://bars.sg/bars/${b.slug}`,
          name: b.name,
        })),
      }
    : null;

  return (
    <>
      <Header />
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={url} />
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link to="/bars" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> All bars
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Bars in {area.name}
            </h1>
            <p className="text-muted-foreground mb-8">
              {bars?.length ?? "—"} curated venues in this Singapore neighbourhood, sorted by Google rating.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {AREAS.filter((a) => a.slug !== area.slug).map((a) => (
                <Link
                  key={a.slug}
                  to={`/bars/area/${a.slug}`}
                  className="px-3 py-1.5 rounded-md border text-xs font-medium bg-card text-muted-foreground border-border hover:border-accent hover:text-accent transition-colors"
                >
                  {a.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bar-card">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                : sorted.map((bar) => {
                    const r = ratings.data?.get(bar.id);
                    const status = getOpenStatus(bar.operating_hours);
                    return (
                      <Link
                        to={`/bars/${bar.slug}`}
                        key={bar.id}
                        className="bar-card block hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-36 overflow-hidden">
                          {bar.image_url ? (
                            <img src={bar.image_url} alt={bar.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                              <span className="text-3xl font-bold text-accent/30">{bar.name.charAt(0)}</span>
                            </div>
                          )}
                          {bar.category && (
                            <span className="bar-category-badge absolute top-3 left-3">
                              <span>{bar.category}</span>
                            </span>
                          )}
                          {status && (
                            <span className="absolute top-3 right-3">
                              <OpenBadge open={status.open} label={status.label} />
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h2 className="text-lg font-semibold text-foreground">{bar.name}</h2>
                            <RatingBadge rating={r?.rating ?? null} count={r?.rating_count} />
                          </div>
                          {bar.address && (
                            <div className="flex items-center text-muted-foreground text-sm mb-1">
                              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                              <span className="truncate">{bar.address}</span>
                            </div>
                          )}
                          {bar.operating_hours && (
                            <div className="flex items-center text-muted-foreground text-xs">
                              <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                              <span className="truncate">{bar.operating_hours}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
            </div>

            {!isLoading && sorted.length === 0 && (
              <p className="text-muted-foreground">No bars found in this area yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}