import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const BASE_DELAY_MS = 500; // delay between API calls to avoid rate limits

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
    process.exit(1);
  }
  if (!anthropicKey) {
    console.error("Missing ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // Fetch bars without descriptions
  const { data: bars, error } = await supabase
    .from("bars")
    .select("id, name, category, address, operating_hours")
    .is("description", null)
    .order("name");

  if (error) {
    console.error("Error fetching bars:", error.message);
    process.exit(1);
  }

  console.log(`Found ${bars.length} bars without descriptions`);

  let success = 0;
  let failed = 0;

  for (const bar of bars) {
    try {
      const prompt = `Write a 2-3 sentence description for a Singapore bar listing. Be specific, engaging, and factual. Do not make up details not provided. Do not use phrases like "nestled" or "vibrant". Keep it under 60 words.

Bar name: ${bar.name}
Category: ${bar.category ?? "Bar"}
Address: ${bar.address ?? "Singapore"}
Operating hours: ${bar.operating_hours ?? ""}

Write only the description, no quotes, no preamble.`;

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });

      const description = (message.content[0] as { text: string }).text.trim();

      const { error: updateError } = await supabase
        .from("bars")
        .update({ description })
        .eq("id", bar.id);

      if (updateError) {
        console.error(`Failed to update ${bar.name}:`, updateError.message);
        failed++;
      } else {
        console.log(`✓ ${bar.name}`);
        success++;
      }

      await new Promise((r) => setTimeout(r, BASE_DELAY_MS));
    } catch (err) {
      console.error(`Error for ${bar.name}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

main();
