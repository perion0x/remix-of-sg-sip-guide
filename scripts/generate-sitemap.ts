import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE = "https://bars.sg";

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all bar slugs (handle >1000 rows)
  let allSlugs: string[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("bars")
      .select("slug")
      .order("name")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Error fetching bars:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allSlugs.push(...data.map((b) => b.slug));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Fetched ${allSlugs.length} bar slugs`);

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE}/bars</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

  for (const slug of allSlugs) {
    xml += `
  <url>
    <loc>${BASE}/bars/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
</urlset>
`;

  const outPath = resolve(process.cwd(), "public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`Sitemap written to ${outPath} with ${allSlugs.length + 2} URLs`);
}

main();
