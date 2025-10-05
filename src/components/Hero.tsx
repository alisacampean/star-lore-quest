import { Brain, Database, Network, Rocket } from "lucide-react";
import { SearchBar } from "./SearchBar";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleSpaceshipClick = () => {
    setIsLaunching(true);
    setTimeout(() => {
      navigate('/space-journey');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Spaceship Button */}
      <button
        onClick={handleSpaceshipClick}
        disabled={isLaunching}
        className={`
          fixed top-8 right-8 z-50 p-4 circuit-frame bg-card/80 hover:bg-card
          transition-all duration-300 hover:scale-110 group
          ${isLaunching ? 'animate-launch' : ''}
        `}
        style={{
          animation: isLaunching ? 'launch 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards' : 'none'
        }}
      >
        <Rocket className={`
          w-6 h-6 text-accent transition-all duration-300
          ${isLaunching ? 'animate-spin' : 'group-hover:rotate-[-45deg]'}
        `} />
        <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
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
            <div 
              onClick={() => navigate('/explorer')}
              className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame cursor-pointer hover:bg-card/70 transition-colors"
            >
              <Database className="w-5 h-5 text-primary" />
              <span className="text-sm font-mono">608+ Publications</span>
            </div>
            <div 
              onClick={() => navigate('/assistant')}
              className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame cursor-pointer hover:bg-card/70 transition-colors"
            >
              <Brain className="w-5 h-5 text-accent" />
              <span className="text-sm font-mono">AI Analysis</span>
            </div>
            <div 
              onClick={() => navigate('/knowledge')}
              className="flex items-center gap-2 bg-card/50 px-4 py-2 circuit-frame cursor-pointer hover:bg-card/70 transition-colors"
            >
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
