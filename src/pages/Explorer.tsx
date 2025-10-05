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

  // Mock data for demonstration
  const mockPublications: Publication[] = Array.from({ length: 20 }, (_, i) => ({
    id: `pub-${i}`,
    title: `Space Biology Research Publication ${i + 1}: Effects of Microgravity on ${["Cellular Structure", "Gene Expression", "Protein Synthesis", "Bone Density", "Muscle Atrophy"][i % 5]}`,
    abstract: `This comprehensive study examines the effects of prolonged microgravity exposure on biological systems. Our findings reveal significant changes in ${["cellular metabolism", "gene regulation", "protein pathways", "skeletal structure", "muscular tissue"][i % 5]} under space conditions. These results have important implications for long-duration space missions.`,
    year: 2000 + Math.floor(i / 2),
    authors: `${["Smith, J.", "Johnson, A.", "Williams, R.", "Brown, M.", "Davis, K."][i % 5]} et al.`,
    research_area: ["Microgravity Effects", "Radiation Biology", "Plant Biology", "Neuroscience", "Cardiovascular"][i % 5],
    organism: ["Humans", "Mice", "Plants", "C. elegans", "Drosophila"][i % 5],
    experiment_type: ["ISS Mission", "Space Shuttle", "Ground Analog", "Parabolic Flight", "Laboratory Study"][i % 5],
    publication_url: `https://ntrs.nasa.gov/citations/${20240000 + i}`,
    link: `https://ntrs.nasa.gov/citations/${20240000 + i}`,
  }));

  // Fetch publications count
  const { data: count } = useQuery({
    queryKey: ["publications-count"],
    queryFn: async () => {
      if (!supabase) {
        return 608; // Mock count when no database
      }
      
      const { count, error } = await supabase
        .from("publications")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("Error fetching count:", error);
        return 608; // Mock count
      }
      return count || 608;
    },
  });

  // Apply filters and search to publications
  const filteredPublications = mockPublications.filter((pub) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        pub.title.toLowerCase().includes(query) ||
        pub.abstract?.toLowerCase().includes(query) ||
        pub.authors?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Year range filter
    if (filters.yearRange[0] && pub.year && pub.year < filters.yearRange[0]) {
      return false;
    }
    if (filters.yearRange[1] && pub.year && pub.year > filters.yearRange[1]) {
      return false;
    }

    // Organism filter
    if (filters.organisms.length > 0 && pub.organism) {
      if (!filters.organisms.includes(pub.organism)) return false;
    }

    // Research area filter
    if (filters.researchArea.length > 0 && pub.research_area) {
      if (!filters.researchArea.includes(pub.research_area)) return false;
    }

    // Experiment type filter
    if (filters.experimentType.length > 0 && pub.experiment_type) {
      if (!filters.experimentType.includes(pub.experiment_type)) return false;
    }

    return true;
  });

  const publications = filteredPublications;
  const isLoading = false;

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
      toast.loading("Importing publications from CSV...");
      const response = await supabase.functions.invoke("import-publications");
      
      if (response.error) {
        toast.error(`Import failed: ${response.error.message}`);
      } else {
        toast.success(response.data.message || "Publications imported successfully!");
        window.location.reload(); // Refresh to show new data
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
