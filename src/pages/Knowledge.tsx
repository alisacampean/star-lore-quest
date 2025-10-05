import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { NecronButton } from "@/components/NecronButton";
import { SearchBar } from "@/components/SearchBar";
import { Home, Database, Brain, Info, Maximize2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Publication } from "@/types/publication";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Knowledge = () => {
  const navigate = useNavigate();
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchQuery, setSelectedSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const { data: searchResults = [] } = useQuery({
    queryKey: ["publication-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,authors.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data as Publication[];
    },
    enabled: searchQuery.length > 0,
  });

  const { data: selectedPubs = [] } = useQuery({
    queryKey: ["selected-publications", selectedPublications],
    queryFn: async () => {
      if (selectedPublications.length === 0) return [];
      
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .in("id", selectedPublications);

      if (error) throw error;
      return data as Publication[];
    },
    enabled: selectedPublications.length > 0,
  });

  const addPublication = (id: string) => {
    if (!selectedPublications.includes(id)) {
      setSelectedPublications([...selectedPublications, id]);
    }
    setSearchQuery("");
  };

  const removePublication = (id: string) => {
    setSelectedPublications(selectedPublications.filter(pubId => pubId !== id));
  };

  const loadAllPublications = async () => {
    try {
      const { data, error } = await supabase
        .from("publications")
        .select("id")
        .limit(100); // Limit to prevent overload

      if (error) throw error;
      if (data) {
        setSelectedPublications(data.map(pub => pub.id));
        toast.success(`Added ${data.length} publications to graph`);
      }
    } catch (error) {
      console.error("Failed to load all publications:", error);
      toast.error("Failed to load publications");
    }
  };

  const clearAllPublications = () => {
    setSelectedPublications([]);
    toast.success("Cleared all publications from graph");
  };

  // Filter selected publications by search query
  const filteredSelectedPubs = selectedPubs.filter(pub => {
    if (!selectedSearchQuery.trim()) return true;
    const query = selectedSearchQuery.toLowerCase();
    return (
      pub.title.toLowerCase().includes(query) ||
      pub.abstract?.toLowerCase().includes(query) ||
      pub.research_area?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/30 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold font-mono text-primary glow-text">
              KNOWLEDGE GRAPH
            </h1>
            <div className="flex gap-2">
              <NecronButton onClick={() => navigate("/")} size="sm" variant="ghost">
                <Home className="w-4 h-4 mr-2" />
                Home
              </NecronButton>
              <NecronButton onClick={() => navigate("/explorer")} size="sm" variant="ghost">
                <Database className="w-4 h-4 mr-2" />
                Explorer
              </NecronButton>
              <NecronButton onClick={() => navigate("/assistant")} size="sm" variant="ghost">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </NecronButton>
            </div>
          </div>

          <Alert className="bg-card border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm font-mono">
              Search and add publications to visualize relationships. 
              Click on nodes to open publications. Related topics are automatically connected.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-6">
          {/* Left Panel - Search & Add */}
          <div className="space-y-4">
            <div className="circuit-frame bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-mono text-accent">
                  ADD PUBLICATIONS
                </h3>
                <NecronButton 
                  onClick={loadAllPublications} 
                  size="sm" 
                  variant="secondary"
                >
                  Add All
                </NecronButton>
              </div>
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Search to add..."
                initialValue={searchQuery}
              />
              
              {searchQuery && (
                <ScrollArea className="h-[400px] mt-4">
                  <div className="space-y-2">
                    {searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No results found
                      </p>
                    ) : (
                      searchResults.map((pub) => (
                        <div
                          key={pub.id}
                          className="p-3 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => addPublication(pub.id)}
                        >
                          <p className="text-sm font-mono text-foreground line-clamp-2">
                            {pub.title}
                          </p>
                          {pub.year && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {pub.year}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Center - Graph */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-mono text-accent">
                  RESEARCH NETWORK
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <NecronButton onClick={toggleFullscreen} size="sm" variant="secondary">
                <Maximize2 className="w-4 h-4 mr-2" />
                {isFullscreen ? "Exit" : "Fullscreen"}
              </NecronButton>
            </div>

            <KnowledgeGraph selectedPublicationIds={selectedPublications} />
          </div>

          {/* Right Panel - Selected Publications */}
          <div className="space-y-4">
            <div className="circuit-frame bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-mono text-accent">
                  SELECTED ({selectedPublications.length})
                </h3>
                <NecronButton 
                  onClick={clearAllPublications} 
                  size="sm" 
                  variant="secondary"
                  disabled={selectedPublications.length === 0}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  Clear All
                </NecronButton>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={selectedSearchQuery}
                  onChange={(e) => setSelectedSearchQuery(e.target.value)}
                  placeholder="Filter selected..."
                  className="w-full px-3 py-2 bg-input border border-primary/30 text-foreground placeholder:text-muted-foreground text-sm font-mono"
                />
              </div>
              
              <ScrollArea className="h-[450px]">
                <div className="space-y-2">
                  {selectedPubs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No publications selected.
                      <br />
                      Search and click to add.
                    </p>
                  ) : filteredSelectedPubs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No publications match your filter.
                    </p>
                  ) : (
                    filteredSelectedPubs.map((pub) => (
                      <div
                        key={pub.id}
                        className="p-3 border border-border group relative"
                      >
                        <button
                          onClick={() => removePublication(pub.id)}
                          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-foreground hover:text-primary line-clamp-3 pr-8 block"
                        >
                          {pub.title}
                        </a>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pub.year && (
                            <Badge variant="outline" className="text-xs">
                              {pub.year}
                            </Badge>
                          )}
                          {pub.research_area && (
                            <Badge variant="secondary" className="text-xs">
                              {pub.research_area}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
