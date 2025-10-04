import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { NecronButton } from "@/components/NecronButton";
import { DashboardStats } from "@/components/DashboardStats";
import { Database, Brain, Network, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/explorer?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      <Hero onSearch={handleSearch} />

      {/* Dashboard Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-primary glow-text mb-4">
            SYSTEM OVERVIEW
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analytics and insights from our space biology research database
          </p>
        </div>
        
        <DashboardStats />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-primary glow-text mb-4">
            CORE SYSTEMS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced tools for exploring and analyzing space biology research
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="circuit-frame bg-card p-8 text-center space-y-4 hover:bg-card/80 transition-all group">
            <Database className="w-12 h-12 text-primary mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-mono">Publication Explorer</h3>
            <p className="text-muted-foreground text-sm">
              Search and filter 608+ NASA bioscience publications with advanced filtering and detailed summaries
            </p>
            <NecronButton onClick={() => navigate("/explorer")} className="w-full">
              Explore Database
              <ArrowRight className="w-4 h-4 ml-2" />
            </NecronButton>
          </div>

          <div className="circuit-frame bg-card p-8 text-center space-y-4 hover:bg-card/80 transition-all group">
            <Brain className="w-12 h-12 text-accent mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-mono">AI Assistant</h3>
            <p className="text-muted-foreground text-sm">
              Chat with an AI expert about space biology research, findings, and specific publications
            </p>
            <NecronButton onClick={() => navigate("/assistant")} className="w-full">
              Start Chatting
              <ArrowRight className="w-4 h-4 ml-2" />
            </NecronButton>
          </div>

          <div className="circuit-frame bg-card p-8 text-center space-y-4 hover:bg-card/80 transition-all group">
            <Network className="w-12 h-12 text-primary mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-mono">Knowledge Graph</h3>
            <p className="text-muted-foreground text-sm">
              Visualize research connections and explore relationships between publications interactively
            </p>
            <NecronButton onClick={() => navigate("/knowledge")} className="w-full">
              View Graph
              <ArrowRight className="w-4 h-4 ml-2" />
            </NecronButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            SPACE BIOLOGY KNOWLEDGE ENGINE © 2024
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by NASA Bioscience Research Data
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
