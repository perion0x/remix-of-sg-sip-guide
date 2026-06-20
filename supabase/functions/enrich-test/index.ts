const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const { bar_id } = await req.json().catch(() => ({}));
  if (!bar_id) return new Response(JSON.stringify({ error: "bar_id required" }), { status: 400, headers: corsHeaders });
  const token = Deno.env.get("ENRICH_ADMIN_TOKEN");
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/enrich-bar`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-enrich-token": token ?? "",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    },
    body: JSON.stringify({ bar_id }),
  });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});