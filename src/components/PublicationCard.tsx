import { Publication } from "@/types/publication";
import { Calendar, User, Microscope, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NecronButton } from "./NecronButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard = ({ publication }: PublicationCardProps) => {
  const displayLink = publication.link || publication.publication_url;
  
  return (
    <div className="circuit-frame bg-card p-6 space-y-4 hover:bg-card/80 transition-all">
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-mono text-primary">
          {publication.title}
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
              <span className="line-clamp-1">{publication.authors.split(',')[0]}</span>
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
              {publication.abstract}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic pt-2 border-t border-primary/20">
            No summary available for this publication.
          </p>
        )}
      </div>

      {displayLink && (
        <NecronButton
          size="sm"
          variant="primary"
          className="w-full"
          onClick={() => window.open(displayLink, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Full Publication
        </NecronButton>
      )}
    </div>
  );
};
