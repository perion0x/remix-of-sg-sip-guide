import { Helmet } from "react-helmet-async";

interface BarSchemaProps {
  name: string;
  address: string;
  category: string;
  phone?: string;
  socialMedia?: string;
  mapUrl?: string;
  pageUrl: string;
}

export function BarSchema({ name, address, category, phone, socialMedia, mapUrl, pageUrl }: BarSchemaProps) {
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

  if (phone) {
    const clean = phone.replace(/[^\d]/g, "");
    schema.telephone = clean.length === 8 ? `+65-${clean.slice(0, 4)}-${clean.slice(4)}` : phone;
  }
  if (socialMedia) schema.sameAs = socialMedia.split(",").map((s) => s.trim()).filter(Boolean);
  if (mapUrl) schema.hasMap = mapUrl;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
