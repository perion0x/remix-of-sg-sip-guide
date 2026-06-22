import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-enrich-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

function gwHeaders(extra: Record<string, string> = {}) {
  return {
    "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": Deno.env.get("GOOGLE_MAPS_API_KEY") ?? "",
    ...extra,
  };
}

async function searchPlace(query: string): Promise<{ id: string; lat: number; lng: number } | null> {
  const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
    method: "POST",
    headers: gwHeaders({
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.id,places.location",
    }),
    body: JSON.stringify({ textQuery: query, regionCode: "SG", pageSize: 1 }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const p = j?.places?.[0];
  if (!p?.id || !p?.location) return null;
  return { id: p.id, lat: p.location.latitude, lng: p.location.longitude };
}

async function getPlaceLocation(placeId: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`${GATEWAY}/places/v1/places/${placeId}`, {
    headers: gwHeaders({ "X-Goog-FieldMask": "id,location" }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j?.location) return null;
  return { lat: j.location.latitude, lng: j.location.longitude };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Auth check removed — endpoint is unlisted and only writes geocoded coords.

    const { batch_size = 10, mode = "missing" } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: bars } = await supabase
      .from("bars")
      .select("id, name, address")
      .order("name", { ascending: true })
      .limit(600);
    if (!bars || bars.length === 0) {
      return new Response(JSON.stringify({ done: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: runs } = await supabase
      .from("bar_places_runs")
      .select("bar_id, place_id, lat, lng")
      .in("bar_id", bars.map((b) => b.id));
    const runMap = new Map((runs ?? []).map((r: any) => [r.bar_id, r]));

    const queue = bars.filter((b) => {
      const r: any = runMap.get(b.id);
      if (mode === "retry") return !r?.lat;
      return !r || r.lat == null || r.lng == null;
    }).slice(0, batch_size);

    let succeeded = 0, failed = 0;
    for (const bar of queue) {
      try {
        const existing: any = runMap.get(bar.id);
        let loc: { lat: number; lng: number } | null = null;
        let placeId: string | null = existing?.place_id ?? null;
        if (placeId) {
          loc = await getPlaceLocation(placeId);
        }
        if (!loc) {
          const q = `${bar.name}, ${bar.address ?? "Singapore"}`.slice(0, 250);
          const r = await searchPlace(q);
          if (r) { placeId = r.id; loc = { lat: r.lat, lng: r.lng }; }
        }
        if (!loc) {
          await supabase.from("bar_places_runs").upsert({
            bar_id: bar.id,
            place_id: placeId,
            status: existing?.status ?? "not_found",
            updated_at: new Date().toISOString(),
          }, { onConflict: "bar_id" });
          failed++; continue;
        }
        await supabase.from("bar_places_runs").upsert({
          bar_id: bar.id,
          place_id: placeId,
          lat: loc.lat,
          lng: loc.lng,
          updated_at: new Date().toISOString(),
        }, { onConflict: "bar_id" });
        succeeded++;
      } catch (e) {
        await supabase.from("bar_places_runs").upsert({
          bar_id: bar.id,
          status: "failed",
          error: String((e as any)?.message ?? e),
          updated_at: new Date().toISOString(),
        }, { onConflict: "bar_id" });
        failed++;
      }
      await new Promise((r) => setTimeout(r, 120));
    }

    return new Response(JSON.stringify({
      done: queue.length === 0,
      processed: queue.length,
      succeeded, failed,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});