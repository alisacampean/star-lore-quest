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
  return (
    <Dialog>
      <div className="circuit-frame bg-card p-6 space-y-4 hover:bg-card/80 transition-all">
        <div className="space-y-2">
          <h3 className="text-lg font-bold font-mono text-primary line-clamp-2">
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

          {publication.abstract && (
            <p className="text-sm text-foreground/80 line-clamp-3">
              {publication.abstract}
            </p>
          )}

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
        </div>

        <div className="flex gap-2">
          <DialogTrigger asChild>
            <NecronButton size="sm" variant="primary" className="flex-1">
              View Summary
            </NecronButton>
          </DialogTrigger>
          {publication.publication_url && (
            <NecronButton
              size="sm"
              variant="secondary"
              onClick={() => window.open(publication.publication_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </NecronButton>
          )}
        </div>
      </div>

      <DialogContent className="bg-card border-primary/30 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-primary">
            {publication.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {publication.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-mono">{publication.year}</span>
                </div>
              )}
              {publication.authors && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-mono">{publication.authors}</span>
                </div>
              )}
              {publication.experiment_type && (
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-primary" />
                  <span className="font-mono">{publication.experiment_type}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-accent font-mono">ABSTRACT</h4>
              <p className="text-foreground/90 leading-relaxed">
                {publication.abstract || "No abstract available."}
              </p>
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

            {publication.publication_url && (
              <NecronButton
                size="md"
                variant="primary"
                className="w-full"
                onClick={() => window.open(publication.publication_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Documentation
              </NecronButton>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
