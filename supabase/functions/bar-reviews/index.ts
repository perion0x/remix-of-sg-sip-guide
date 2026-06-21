import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { slug, bar_id } = await req.json();
    if (!slug && !bar_id) {
      return new Response(JSON.stringify({ error: "slug or bar_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const q = supabase.from("bars").select("id, name, address, slug").limit(1);
    const { data: bar } = slug
      ? await q.eq("slug", slug).maybeSingle()
      : await q.eq("id", bar_id).maybeSingle();
    if (!bar) {
      return new Response(JSON.stringify({ error: "bar not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try cached place_id
    const { data: run } = await supabase
      .from("bar_places_runs")
      .select("place_id")
      .eq("bar_id", bar.id)
      .maybeSingle();

    let placeId = run?.place_id ?? null;
    if (!placeId) {
      const query = `${bar.name}, ${bar.address ?? "Singapore"}`.slice(0, 250);
      placeId = await searchPlace(query);
      if (placeId) {
        await supabase.from("bar_places_runs").upsert({
          bar_id: bar.id, place_id: placeId, status: "reviews_lookup",
          updated_at: new Date().toISOString(),
        }, { onConflict: "bar_id" });
      }
    }

    if (!placeId) {
      return new Response(JSON.stringify({ reviews: [], rating: null, total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const details = await getPlaceReviews(placeId);
    const reviews = (details.reviews ?? []).map((r: any) => ({
      author: r.authorAttribution?.displayName ?? "Anonymous",
      avatar: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? null,
      text: r.text?.text ?? r.originalText?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      publishTime: r.publishTime ?? null,
    }));

    return new Response(JSON.stringify({
      reviews,
      rating: details.rating ?? null,
      total: details.userRatingCount ?? 0,
      mapsUrl: details.googleMapsUri ?? null,
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});