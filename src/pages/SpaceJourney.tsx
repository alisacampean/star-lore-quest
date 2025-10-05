import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Dna, Beaker, Microscope, Orbit, Radiation, Satellite, Sprout, Rocket, ArrowLeft } from "lucide-react";
import earthImg from "@/assets/earth.png";
import nebula1Img from "@/assets/nebula1.png";
import nebula2Img from "@/assets/nebula2.png";
import asteroid1Img from "@/assets/asteroid1.png";
import asteroid2Img from "@/assets/asteroid2.png";

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  position: number; // percentage from left (0-100)
  top: number; // percentage from top (0-100)
}

const topics: Topic[] = [
  {
    id: "start",
    title: "Begin Your Journey",
    description: "Scroll right to explore space biology research →",
    icon: Rocket,
    position: 5,
    top: 50
  },
  {
    id: "microgravity",
    title: "Microgravity Effects",
    description: "How reduced gravity affects biological systems",
    icon: Orbit,
    position: 20,
    top: 30
  },
  {
    id: "radiation",
    title: "Space Radiation",
    description: "Effects of cosmic radiation on DNA and cells",
    icon: Radiation,
    position: 35,
    top: 65
  },
  {
    id: "plant-biology",
    title: "Plant Biology",
    description: "Growth and adaptation in microgravity",
    icon: Sprout,
    position: 48,
    top: 25
  },
  {
    id: "cellular",
    title: "Cellular Mechanisms",
    description: "Molecular responses to spaceflight",
    icon: Microscope,
    position: 60,
    top: 70
  },
  {
    id: "genetics",
    title: "Genetics & DNA",
    description: "Genetic expression in space environments",
    icon: Dna,
    position: 72,
    top: 35
  },
  {
    id: "neuroscience",
    title: "Neuroscience",
    description: "Brain changes during spaceflight",
    icon: Brain,
    position: 82,
    top: 55
  },
  {
    id: "biotechnology",
    title: "Biotechnology",
    description: "Space biology applications",
    icon: Beaker,
    position: 90,
    top: 40
  },
  {
    id: "satellite",
    title: "Orbital Research",
    description: "Long-term space station studies",
    icon: Satellite,
    position: 95,
    top: 60
  }
];

