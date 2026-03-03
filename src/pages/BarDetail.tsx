import { useParams, Link } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BarSchema } from "@/components/BarSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock, ExternalLink, ChevronRight, Globe, Train, X, ChevronLeft, Images } from "lucide-react";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

function getSocialInfo(url: string): { platform: string; handle: string; Icon: () => JSX.Element; className: string } {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace("www.", "");
    const handle = pathname.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? host;
    if (host.includes("instagram.com"))
      return { platform: "Instagram", handle: `@${handle}`, Icon: InstagramIcon, className: "text-pink-500 border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-950" };
    if (host.includes("facebook.com"))
      return { platform: "Facebook", handle: handle, Icon: FacebookIcon, className: "text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950" };
    return { platform: host, handle: handle, Icon: () => <Globe className="w-4 h-4" />, className: "text-accent border-border hover:bg-muted" };
  } catch {
    return { platform: "Link", handle: url, Icon: () => <ExternalLink className="w-4 h-4" />, className: "text-accent border-border hover:bg-muted" };
  }
}

function getOpenStatus(hours: string | null): { open: boolean; label: string } | null {
  if (!hours) return null;
  try {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayName = dayNames[day];

    const segments = hours.split(/[;,]\s+/);
    for (const seg of segments) {
      const match = seg.trim().match(/^([A-Za-z\s\-]+?)\s+(\d+(?::\d+)?(?:am|pm)?)-(.+)$/i);
      if (!match) continue;

      const dayRange = match[1].trim();
      const dayParts = dayRange.split("-").map((d) => d.trim());
      const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startIdx = dayOrder.indexOf(dayParts[0]);
      const endIdx = dayParts[1] ? dayOrder.indexOf(dayParts[1]) : startIdx;
      const todayIdx = dayOrder.indexOf(todayName);

      const inRange = startIdx <= endIdx
        ? todayIdx >= startIdx && todayIdx <= endIdx
        : todayIdx >= startIdx || todayIdx <= endIdx;

      if (!inRange) continue;

      const parseHour = (t: string): number => {
        t = t.trim().toLowerCase();
        if (t === "midnight") return 24;
        if (t === "noon") return 12;
        const m = t.match(/^(\d+)(?::(\d+))?\s*(am|pm)$/);
        if (!m) return -1;
        let h = parseInt(m[1]);
        if (m[3] === "pm" && h !== 12) h += 12;
        if (m[3] === "am" && h === 12) h = 0;
        return h;
      };

      const openH = parseHour(match[2]);
      const closeRaw = match[3].trim();
      let closeH = parseHour(closeRaw);
      if (closeH < openH) closeH += 24; // past midnight

      const currentH = now.getHours() + now.getMinutes() / 60;
      const isOpen = currentH >= openH && currentH < closeH;

      const closingLabel = closeRaw === "midnight" ? "midnight" : closeRaw;
      return {
        open: isOpen,
        label: isOpen ? `Open · closes ${closingLabel}` : `Closed · opens ${match[2]}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function getArea(address: string | null): string | null {
  if (!address) return null;
  const areas: Record<string, string[]> = {
    "Clarke Quay / River Valley": ["Clarke Quay", "River Valley", "Robertson Quay"],
    "Chinatown / Tanjong Pagar": ["Chinatown", "Tanjong Pagar", "Amoy", "Club St", "Ann Siang", "Neil Rd", "Duxton"],
    "CBD / Marina Bay": ["Marina Bay", "Raffles Place", "Shenton Way", "Marina Blvd"],
    "Orchard": ["Orchard", "Somerset", "Dhoby Ghaut"],
    "Bugis / Beach Road": ["Bugis", "Beach Rd", "Arab St", "Haji Lane"],
    "Kampong Glam": ["Kampong Glam", "Sultan", "North Bridge"],
    "Dempsey": ["Dempsey"],
    "Holland Village": ["Holland"],
    "Sentosa": ["Sentosa"],
  };
  for (const [area, keywords] of Object.entries(areas)) {
    if (keywords.some((k) => address.toLowerCase().includes(k.toLowerCase()))) return area;
  }
  return null;
}

function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-7 h-7" />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
      <img
        src={images[current]}
        alt={`Photo ${current + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

function PhotoGallery({ images, barName }: { images: string[]; barName: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const visible = images.slice(0, 5);
  const remaining = images.length - 5;

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
      <div className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[420px] md:h-[500px]">
          {/* Main large image */}
          <button
            className="col-span-2 row-span-2 relative overflow-hidden bg-muted focus:outline-none"
            onClick={() => setLightboxIndex(0)}
            aria-label={`View photo 1 of ${barName}`}
          >
            <img
              src={visible[0]}
              alt={barName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </button>

          {/* 2×2 thumbnails */}
          {[1, 2, 3, 4].map((i) => (
            visible[i] ? (
              <button
                key={i}
                className="relative overflow-hidden bg-muted focus:outline-none"
                onClick={() => setLightboxIndex(i)}
                aria-label={`View photo ${i + 1} of ${barName}`}
              >
                <img
                  src={visible[i]}
                  alt={`${barName} photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {i === 4 && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{remaining} more</span>
                  </div>
                )}
              </button>
            ) : <div key={i} className="bg-muted" />
          ))}
        </div>

        {/* Show all photos button */}
        <button
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-foreground text-sm font-medium px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-border"
        >
          <Images className="w-4 h-4" />
          Show all {images.length} photos
        </button>
      </div>
    </>
  );
}

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
      <main>
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
              <meta property="og:description" content={bar.description ?? `Discover ${bar.name} in Singapore. ${bar.category ?? "Bar"} — address, hours, contact and more.`} />
              <meta property="og:image" content={bar.image_url ?? "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png"} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:site" content="@sgbars" />
              <meta name="twitter:title" content={`${bar.name} — SG Bars | Singapore Bar Guide`} />
              <meta name="twitter:description" content={bar.description ?? `Discover ${bar.name} in Singapore. ${bar.category ?? "Bar"} — address, hours, contact and more.`} />
              <meta name="twitter:image" content={bar.image_url ?? "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png"} />
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

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 pt-6 pb-2">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/bars" className="hover:text-foreground transition-colors">Bars</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium truncate">{bar.name}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-3">{bar.name}</h1>
              {bar.category && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                  {bar.category}
                </span>
              )}
            </div>

            {/* Photo gallery / hero */}
            {(bar as any).images?.length > 0 ? (
              <div className="mt-4">
                <PhotoGallery images={(bar as any).images} barName={bar.name} />
              </div>
            ) : bar.image_url ? (
              <div className="relative h-64 md:h-80 mt-4">
                <img src={bar.image_url} alt={bar.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="h-48 mt-4 bg-gradient-to-br from-accent/30 via-primary/20 to-background flex items-center justify-center">
                <span className="text-8xl font-bold text-accent/10 select-none">{bar.name.charAt(0)}</span>
              </div>
            )}

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Main content */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Open status */}
                  {(() => {
                    const status = getOpenStatus(bar.operating_hours);
                    if (!status) return null;
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.open ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                        <span className={`w-2 h-2 rounded-full ${status.open ? "bg-green-500" : "bg-red-500"}`} />
                        {status.label}
                      </div>
                    );
                  })()}

                  {/* Description */}
                  {/* Description placeholder - add description column to bars table to enable */}

                  {/* Highlights */}
                  {bar.category && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-3">Highlights</h2>
                      <div className="flex flex-wrap gap-2">
                        {[bar.category, "Singapore Bar", bar.address ? getArea(bar.address) : null]
                          .filter(Boolean)
                          .map((tag) => (
                            <span key={tag} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Getting There */}
                  {bar.address && (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-3">Getting There</h2>
                      <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                          <span>{bar.address}</span>
                        </div>
                        {getArea(bar.address) && (
                          <div className="flex items-start gap-3">
                            <Train className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                            <span>Located in the <strong>{getArea(bar.address)}</strong> area of Singapore</span>
                          </div>
                        )}
                        {bar.google_maps_link && (
                          <a
                            href={bar.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 btn-gold mt-2"
                          >
                            <ExternalLink className="w-4 h-4" /> View on Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card p-6 space-y-5">

                    {bar.operating_hours && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hours</h3>
                        <div className="flex items-start gap-2 text-foreground text-sm">
                          <Clock className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                          <span className="whitespace-pre-line">{bar.operating_hours}</span>
                        </div>
                      </div>
                    )}

                    {bar.phone && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phone</h3>
                        <a href={`tel:${bar.phone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors">
                          <Phone className="w-4 h-4 text-accent shrink-0" />
                          {bar.phone}
                        </a>
                      </div>
                    )}

                    {bar.email && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email</h3>
                        <a href={`mailto:${bar.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors">
                          <Mail className="w-4 h-4 text-accent shrink-0" />
                          {bar.email}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Follow</h3>
                      {bar.social_media_links ? (
                        <div className="flex flex-col gap-2">
                          {bar.social_media_links.split(",").map((link) => {
                            const trimmed = link.trim();
                            if (!trimmed) return null;
                            const { platform, handle, Icon, className } = getSocialInfo(trimmed);
                            return (
                              <a
                                key={trimmed}
                                href={trimmed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${className}`}
                              >
                                <Icon />
                                <span>{platform}</span>
                                <span className="text-xs opacity-70">{handle}</span>
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Know their socials?{" "}
                          <a
                            href={`mailto:hello@bars.sg?subject=Suggest an edit for ${encodeURIComponent(bar.name)}`}
                            className="text-accent hover:underline"
                          >
                            Help us update this listing.
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BarDetail;
