import { Search, MapPin, Filter, Wine, Music, Beer, GlassWater, Martini } from "lucide-react";
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
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search by bar name, location, or category..."
                className="search-input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Categories */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Categories ({categories?.categories.length ?? "—"})
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  activeFilter === "all"
                    ? "bg-accent text-accent-foreground border-accent shadow-gold"
                    : "bg-background text-muted-foreground border-border hover:border-accent hover:text-accent"
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">All ({categories?.total ?? "—"})</span>
              </button>
              {displayedCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveFilter(cat.name)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    activeFilter === cat.name
                      ? "bg-accent text-accent-foreground border-accent shadow-gold"
                      : "bg-background text-muted-foreground border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
            {categories && categories.categories.length > 8 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-3 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                {showAllCategories
                  ? "Show less"
                  : `Show all ${categories.categories.length} categories`}
              </button>
            )}
          </div>

          {/* Search Results */}
          {hasActiveSearch && searchResults?.data && searchResults.data.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Results ({searchResults.count ?? searchResults.data.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.data.map((bar) => (
                  <Link
                    to={`/bars/${bar.slug}`}
                    key={bar.id}
                    className="p-4 bg-background rounded-lg border border-border hover:border-accent transition-all duration-200 block"
                  >
                    <h4 className="font-medium text-foreground mb-1">{bar.name}</h4>
                    {bar.category && (
                      <span className="text-xs text-accent font-medium">{bar.category}</span>
                    )}
                    {bar.address && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{bar.address}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">{categories?.total ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Total Bars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">{categories?.categories.length ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {categories?.categories.find((c) => c.name === "Rooftop Bar")?.count ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">Rooftop Bars</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