export default function SpaceJourney() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = (scrollLeft / maxScroll) * 100;
      setScrollProgress(progress);

      // Find active topic based on scroll position
      const centerScroll = ((scrollLeft + container.clientWidth / 2) / container.scrollWidth) * 100;
      let closestTopic = topics[0];
      let minDistance = Math.abs(topics[0].position - centerScroll);

      topics.forEach(topic => {
        const distance = Math.abs(topic.position - centerScroll);
        if (distance < minDistance) {
          minDistance = distance;
          closestTopic = topic;
        }
      });

      if (minDistance < 10) {
        setActiveTopicId(closestTopic.id);
      } else {
        setActiveTopicId(null);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTopicClick = (topicId: string) => {
    if (topicId === "start") return;
    navigate(`/explorer?topic=${topicId}`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-[#0a0e27] via-[#0f1419] to-[#000000] overflow-hidden">
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-transparent to-transparent opacity-50" />
      
      {/* Stars background */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20px 30px, white, transparent),
              radial-gradient(2px 2px at 60px 70px, white, transparent),
              radial-gradient(1px 1px at 50px 50px, white, transparent),
              radial-gradient(1px 1px at 130px 80px, white, transparent),
              radial-gradient(2px 2px at 90px 10px, white, transparent),
              radial-gradient(1px 1px at 20px 90px, white, transparent),
              radial-gradient(1px 1px at 110px 30px, white, transparent),
              radial-gradient(2px 2px at 160px 60px, white, transparent)
            `,
            backgroundSize: '200px 100px',
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Earth - Fixed on the left */}
      <div 
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20"
        style={{
          width: '60vh',
          height: '60vh',
          marginLeft: '-30vh'
        }}
      >
        <img 
          src={earthImg} 
          alt="Earth" 
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.4))'
          }}
        />
      </div>

      {/* Nebulas - Animated */}
      <div 
        className="fixed opacity-20 pointer-events-none z-10"
        style={{
          left: '30%',
          top: '20%',
          width: '800px',
          height: '800px',
          animation: 'float 20s ease-in-out infinite'
        }}
      >
        <img src={nebula1Img} alt="" className="w-full h-full object-contain" />
      </div>
      <div 
        className="fixed opacity-15 pointer-events-none z-10"
        style={{
          left: '60%',
          top: '50%',
          width: '700px',
          height: '700px',
          animation: 'float 25s ease-in-out infinite reverse'
        }}
      >
        <img src={nebula2Img} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Asteroids - Animated */}
      <div 
        className="fixed pointer-events-none z-15"
        style={{
          left: '25%',
          top: '70%',
          width: '80px',
          height: '80px',
          animation: 'rotate 30s linear infinite, float 15s ease-in-out infinite'
        }}
      >
        <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-60" />
      </div>
      <div 
        className="fixed pointer-events-none z-15"
        style={{
          left: '50%',
          top: '15%',
          width: '60px',
          height: '60px',
          animation: 'rotate 40s linear infinite reverse, float 20s ease-in-out infinite'
        }}
      >
        <img src={asteroid2Img} alt="" className="w-full h-full object-contain opacity-50" />
      </div>
      <div 
        className="fixed pointer-events-none z-15"
        style={{
          left: '80%',
          top: '60%',
          width: '70px',
          height: '70px',
          animation: 'rotate 35s linear infinite, float 18s ease-in-out infinite'
        }}
      >
        <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-55" />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 circuit-frame bg-background/80 backdrop-blur-sm px-4 py-2 flex items-center gap-2 hover:bg-background/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-sm">Back to Home</span>
      </button>

      {/* Rocket (moves with scroll from Earth) */}
      <div 
        className="fixed z-40 transition-all duration-300"
        style={{
          left: `${20 + (scrollProgress * 6)}%`,
          top: '50%',
          transform: `translateY(-50%) rotate(-45deg) scale(${1 + scrollProgress / 100})`,
        }}
      >
        <div className="relative">
          <Rocket 
            className="w-20 h-20 text-primary"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))'
            }}
          />
          {/* Engine trail */}
          <div 
            className="absolute right-full top-1/2 -translate-y-1/2 h-3 bg-gradient-to-l from-accent via-primary to-transparent"
            style={{
              width: `${scrollProgress * 3}px`,
              opacity: scrollProgress > 0 ? 0.7 : 0,
              filter: 'blur(2px)'
            }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-64 h-2 bg-background/20 circuit-frame">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Wide content area */}
        <div className="relative h-full" style={{ width: '800vw' }}>
          {/* Topics scattered throughout */}
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isActive = activeTopicId === topic.id;
            const isStart = topic.id === "start";

            return (
              <div
                key={topic.id}
                className={`absolute cursor-pointer transition-all duration-500 ${
                  isActive ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  left: `${topic.position}%`,
                  top: `${topic.top}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleTopicClick(topic.id)}
              >
                {/* Glow effect */}
                <div 
                  className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${
                    isActive ? 'opacity-60' : 'opacity-30'
                  }`}
                  style={{
                    background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
                    width: '200px',
                    height: '200px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Icon container */}
                <div 
                  className={`relative circuit-frame bg-background/40 backdrop-blur-sm p-6 transition-all duration-300 ${
                    isActive ? 'bg-background/60' : ''
                  }`}
                >
                  <Icon 
                    className={`w-12 h-12 transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-primary'
                    }`}
                  />
                </div>

                {/* Info popup */}
                <div 
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="circuit-frame bg-background/90 backdrop-blur-md p-4">
                    <h3 className="font-mono font-bold text-lg mb-2 glow-text">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {topic.description}
                    </p>
                    {!isStart && (
                      <div className="text-xs font-mono text-accent">
                        Click to explore →
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Distance markers */}
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="absolute top-8 opacity-30"
              style={{
                left: `${(i + 1) * 11.11}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="text-xs font-mono text-muted-foreground">
                {(i + 1) * 100}km
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 text-center opacity-80">
        <p className="text-sm font-mono text-muted-foreground">
          Scroll horizontally to explore • Click topics to view publications
        </p>
      </div>
    </div>
  );
}
