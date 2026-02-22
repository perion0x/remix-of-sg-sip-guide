import { Helmet } from "react-helmet-async";

interface BarSchemaProps {
  name: string;
  address: string;
  category: string;
  phone?: string;
  socialMedia?: string;
  mapUrl?: string;
  pageUrl: string;
  operatingHours?: string;
}

const DAY_MAP: Record<string, string> = {
  Mon: "Mo", Tue: "Tu", Wed: "We", Thu: "Th", Fri: "Fr", Sat: "Sa", Sun: "Su",
};

function parseTime(t: string): string {
  t = t.trim().toLowerCase();
  if (t === "midnight") return "00:00";
  if (t === "noon") return "12:00";
  const match = t.match(/^(\d+)(?::(\d+))?\s*(am|pm)$/);
  if (!match) return t;
  let h = parseInt(match[1]);
  const m = match[2] ? parseInt(match[2]) : 0;
  if (match[3] === "pm" && h !== 12) h += 12;
  if (match[3] === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseDays(d: string): string {
  return d.trim().replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g, (m) => DAY_MAP[m] ?? m);
}

function parseOpeningHours(raw: string): string[] {
  const segments = raw.split(/[;,]\s+/);
  return segments.flatMap((seg) => {
    const match = seg.trim().match(/^([A-Za-z\s\-]+?)\s+(\S+)-(\S+)$/);
    if (!match) return [];
    return [`${parseDays(match[1])} ${parseTime(match[2])}-${parseTime(match[3])}`];
  });
}

export function BarSchema({ name, address, category, phone, socialMedia, mapUrl, pageUrl, operatingHours }: BarSchemaProps) {
  const nightclubTypes = ["Nightclub", "Club", "Techno Club"];
  const breweryTypes = ["Brewery", "Micro-Brewery"];

  let schemaType = "BarOrPub";
  if (nightclubTypes.includes(category)) schemaType = "NightClub";
  if (breweryTypes.includes(category)) schemaType = "Brewery";

  const postalMatch = address.match(/Singapore\s+(\d{6})/);
  const postalCode = postalMatch ? postalMatch[1] : "";
  const streetAddress = address
    .replace(/,?\s*Singapore\s+\d{6}\s*$/, "")
    .replace(/,?\s*Singapore\s*$/, "")
    .trim();

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": name,
    "url": pageUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": streetAddress,
      "addressLocality": "Singapore",
      "postalCode": postalCode,
      "addressCountry": "SG",
    },
  };

  schema.description = `${category ? category + " " : ""}located in Singapore. Discover address, opening hours, and contact details for ${name}.`;

  if (phone) {
    const clean = phone.replace(/[^\d]/g, "");
    schema.telephone = clean.length === 8 ? `+65-${clean.slice(0, 4)}-${clean.slice(4)}` : phone;
  }
  if (socialMedia) schema.sameAs = socialMedia.split(",").map((s) => s.trim()).filter(Boolean);
  if (mapUrl) schema.hasMap = mapUrl;
  if (operatingHours) {
    const parsed = parseOpeningHours(operatingHours);
    if (parsed.length > 0) schema.openingHours = parsed;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
