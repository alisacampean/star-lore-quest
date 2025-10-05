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

  // Handle search - clears filters
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Clear all filters when searching
      setFilters({
        yearRange: [null, null],
        organisms: [],
        researchArea: [],
        experimentType: [],
      });
    }
  };

  // Handle filter change - clears search
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Check if any filter is active
    const hasActiveFilters = 
      newFilters.yearRange[0] !== null || 
      newFilters.yearRange[1] !== null ||
      newFilters.organisms.length > 0 ||
      newFilters.researchArea.length > 0 ||
      newFilters.experimentType.length > 0;
    
    if (hasActiveFilters) {
      setSearchQuery("");
    }
  };

  // Fetch publications from database
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ["publications", searchQuery, filters],
    queryFn: async () => {
      let query = supabase.from("publications").select("*");

      // Apply search filter across multiple fields
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,authors.ilike.%${searchQuery}%`);
      }

      // Apply year range filter
      if (filters.yearRange[0]) {
        query = query.gte("year", filters.yearRange[0]);
      }
      if (filters.yearRange[1]) {
        query = query.lte("year", filters.yearRange[1]);
      }

      // Apply organism filter with synonyms and case-insensitive matching
      if (filters.organisms.length > 0) {
        const ORGANISM_SYNONYMS: Record<string, string[]> = {
          "Humans": ["human", "homo sapiens"],
          "Mice": ["mouse", "mice", "murine", "mus musculus"],
          "Rats": ["rat", "rattus"],
          "C. elegans": ["c. elegans", "caenorhabditis elegans"],
          "Drosophila": ["drosophila", "fruit fly", "d. melanogaster", "drosophila melanogaster"],
          "Plants": ["plant", "arabidopsis", "zea mays", "oryza", "glycine max"],
          "Bacteria": ["bacteria", "bacterium", "e. coli", "escherichia coli", "bacillus"],
          "Yeast": ["yeast", "saccharomyces cerevisiae"],
          "Other": []
        };
        const organismConditions = filters.organisms
          .flatMap(org => (ORGANISM_SYNONYMS[org] && ORGANISM_SYNONYMS[org].length > 0) ? ORGANISM_SYNONYMS[org] : [org])
          .map(s => `organism.ilike.%${s}%`)
          .join(',');
        if (organismConditions) {
          query = query.or(organismConditions);
        }
      }

      // Apply research area filter with synonyms and case-insensitive matching
      if (filters.researchArea.length > 0) {
        const AREA_SYNONYMS: Record<string, string[]> = {
          "Microgravity Effects": ["microgravity", "spaceflight", "space flight", "weightlessness", "gravity unloading"],
          "Radiation Biology": ["radiation", "cosmic radiation", "ionizing radiation", "space radiation"],
          "Life Support": ["life support", "eclss", "environmental control", "closed-loop"],
          "Plant Biology": ["plant", "botany", "crop"],
          "Neuroscience": ["neuro", "brain", "cns"],
          "Cardiovascular": ["cardio", "heart", "vascular"],
          "Bone & Muscle": ["bone", "muscle", "skeletal", "osteoporosis", "atrophy"],
          "Immunology": ["immune", "immunology", "inflammation"],
          "Genetics": ["genetic", "genomics", "gene", "transcriptomic"],
          "Other": []
        };
        const areaConditions = filters.researchArea
          .flatMap(a => (AREA_SYNONYMS[a] && AREA_SYNONYMS[a].length > 0) ? AREA_SYNONYMS[a] : [a])
          .map(s => `research_area.ilike.%${s}%`)
          .join(',');
        if (areaConditions) {
          query = query.or(areaConditions);
        }
      }

      // Apply experiment type filter with synonyms and case-insensitive matching
      if (filters.experimentType.length > 0) {
        const TYPE_SYNONYMS: Record<string, string[]> = {
          "ISS Mission": ["iss", "international space station", "space station", "mission"],
          "Space Shuttle": ["space shuttle", "sts"],
          "Ground Analog": ["ground analog", "bed rest", "hindlimb unloading", "hind limb unloading"],
          "Parabolic Flight": ["parabolic flight", "parabola", "parabolic"],
          "Laboratory Study": ["laboratory", "in vitro", "in vivo", "bench"],
          "Field Study": ["field study", "fieldwork", "observational"]
        };
        const typeConditions = filters.experimentType
          .flatMap(t => (TYPE_SYNONYMS[t] && TYPE_SYNONYMS[t].length > 0) ? TYPE_SYNONYMS[t] : [t])
          .map(s => `experiment_type.ilike.%${s}%`)
          .join(',');
        if (typeConditions) {
          query = query.or(typeConditions);
        }
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
    const limit = 5; // Keep small to avoid function timeouts
    let offset = 0;
    let total = 0;
    let done = false;
    let firstRun = true;

    const toastId = toast.loading("Starting import... This may take several minutes. Please keep this tab open.", {
      duration: Infinity,
    });

    try {
      while (!done) {
        const { data, error } = await supabase.functions.invoke("import-publications", {
          body: { offset, limit, reset: firstRun },
        });

        if (error) {
          throw new Error(error.message || "Edge Function error");
        }

        total = data?.total ?? total;
        offset = data?.nextOffset ?? offset + limit;
        done = Boolean(data?.done);
        firstRun = false;

        // Lightweight progress feedback
        toast.message(`Imported ${Math.min(offset, total)} of ${total}`);

        // Brief pause between batches to reduce rate limiting
        await new Promise((r) => setTimeout(r, 500));
      }

      toast.dismiss(toastId);
      toast.success(`Import complete: ${offset}/${total} publications.`);
      setTimeout(() => window.location.reload(), 1500); // Refresh to show new data
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
            onSearch={handleSearch} 
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
            <PublicationFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
                  {!searchQuery && (filters.organisms.length > 0 || filters.researchArea.length > 0 || filters.experimentType.length > 0 || filters.yearRange[0] || filters.yearRange[1]) && " (filtered)"}
                </div>
                <div className="grid gap-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} highlightQuery={searchQuery} />
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
