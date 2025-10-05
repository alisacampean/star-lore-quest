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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the CSV file
    const csvResponse = await fetch(
      "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv"
    );
    const csvText = await csvResponse.text();

    // Parse CSV
    const lines = csvText.split("\n");
    const publications = [];

    // Skip header row, start from line 1
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV with possible commas in quotes
      const match = line.match(/^"([^"]+)"|^([^,]+),(.+)$/);
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

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < publications.length; i += batchSize) {
      const batch = publications.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("publications")
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize}:`, insertError);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${inserted} publications out of ${publications.length} parsed`,
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
