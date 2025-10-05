import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIChat } from "@/components/AIChat";
import { NecronButton } from "@/components/NecronButton";
import { Home, Database, Network, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Assistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Handle pre-populated question from navigation state
  useEffect(() => {
    if (location.state?.question) {
      setSelectedQuestion(location.state.question);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/30 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold font-mono text-primary glow-text">
              AI ASSISTANT
            </h1>
            <div className="flex gap-2">
              <NecronButton onClick={() => navigate("/")} size="sm" variant="ghost">
                <Home className="w-4 h-4 mr-2" />
                Home
              </NecronButton>
              <NecronButton onClick={() => navigate("/explorer")} size="sm" variant="ghost">
                <Database className="w-4 h-4 mr-2" />
                Explorer
              </NecronButton>
              <NecronButton onClick={() => navigate("/knowledge")} size="sm" variant="ghost">
                <Network className="w-4 h-4 mr-2" />
                Knowledge Graph
              </NecronButton>
            </div>
          </div>

          <Alert className="bg-card border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm font-mono">
              Ask questions about space biology, microgravity effects, radiation studies, or specific research areas. 
              The AI will help you explore our publication database and understand complex scientific concepts.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AIChat selectedQuestion={selectedQuestion} onQuestionHandled={() => setSelectedQuestion(null)} />

          {/* Suggested Questions */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold font-mono text-accent">SUGGESTED QUESTIONS</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "What are the main effects of microgravity on human cells?",
                "How does radiation affect astronauts during long missions?",
                "What research has been done on plant growth in space?",
                "Tell me about bone density loss in microgravity",
                "What organisms have been studied on the ISS?",
                "How does the immune system change in space?",
              ].map((question, index) => (
                <button
                  key={index}
                  className="circuit-frame bg-card p-4 text-left hover:bg-card/80 transition-all text-sm group"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <p className="text-foreground/80 group-hover:text-foreground">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
