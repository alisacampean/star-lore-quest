import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { supabase } from "@/integrations/supabase/client";
import { GraphNode, GraphLink } from "@/types/publication";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeGraphProps {
  selectedPublicationId?: string | null;
}

export const KnowledgeGraph = ({ selectedPublicationId }: KnowledgeGraphProps) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const graphRef = useRef<any>();

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (selectedPublicationId && graphRef.current) {
      const node = graphData.nodes.find(n => n.id === selectedPublicationId);
      if (node) {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(3, 1000);
      }
    }
  }, [selectedPublicationId, graphData.nodes]);

  const loadGraphData = async () => {
    try {
      setIsLoading(true);

      // Fetch publications (limit to first 100 for performance)
      const { data: pubs, error: pubError } = await supabase
        .from("publications")
        .select("id, title, year, research_area")
        .limit(100);

      if (pubError) {
        console.error("Error fetching publications:", pubError);
        toast.error("Failed to load publications");
        // Create mock data for demo purposes
        const mockPubs = Array.from({ length: 50 }, (_, i) => ({
          id: `pub-${i}`,
          title: `Publication ${i + 1}`,
          year: 2000 + Math.floor(Math.random() * 24),
          research_area: ["Microgravity", "Radiation", "Plant Biology"][Math.floor(Math.random() * 3)]
        }));
        
        const mockConnections = Array.from({ length: 80 }, (_, i) => ({
          source_publication_id: `pub-${Math.floor(Math.random() * 50)}`,
          target_publication_id: `pub-${Math.floor(Math.random() * 50)}`,
          connection_type: "related",
          strength: Math.random() * 3 + 1
        })).filter(c => c.source_publication_id !== c.target_publication_id);

        const nodes: GraphNode[] = mockPubs.map((pub) => ({
          id: pub.id,
          title: pub.title,
          year: pub.year,
          research_area: pub.research_area,
          val: 5,
        }));

        const links: GraphLink[] = mockConnections.map((conn) => ({
          source: conn.source_publication_id,
          target: conn.target_publication_id,
          type: conn.connection_type,
          strength: conn.strength,
        }));

        setGraphData({ nodes, links });
        setIsLoading(false);
        return;
      }

      // Fetch connections
      const pubIds = pubs?.map(p => p.id) || [];
      const { data: connections, error: connError } = await supabase
        .from("publication_connections")
        .select("*")
        .in("source_publication_id", pubIds)
        .in("target_publication_id", pubIds);

      if (connError) {
        console.error("Error fetching connections:", connError);
      }

      // Transform to graph format
      const nodes: GraphNode[] = (pubs || []).map((pub) => ({
        id: pub.id,
        title: pub.title,
        year: pub.year || undefined,
        research_area: pub.research_area || undefined,
        val: 5,
      }));

      const links: GraphLink[] = (connections || []).map((conn) => ({
        source: conn.source_publication_id,
        target: conn.target_publication_id,
        type: conn.connection_type,
        strength: conn.strength || 1,
      }));

      setGraphData({ nodes, links });
      toast.success(`Loaded ${nodes.length} publications with ${links.length} connections`);
    } catch (error) {
      console.error("Failed to load graph data:", error);
      toast.error("Failed to load knowledge graph");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-card circuit-frame">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-mono">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="circuit-frame bg-card overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-background/90 p-3 border border-border">
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Publications ({graphData.nodes.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-accent" />
            <span>Connections ({graphData.links.length})</span>
          </div>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={800}
        height={600}
        nodeLabel={(node: any) => node.title}
        nodeColor={(node: any) =>
          node.id === selectedPublicationId ? "hsl(var(--accent))" : "hsl(var(--primary))"
        }
        nodeRelSize={5}
        linkColor={() => "hsl(var(--accent))"}
        linkWidth={(link: any) => (link.strength || 1) * 2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="hsl(var(--card))"
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px monospace`;
          ctx.fillStyle = node.id === selectedPublicationId
            ? "hsl(180 100% 50%)"
            : "hsl(150 100% 50%)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fill();

          if (node.id === selectedPublicationId) {
            ctx.shadowColor = "hsl(180 100% 50%)";
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "hsl(150 100% 95%)";
          if (globalScale > 2) {
            ctx.fillText(label.substring(0, 20) + "...", node.x, node.y + 10);
          }
        }}
      />
    </div>
  );
};
