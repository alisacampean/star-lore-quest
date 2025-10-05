import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publications } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!publications || publications.length < 2) {
      return new Response(
        JSON.stringify({ connections: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a prompt for AI to analyze connections
    const pubSummaries = publications.map((pub: any, idx: number) => 
      `[${idx}] Title: ${pub.title}\nAbstract: ${pub.abstract || 'N/A'}\nResearch Area: ${pub.research_area || 'N/A'}`
    ).join('\n\n');

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
            content: "You are a scientific research analyst. Analyze publications and identify thematic connections based on shared topics, methodologies, or research domains."
          },
          {
            role: "user",
            content: `Analyze these ${publications.length} publications and identify connections between them based on shared topics, keywords, or research themes. Return ONLY valid JSON with this structure: {"connections": [{"source": <index>, "target": <index>, "strength": <1-5>, "topics": ["topic1", "topic2"]}]}. Strength 5 means highly related, 1 means loosely related.\n\n${pubSummaries}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_connections",
              description: "Create connections between publications based on shared topics",
              parameters: {
                type: "object",
                properties: {
                  connections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        source: { type: "number", description: "Source publication index" },
                        target: { type: "number", description: "Target publication index" },
                        strength: { type: "number", minimum: 1, maximum: 5 },
                        topics: { type: "array", items: { type: "string" } }
                      },
                      required: ["source", "target", "strength", "topics"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["connections"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_connections" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ connections: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Map indices back to publication IDs
    const connectionsWithIds = result.connections.map((conn: any) => ({
      source: publications[conn.source].id,
      target: publications[conn.target].id,
      strength: conn.strength,
      topics: conn.topics,
      type: "semantic"
    }));

    return new Response(
      JSON.stringify({ connections: connectionsWithIds }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-connections:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
