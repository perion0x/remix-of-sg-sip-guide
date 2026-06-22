import { Star } from "lucide-react";

export function RatingBadge({ rating, count, size = "sm" }: { rating: number | null | undefined; count?: number | null; size?: "sm" | "md" }) {
  if (rating == null) return null;
  const cls = size === "md" ? "text-sm" : "text-xs";
  const iconCls = size === "md" ? "w-3.5 h-3.5" : "w-3 h-3";
  return (
    <span className={`inline-flex items-center gap-1 font-medium text-foreground ${cls}`}>
      <Star className={`${iconCls} fill-accent text-accent`} />
      {rating.toFixed(1)}
      {count ? <span className="text-muted-foreground font-normal">({count.toLocaleString()})</span> : null}
    </span>
  );
}

export function OpenBadge({ open, label, size = "sm" }: { open: boolean; label: string; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cls} ${
        open ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-500" : "bg-muted-foreground/50"}`} />
      {open ? "Open now" : label.replace(/^Closed · /, "")}
    </span>
  );
}