import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NecronButton } from "./NecronButton";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to the Space Biology Knowledge Engine. I'm here to help you explore NASA bioscience research. Ask me anything about space biology, microgravity effects, radiation studies, or specific publications!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate AI response - in production, this would call your AI backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        "That's an interesting question about space biology! The effects of microgravity on biological systems have been studied extensively in various NASA missions.",
        "Based on the research in our database, there are several key findings related to that topic. Would you like me to point you to specific publications?",
        "Space biology research has shown fascinating adaptations of organisms in microgravity environments. This includes changes in cellular structure, gene expression, and metabolic processes.",
        "The ISS has been instrumental in advancing our understanding of how space affects living organisms. Many experiments have focused on muscle atrophy, bone density loss, and immune system changes.",
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="circuit-frame bg-card flex flex-col h-[600px]">
      <div className="p-4 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h3 className="font-bold font-mono text-accent">AI ASSISTANT</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded ${
                  message.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "bg-card border border-primary/30"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-card border border-primary/30 p-3 rounded">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-primary/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about space biology research..."
            className="bg-input border-primary/30 font-mono"
            disabled={isLoading}
          />
          <NecronButton
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="md"
          >
            <Send className="w-4 h-4" />
          </NecronButton>
        </div>
      </div>
    </div>
  );
};
