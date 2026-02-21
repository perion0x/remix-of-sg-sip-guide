import { Search, MapPin, Filter, Star, Clock, DollarSign, Wine, Music, Beer } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SearchFilters = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filters = [
    { id: "all", label: "All Bars", icon: Search },
    { id: "Cocktail Bar", label: "Cocktail", icon: Wine },
    { id: "Rooftop Bar", label: "Rooftop", icon: MapPin },
    { id: "Speakeasy", label: "Speakeasy", icon: Filter },
    { id: "Wine Bar", label: "Wine", icon: Wine },
    { id: "Jazz Bar", label: "Jazz", icon: Music },
    { id: "Beer Bar", label: "Beer", icon: Beer },
  ];

  const { data: stats } = useQuery({
    queryKey: ["bar-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_bar_stats");
      if (error) throw error;
      return data as { total: number; categories: number; rooftop: number };
    },
  });

  const hasActiveSearch = activeFilter !== "all" || searchTerm.trim().length > 0;

  const { data: searchResults } = useQuery({
    queryKey: ["bar-search", activeFilter, searchTerm],
    queryFn: async () => {
      let query = supabase.from("bars").select("id, name, address, category, operating_hours", { count: "exact" });
      if (activeFilter !== "all") {
        query = query.or(`category.eq.${activeFilter},category.eq.${activeFilter} Bar`);
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
            <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      activeFilter === filter.id
                        ? "bg-accent text-accent-foreground border-accent shadow-gold"
                        : "bg-background text-muted-foreground border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Results */}
          {hasActiveSearch && searchResults?.data && searchResults.data.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Results ({searchResults.count ?? searchResults.data.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.data.map((bar) => (
                  <div
                    key={bar.id}
                    className="p-4 bg-background rounded-lg border border-border hover:border-accent transition-all duration-200"
                  >
                    <h4 className="font-medium text-foreground mb-1">{bar.name}</h4>
                    {bar.category && (
                      <span className="text-xs text-accent font-medium">{bar.category}</span>
                    )}
                    {bar.address && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{bar.address}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">{stats?.total ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Total Bars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">{stats?.categories ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">{stats?.rooftop ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Rooftop Bars</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
