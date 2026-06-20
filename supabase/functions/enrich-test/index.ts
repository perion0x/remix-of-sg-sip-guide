const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const body = await req.json().catch(() => ({} as any));
  const token = Deno.env.get("ENRICH_ADMIN_TOKEN") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const base = Deno.env.get("SUPABASE_URL");

  // Single-bar mode (backward compat)
  if (body?.bar_id) {
    const res = await fetch(`${base}/functions/v1/enrich-bar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-enrich-token": token, Authorization: `Bearer ${anon}` },
      body: JSON.stringify({ bar_id: body.bar_id }),
    });
    return new Response(await res.text(), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Batch driver: loop enrich-all until done or time budget exhausted
  const mode = body?.mode ?? "pending";
  const batchSize = body?.batch_size ?? 5;
  const budgetMs = Math.min(body?.budget_ms ?? 110_000, 140_000);
  const start = Date.now();
  const batches: any[] = [];
  let totalProcessed = 0, totalOk = 0, totalFail = 0;

  while (Date.now() - start < budgetMs) {
    const res = await fetch(`${base}/functions/v1/enrich-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-enrich-token": token, Authorization: `Bearer ${anon}` },
      body: JSON.stringify({ batch_size: batchSize, mode }),
    });
    const j = await res.json().catch(() => ({} as any));
    batches.push({ processed: j.processed, succeeded: j.succeeded, failed: j.failed });
    totalProcessed += j.processed ?? 0;
    totalOk += j.succeeded ?? 0;
    totalFail += j.failed ?? 0;
    if (j.done || (j.processed ?? 0) === 0) {
      return new Response(JSON.stringify({ done: true, totalProcessed, totalOk, totalFail, batches, elapsedMs: Date.now() - start }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
  return new Response(JSON.stringify({ done: false, totalProcessed, totalOk, totalFail, batches, elapsedMs: Date.now() - start, note: "budget exhausted, call again to resume" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});