import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { NecronButton } from "@/components/NecronButton";
import { Home, Database, Brain, Info, Maximize2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Knowledge = () => {
  const navigate = useNavigate();
  const [selectedPublication, setSelectedPublication] = useState<string | null>(null);
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
              This interactive graph visualizes relationships between publications. 
              Hover over nodes to see publication titles. Click and drag to explore connections.
              Lines show research relationships and citations between papers.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Graph Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-mono text-accent">
                RESEARCH NETWORK VISUALIZATION
              </h2>
              <p className="text-sm text-muted-foreground">
                Explore interconnected space biology research
              </p>
            </div>
            <NecronButton onClick={toggleFullscreen} size="sm" variant="secondary">
              <Maximize2 className="w-4 h-4 mr-2" />
              {isFullscreen ? "Exit" : "Fullscreen"}
            </NecronButton>
          </div>

          {/* Legend */}
          <div className="circuit-frame bg-card p-4">
            <div className="flex flex-wrap gap-6 text-sm font-mono">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span>Publication Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent" />
                <span>Selected/Highlighted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-accent" />
                <span>Research Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Active Flow</span>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="flex justify-center">
            <KnowledgeGraph selectedPublicationId={selectedPublication} />
          </div>

          {/* Info Panel */}
          <div className="circuit-frame bg-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-mono text-accent">
              GRAPH INSIGHTS
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono">Network Density</p>
                <p className="text-2xl font-bold text-primary">High</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono">Central Topics</p>
                <p className="text-lg text-foreground">Microgravity, Radiation, Genetics</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono">Time Span</p>
                <p className="text-lg text-foreground">1990 - 2024</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This knowledge graph represents decades of interconnected space biology research. 
              Stronger connections indicate more citations, shared authors, or related research topics. 
              The visualization helps identify research clusters, influential papers, and emerging trends in the field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
