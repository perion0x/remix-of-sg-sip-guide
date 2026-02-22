import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BarSchema } from "@/components/BarSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ExternalLink, ChevronRight } from "lucide-react";

const BarDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: bar, isLoading, error } = useQuery({
    queryKey: ["bar", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Bar not found");
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        {isLoading && (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">Bar not found</p>
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        )}

        {bar && (
          <>
            <Helmet>
              <title>{bar.name} — SG Bars | Singapore Bar Guide</title>
              <link rel="canonical" href={`https://bars.sg/bars/${slug}`} />
              <meta name="description" content={`Discover ${bar.name} in Singapore. ${bar.category ?? "Bar"} — address, hours, contact and more.`} />
              <meta property="og:type" content="website" />
              <meta property="og:url" content={`https://bars.sg/bars/${slug}`} />
              <meta property="og:title" content={`${bar.name} — SG Bars | Singapore Bar Guide`} />
              <meta property="og:description" content={`Discover ${bar.name} in Singapore. ${bar.category ?? "Bar"} — address, hours, contact and more.`} />
              <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:site" content="@sgbars" />
              <meta name="twitter:title" content={`${bar.name} — SG Bars | Singapore Bar Guide`} />
              <meta name="twitter:description" content={`Discover ${bar.name} in Singapore. ${bar.category ?? "Bar"} — address, hours, contact and more.`} />
              <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png" />
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://bars.sg/" },
                    { "@type": "ListItem", position: 2, name: "Bars", item: "https://bars.sg/bars" },
                    { "@type": "ListItem", position: 3, name: bar.name },
                  ],
                })}
              </script>
            </Helmet>

            <BarSchema
              name={bar.name}
              address={bar.address ?? ""}
              category={bar.category ?? ""}
              phone={bar.phone ?? undefined}
              socialMedia={bar.social_media_links ?? undefined}
              mapUrl={bar.google_maps_link ?? undefined}
              pageUrl={`https://bars.sg/bars/${slug}`}
              operatingHours={bar.operating_hours ?? undefined}
            />

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/bars" className="hover:text-accent transition-colors">Bars</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium truncate">{bar.name}</span>
            </nav>

            <h1 className="text-4xl font-bold text-foreground mb-2">{bar.name}</h1>

            {bar.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent-foreground text-sm font-medium mb-6">
                {bar.category}
              </span>
            )}

            <div className="space-y-4 mt-6">
              {bar.address && (
                <div className="flex items-start gap-3 text-foreground">
                  <MapPin className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                  <span>{bar.address}</span>
                </div>
              )}

              {bar.operating_hours && (
                <div className="flex items-start gap-3 text-foreground">
                  <Clock className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                  <span className="whitespace-pre-line">{bar.operating_hours}</span>
                </div>
              )}

              {bar.phone && (
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <a href={`tel:${bar.phone}`} className="hover:text-accent transition-colors">{bar.phone}</a>
                </div>
              )}

              {bar.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <a href={`mailto:${bar.email}`} className="hover:text-accent transition-colors">{bar.email}</a>
                </div>
              )}

              {bar.google_maps_link && (
                <a
                  href={bar.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-gold mt-4"
                >
                  <ExternalLink className="w-4 h-4" /> View on Google Maps
                </a>
              )}

              {bar.social_media_links && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Social Media</h2>
                  <div className="flex flex-wrap gap-3">
                    {bar.social_media_links.split(",").map((link) => {
                      const trimmed = link.trim();
                      if (!trimmed) return null;
                      return (
                        <a
                          key={trimmed}
                          href={trimmed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline"
                        >
                          {new URL(trimmed).hostname.replace("www.", "")}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BarDetail;
