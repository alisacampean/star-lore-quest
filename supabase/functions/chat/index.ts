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
      .select("title, link, abstract, research_area")
      .textSearch("title", userMessage.split(" ").slice(0, 5).join(" "), {
        type: "websearch",
        config: "english",
      })
      .limit(8);

    if (error) {
      console.error("Database search error:", error);
    }

    // Build context from publications
    let publicationsContext = "";
    if (publications && publications.length > 0) {
      publicationsContext = "\n\n📚 **Relevant NASA Space Biology Publications (ALWAYS reference these with markdown links when relevant):**\n\n";
      publications.forEach((pub, idx) => {
        publicationsContext += `${idx + 1}. **"${pub.title}"**\n   Link: ${pub.link}\n   Area: ${pub.research_area || 'N/A'}\n   ${pub.abstract ? `Summary: ${pub.abstract.substring(0, 150)}...\n` : ''}\n`;
      });
      publicationsContext += "\n**IMPORTANT: When mentioning any of these studies in your response, ALWAYS format them as: [Study Title](link)**\n";
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

**CRITICAL FORMATTING RULES:**

1. **Study References (MANDATORY):**
   - ALWAYS cite studies using markdown links: [Study Title](actual_link)
   - When discussing research, ALWAYS include at least 2-3 study links from the provided publications
   - Example: "According to [Effects of Microgravity on Cell Growth](https://link.com), we observe..."

2. **Structure & Readability (REQUIRED):**
   - Start with an engaging intro with emoji (🧬 🚀 🔬 🌌 ⚛️ 🛰️ 🌍)
   - **ALWAYS use bullet points (•) for ALL responses** - format everything as clear bullet lists
   - Use sub-bullets for additional details or examples
   - Use numbered lists (1. 2. 3.) ONLY for sequential steps or procedures
   - Add blank lines between major sections for breathing room
   - Keep each bullet point concise and focused (1-2 sentences)

3. **Text Styling:**
   - Use emojis throughout to make it engaging (but not excessively)
   - Use **bold** for important terms, key concepts, and critical findings (this will appear in green)
   - Use *italics* for scientific terms
   - Do NOT use ==highlight syntax==

**Example Response Structure:**

🔬 **Research Overview:**

• **Microgravity** significantly impacts cellular behavior in multiple ways
• Studies show **altered gene expression** in space environments
• **Bone density loss** is one of the most critical concerns

📚 **Relevant Studies:**

• [Study Title 1](link) - Found that **key finding** about microgravity
• [Study Title 2](link) - Demonstrated **important result** in space biology
  - Sub-finding with additional context
  - Another relevant detail

**Remember:** Use bullet points for everything, make important terms **bold**, and ALWAYS include study links!${publicationsContext}`,
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
