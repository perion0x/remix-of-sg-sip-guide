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

async function searchPlace(query: string): Promise<string | null> {
  const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
    method: "POST",
    headers: gwHeaders({
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.id",
    }),
    body: JSON.stringify({ textQuery: query, regionCode: "SG", pageSize: 1 }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  return j?.places?.[0]?.id ?? null;
}

async function getPlaceReviews(placeId: string) {
  const fields = "id,rating,userRatingCount,googleMapsUri,reviews";
  const res = await fetch(`${GATEWAY}/places/v1/places/${placeId}`, {
    headers: gwHeaders({ "X-Goog-FieldMask": fields }),
  });
  if (!res.ok) throw new Error(`placeDetails ${res.status}`);
  return await res.json();
}

function normalizeReviews(details: any) {
  return (details.reviews ?? []).map((r: any) => ({
    author: r.authorAttribution?.displayName ?? "Anonymous",
    avatar: r.authorAttribution?.photoUri ?? null,
    rating: r.rating ?? null,
    text: r.text?.text ?? r.originalText?.text ?? "",
    relativeTime: r.relativePublishTimeDescription ?? "",
    publishTime: r.publishTime ?? null,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const adminToken = Deno.env.get("ENRICH_ADMIN_TOKEN");
    if (!adminToken || req.headers.get("x-enrich-token") !== adminToken) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batch_size = 5, mode = "missing", max_age_days = 30 } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pick bars to process
    const { data: bars } = await supabase
      .from("bars")
      .select("id, name, address, slug")
      .order("name", { ascending: true })
      .limit(500);

    if (!bars || bars.length === 0) {
      return new Response(JSON.stringify({ done: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: runs } = await supabase
      .from("bar_places_runs")
      .select("bar_id, place_id, reviews_fetched_at, rating")
      .in("bar_id", bars.map(b => b.id));

    const runMap = new Map((runs ?? []).map((r: any) => [r.bar_id, r]));
    const ageCutoff = Date.now() - max_age_days * 86400 * 1000;

    const queue = bars.filter((b) => {
      const r: any = runMap.get(b.id);
      if (mode === "retry") return !r || !r.reviews_fetched_at;
      // missing: never fetched OR stale
      if (!r?.reviews_fetched_at) return true;
      return new Date(r.reviews_fetched_at).getTime() < ageCutoff;
    }).slice(0, batch_size);

    let succeeded = 0, failed = 0;
    for (const bar of queue) {
      try {
        let placeId = (runMap.get(bar.id) as any)?.place_id ?? null;
        if (!placeId) {
          const q = `${bar.name}, ${bar.address ?? "Singapore"}`.slice(0, 250);
          placeId = await searchPlace(q);
        }
        if (!placeId) {
          await supabase.from("bar_places_runs").upsert({
            bar_id: bar.id, status: "not_found",
            updated_at: new Date().toISOString(),
          }, { onConflict: "bar_id" });
          failed++; continue;
        }
        const details = await getPlaceReviews(placeId);
        const reviews = normalizeReviews(details);
        await supabase.from("bar_places_runs").upsert({
          bar_id: bar.id,
          place_id: placeId,
          status: "done",
          rating: details.rating ?? null,
          rating_count: details.userRatingCount ?? 0,
          reviews_json: reviews,
          maps_url: details.googleMapsUri ?? null,
          reviews_fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "bar_id" });
        succeeded++;
      } catch (e) {
        await supabase.from("bar_places_runs").upsert({
          bar_id: bar.id, status: "failed",
          error: String((e as any)?.message ?? e),
          updated_at: new Date().toISOString(),
        }, { onConflict: "bar_id" });
        failed++;
      }
      await new Promise(r => setTimeout(r, 150));
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