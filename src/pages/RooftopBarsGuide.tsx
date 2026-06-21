import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const CANONICAL = "https://bars.sg/guides/rooftop-bars-singapore";
const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png";

const FEATURED_SLUGS = [
  "c-la-vi-singapore",
  "1-altitude-gallery-bar",
  "kinki-rooftop-bar",
  "artemis-grill-sky-bar",
  "antidote-rooftop-bar",
  "1-altitude-coast",
];

const RooftopBarsGuide = () => {
  const { data: bars, isLoading } = useQuery({
    queryKey: ["rooftop-bars-guide"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("id, name, slug, address, description, image_url, category")
        .ilike("category", "%rooftop%")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const featured = FEATURED_SLUGS
    .map((slug) => bars?.find((b) => b.slug === slug))
    .filter(Boolean) as NonNullable<typeof bars>;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Best Rooftop Bars in Singapore (2026 Guide)",
    description:
      "A curated guide to Singapore's best rooftop bars — from Marina Bay sky decks to heritage shophouse perches in Chinatown and Tanjong Pagar.",
    image: OG_IMAGE,
    author: { "@type": "Organization", name: "SG Bars" },
    publisher: {
      "@type": "Organization",
      name: "SG Bars",
      url: "https://bars.sg",
    },
    mainEntityOfPage: CANONICAL,
  };

  const itemListJsonLd = bars && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Rooftop Bars in Singapore",
    numberOfItems: bars.length,
    itemListElement: bars.map((bar, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://bars.sg/bars/${bar.slug}`,
      name: bar.name,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Best Rooftop Bars in Singapore (2026) — SG Bars</title>
        <meta
          name="description"
          content="The best rooftop bars in Singapore — from Marina Bay sky decks to heritage shophouse perches. A curated 2026 guide with views, vibes and addresses."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Best Rooftop Bars in Singapore (2026) — SG Bars" />
        <meta
          property="og:description"
          content="A curated guide to Singapore's best rooftop bars — from Marina Bay sky decks to heritage shophouse perches."
        />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sgbars" />
        <meta name="twitter:title" content="Best Rooftop Bars in Singapore (2026) — SG Bars" />
        <meta
          name="twitter:description"
          content="A curated guide to Singapore's best rooftop bars — from Marina Bay sky decks to heritage shophouse perches."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        {itemListJsonLd && (
          <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        )}
        </Helmet>
      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>

          <header className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Guide</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
              The Best Rooftop Bars in Singapore
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Singapore's skyline is best enjoyed with a cocktail in hand. From the
              57th-floor decks of Marina Bay Sands to quieter shophouse perches in
              Chinatown and Tanjong Pagar, here are the rooftop bars worth the lift
              ride — curated from our directory of {bars?.length ?? 41}+ elevated
              venues across the island.
            </p>
          </header>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
              Our Top Picks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))
                : featured.map((bar) => (
                    <Link
                      key={bar.id}
                      to={`/bars/${bar.slug}`}
                      className="bar-card block p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                        {bar.name}
                      </h3>
                      {bar.address && (
                        <div className="flex items-start text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-accent/70" />
                          <span>{bar.address}</span>
                        </div>
                      )}
                      {bar.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {bar.description}
                        </p>
                      )}
                    </Link>
                  ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
              What Makes a Great Rooftop Bar in Singapore?
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Singapore does rooftops better than most cities. The tropical climate
                means open-air drinking is a year-round affair, and the skyline —
                anchored by Marina Bay Sands, the Esplanade and a tight cluster of
                CBD towers — gives almost every elevated bar a postcard view.
              </p>
              <p>
                The best rooftop bars balance three things: a genuinely good cocktail
                programme, a view that earns the height, and a vibe that holds up
                past sunset. Marina Bay venues like CÉ LA VI and 1-Altitude deliver
                on spectacle. Heritage perches above Erskine Road, Tras Street and
                Hill Street trade altitude for atmosphere.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
              All Rooftop Bars in Singapore
            </h2>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {bars?.map((bar) => (
                  <li key={bar.id}>
                    <Link
                      to={`/bars/${bar.slug}`}
                      className="text-foreground hover:text-accent transition-colors"
                    >
                      {bar.name}
                    </Link>
                    {bar.address && (
                      <span className="block text-xs text-muted-foreground truncate">
                        {bar.address}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-border/40 pt-10">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              Keep Exploring
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/bars?category=Rooftop+Bar"
                className="px-5 py-2.5 border border-accent/30 text-accent text-sm hover:bg-accent hover:text-accent-foreground transition-all"
              >
                Browse all rooftop bars
              </Link>
              <Link
                to="/bars"
                className="px-5 py-2.5 border border-border text-muted-foreground text-sm hover:text-accent hover:border-accent transition-all"
              >
                See the full directory
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default RooftopBarsGuide;