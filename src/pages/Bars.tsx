import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Clock, Award, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const BARS_PER_PAGE = 24;

const Bars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { data: categories } = useQuery({
    queryKey: ["bar-categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bars").select("category");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data) {
        if (row.category) counts[row.category] = (counts[row.category] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  const { data: barsResult, isLoading } = useQuery({
    queryKey: ["all-bars", activeCategory, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("bars")
        .select("*", { count: "exact" })
        .order("name", { ascending: true });

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const from = (currentPage - 1) * BARS_PER_PAGE;
      query = query.range(from, from + BARS_PER_PAGE - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { bars: data, total: count ?? 0 };
    },
  });

  const totalPages = Math.ceil((barsResult?.total ?? 0) / BARS_PER_PAGE);

  const setFilter = (category: string) => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    setSearchParams(params);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    setSearchParams(params);
  };

  const itemListJsonLd = barsResult?.bars
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Bars in Singapore",
        numberOfItems: barsResult.total,
        itemListElement: barsResult.bars.map((bar, i) => ({
          "@type": "ListItem",
          position: (currentPage - 1) * BARS_PER_PAGE + i + 1,
          url: `https://bars.sg/bars/${bar.slug}`,
          name: bar.name,
        })),
      }
    : null;

  return (
    <>
      <Helmet>
        <title>Singapore Bars Directory — Cocktail Bars &amp; Speakeasies</title>
        <link rel="canonical" href="https://bars.sg/bars" />
        <meta name="description" content="Browse all bars in Singapore — cocktail bars, speakeasies, rooftop bars, wine bars and more. Find your next favourite spot." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bars.sg/bars" />
        <meta property="og:title" content="Singapore Bars Directory — Cocktail Bars & Speakeasies" />
        <meta property="og:description" content="Browse all bars in Singapore — cocktail bars, speakeasies, rooftop bars, wine bars and more. Find your next favourite spot." />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sgbars" />
        <meta name="twitter:title" content="Singapore Bars Directory — Cocktail Bars & Speakeasies" />
        <meta name="twitter:description" content="Browse all bars in Singapore — cocktail bars, speakeasies, rooftop bars, wine bars and more. Find your next favourite spot." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png" />
        {itemListJsonLd && (
          <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        )}
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">All Bars</h1>
            <p className="text-muted-foreground mb-8">
              Explore {barsResult?.total ?? "—"} bars across Singapore
            </p>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  activeCategory === "all"
                    ? "bg-accent text-accent-foreground border-accent shadow-gold"
                    : "bg-card text-muted-foreground border-border hover:border-accent hover:text-accent"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setFilter(cat.name)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.name
                      ? "bg-accent text-accent-foreground border-accent shadow-gold"
                      : "bg-card text-muted-foreground border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Bar grid */}
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
                : barsResult?.bars?.map((bar) => (
                    <Link
                      to={`/bars/${bar.slug}`}
                      key={bar.id}
                      className="bar-card block hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-36 overflow-hidden">
                        {bar.image_url ? (
                          <img
                            src={bar.image_url}
                            alt={bar.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                            <span className="text-3xl font-bold text-accent/30">
                              {bar.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {bar.category && (
                          <span className="absolute top-3 left-3 ranking-badge text-xs">
                            {bar.category}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-foreground mb-1">{bar.name}</h2>
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
                  ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-accent text-accent-foreground"
                        : "border border-border text-muted-foreground hover:text-accent hover:border-accent"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Bars;
