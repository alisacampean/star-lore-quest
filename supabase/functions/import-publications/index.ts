import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchAndSummarize(url: string, lovableApiKey: string): Promise<string | null> {
  try {
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    // Extract article text content
    let content = "";
    const abstractEl = doc?.querySelector(".abstract, .article-abstract");
    if (abstractEl) {
      content = abstractEl.textContent || "";
    } else {
      // Fallback to finding main content areas
      const mainContent = doc?.querySelector("article, main, .article-content, .content");
      if (mainContent) {
        content = mainContent.textContent || "";
      }
    }
    
    if (!content || content.length < 50) {
      console.log(`Insufficient content from ${url}`);
      return null;
    }
    
    // Truncate to first 4000 chars to avoid token limits
    content = content.substring(0, 4000).replace(/\s+/g, ' ').trim();
    
    // Generate summary using Lovable AI
    console.log(`Generating summary for ${url}`);
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a scientific research summarizer. Create concise 2-3 sentence summaries of research publications focusing on the key findings and methodology."
          },
          {
            role: "user",
            content: `Summarize this research publication in 2-3 sentences:\n\n${content}`
          }
        ],
      }),
    });
    
    if (!aiResponse.ok) {
      console.error(`AI summary failed for ${url}: ${aiResponse.status}`);
      return null;
    }
    
    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content;
    console.log(`Generated summary for ${url}`);
    return summary || null;
    
  } catch (error) {
    console.error(`Error processing ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching CSV from GitHub...');
    // Fetch the CSV file
    const csvResponse = await fetch(
      "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv"
    );
    const csvText = await csvResponse.text();
    console.log('CSV fetched successfully');

    // Parse CSV
    const lines = csvText.split("\n");
    const publications = [];

    // Skip header row, start from line 1
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let title, link;

      if (line.startsWith('"')) {
        // Title is quoted
        const endQuoteIndex = line.indexOf('",');
        if (endQuoteIndex === -1) continue;
        title = line.substring(1, endQuoteIndex);
        link = line.substring(endQuoteIndex + 2).trim();
      } else {
        // Simple case
        const commaIndex = line.indexOf(',');
        if (commaIndex === -1) continue;
        title = line.substring(0, commaIndex).trim();
        link = line.substring(commaIndex + 1).trim();
      }

      if (title && link) {
        publications.push({ title, link });
      }
    }

    console.log(`Parsed ${publications.length} publications`);

    // Clear existing publications
    const { error: deleteError } = await supabase
      .from("publications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Error clearing publications:", deleteError);
    }

    // Process publications with summaries in smaller batches
    let inserted = 0;
    const batchSize = 5; // Small batch to avoid rate limits
    
    for (let i = 0; i < publications.length; i += batchSize) {
      const batch = publications.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(publications.length / batchSize)}`);
      
      // Fetch and summarize each publication
      const enrichedBatch = await Promise.all(
        batch.map(async (pub) => {
          const abstract = await fetchAndSummarize(pub.link, lovableApiKey);
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            title: pub.title,
            link: pub.link,
            abstract: abstract || "Summary unavailable for this publication.",
          };
        })
      );
      
      const { error: insertError } = await supabase
        .from("publications")
        .insert(enrichedBatch);
      
      if (insertError) {
        console.error('Error inserting batch:', insertError);
      } else {
        inserted += batch.length;
        console.log(`Processed and inserted: ${inserted}/${publications.length}`);
      }
      
      // Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${inserted} publications out of ${publications.length} parsed with AI-generated summaries`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
