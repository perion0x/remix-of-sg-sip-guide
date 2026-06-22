export type AreaKey =
  | "clarke-quay"
  | "tanjong-pagar"
  | "marina-bay"
  | "orchard"
  | "bugis"
  | "kampong-glam"
  | "dempsey"
  | "holland-village"
  | "sentosa";

export const AREAS: { slug: AreaKey; name: string; keywords: string[] }[] = [
  { slug: "clarke-quay", name: "Clarke Quay / River Valley", keywords: ["Clarke Quay", "River Valley", "Robertson Quay"] },
  { slug: "tanjong-pagar", name: "Chinatown / Tanjong Pagar", keywords: ["Chinatown", "Tanjong Pagar", "Amoy", "Club St", "Ann Siang", "Neil Rd", "Duxton"] },
  { slug: "marina-bay", name: "CBD / Marina Bay", keywords: ["Marina Bay", "Raffles Place", "Shenton Way", "Marina Blvd"] },
  { slug: "orchard", name: "Orchard", keywords: ["Orchard", "Somerset", "Dhoby Ghaut"] },
  { slug: "bugis", name: "Bugis / Beach Road", keywords: ["Bugis", "Beach Rd", "Arab St", "Haji Lane"] },
  { slug: "kampong-glam", name: "Kampong Glam", keywords: ["Kampong Glam", "Sultan", "North Bridge"] },
  { slug: "dempsey", name: "Dempsey", keywords: ["Dempsey"] },
  { slug: "holland-village", name: "Holland Village", keywords: ["Holland"] },
  { slug: "sentosa", name: "Sentosa", keywords: ["Sentosa"] },
];

export function getArea(address: string | null | undefined): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const a of AREAS) {
    if (a.keywords.some((k) => lower.includes(k.toLowerCase()))) return a.name;
  }
  return null;
}

export function getAreaSlug(address: string | null | undefined): AreaKey | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const a of AREAS) {
    if (a.keywords.some((k) => lower.includes(k.toLowerCase()))) return a.slug;
  }
  return null;
}

export function findAreaBySlug(slug: string) {
  return AREAS.find((a) => a.slug === slug) ?? null;
}

export function getOpenStatus(hours: string | null | undefined): { open: boolean; label: string } | null {
  if (!hours) return null;
  try {
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayName = dayNames[now.getDay()];
    const segments = hours.split(/[;,]\s+/);
    for (const seg of segments) {
      const match = seg.trim().match(/^([A-Za-z\s\-]+?)\s+(\d+(?::\d+)?(?:am|pm)?)-(.+)$/i);
      if (!match) continue;
      const dayParts = match[1].trim().split("-").map((d) => d.trim());
      const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startIdx = dayOrder.indexOf(dayParts[0]);
      const endIdx = dayParts[1] ? dayOrder.indexOf(dayParts[1]) : startIdx;
      const todayIdx = dayOrder.indexOf(todayName);
      const inRange = startIdx <= endIdx ? todayIdx >= startIdx && todayIdx <= endIdx : todayIdx >= startIdx || todayIdx <= endIdx;
      if (!inRange) continue;
      const parseHour = (t: string): number => {
        t = t.trim().toLowerCase();
        if (t === "midnight") return 24;
        if (t === "noon") return 12;
        const m = t.match(/^(\d+)(?::(\d+))?\s*(am|pm)$/);
        if (!m) return -1;
        let h = parseInt(m[1]);
        if (m[3] === "pm" && h !== 12) h += 12;
        if (m[3] === "am" && h === 12) h = 0;
        return h;
      };
      const openH = parseHour(match[2]);
      const closeRaw = match[3].trim();
      let closeH = parseHour(closeRaw);
      if (closeH < openH) closeH += 24;
      const currentH = now.getHours() + now.getMinutes() / 60;
      const isOpen = currentH >= openH && currentH < closeH;
      const closingLabel = closeRaw === "midnight" ? "midnight" : closeRaw;
      return {
        open: isOpen,
        label: isOpen ? `Open · closes ${closingLabel}` : `Closed · opens ${match[2]}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}