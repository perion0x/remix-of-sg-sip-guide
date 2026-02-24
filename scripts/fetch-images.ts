import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const DELAY_MS = 1500;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function getOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );
    if (match?.[1]) {
      const img = match[1].trim();
      // Make relative URLs absolute
      if (img.startsWith("//")) return `https:${img}`;
      if (img.startsWith("/")) {
        const base = new URL(url).origin;
        return `${base}${img}`;
      }
      return img;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const barsFile = join(__dirname, "bars-with-websites.json");
  const bars: { id: string; name: string; website: string }[] = JSON.parse(
    readFileSync(barsFile, "utf-8")
  );

  console.log(`Found ${bars.length} bars with websites\n`);

  const results: { id: string; image_url: string }[] = [];
  let success = 0;
  let failed = 0;

  for (const bar of bars) {
    try {
      const imageUrl = await getOgImage(bar.website);
      if (imageUrl) {
        results.push({ id: bar.id, image_url: imageUrl });
        console.log(`✓ ${bar.name}`);
        console.log(`  ${imageUrl}`);
        success++;
      } else {
        console.log(`- ${bar.name}: no og:image found`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ ${bar.name}: ${err}`);
      failed++;
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const outFile = join(__dirname, "image-results.json");
  writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\nDone. ${success} succeeded, ${failed} failed/skipped.`);
  console.log(`Results written to ${outFile}`);
}

main();
