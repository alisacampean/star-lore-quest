import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Publication } from "@/types/publication";
import { PublicationCard } from "@/components/PublicationCard";
import { PublicationFilters } from "@/components/PublicationFilters";
import { SearchBar } from "@/components/SearchBar";
import { NecronButton } from "@/components/NecronButton";
import { Database, Download, Loader2, Home, Brain, Network } from "lucide-react";
import { toast } from "sonner";

const Explorer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    yearRange: [null, null] as [number | null, number | null],
    organisms: [] as string[],
    researchArea: [] as string[],
    experimentType: [] as string[],
  });

  // Fetch publications from database
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ["publications", searchQuery, filters],
    queryFn: async () => {
      let query = supabase.from("publications").select("*");

      // Apply search filter
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      // Apply year range filter
      if (filters.yearRange[0]) {
        query = query.gte("year", filters.yearRange[0]);
      }
      if (filters.yearRange[1]) {
        query = query.lte("year", filters.yearRange[1]);
      }

      // Apply organism filter
      if (filters.organisms.length > 0) {
        query = query.in("organism", filters.organisms);
      }

      // Apply research area filter
      if (filters.researchArea.length > 0) {
        query = query.in("research_area", filters.researchArea);
      }

      // Apply experiment type filter
      if (filters.experimentType.length > 0) {
        query = query.in("experiment_type", filters.experimentType);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(100);

      if (error) {
        console.error("Error fetching publications:", error);
        toast.error("Failed to fetch publications");
        return [];
      }

      return data as Publication[];
    },
  });

  // Fetch publications count
  const { data: count } = useQuery({
    queryKey: ["publications-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("publications")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("Error fetching count:", error);
        return 0;
      }
      return count || 0;
    },
  });

  useEffect(() => {
    if (initialQuery) {
      toast.info(`Searching for: "${initialQuery}"`);
    }
  }, [initialQuery]);

  const handleExport = () => {
    toast.success("Export functionality coming soon!");
  };

  const handleImport = async () => {
    try {
      const toastId = toast.loading("Starting import with AI summary generation... This will take 10-15 minutes for all publications.", {
        duration: Infinity,
      });
      
      const response = await supabase.functions.invoke("import-publications");
      
      toast.dismiss(toastId);
      
      if (response.error) {
        toast.error(`Import failed: ${response.error.message}`);
      } else {
        toast.success(response.data.message || "Publications imported successfully with AI summaries!");
        setTimeout(() => window.location.reload(), 2000); // Refresh to show new data
      }
    } catch (error) {
      toast.error("Failed to import publications");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/30 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold font-mono text-primary glow-text">
              PUBLICATION EXPLORER
            </h1>
            <div className="flex gap-2">
              <NecronButton onClick={() => navigate("/")} size="sm" variant="ghost">
                <Home className="w-4 h-4 mr-2" />
                Home
              </NecronButton>
              <NecronButton onClick={() => navigate("/assistant")} size="sm" variant="ghost">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </NecronButton>
              <NecronButton onClick={() => navigate("/knowledge")} size="sm" variant="ghost">
                <Network className="w-4 h-4 mr-2" />
                Knowledge Graph
              </NecronButton>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-mono">{count || 608} publications indexed</span>
            </div>
            <NecronButton onClick={handleExport} size="sm" variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </NecronButton>
            <NecronButton onClick={handleImport} size="sm" variant="primary">
              <Database className="w-4 h-4 mr-2" />
              Import CSV Data
            </NecronButton>
          </div>

          <SearchBar 
            onSearch={setSearchQuery} 
            initialValue={searchQuery}
            placeholder="Search by title, abstract, author..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <PublicationFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Publications Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground font-mono">Loading publications...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground font-mono">
                  Showing {publications.length} results
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                <div className="grid gap-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
