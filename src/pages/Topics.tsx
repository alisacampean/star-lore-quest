import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Dna, Beaker, Microscope, Orbit, Radiation, Satellite, Sprout } from "lucide-react";
import { NecronButton } from "@/components/NecronButton";

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  publications: number;
}

const topics: Topic[] = [
  {
    id: "microgravity",
    title: "Microgravity Effects",
    description: "Understanding how reduced gravity affects biological systems and cellular processes",
    icon: Orbit,
    color: "from-primary/20 to-accent/20",
    publications: 142
  },
  {
    id: "radiation",
    title: "Space Radiation",
    description: "Effects of cosmic radiation on DNA, cells, and organisms in space environments",
    icon: Radiation,
    color: "from-accent/20 to-primary/20",
    publications: 98
  },
  {
    id: "plant-biology",
    title: "Plant Biology",
    description: "Growth, development, and adaptation of plants in microgravity conditions",
    icon: Sprout,
    color: "from-primary/20 to-accent/20",
    publications: 87
  },
  {
    id: "cellular",
    title: "Cellular Mechanisms",
    description: "Molecular and cellular responses to spaceflight conditions",
    icon: Microscope,
    color: "from-accent/20 to-primary/20",
    publications: 123
  },
  {
    id: "genetics",
    title: "Genetics & DNA",
    description: "Genetic expression and mutations in space environments",
    icon: Dna,
    color: "from-primary/20 to-accent/20",
    publications: 76
  },
  {
    id: "neuroscience",
    title: "Neuroscience",
    description: "Brain and nervous system changes during spaceflight",
    icon: Brain,
    color: "from-accent/20 to-primary/20",
    publications: 54
  },
  {
    id: "biotechnology",
    title: "Biotechnology",
    description: "Applications of space biology for technology and medicine",
    icon: Beaker,
    color: "from-primary/20 to-accent/20",
    publications: 43
  },
  {
    id: "satellite",
    title: "Orbital Research",
    description: "Long-term studies conducted on space stations and satellites",
    icon: Satellite,
    color: "from-accent/20 to-primary/20",
    publications: 85
  }
];

export default function Topics() {
  const navigate = useNavigate();
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const handleTopicClick = (topicId: string) => {
    navigate(`/explorer?topic=${topicId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(var(--primary)) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, hsl(var(--accent)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "pulse-necron 3s ease-in-out infinite"
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center gap-4 mb-6">
            <NecronButton onClick={() => navigate('/')}>
              ← Back to Home
            </NecronButton>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold glow-text font-mono mb-4">
            RESEARCH TOPICS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore key areas of space biology research through interactive topic cards
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            const isHovered = hoveredTopic === topic.id;
            
            return (
              <div
                key={topic.id}
                className="group relative cursor-pointer"
                style={{
                  animation: `fade-in 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={() => setHoveredTopic(topic.id)}
                onMouseLeave={() => setHoveredTopic(null)}
                onClick={() => handleTopicClick(topic.id)}
              >
                <div 
                  className={`
                    relative h-64 p-6 circuit-frame
                    bg-gradient-to-br ${topic.color}
                    transition-all duration-500 ease-out
                    ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100'}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    absolute top-6 left-6 p-3 circuit-frame bg-background/50
                    transition-all duration-500
                    ${isHovered ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}
                  `}>
                    <Icon className={`w-8 h-8 ${isHovered ? 'text-accent' : 'text-primary'} transition-colors duration-300`} />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold mb-2 font-mono">
                      {topic.title}
                    </h3>
                    <p className={`
                      text-sm text-muted-foreground mb-3
                      transition-all duration-500
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}>
                      {topic.description}
                    </p>
                    <div className={`
                      inline-flex items-center gap-2 px-3 py-1 circuit-frame bg-background/30 text-xs font-mono
                      transition-all duration-500
                      ${isHovered ? 'opacity-100' : 'opacity-70'}
                    `}>
                      <span className="text-accent">{topic.publications}</span>
                      <span>Publications</span>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div 
                    className={`
                      absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10
                      transition-opacity duration-500
                      ${isHovered ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)'
                    }}
                  />
                </div>

                {/* Glow effect on hover */}
                {isHovered && (
                  <div 
                    className="absolute inset-0 -z-10 blur-xl opacity-50 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground font-mono">
            Click any topic to explore related publications
          </p>
        </div>
      </div>
    </div>
  );
}
