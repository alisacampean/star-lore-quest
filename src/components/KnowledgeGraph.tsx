import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { supabase } from "@/integrations/supabase/client";
import { GraphNode, GraphLink, Publication } from "@/types/publication";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeGraphProps {
  selectedPublicationIds: string[];
}

export const KnowledgeGraph = ({ selectedPublicationIds }: KnowledgeGraphProps) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);
  const graphRef = useRef<any>();

  useEffect(() => {
    loadGraphData();
  }, [selectedPublicationIds]);

  const loadGraphData = async () => {
    if (selectedPublicationIds.length === 0) {
      setGraphData({ nodes: [], links: [] });
      setPublications([]);
      return;
    }

    try {
      setIsLoading(true);

      const { data: pubs, error } = await supabase
        .from("publications")
        .select("*")
        .in("id", selectedPublicationIds);

      if (error) throw error;
      if (!pubs) return;

      setPublications(pubs);

      const nodes: GraphNode[] = pubs.map((pub) => ({
        id: pub.id,
        title: pub.title,
        year: pub.year || undefined,
        research_area: pub.research_area || undefined,
        val: 5,
        link: pub.link,
      }));

      // Create connections based on shared attributes
      const links: GraphLink[] = [];
      for (let i = 0; i < pubs.length; i++) {
        for (let j = i + 1; j < pubs.length; j++) {
          const pub1 = pubs[i];
          const pub2 = pubs[j];
          let strength = 0;

          // Connect if same research area
          if (pub1.research_area && pub2.research_area && 
              pub1.research_area === pub2.research_area) {
            strength += 2;
          }

          // Connect if same organism
          if (pub1.organism && pub2.organism && 
              pub1.organism === pub2.organism) {
            strength += 1.5;
          }

          // Connect if same experiment type
          if (pub1.experiment_type && pub2.experiment_type && 
              pub1.experiment_type === pub2.experiment_type) {
            strength += 1;
          }

          // Connect if shared author (simple check)
          if (pub1.authors && pub2.authors) {
            const authors1 = pub1.authors.split(',').map(a => a.trim().toLowerCase());
            const authors2 = pub2.authors.split(',').map(a => a.trim().toLowerCase());
            const sharedAuthors = authors1.filter(a => authors2.includes(a));
            if (sharedAuthors.length > 0) {
              strength += sharedAuthors.length;
            }
          }

          if (strength > 0) {
            links.push({
              source: pub1.id,
              target: pub2.id,
              type: "related",
              strength: strength,
            });
          }
        }
      }

      setGraphData({ nodes, links });
      if (pubs.length > 0) {
        toast.success(`Graph updated: ${nodes.length} publications, ${links.length} connections`);
      }
    } catch (error) {
      console.error("Failed to load graph data:", error);
      toast.error("Failed to load knowledge graph");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card circuit-frame">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-mono">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card circuit-frame">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-mono">No publications selected</p>
          <p className="text-sm text-muted-foreground">Search and add publications to visualize</p>
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
        width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.5, 800) : 800}
        height={600}
        nodeLabel={(node: any) => node.title}
        nodeColor={() => "hsl(var(--primary))"}
        nodeRelSize={6}
        linkColor={(link: any) => {
          const strength = link.strength || 1;
          const opacity = Math.min(strength / 5, 1);
          return `hsla(var(--accent), ${opacity})`;
        }}
        linkWidth={(link: any) => Math.min((link.strength || 1) * 1.5, 6)}
        linkDirectionalParticles={(link: any) => Math.ceil((link.strength || 1) / 2)}
        linkDirectionalParticleSpeed={0.003}
        backgroundColor="hsl(var(--card))"
        onNodeClick={(node: any) => {
          if (node.link) {
            window.open(node.link, '_blank');
          }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 10 / globalScale;
          ctx.font = `${fontSize}px monospace`;
          
          // Draw node
          ctx.fillStyle = "hsl(150 100% 50%)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fill();

          // Add glow effect
          ctx.shadowColor = "hsl(150 100% 50%)";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw label if zoomed in
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "hsl(150 100% 95%)";
          if (globalScale > 1.5) {
            const maxLength = Math.floor(30 / globalScale * 2);
            const text = label.length > maxLength ? label.substring(0, maxLength) + "..." : label;
            ctx.fillText(text, node.x, node.y + node.val + 8);
          }
        }}
      />
    </div>
  );
};
