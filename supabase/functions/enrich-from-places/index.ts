import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-enrich-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const BUCKET = "bar-media";

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
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    }),
    body: JSON.stringify({ textQuery: query, regionCode: "SG", pageSize: 1 }),
  });
  if (!res.ok) throw new Error(`searchText ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return j?.places?.[0]?.id ?? null;
}

async function getPlaceDetails(placeId: string): Promise<any> {
  const fields = [
    "id",
    "websiteUri",
    "internationalPhoneNumber",
    "nationalPhoneNumber",
    "regularOpeningHours",
    "photos",
  ].join(",");
  const res = await fetch(`${GATEWAY}/places/v1/places/${placeId}`, {
    headers: gwHeaders({ "X-Goog-FieldMask": fields }),
  });
  if (!res.ok) throw new Error(`placeDetails ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return await res.json();
}

async function downloadPhoto(photoName: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  // photoName like "places/XXX/photos/YYY"
  const url = `${GATEWAY}/places/v1/${photoName}/media?maxWidthPx=1600&skipHttpRedirect=true`;
  const res = await fetch(url, { headers: gwHeaders() });
  if (!res.ok) {
    console.error("photo lookup failed", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const j = await res.json().catch(() => null);
  const photoUri: string | undefined = j?.photoUri;
  if (!photoUri) return null;
  const img = await fetch(photoUri);
  if (!img.ok) return null;
  const ab = await img.arrayBuffer();
  return { bytes: new Uint8Array(ab), contentType: img.headers.get("content-type") || "image/jpeg" };
}

function formatHours(h: any): string | null {
  if (!h) return null;
  if (Array.isArray(h?.weekdayDescriptions) && h.weekdayDescriptions.length) {
    return h.weekdayDescriptions.join("\n");
  }
  return null;
}

async function processBar(supabase: ReturnType<typeof createClient>, bar: any) {
  const query = `${bar.name}, ${bar.address ?? "Singapore"}`.slice(0, 250);
  const placeId = await searchPlace(query);
  if (!placeId) {
    await supabase.from("bar_places_runs").upsert({
      bar_id: bar.id, status: "not_found", error: "no place match", updated_at: new Date().toISOString(),
    }, { onConflict: "bar_id" });
    return { ok: true, found: false };
  }

  const details = await getPlaceDetails(placeId);
  const updates: Record<string, any> = {};
  const got = { website: false, image: false, phone: false, hours: false };

  if (!bar.website && details.websiteUri) { updates.website = details.websiteUri; got.website = true; }
  const phone = details.internationalPhoneNumber ?? details.nationalPhoneNumber;
  if (!bar.phone && phone) { updates.phone = phone; got.phone = true; }
  const hours = formatHours(details.regularOpeningHours);
  if (!bar.operating_hours && hours) { updates.operating_hours = hours; got.hours = true; }

  // Photo
  let imagePublicUrl: string | null = null;
  if (!bar.image_url && Array.isArray(details.photos) && details.photos.length) {
    const photo = await downloadPhoto(details.photos[0].name);
    if (photo) {
      const ext = photo.contentType.includes("png") ? "png" : photo.contentType.includes("webp") ? "webp" : "jpg";
      const path = `${bar.slug || bar.id}/places/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, photo.bytes, {
        contentType: photo.contentType, upsert: false,
      });
      if (!upErr) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signed?.signedUrl) {
          imagePublicUrl = signed.signedUrl;
          updates.image_url = signed.signedUrl;
          got.image = true;
          await supabase.from("bar_images").insert({
            bar_id: bar.id, storage_path: path, source_url: "google-places",
            kind: "hero", position: 0,
          });
        }
      }
    }
  }

  if (Object.keys(updates).length) {
    await supabase.from("bars").update(updates).eq("id", bar.id);
  }

  await supabase.from("bar_places_runs").upsert({
    bar_id: bar.id,
    status: "done",
    place_id: placeId,
    error: null,
    got_website: got.website,
    got_image: got.image,
    got_phone: got.phone,
    got_hours: got.hours,
    updated_at: new Date().toISOString(),
  }, { onConflict: "bar_id" });

  return { ok: true, found: true, updates: Object.keys(updates), imagePublicUrl };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: { batch_size?: number; mode?: "missing" | "retry" } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const batchSize = Math.min(Math.max(body.batch_size ?? 5, 1), 10);
  const mode = body.mode ?? "missing";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Pick bars to process: missing website OR image_url AND no prior run (or failed run for retry mode)
  const { data: prior } = await supabase
    .from("bar_places_runs")
    .select("bar_id, status");
  const skip = new Set(
    (prior ?? [])
      .filter((r) => mode === "retry" ? !(r.status === "failed") : true)
      .map((r) => r.bar_id)
  );

  const { data: bars } = await supabase
    .from("bars")
    .select("id, name, slug, address, website, phone, operating_hours, image_url")
    .or("website.is.null,image_url.is.null")
    .order("created_at", { ascending: true })
    .limit(500);

  const targets = (bars ?? []).filter((b) => !skip.has(b.id)).slice(0, batchSize);

  if (targets.length === 0) {
    return new Response(JSON.stringify({ done: true, processed: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  for (const bar of targets) {
    try {
      const r = await processBar(supabase, bar);
      results.push({ bar_id: bar.id, name: bar.name, ...r });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase.from("bar_places_runs").upsert({
        bar_id: bar.id, status: "failed", error: msg.slice(0, 500), updated_at: new Date().toISOString(),
      }, { onConflict: "bar_id" });
      results.push({ bar_id: bar.id, name: bar.name, ok: false, error: msg });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  return new Response(JSON.stringify({
    done: false, processed: targets.length, succeeded, failed: targets.length - succeeded, results,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});