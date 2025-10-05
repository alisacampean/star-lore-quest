import { Publication } from "@/types/publication";
import { Calendar, User, Microscope, ExternalLink, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NecronButton } from "./NecronButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface PublicationCardProps {
  publication: Publication;
  highlightQuery?: string;
}

export const PublicationCard = ({ publication, highlightQuery }: PublicationCardProps) => {
  const navigate = useNavigate();
  const displayLink = publication.link || publication.publication_url;

  const handleAskAI = () => {
    navigate('/assistant', { state: { question: `Tell me about: ${publication.title}` } });
  };

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlight = (text?: string) => {
    if (!text) return null;
    if (!highlightQuery || highlightQuery.trim().length < 2) return text;
    const pattern = new RegExp(`(${escapeRegExp(highlightQuery)})`, "ig");
    return text.split(pattern).map((part, i) =>
      pattern.test(part) ? (
        <mark key={i} className="bg-primary/20 text-foreground rounded px-1">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="circuit-frame bg-card p-6 space-y-4 hover:bg-card/80 transition-all">
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-mono text-primary">
          {highlight(publication.title) || publication.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {publication.year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{publication.year}</span>
            </div>
          )}
          {publication.authors && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="line-clamp-1">{highlight(publication.authors.split(',')[0])}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {publication.research_area && (
            <Badge variant="outline" className="border-primary/50 text-primary">
              {publication.research_area}
            </Badge>
          )}
          {publication.organism && (
            <Badge variant="outline" className="border-accent/50 text-accent">
              {publication.organism}
            </Badge>
          )}
        </div>
        
        {/* Summary Section */}
        {publication.abstract ? (
          <div className="space-y-2 pt-2 border-t border-primary/20">
            <h4 className="text-xs font-bold font-mono text-accent uppercase">Summary</h4>
            <p className="text-sm text-foreground/80 line-clamp-4">
              {highlight(publication.abstract) || publication.abstract}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic pt-2 border-t border-primary/20">
            No summary available for this publication.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {displayLink && (
          <NecronButton
            size="sm"
            variant="primary"
            className="flex-1"
            onClick={() => window.open(displayLink, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Publication
          </NecronButton>
        )}
        <NecronButton
          size="sm"
          variant="ghost"
          className={displayLink ? "" : "w-full"}
          onClick={handleAskAI}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask AI
        </NecronButton>
      </div>
    </div>
  );
};
