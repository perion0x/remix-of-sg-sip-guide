import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-enrich-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const BUCKET = "bar-media";

const menuItemsSchema = {
  type: "object",
  properties: {
    menu_link: { type: "string", description: "Absolute URL to the menu/drinks/food page if present, else empty" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          price_text: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  required: ["items"],
} as const;

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url);
}
function isPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}
function looksLikeLogo(url: string) {
  return /(logo|icon|favicon|sprite|placeholder)/i.test(url);
}
function absolutize(href: string, base: string): string {
  try { return new URL(href, base).toString(); } catch { return href; }
}

async function firecrawlScrape(url: string, body: Record<string, unknown>, apiKey: string) {
  const res = await fetch(`${FIRECRAWL}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, ...body }),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(`firecrawl ${res.status}: ${text.slice(0, 300)}`);
  }
  return json?.data ?? json;
}

async function uploadFromUrl(
  supabase: ReturnType<typeof createClient>,
  url: string,
  prefix: string,
): Promise<{ path: string; contentType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 2048) return null; // skip tiny icons
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const ext = (() => {
      const m = url.match(/\.([a-z0-9]{2,5})(\?|$)/i);
      if (m) return m[1].toLowerCase();
      if (contentType.includes("png")) return "png";
      if (contentType.includes("webp")) return "webp";
      if (contentType.includes("pdf")) return "pdf";
      return "jpg";
    })();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, new Uint8Array(ab), {
      contentType,
      upsert: false,
    });
    if (error) {
      console.error("upload error", error);
      return null;
    }
    return { path, contentType };
  } catch (e) {
    console.error("uploadFromUrl failed", url, e);
    return null;
  }
}

function extractImagesFromHtml(html: string, base: string): string[] {
  const urls = new Set<string>();
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const abs = absolutize(m[1], base);
    if (isImage(abs) && !looksLikeLogo(abs)) urls.add(abs);
  }
  const ogRe = /<meta[^>]+property=["'](og:image|og:image:secure_url|twitter:image)["'][^>]+content=["']([^"']+)["']/gi;
  while ((m = ogRe.exec(html))) {
    urls.add(absolutize(m[2], base));
  }
  return Array.from(urls);
}

async function enrichBar(supabase: ReturnType<typeof createClient>, barId: string, apiKey: string) {
  const { data: bar, error } = await supabase.from("bars").select("id, name, slug, website").eq("id", barId).single();
  if (error || !bar) throw new Error(`bar not found: ${barId}`);
  if (!bar.website) {
    await supabase.from("bar_enrichment_runs").upsert({ bar_id: barId, status: "skipped", error: "no website", updated_at: new Date().toISOString() }, { onConflict: "bar_id" });
    return { skipped: true };
  }

  // 1) homepage scrape
  const home = await firecrawlScrape(bar.website, {
    formats: ["markdown", "html", "links", { type: "json", schema: menuItemsSchema, prompt: "Find the menu link if any. Extract any visible food/drink menu items with section, name, description, price text." }],
    onlyMainContent: false,
  }, apiKey);

  const html = home?.html ?? "";
  const baseUrl = home?.metadata?.sourceURL ?? bar.website;
  const ogImage: string | null = home?.metadata?.ogImage ?? home?.metadata?.["og:image"] ?? null;

  let imageUrls = extractImagesFromHtml(html, baseUrl);
  if (ogImage) imageUrls = [absolutize(ogImage, baseUrl), ...imageUrls.filter((u) => u !== ogImage)];
  // rank: og first, then largest-looking (no -thumb), cap 10
  imageUrls = Array.from(new Set(imageUrls)).slice(0, 10);

  const prefix = bar.slug || bar.id;
  let imagesCount = 0;
  let heroPath: string | null = null;
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const uploaded = await uploadFromUrl(supabase, url, `${prefix}/images`);
    if (!uploaded) continue;
    const kind = i === 0 ? "hero" : "gallery";
    if (i === 0) heroPath = uploaded.path;
    await supabase.from("bar_images").insert({
      bar_id: barId,
      storage_path: uploaded.path,
      source_url: url,
      kind,
      position: i,
    });
    imagesCount++;
  }

  // Update bars.image_url with public URL of hero
  if (heroPath) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(heroPath);
    if (pub?.publicUrl) {
      await supabase.from("bars").update({ image_url: pub.publicUrl }).eq("id", barId);
    }
  }

  // 2) menu
  const homeJson = home?.json ?? home?.extract ?? {};
  const menuLink: string | null = homeJson?.menu_link ? absolutize(homeJson.menu_link, baseUrl) : null;
  let menuMarkdown: string | null = null;
  let menuPdfPath: string | null = null;
  let menuSourceUrl: string | null = null;
  const items: Array<{ section?: string; name: string; description?: string; price_text?: string }> = Array.isArray(homeJson?.items) ? homeJson.items : [];

  if (menuLink) {
    menuSourceUrl = menuLink;
    if (isPdf(menuLink)) {
      const uploaded = await uploadFromUrl(supabase, menuLink, `${prefix}/menus`);
      if (uploaded) menuPdfPath = uploaded.path;
    } else {
      try {
        const menuScrape = await firecrawlScrape(menuLink, {
          formats: ["markdown", { type: "json", schema: menuItemsSchema, prompt: "Extract every menu item with section, name, description, and price text." }],
          onlyMainContent: true,
        }, apiKey);
        menuMarkdown = menuScrape?.markdown ?? null;
        const menuItems = Array.isArray(menuScrape?.json?.items) ? menuScrape.json.items : [];
        if (menuItems.length) items.splice(0, items.length, ...menuItems);
      } catch (e) {
        console.error("menu scrape failed", e);
      }
    }
  }

  if (menuMarkdown || menuPdfPath || menuSourceUrl) {
    await supabase.from("bar_menus").insert({
      bar_id: barId,
      source_url: menuSourceUrl,
      markdown: menuMarkdown,
      pdf_storage_path: menuPdfPath,
    });
  }

  let menuItemsCount = 0;
  if (items.length) {
    const rows = items.slice(0, 200).map((it, idx) => ({
      bar_id: barId,
      section: it.section ?? null,
      name: String(it.name).slice(0, 200),
      description: it.description ?? null,
      price_text: it.price_text ?? null,
      position: idx,
    }));
    const { error: insErr } = await supabase.from("bar_menu_items").insert(rows);
    if (!insErr) menuItemsCount = rows.length;
  }

  await supabase.from("bar_enrichment_runs").upsert({
    bar_id: barId,
    status: "done",
    error: null,
    images_count: imagesCount,
    menu_items_count: menuItemsCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: "bar_id" });

  return { imagesCount, menuItemsCount, menuPdf: !!menuPdfPath };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const adminToken = Deno.env.get("ENRICH_ADMIN_TOKEN");
  const provided = req.headers.get("x-enrich-token");
  if (!adminToken || provided !== adminToken) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let body: { bar_id?: string };
  try { body = await req.json(); } catch { body = {}; }
  if (!body.bar_id) {
    return new Response(JSON.stringify({ error: "bar_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const result = await enrichBar(supabase, body.bar_id, apiKey);
    return new Response(JSON.stringify({ success: true, ...result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("bar_enrichment_runs").upsert({
      bar_id: body.bar_id,
      status: "failed",
      error: msg.slice(0, 500),
      updated_at: new Date().toISOString(),
    }, { onConflict: "bar_id" });
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});