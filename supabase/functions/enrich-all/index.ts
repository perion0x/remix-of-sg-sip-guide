import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-enrich-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const adminToken = Deno.env.get("ENRICH_ADMIN_TOKEN");
  const provided = req.headers.get("x-enrich-token");
  if (!adminToken || provided !== adminToken) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let body: { batch_size?: number; mode?: "pending" | "failed" | "all" } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const batchSize = Math.min(Math.max(body.batch_size ?? 5, 1), 10);
  const mode = body.mode ?? "pending";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Pick bars that need work
  let barIds: string[] = [];
  if (mode === "failed") {
    const { data } = await supabase
      .from("bar_enrichment_runs")
      .select("bar_id")
      .eq("status", "failed")
      .limit(batchSize);
    barIds = (data ?? []).map((r) => r.bar_id);
  } else {
    // pending = bars with a website and no done/skipped run
    const { data: doneRuns } = await supabase
      .from("bar_enrichment_runs")
      .select("bar_id")
      .in("status", mode === "all" ? ["__none__"] : ["done", "skipped", "failed"]);
    const exclude = new Set((doneRuns ?? []).map((r) => r.bar_id));
    const { data: bars } = await supabase
      .from("bars")
      .select("id")
      .not("website", "is", null)
      .order("created_at", { ascending: true })
      .limit(500);
    barIds = (bars ?? []).map((b) => b.id).filter((id) => !exclude.has(id)).slice(0, batchSize);
  }

  if (barIds.length === 0) {
    return new Response(JSON.stringify({ done: true, processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/enrich-bar`;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const results = await Promise.allSettled(
    barIds.map(async (bar_id) => {
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
          "x-enrich-token": adminToken,
        },
        body: JSON.stringify({ bar_id }),
      });
      const j = await res.json().catch(() => ({}));
      return { bar_id, ok: res.ok, ...j };
    })
  );

  const summary = results.map((r) => r.status === "fulfilled" ? r.value : { ok: false, error: String(r.reason) });
  const okCount = summary.filter((r: any) => r.ok).length;

  return new Response(JSON.stringify({
    done: false,
    processed: barIds.length,
    succeeded: okCount,
    failed: barIds.length - okCount,
    results: summary,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});