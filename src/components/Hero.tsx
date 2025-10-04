import { Brain, Database, Network } from "lucide-react";
import { SearchBar } from "./SearchBar";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-12 space-y-6">
          {/* Main title with glow effect */}
          <h1 className="text-5xl md:text-7xl font-bold glow-text font-mono mb-4">
            SPACE BIOLOGY
            <br />
            <span className="text-accent">KNOWLEDGE ENGINE</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore decades of NASA bioscience research with AI-powered insights
            and interactive knowledge graphs
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame">
              <Database className="w-5 h-5 text-primary" />
              <span className="text-sm font-mono">608+ Publications</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame">
              <Brain className="w-5 h-5 text-accent" />
              <span className="text-sm font-mono">AI Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame">
              <Network className="w-5 h-5 text-primary" />
              <span className="text-sm font-mono">Knowledge Graphs</span>
            </div>
          </div>
        </div>

        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
};
