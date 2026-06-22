import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { RatingBadge } from "@/components/RatingBadge";
import { MapPin } from "lucide-react";

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
const TRACKING = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string;

type MapBar = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  category: string | null;
  lat: number;
  lng: number;
  rating: number | null;
  rating_count: number | null;
};

function loadMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps?.Map) return Promise.resolve();
  if ((window as any).__sgbarsMapsLoading) return (window as any).__sgbarsMapsLoading;
  const p = new Promise<void>((resolve, reject) => {
    (window as any).__sgbarsInitMap = () => resolve();
    const s = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: "async",
      callback: "__sgbarsInitMap",
      libraries: "marker",
      ...(TRACKING ? { channel: TRACKING } : {}),
    });
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  (window as any).__sgbarsMapsLoading = p;
  return p;
}

export default function BarsMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const [selected, setSelected] = useState<MapBar | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["bars-map"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      const out: MapBar[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("bar_places_runs")
          .select("bar_id, lat, lng, rating, rating_count, bars!inner(id, name, slug, address, category)")
          .not("lat", "is", null)
          .not("lng", "is", null)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        for (const r of data ?? []) {
          const b: any = (r as any).bars;
          if (!b) continue;
          out.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            address: b.address,
            category: b.category,
            lat: r.lat as number,
            lng: r.lng as number,
            rating: (r as any).rating ?? null,
            rating_count: (r as any).rating_count ?? null,
          });
        }
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return out;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    let cancelled = false;
    loadMapsScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: { lat: 1.2966, lng: 103.8520 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0f0f0f" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1a2a" }] },
          ],
        });
        infoRef.current = new g.maps.InfoWindow();
        setMapReady(true);
      })
      .catch((e) => console.error(e));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapReady || !data || !mapRef.current) return;
    const g = (window as any).google;
    const markers: any[] = [];
    for (const bar of data) {
      const m = new g.maps.Marker({
        position: { lat: bar.lat, lng: bar.lng },
        map: mapRef.current,
        title: bar.name,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#d4af37",
          fillOpacity: 0.95,
          strokeColor: "#0a0a0a",
          strokeWeight: 1.5,
        },
      });
      m.addListener("click", () => {
        setSelected(bar);
        infoRef.current?.setContent(
          `<div style="color:#0a0a0a;font-family:Inter,sans-serif;min-width:180px"><strong>${bar.name}</strong><br/><span style="font-size:12px;color:#555">${bar.category ?? ""}</span></div>`,
        );
        infoRef.current?.open({ map: mapRef.current, anchor: m });
      });
      markers.push(m);
    }
    return () => { markers.forEach((m) => m.setMap(null)); };
  }, [mapReady, data]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Singapore Bars Map — 500+ Bars on an Interactive Map | SG Bars</title>
        <meta name="description" content="Explore every bar in Singapore on an interactive map. Find cocktail bars, speakeasies, rooftops and nightclubs near you." />
        <link rel="canonical" href="https://bars.sg/bars/map" />
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Singapore Bars Map</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Loading bars…" : `${data?.length ?? 0} bars plotted across Singapore.`}
            </p>
          </div>
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <Card className="overflow-hidden">
              <div ref={containerRef} className="w-full h-[70vh] min-h-[480px] bg-muted" />
            </Card>
            <Card className="p-5 h-[70vh] min-h-[480px] overflow-auto">
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold text-foreground leading-tight">{selected.name}</h2>
                    <button
                      onClick={() => { setSelected(null); infoRef.current?.close(); }}
                      className="text-muted-foreground hover:text-foreground text-sm"
                      aria-label="Close"
                    >✕</button>
                  </div>
                  {selected.category && (
                    <p className="text-xs uppercase tracking-wide text-accent">{selected.category}</p>
                  )}
                  {selected.rating != null && (
                    <RatingBadge rating={selected.rating} count={selected.rating_count} size="md" />
                  )}
                  {selected.address && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{selected.address}</span>
                    </p>
                  )}
                  <Link
                    to={`/bars/${selected.slug}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 mt-2 bg-accent text-accent-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
                  >
                    View bar details
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
                  <MapPin className="w-10 h-10 opacity-40" />
                  <p className="text-sm">Click any pin on the map to see bar details.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}