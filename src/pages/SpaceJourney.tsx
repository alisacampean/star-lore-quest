import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Dna, Beaker, Microscope, Orbit, Radiation, Satellite, Sprout, Rocket as RocketIcon, ArrowLeft, X, ExternalLink, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Publication } from "@/types/publication";
import { ScrollArea } from "@/components/ui/scroll-area";
import earthImg from "@/assets/earth.png";
import nebula1Img from "@/assets/nebula1.png";
import nebula2Img from "@/assets/nebula2.png";
import asteroid1Img from "@/assets/asteroid1.png";
import asteroid2Img from "@/assets/asteroid2.png";
import asteroid3Img from "@/assets/asteroid3.png";
import asteroid4Img from "@/assets/asteroid4.png";
import rocketImg from "@/assets/rocket.png";
import satelliteImg from "@/assets/satellite.png";

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
    icon: RocketIcon,
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
  const [selectedTopic, setSelectedTopic] = useState<typeof topics[0] | null>(null);
  const [topPublications, setTopPublications] = useState<Publication[]>([]);
  const [loadingPublications, setLoadingPublications] = useState(false);

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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 3;
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleTopicClick = async (topic: Topic) => {
    if (topic.id === "start") return;
    
    setSelectedTopic(topic);
    setLoadingPublications(true);
    
    try {
      // Define keywords for each topic
      const topicKeywords: Record<string, string[]> = {
        "microgravity": ["microgravity", "weightlessness", "unloading", "reduced gravity"],
        "radiation": ["radiation", "cosmic", "HZE", "ionizing"],
        "plant-biology": ["plant", "Arabidopsis", "root", "gravitropism", "photosynthesis"],
        "cellular": ["cellular", "cell", "gene expression", "molecular"],
        "genetics": ["genetic", "DNA", "gene", "chromosome", "epigenetic"],
        "neuroscience": ["neuroscience", "brain", "neuronal", "cognitive"],
        "biotechnology": ["biotechnology", "biotech", "pharmaceutical"],
        "satellite": ["satellite", "orbital", "ISS", "space station"]
      };

      const keywords = topicKeywords[topic.id] || [topic.title.toLowerCase()];
      
      // Build OR query for multiple keywords
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .or(keywords.map(kw => `title.ilike.%${kw}%`).join(','))
        .limit(3);
      
      if (error) throw error;
      setTopPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
      setTopPublications([]);
    } finally {
      setLoadingPublications(false);
    }
  };

  const closeDashboard = () => {
    setSelectedTopic(null);
    setTopPublications([]);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Dynamic background that transitions with scroll */}
      <div 
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: scrollProgress < 15 
            ? `linear-gradient(to right, 
                rgba(59, 130, 246, ${0.3 - scrollProgress * 0.02}) 0%, 
                rgba(14, 165, 233, ${0.2 - scrollProgress * 0.015}) 25%,
                rgba(10, 14, 39, ${0.9 + scrollProgress * 0.01}) 50%,
                #000000 100%)`
            : '#000000'
        }}
      />
      
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

      {/* Earth - Fades out as you scroll */}
      <div 
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-700"
        style={{
          width: '60vh',
          height: '60vh',
          marginLeft: '-30vh',
          opacity: Math.max(0, 1 - scrollProgress / 10)
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

      {/* Nebulas - Animated with better blending */}
      <div 
        className="fixed pointer-events-none z-10"
        style={{
          left: '30%',
          top: '20%',
          width: '800px',
          height: '800px',
          animation: 'float 20s ease-in-out infinite',
          mixBlendMode: 'screen',
          opacity: 0.15,
          filter: 'blur(8px)'
        }}
      >
        <img src={nebula1Img} alt="" className="w-full h-full object-contain" />
      </div>
      <div 
        className="fixed pointer-events-none z-10"
        style={{
          left: '60%',
          top: '50%',
          width: '700px',
          height: '700px',
          animation: 'float 25s ease-in-out infinite reverse',
          mixBlendMode: 'screen',
          opacity: 0.12,
          filter: 'blur(10px)'
        }}
      >
        <img src={nebula2Img} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Satellite next to Earth - fades with Earth */}
      <div 
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-700"
        style={{
          width: '15vh',
          height: '15vh',
          marginLeft: '35vh',
          marginTop: '-25vh',
          opacity: Math.max(0, 1 - scrollProgress / 10)
        }}
      >
        <img 
          src={satelliteImg} 
          alt="Satellite" 
          className="w-full h-full object-contain"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* Scrollable container - needed for absolute positioned asteroids */}
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
          {/* Asteroids - Scattered throughout space, left behind as you scroll */}
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '8%',
              top: '70%',
              width: '100px',
              height: '100px',
              animation: 'rotate 30s linear infinite, float 15s ease-in-out infinite'
            }}
          >
            <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-70" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '12%',
              top: '15%',
              width: '70px',
              height: '70px',
              animation: 'rotate 40s linear infinite reverse, float 20s ease-in-out infinite'
            }}
          >
            <img src={asteroid2Img} alt="" className="w-full h-full object-contain opacity-60" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '18%',
              top: '55%',
              width: '85px',
              height: '85px',
              animation: 'rotate 35s linear infinite, float 18s ease-in-out infinite'
            }}
          >
            <img src={asteroid3Img} alt="" className="w-full h-full object-contain opacity-65" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '25%',
              top: '25%',
              width: '60px',
              height: '60px',
              animation: 'rotate 28s linear infinite, float 16s ease-in-out infinite'
            }}
          >
            <img src={asteroid4Img} alt="" className="w-full h-full object-contain opacity-55" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '32%',
              top: '80%',
              width: '90px',
              height: '90px',
              animation: 'rotate 33s linear infinite reverse, float 17s ease-in-out infinite'
            }}
          >
            <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-60" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '40%',
              top: '20%',
              width: '75px',
              height: '75px',
              animation: 'rotate 38s linear infinite, float 19s ease-in-out infinite'
            }}
          >
            <img src={asteroid3Img} alt="" className="w-full h-full object-contain opacity-70" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '48%',
              top: '65%',
              width: '95px',
              height: '95px',
              animation: 'rotate 31s linear infinite reverse, float 14s ease-in-out infinite'
            }}
          >
            <img src={asteroid2Img} alt="" className="w-full h-full object-contain opacity-65" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '55%',
              top: '35%',
              width: '80px',
              height: '80px',
              animation: 'rotate 36s linear infinite, float 21s ease-in-out infinite'
            }}
          >
            <img src={asteroid4Img} alt="" className="w-full h-full object-contain opacity-60" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '63%',
              top: '75%',
              width: '70px',
              height: '70px',
              animation: 'rotate 29s linear infinite reverse, float 16s ease-in-out infinite'
            }}
          >
            <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-55" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '70%',
              top: '18%',
              width: '88px',
              height: '88px',
              animation: 'rotate 34s linear infinite, float 18s ease-in-out infinite'
            }}
          >
            <img src={asteroid3Img} alt="" className="w-full h-full object-contain opacity-68" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '77%',
              top: '60%',
              width: '92px',
              height: '92px',
              animation: 'rotate 37s linear infinite reverse, float 15s ease-in-out infinite'
            }}
          >
            <img src={asteroid2Img} alt="" className="w-full h-full object-contain opacity-62" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '84%',
              top: '30%',
              width: '78px',
              height: '78px',
              animation: 'rotate 32s linear infinite, float 20s ease-in-out infinite'
            }}
          >
            <img src={asteroid4Img} alt="" className="w-full h-full object-contain opacity-58" />
          </div>
          <div 
            className="absolute pointer-events-none z-15"
            style={{
              left: '90%',
              top: '70%',
              width: '85px',
              height: '85px',
              animation: 'rotate 30s linear infinite reverse, float 17s ease-in-out infinite'
            }}
          >
            <img src={asteroid1Img} alt="" className="w-full h-full object-contain opacity-64" />
          </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 circuit-frame bg-background/80 backdrop-blur-sm px-4 py-2 flex items-center gap-2 hover:bg-background/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono text-sm">Back to Home</span>
      </button>

      {/* Rocket (stays fixed on left side) */}
      <div 
        className="fixed z-40 left-32 top-1/2 -translate-y-1/2"
      >
        <div className="relative">
          {/* Engine trail that grows with scroll - positioned behind */}
          <div 
            className="absolute right-full top-1/2 -translate-y-1/2 h-8 bg-gradient-to-r from-orange-500 via-yellow-400 to-transparent"
            style={{
              width: `${scrollProgress * 4}px`,
              opacity: scrollProgress > 0 ? 0.8 : 0,
              filter: 'blur(5px)',
              marginRight: '-10px'
            }}
          />
          <img 
            src={rocketImg}
            alt="Rocket"
            className="w-48 h-48 object-contain relative z-10"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 15px rgba(236, 72, 153, 0.4))'
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
                onClick={() => handleTopicClick(topic)}
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

      {/* Topic Dashboard Panel */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="circuit-frame bg-card w-full max-w-2xl max-h-[80vh] m-4 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <selectedTopic.icon className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold font-mono text-primary">{selectedTopic.title}</h2>
              </div>
              <button
                onClick={closeDashboard}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loadingPublications ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : topPublications.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    Top 3 most relevant studies on {selectedTopic.title}
                  </p>
                   {topPublications.map((pub) => (
                    <div key={pub.id} className="circuit-frame bg-background/50 p-4 space-y-3">
                      <h3 className="font-bold text-primary line-clamp-2">{pub.title}</h3>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate('/assistant', { state: { question: `Tell me about: ${pub.title}` } })}
                          className="flex items-center gap-1 text-sm text-accent hover:text-primary transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" /> Ask AI
                        </button>
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors"
                        >
                          View Study <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-mono">
                    No publications found for this topic yet.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
