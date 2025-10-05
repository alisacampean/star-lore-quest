import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's last message
    const userMessage = messages[messages.length - 1].content;

    // Search publications database for relevant content
    const { data: publications, error } = await supabase
      .from("publications")
      .select("title, link")
      .textSearch("title", userMessage.split(" ").slice(0, 5).join(" "), {
        type: "websearch",
        config: "english",
      })
      .limit(5);

    if (error) {
      console.error("Database search error:", error);
    }

    // Build context from publications
    let publicationsContext = "";
    if (publications && publications.length > 0) {
      publicationsContext = "\n\nRelevant NASA space biology publications:\n";
      publications.forEach((pub, idx) => {
        publicationsContext += `${idx + 1}. "${pub.title}" - ${pub.link}\n`;
      });
    }

    // Call Lovable AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable AI assistant specializing in NASA space biology research. 

Your role:
- Answer questions about space biology, microgravity effects, radiation studies, and related topics
- When relevant publications are provided, ALWAYS reference them with their links as markdown: [Study Title](link)
- Format your responses with clear structure using bullet points, numbered lists, and headings
- Use **bold** for KEY findings, important concepts, and emphasis (this will be styled in green)
- Use *italics* for scientific terms
- Add relevant emojis to make the content engaging (🧬 🚀 🔬 🌌 ⚛️ 🛰️ 🌍 etc.)
- Structure responses with:
  • Clear introductory statement with emoji
  • Bullet points for key findings or effects
  • Numbered lists for sequential information
  • Relevant study references with links
- Keep responses informative but scannable (use white space)
- Always link to specific studies when mentioning research

CRITICAL: When referencing publications from the provided list, you MUST format them as markdown links: [Publication Title](URL)

Style: Engaging, visual, and easy to scan while maintaining scientific accuracy.${publicationsContext}`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
