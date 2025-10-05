import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NecronButton } from "./NecronButton";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  selectedQuestion?: string | null;
  onQuestionHandled?: () => void;
}

export const AIChat = ({ selectedQuestion, onQuestionHandled }: AIChatProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "# Welcome! 👋\n\nI'm your **Space Biology Knowledge Engine** assistant. I can help you explore NASA bioscience research.\n\n**Ask me about:**\n- Microgravity effects on biological systems\n- Radiation studies and space health\n- Specific research publications\n- Organisms studied on the ISS\n- Any space biology topic!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  // Handle selected question from parent
  useEffect(() => {
    if (selectedQuestion) {
      setInput(selectedQuestion);
      onQuestionHandled?.();
    }
  }, [selectedQuestion, onQuestionHandled]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("No response body");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === "assistant") {
                  lastMsg.content = assistantContent;
                } else {
                  newMessages.push({ role: "assistant", content: assistantContent });
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
      setMessages(prev => prev.filter(m => m !== userMsg));
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
                {message.role === "assistant" ? (
                  <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none 
                    prose-headings:text-accent prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-4
                    prose-p:my-3 prose-p:leading-7 prose-p:text-white
                    prose-a:bg-primary/20 prose-a:text-primary prose-a:font-bold prose-a:px-2 prose-a:py-0.5 prose-a:rounded prose-a:no-underline hover:prose-a:bg-primary/30 prose-a:after:content-['_🔗']
                    prose-strong:text-primary prose-strong:font-bold
                    prose-em:text-white
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
                    prose-ul:my-3 prose-ul:space-y-2 prose-li:my-1 prose-li:text-white
                    prose-ol:my-3 prose-ol:space-y-2
                    text-white
                    [&_mark]:bg-primary/30 [&_mark]:text-primary [&_mark]:px-1 [&_mark]:rounded [&_mark]:font-semibold">
                    <ReactMarkdown
                      components={{
                        // Convert ==highlight== to <mark> tags
                        p: ({ children }) => {
                          if (typeof children === 'string') {
                            const parts = children.split(/(==.*?==)/g);
                            return (
                              <p>
                                {parts.map((part, i) => {
                                  if (part.startsWith('==') && part.endsWith('==')) {
                                    return <mark key={i}>{part.slice(2, -2)}</mark>;
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          }
                          return <p>{children}</p>;
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
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
