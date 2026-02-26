import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const SearchFilters = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["bar-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("category");
      if (error) throw error;

      const counts: Record<string, number> = {};
      let total = 0;
      for (const row of data) {
        if (row.category) {
          counts[row.category] = (counts[row.category] || 0) + 1;
        }
        total++;
      }

      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return { categories: sorted, total };
    },
  });

  const hasActiveSearch = activeFilter !== "all" || searchTerm.trim().length > 0;

  const { data: searchResults } = useQuery({
    queryKey: ["bar-search", activeFilter, searchTerm],
    queryFn: async () => {
      let query = supabase.from("bars").select("id, name, address, category, operating_hours, slug", { count: "exact" });
      if (activeFilter !== "all") {
        query = query.eq("category", activeFilter);
      }
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }
      query = query.limit(12);
      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },
    enabled: hasActiveSearch,
  });

  const displayedCategories = categories?.categories
    ? showAllCategories
      ? categories.categories
      : categories.categories.slice(0, 8)
    : [];

  return (
    <section className="py-12 bg-secondary/40 border-y border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search bars, neighbourhoods, categories…"
            className="search-input pl-11 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              activeFilter === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            All · {categories?.total ?? "—"}
          </button>
          {displayedCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveFilter(cat.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                activeFilter === cat.name
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat.name} · {cat.count}
            </button>
          ))}
          {categories && categories.categories.length > 8 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAllCategories ? "Less" : `+${categories.categories.length - 8} more`}
            </button>
          )}
        </div>

        {/* Search Results */}
        {hasActiveSearch && searchResults?.data && searchResults.data.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {searchResults.count ?? searchResults.data.length} results
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {searchResults.data.map((bar) => (
                <Link
                  to={`/bars/${bar.slug}`}
                  key={bar.id}
                  className="p-4 bg-background rounded-lg border border-border hover:border-accent transition-all block"
                >
                  <h4 className="font-medium text-foreground text-sm mb-0.5">{bar.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {bar.category && <span className="text-accent/80 font-medium">{bar.category}</span>}
                    {bar.category && bar.address && <span>·</span>}
                    {bar.address && <span className="truncate">{bar.address}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchFilters;
